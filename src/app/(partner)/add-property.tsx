/**
 * ============================================
 * ADD PROPERTY
 * ============================================
 *
 * Creates a private draft using the SAME form as Edit Property.
 *
 * Add used to collect a reduced field set, so a partner created a half-empty
 * listing and only discovered parking, year built, availability and the
 * feature toggles after the draft existed. Both screens now render
 * `PropertyForm` and validate through `missingForDraft`, so the two cannot
 * drift apart again.
 *
 * Media is deliberately NOT here: an upload needs a property id, and the row
 * does not exist until this screen saves. The partner is told that, then sent
 * straight to Edit Property where media lives.
 *
 * Publication, verification and investment metrics are administered by Mizan
 * Invest; the guard trigger rejects them from a partner, so they are not
 * offered.
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import {
  describeSaveError,
  emptyPropertyForm,
  missingForDraft,
  PropertyForm,
  toPropertyInput,
  type PropertyFormValues,
  type SheetKind,
} from '@/components/partner/PropertyForm';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles } from '@/context/ThemeContext';
import { createPartnerDraft, getCitiesForPartnerForm, getCountriesForPartnerForm, type PartnerPlace } from '@/lib/partner';

export default function AddPropertyScreen() {
  const styles = useStyles();
  const { partnerMemberships } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [countries, setCountries] = useState<PartnerPlace[]>([]);
  const [cities, setCities] = useState<PartnerPlace[]>([]);
  const [values, setValues] = useState<PropertyFormValues>(emptyPropertyForm);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getCountriesForPartnerForm()
      .then(setCountries)
      .catch(() => Alert.alert(t('couldNotLoadCountries')));
  }, [t]);

  const loadCities = useCallback(
    (countryId: string) => {
      void getCitiesForPartnerForm(countryId)
        .then(setCities)
        .catch(() => Alert.alert(t('couldNotLoadCities')));
    },
    [t]
  );

  const submit = async () => {
    const partnerId = partnerMemberships[0]?.partnerId;
    if (!partnerId || busy) return;

    const missing = missingForDraft(values);
    if (missing.length > 0) {
      Alert.alert(t('completeRequiredFields'), `• ${missing.map(t).join('\n• ')}`);
      return;
    }

    setBusy(true);
    try {
      const propertyId = await createPartnerDraft({ partnerId, ...toPropertyInput(values) });
      Alert.alert(t('draftCreated'), t('draftSavedContinue'), [
        {
          text: t('saveAndContinue'),
          // Straight into Edit Property, which is where media and Submit live.
          onPress: () => router.replace({ pathname: '/(partner)/edit-property', params: { id: propertyId } }),
        },
      ]);
    } catch (error) {
      Alert.alert(t('couldNotCreateDraft'), describeSaveError(error, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('addPropertyTitle')}</Text>

        <PropertyForm
          values={values}
          onChange={setValues}
          editable={!busy}
          countries={countries}
          cities={cities}
          onCountrySelected={loadCities}
          sheet={sheet}
          onSheetChange={setSheet}
        />

        <Text style={styles.note}>{t('mediaAfterSaveNote')}</Text>
        <Text style={styles.note}>{t('addPropertyNote')}</Text>

        <Button title={t('createDraft')} size="lg" onPress={() => void submit()} loading={busy} style={styles.action} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.smd },
  title: { ...t.typography.h2, color: t.colors.text, marginBottom: t.spacing.sm },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 17, marginTop: t.spacing.sm },
  action: { marginTop: t.spacing.md },
}));
