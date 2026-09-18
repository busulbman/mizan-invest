/**
 * ============================================
 * EDIT PROPERTY
 * ============================================
 *
 * The partner's edit surface for a draft or a listing that came back with
 * changes requested.
 *
 * AUTHORITY
 * Editability is decided by the database, not this screen. RLS admits writes
 * only for a property whose `partner_id` is in `my_partner_ids()` AND whose
 * `publication_status` is 'draft' or 'unpublished'; the guard trigger rejects
 * any attempt to touch verified/featured/metrics. The read-only rendering here
 * is a courtesy so a partner is not offered a control that would fail — it is
 * not the security boundary, and nothing here relaxes one.
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
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, BottomSheet, Button, IconButton, SheetOption } from '@/components/ui';
import { MediaManager } from '@/components/partner/MediaManager';
import { describeStatus, PropertyStatusBadge } from '@/components/partner/PropertyStatusBadge';
import type { TranslationKey } from '@/constants/translations';
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

const PROPERTY_TYPES = ['apartment', 'villa', 'land', 'commercial'] as const;
const CURRENCIES = ['SAR', 'AED', 'USD', 'TRY', 'RUB', 'EUR', 'GBP'] as const;
const LISTING_STATUSES = ['available', 'reserved', 'sold'] as const;

/** Enum value -> existing translation key, so pickers read in the user's language. */
const TYPE_KEYS: Record<(typeof PROPERTY_TYPES)[number], TranslationKey> = {
  apartment: 'typeApartment',
  villa: 'typeVilla',
  land: 'typeLand',
  commercial: 'typeCommercial',
};

const LISTING_STATUS_KEYS: Record<(typeof LISTING_STATUSES)[number], TranslationKey> = {
  available: 'available',
  reserved: 'reserved',
  sold: 'sold',
};

type PropertyType = (typeof PROPERTY_TYPES)[number];
type Currency = (typeof CURRENCIES)[number];
type ListingStatus = (typeof LISTING_STATUSES)[number];

/**
 * Fields the review queue needs before a listing is worth an admin's time.
 * Deliberately limited to columns the schema actually has — no invented
 * requirements. Saving a draft does not run this.
 */
function missingForSubmit(form: FormState): TranslationKey[] {
  const missing: TranslationKey[] = [];
  if (!form.countryId) missing.push('country');
  if (!form.cityId) missing.push('city');
  if (!form.title.trim()) missing.push('titleField');
  if (!form.propertyType) missing.push('propertyType');
  const price = Number(form.price);
  if (!form.price.trim() || !Number.isFinite(price) || price <= 0) missing.push('price');
  if (!form.currency) missing.push('currency');
  const area = Number(form.area);
  if (!form.area.trim() || !Number.isFinite(area) || area <= 0) missing.push('area');
  return missing;
}

interface FormState {
  countryId: string;
  cityId: string;
  propertyType: PropertyType;
  listingStatus: ListingStatus;
  currency: Currency;
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  parking: string;
  yearBuilt: string;
  hasPool: boolean;
  hasSecurity: boolean;
  hasGarden: boolean;
  hasSeaView: boolean;
  hasCityView: boolean;
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
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sheet, setSheet] = useState<'country' | 'city' | 'type' | 'currency' | 'listing' | null>(null);

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
      setForm({
        countryId: property.countryId,
        cityId: property.cityId,
        propertyType: property.propertyType,
        listingStatus: property.listingStatus,
        currency: property.priceCurrency,
        title: property.title,
        description: property.description ?? '',
        price: String(property.price),
        bedrooms: String(property.bedrooms),
        bathrooms: String(property.bathrooms),
        area: property.areaSqm === null || property.areaSqm === undefined ? '' : String(property.areaSqm),
        parking: String(property.parkingSpaces ?? 0),
        yearBuilt: property.yearBuilt ? String(property.yearBuilt) : '',
        hasPool: Boolean(property.hasPool),
        hasSecurity: Boolean(property.hasSecurity),
        hasGarden: Boolean(property.hasGarden),
        hasSeaView: Boolean(property.hasSeaView),
        hasCityView: Boolean(property.hasCityView),
      });

      if (property.countryId) {
        setCities(await getCitiesForPartnerForm(property.countryId));
      }
    } catch (error) {
      Alert.alert(t('couldNotLoad'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (next: Partial<FormState>) => setForm((current) => (current ? { ...current, ...next } : current));

  const buildInput = (state: FormState) => ({
    countryId: state.countryId,
    cityId: state.cityId,
    propertyType: state.propertyType,
    listingStatus: state.listingStatus,
    price: Number(state.price),
    priceCurrency: state.currency,
    bedrooms: Number(state.bedrooms) || 0,
    bathrooms: Number(state.bathrooms) || 0,
    areaSqm: state.area ? Number(state.area) : null,
    parkingSpaces: Number(state.parking) || 0,
    hasPool: state.hasPool,
    hasSecurity: state.hasSecurity,
    hasGarden: state.hasGarden,
    hasSeaView: state.hasSeaView,
    hasCityView: state.hasCityView,
    yearBuilt: state.yearBuilt ? Number(state.yearBuilt) : null,
    title: state.title,
    description: state.description,
  });

  const save = async (): Promise<boolean> => {
    if (!detail || !form || saving || submitting) return false;
    // Save Draft is deliberately looser than Submit: only the fields the
    // database itself refuses to accept are enforced here.
    if (!form.countryId || !form.cityId || !form.title.trim()) {
      Alert.alert(t('almostThere'), t('almostThereBody'));
      return false;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert(t('checkThePrice'), t('checkThePriceBody'));
      return false;
    }

    setSaving(true);
    try {
      await updatePartnerDraft(detail.id, buildInput(form));
      return true;
    } catch (error) {
      Alert.alert(t('couldNotSave'), error instanceof Error ? error.message : t('pleaseTryAgain'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!detail || !form || saving || submitting) return;

    const missing = missingForSubmit(form);
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

  if (loading || !form || !detail) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const presentation = describeStatus(detail.publicationStatus, Boolean(detail.rejectionReason));
  const countryLabel = countries.find((item) => item.id === form.countryId)?.name ?? t('selectCountry');
  const cityLabel = cities.find((item) => item.id === form.cityId)?.name ?? t('selectCity');
  const busy = saving || submitting;

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

        {!editable ? (
          <Text style={styles.lockedNote}>{t('readOnlyListingNote')}</Text>
        ) : null}

        <Field label={t('titleEnglish')} value={form.title} onChangeText={(v) => patch({ title: v })} editable={editable} />
        <Field
          label={t('descriptionEnglish')}
          value={form.description}
          onChangeText={(v) => patch({ description: v })}
          multiline
          editable={editable}
        />

        <Picker label={t('country')} value={countryLabel} onPress={() => setSheet('country')} disabled={!editable} />
        <Picker label={t('city')} value={cityLabel} onPress={() => setSheet('city')} disabled={!editable || !form.countryId} />
        <Picker label={t('propertyType')} value={t(TYPE_KEYS[form.propertyType])} onPress={() => setSheet('type')} disabled={!editable} />
        <Picker label={t('availability')} value={t(LISTING_STATUS_KEYS[form.listingStatus])} onPress={() => setSheet('listing')} disabled={!editable} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label={t('price')} value={form.price} onChangeText={(v) => patch({ price: v })} keyboardType="decimal-pad" editable={editable} />
          </View>
          <View style={styles.half}>
            <Picker label={t('currency')} value={form.currency} onPress={() => setSheet('currency')} disabled={!editable} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label={t('bedrooms')} value={form.bedrooms} onChangeText={(v) => patch({ bedrooms: v })} keyboardType="number-pad" editable={editable} />
          </View>
          <View style={styles.half}>
            <Field label={t('bathrooms')} value={form.bathrooms} onChangeText={(v) => patch({ bathrooms: v })} keyboardType="number-pad" editable={editable} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Field label={t('areaSqmLabel')} value={form.area} onChangeText={(v) => patch({ area: v })} keyboardType="decimal-pad" editable={editable} />
          </View>
          <View style={styles.half}>
            <Field label={t('parkingSpaces')} value={form.parking} onChangeText={(v) => patch({ parking: v })} keyboardType="number-pad" editable={editable} />
          </View>
        </View>

        <Field label={t('yearBuiltOptional')} value={form.yearBuilt} onChangeText={(v) => patch({ yearBuilt: v })} keyboardType="number-pad" editable={editable} />

        <Text style={styles.sectionLabel}>{t('features')}</Text>
        <View style={styles.toggles}>
          <Toggle label={t('pool')} value={form.hasPool} onToggle={() => patch({ hasPool: !form.hasPool })} disabled={!editable} />
          <Toggle label={t('security')} value={form.hasSecurity} onToggle={() => patch({ hasSecurity: !form.hasSecurity })} disabled={!editable} />
          <Toggle label={t('garden')} value={form.hasGarden} onToggle={() => patch({ hasGarden: !form.hasGarden })} disabled={!editable} />
          <Toggle label={t('seaView')} value={form.hasSeaView} onToggle={() => patch({ hasSeaView: !form.hasSeaView })} disabled={!editable} />
          <Toggle label={t('cityView')} value={form.hasCityView} onToggle={() => patch({ hasCityView: !form.hasCityView })} disabled={!editable} />
        </View>

        <MediaManager propertyId={detail.id} media={media} editable={editable} onChange={setMedia} />

        <Text style={styles.note}>{t('editPropertyNote')}</Text>

        {editable ? (
          <View style={styles.actions}>
            <Button title={t('saveDraft')} variant="secondary" size="lg" onPress={() => void save()} loading={saving} disabled={busy} />
            <Button title={t('submitForReview')} variant="gold" size="lg" onPress={() => void submit()} loading={submitting} disabled={busy} />
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet visible={sheet === 'country'} onClose={() => setSheet(null)} title={t('country')}>
        {countries.map((item) => (
          <SheetOption
            key={item.id}
            label={item.name}
            active={item.id === form.countryId}
            onPress={() => {
              patch({ countryId: item.id, cityId: '' });
              setSheet(null);
              void getCitiesForPartnerForm(item.id).then(setCities).catch(() => setCities([]));
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'city'} onClose={() => setSheet(null)} title={t('city')}>
        {cities.map((item) => (
          <SheetOption key={item.id} label={item.name} active={item.id === form.cityId} onPress={() => { patch({ cityId: item.id }); setSheet(null); }} />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'type'} onClose={() => setSheet(null)} title={t('propertyType')}>
        {PROPERTY_TYPES.map((item) => (
          <SheetOption key={item} label={t(TYPE_KEYS[item])} active={item === form.propertyType} onPress={() => { patch({ propertyType: item }); setSheet(null); }} />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'listing'} onClose={() => setSheet(null)} title={t('availability')}>
        {LISTING_STATUSES.map((item) => (
          <SheetOption key={item} label={t(LISTING_STATUS_KEYS[item])} active={item === form.listingStatus} onPress={() => { patch({ listingStatus: item }); setSheet(null); }} />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'currency'} onClose={() => setSheet(null)} title={t('currency')}>
        {CURRENCIES.map((item) => (
          <SheetOption key={item} label={item} active={item === form.currency} onPress={() => { patch({ currency: item }); setSheet(null); }} />
        ))}
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  editable?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

function Picker({ label, value, onPress, disabled }: { label: string; value: string; onPress: () => void; disabled?: boolean }) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={[styles.select, disabled && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

function Toggle({ label, value, onToggle, disabled }: { label: string; value: boolean; onToggle: () => void; disabled?: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.toggle, value && styles.toggleOn, disabled && styles.disabled]}
    >
      <AppIcon name={value ? 'check' : 'close'} size="xs" color={value ? colors.onAccent : colors.textMuted} />
      <Text style={[styles.toggleLabel, value && styles.toggleLabelOn]}>{label}</Text>
    </Pressable>
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
  label: { ...t.typography.label, color: t.colors.textSecondary, marginBottom: 6 },
  input: {
    minHeight: 48,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    backgroundColor: t.colors.surface,
    ...t.typography.body,
  },
  multiline: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' },
  select: {
    minHeight: 54,
    paddingHorizontal: t.spacing.md,
    justifyContent: 'center',
    borderRadius: t.borderRadius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  value: { ...t.typography.bodyBold, color: t.colors.text },
  row: { flexDirection: 'row', gap: t.spacing.sm },
  half: { flex: 1, minWidth: 0 },
  sectionLabel: { ...t.typography.label, color: t.colors.textSecondary, marginTop: t.spacing.sm },
  toggles: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: t.spacing.smd,
    paddingVertical: 9,
    borderRadius: t.borderRadius.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  toggleOn: { borderColor: t.colors.accent, backgroundColor: t.colors.accent },
  toggleLabel: { ...t.typography.caption, color: t.colors.textSecondary },
  toggleLabelOn: { color: t.colors.onAccent, fontWeight: '700' },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 17, marginTop: t.spacing.sm },
  actions: { gap: t.spacing.sm, marginTop: t.spacing.sm },
  disabled: { opacity: 0.5 },
}));
