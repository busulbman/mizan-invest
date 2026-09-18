/**
 * ============================================
 * ADD PROPERTY
 * ============================================
 *
 * Creates a private draft. Publication, verification and investment metrics
 * are administered by Mizan Invest and are not offered here — the guard
 * trigger would reject them anyway.
 */

import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, IconButton, SheetOption } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import { createPartnerDraft, getCitiesForPartnerForm, getCountriesForPartnerForm, type PartnerPlace } from '@/lib/partner';

const types = ['apartment', 'villa', 'land', 'commercial'] as const;
const currencies = ['SAR', 'AED', 'USD', 'TRY', 'RUB', 'EUR', 'GBP'] as const;

/** Enum value -> existing translation key, so the sheets read in the user's language. */
const TYPE_KEYS: Record<(typeof types)[number], TranslationKey> = {
  apartment: 'typeApartment',
  villa: 'typeVilla',
  land: 'typeLand',
  commercial: 'typeCommercial',
};

export default function AddPropertyScreen() {
  const styles = useStyles();
  const { partnerMemberships } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [countries, setCountries] = useState<PartnerPlace[]>([]);
  const [cities, setCities] = useState<PartnerPlace[]>([]);
  const [countryId, setCountryId] = useState('');
  const [cityId, setCityId] = useState('');
  const [type, setType] = useState<(typeof types)[number]>('apartment');
  const [currency, setCurrency] = useState<(typeof currencies)[number]>('SAR');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('0');
  const [baths, setBaths] = useState('1');
  const [area, setArea] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getCountriesForPartnerForm()
      .then(setCountries)
      .catch(() => Alert.alert(t('couldNotLoadCountries')));
  }, [t]);

  const submit = async () => {
    const partnerId = partnerMemberships[0]?.partnerId;
    if (!partnerId || !countryId || !cityId || !title.trim() || !price.trim()) {
      Alert.alert(t('completeRequiredFields'), t('addPropertyRequiredBody'));
      return;
    }
    setBusy(true);
    try {
      await createPartnerDraft({
        partnerId,
        countryId,
        cityId,
        propertyType: type,
        listingStatus: 'available',
        price: Number(price),
        priceCurrency: currency,
        bedrooms: Number(beds) || 0,
        bathrooms: Number(baths) || 0,
        areaSqm: area ? Number(area) : null,
        title,
        description,
      });
      Alert.alert(t('draftCreated'), t('draftCreatedBody'), [
        { text: t('viewProperties'), onPress: () => router.replace('/(partner)/properties') },
      ]);
    } catch (error) {
      Alert.alert(t('couldNotCreateDraft'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setBusy(false);
    }
  };

  const selectCountry = (id: string) => {
    setCountryId(id);
    setCityId('');
    setCountryOpen(false);
    void getCitiesForPartnerForm(id)
      .then(setCities)
      .catch(() => Alert.alert(t('couldNotLoadCities')));
  };

  const country = countries.find((x) => x.id === countryId)?.name ?? t('selectCountry');
  const city = cities.find((x) => x.id === cityId)?.name ?? t('selectCity');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(partner)/dashboard')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title}>{t('addPropertyTitle')}</Text>
          <View style={styles.spacer} />
        </View>

        <Field label={t('titleEnglish')} value={title} onChangeText={setTitle} />
        <Field label={t('descriptionEnglish')} value={description} onChangeText={setDescription} multi />
        <Picker label={t('country')} value={country} onPress={() => setCountryOpen(true)} />
        <Picker label={t('city')} value={city} onPress={() => setCityOpen(true)} disabled={!countryId} />
        <Picker label={t('propertyType')} value={t(TYPE_KEYS[type])} onPress={() => setTypeOpen(true)} />
        <Field label={t('price')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Picker label={t('currency')} value={currency} onPress={() => setCurrencyOpen(true)} />
        <View style={styles.row}>
          <View style={styles.half}>
            <Field label={t('bedrooms')} value={beds} onChangeText={setBeds} keyboardType="number-pad" />
          </View>
          <View style={styles.half}>
            <Field label={t('bathrooms')} value={baths} onChangeText={setBaths} keyboardType="number-pad" />
          </View>
        </View>
        <Field label={t('areaOptionalLabel')} value={area} onChangeText={setArea} keyboardType="decimal-pad" />

        <Text style={styles.note}>{t('addPropertyNote')}</Text>
        <Button title={t('createDraft')} onPress={() => void submit()} loading={busy} />
      </ScrollView>

      <BottomSheet visible={countryOpen} onClose={() => setCountryOpen(false)} title={t('country')}>
        {countries.map((x) => (
          <SheetOption key={x.id} label={x.name} active={x.id === countryId} onPress={() => selectCountry(x.id)} />
        ))}
      </BottomSheet>

      <BottomSheet visible={cityOpen} onClose={() => setCityOpen(false)} title={t('city')}>
        {cities.map((x) => (
          <SheetOption
            key={x.id}
            label={x.name}
            active={x.id === cityId}
            onPress={() => {
              setCityId(x.id);
              setCityOpen(false);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={typeOpen} onClose={() => setTypeOpen(false)} title={t('propertyType')}>
        {types.map((x) => (
          <SheetOption
            key={x}
            label={t(TYPE_KEYS[x])}
            active={x === type}
            onPress={() => {
              setType(x);
              setTypeOpen(false);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={currencyOpen} onClose={() => setCurrencyOpen(false)} title={t('currency')}>
        {currencies.map((x) => (
          <SheetOption
            key={x}
            label={x}
            active={x === currency}
            onPress={() => {
              setCurrency(x);
              setCurrencyOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multi,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multi?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
}) {
  const s = useStyles();
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[s.input, multi && s.multi]}
        multiline={multi}
        keyboardType={keyboardType}
        placeholderTextColor="#778095"
      />
    </View>
  );
}

function Picker({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const s = useStyles();
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[s.select, disabled && s.disabled]}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.smd },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, marginBottom: t.spacing.sm },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
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
  multi: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' },
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
  half: { flex: 1 },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 17 },
  disabled: { opacity: 0.45 },
}));
