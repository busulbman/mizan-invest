/**
 * ============================================
 * EDIT PROPERTY
 * ============================================
 *
 * The partner's edit surface, rendering the SAME `PropertyForm` as Add
 * Property so the two field sets and validations cannot diverge.
 *
 * AUTHORITY
 * Editability is decided by the database, not this screen. RLS admits writes
 * only for a property whose `partner_id` is in `my_partner_ids()`, and the
 * guard trigger refuses any write to a listing that is pending_review,
 * published or archived, plus any attempt to touch verified/featured/metrics.
 * The read-only rendering here is a courtesy so a partner is not offered a
 * control that would fail — it is not the security boundary, and nothing here
 * relaxes one.
 *
 * STATE BEHAVIOUR
 *   draft / changes requested -> full edit, media, save, submit
 *   pending_review            -> read only, status explained, no submit
 *   published / archived      -> read only, status explained
 *
 * SUBMIT
 * `submit_property_for_review` is an RPC because moving to `pending_review` is
 * a privileged transition. The partner cannot publish.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button, IconButton } from '@/components/ui';
import { MediaManager } from '@/components/partner/MediaManager';
import {
  describeSaveError,
  emptyPropertyForm,
  missingForDraft,
  missingForSubmit,
  PropertyForm,
  toPropertyInput,
  type PropertyFormValues,
  type SheetKind,
} from '@/components/partner/PropertyForm';
import { describeStatus, PropertyStatusBadge } from '@/components/partner/PropertyStatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import {
  getCitiesForPartnerForm,
  getCountriesForPartnerForm,
  getPartnerPropertyDetail,
  isEditableStatus,
  submitPropertyForReview,
  updatePartnerDraft,
  type PartnerPlace,
  type PartnerPropertyDetail,
} from '@/lib/partner';
import { getPropertyMedia, type PropertyMediaItem } from '@/lib/propertyMedia';
import type { Currency, ListingStatus, PropertyType } from '@/lib/propertyFields';

/** Detail row -> form values. One place, so Add and Edit start from the same shape. */
function formFromDetail(detail: PartnerPropertyDetail): PropertyFormValues {
  return {
    ...emptyPropertyForm(),
    countryId: detail.countryId,
    cityId: detail.cityId,
    propertyType: detail.propertyType as PropertyType,
    listingStatus: detail.listingStatus as ListingStatus,
    currency: detail.priceCurrency as Currency,
    title: detail.title,
    description: detail.description ?? '',
    price: String(detail.price),
    area: detail.areaSqm === null || detail.areaSqm === undefined ? '' : String(detail.areaSqm),
    bedrooms: String(detail.bedrooms),
    bathrooms: String(detail.bathrooms),
    parking: String(detail.parkingSpaces ?? 0),
    yearBuilt: detail.yearBuilt ? String(detail.yearBuilt) : '',
    hasPool: Boolean(detail.hasPool),
    hasSecurity: Boolean(detail.hasSecurity),
    hasGarden: Boolean(detail.hasGarden),
    hasSeaView: Boolean(detail.hasSeaView),
    hasCityView: Boolean(detail.hasCityView),
    highlights: detail.highlights ?? [],
  };
}

export default function EditPropertyScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [detail, setDetail] = useState<PartnerPropertyDetail | null>(null);
  const [media, setMedia] = useState<PropertyMediaItem[]>([]);
  const [countries, setCountries] = useState<PartnerPlace[]>([]);
  const [cities, setCities] = useState<PartnerPlace[]>([]);
  const [values, setValues] = useState<PropertyFormValues | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const editable = detail ? isEditableStatus(detail.publicationStatus) : false;

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [property, mediaItems, countryList] = await Promise.all([
        getPartnerPropertyDetail(id),
        getPropertyMedia(id),
        getCountriesForPartnerForm(),
      ]);

      if (!property) {
        Alert.alert(t('notAvailable'), t('listingCouldNotBeOpened'), [
          { text: t('back'), onPress: () => goBackOr('/(partner)/properties') },
        ]);
        return;
      }

      setDetail(property);
      setMedia(mediaItems);
      setCountries(countryList);
      setValues(formFromDetail(property));

      if (property.countryId) setCities(await getCitiesForPartnerForm(property.countryId));
    } catch (error) {
      Alert.alert(t('couldNotLoad'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadCities = useCallback((countryId: string) => {
    void getCitiesForPartnerForm(countryId).then(setCities).catch(() => setCities([]));
  }, []);

  const save = async (): Promise<boolean> => {
    if (!detail || !values || saving || submitting) return false;

    // Saving a draft is deliberately looser than submitting: only the fields
    // the database itself refuses are enforced here.
    const missing = missingForDraft(values);
    if (missing.length > 0) {
      Alert.alert(t('almostThere'), `• ${missing.map(t).join('\n• ')}`);
      return false;
    }

    setSaving(true);
    try {
      await updatePartnerDraft(detail.id, toPropertyInput(values));
      return true;
    } catch (error) {
      Alert.alert(t('couldNotSave'), describeSaveError(error, t));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!detail || !values || saving || submitting) return;

    const missing = missingForSubmit(values);
    if (missing.length > 0) {
      Alert.alert(t('completeTheListing'), `${t('stillNeededBeforeReview')}\n\n• ${missing.map(t).join('\n• ')}`);
      return;
    }
    if (media.filter((item) => item.mediaType === 'image').length === 0) {
      Alert.alert(t('addAtLeastOnePhoto'), t('addAtLeastOnePhotoBody'));
      return;
    }

    // Save first: submitting stale edits would send the reviewer a version the
    // partner never sees again, because pending_review locks the form.
    if (!(await save())) return;

    setSubmitting(true);
    try {
      await submitPropertyForReview(detail.id);
      Alert.alert(t('submittedForReview'), t('submittedForReviewBody'), [
        { text: t('done'), onPress: () => router.replace('/(partner)/properties') },
      ]);
    } catch (error) {
      Alert.alert(t('couldNotSubmit'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !values || !detail) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const presentation = describeStatus(detail.publicationStatus, Boolean(detail.rejectionReason));
  const busy = saving || submitting;

  /** The one line explaining why the form is locked, matched to the status. */
  const lockedNoteKey =
    detail.publicationStatus === 'pending_review'
      ? 'pendingReviewLocked'
      : detail.publicationStatus === 'published'
        ? 'publishedLocked'
        : 'readOnlyListingNote';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(partner)/properties')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title} numberOfLines={1}>
            {editable ? t('editPropertyTitle') : t('propertyReadOnlyTitle')}
          </Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.statusRow}>
          <PropertyStatusBadge status={detail.publicationStatus} hasRejectionReason={Boolean(detail.rejectionReason)} />
          <Text style={styles.reference}>{detail.referenceCode}</Text>
        </View>
        <Text style={styles.hint}>{t(presentation.hintKey)}</Text>

        {detail.rejectionReason ? (
          <View style={styles.rejectionCard}>
            <View style={styles.rejectionHead}>
              <AppIcon name="warning" size="sm" color={colors.warning} />
              <Text style={styles.rejectionTitle}>{t('reviewNotesActionRequired')}</Text>
            </View>
            <Text style={styles.rejectionBody}>{detail.rejectionReason}</Text>
          </View>
        ) : null}

        {!editable ? <Text style={styles.lockedNote}>{t(lockedNoteKey)}</Text> : null}

        <PropertyForm
          values={values}
          onChange={setValues}
          editable={editable && !busy}
          countries={countries}
          cities={cities}
          onCountrySelected={loadCities}
          sheet={sheet}
          onSheetChange={setSheet}
        />

        <MediaManager propertyId={detail.id} media={media} editable={editable} onChange={setMedia} />

        <Text style={styles.note}>{t('editPropertyNote')}</Text>

        {editable ? (
          <View style={styles.actions}>
            <Button title={t('saveDraft')} variant="secondary" size="lg" onPress={() => void save()} loading={saving} disabled={busy} />
            <Button title={t('submitForReview')} variant="gold" size="lg" onPress={() => void submit()} loading={submitting} disabled={busy} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.smd },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, marginBottom: t.spacing.xs },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.sm },
  reference: { ...t.typography.caption, color: t.colors.textMuted },
  hint: { ...t.typography.tiny, color: t.colors.textSecondary, lineHeight: 16 },
  rejectionCard: {
    gap: 6,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.warning,
    backgroundColor: t.colors.surface,
  },
  rejectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rejectionTitle: { ...t.typography.smallBold, color: t.colors.warning },
  rejectionBody: { ...t.typography.small, color: t.colors.text, lineHeight: 20 },
  lockedNote: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16 },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 17, marginTop: t.spacing.sm },
  actions: { gap: t.spacing.sm, marginTop: t.spacing.sm },
}));
