import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, IconButton, SheetOption } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme, makeStyles } from '@/context/ThemeContext';
import { goToParent } from '@/lib/navigation';
import { getCitiesForPartnerForm, getCountriesForPartnerForm, submitPartnerApplication, type PartnerPlace } from '@/lib/partner';

export default function PartnerApplicationScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isAuthenticated, isPartner } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [countries, setCountries] = useState<PartnerPlace[]>([]);
  const [cities, setCities] = useState<PartnerPlace[]>([]);
  const [countryId, setCountryId] = useState('');
  const [cityId, setCityId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [about, setAbout] = useState('');
  const [message, setMessage] = useState('');
  const [languages, setLanguages] = useState<('en' | 'ru' | 'ar' | 'tr')[]>(['en']);
  const [applicantType, setApplicantType] = useState<'individual' | 'company'>('company');
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { void getCountriesForPartnerForm().then(setCountries).catch(() => Alert.alert(t('couldNotLoadMarkets'))); }, [t]);
  const selectCountry = useCallback((next: string) => {
    setCountryId(next); setCityId(null); setCities([]); setCountryOpen(false);
    void getCitiesForPartnerForm(next).then(setCities).catch(() => Alert.alert(t('couldNotLoadCities')));
  }, [t]);

  if (!isAuthenticated || isPartner) return <Redirect href="/(main)/home" />;
  const countryName = countries.find((item) => item.id === countryId)?.name ?? t('selectCountry');
  const cityName = cities.find((item) => item.id === cityId)?.name ?? t('selectCityRegion');
  const submit = async () => {
    if (!displayName.trim() || !countryId || (!phone.trim() && !email.trim())) {
      Alert.alert(t('completeRequiredFields'), t('partnerApplicationRequiredBody')); return;
    }
    setLoading(true);
    try {
      await submitPartnerApplication({ applicantType, displayName, countryId, cityId, languages, phone, email, about, message });
      Alert.alert(t('applicationReceived'), t('applicationReceivedBody'), [{ text: t('ok'), onPress: () => router.replace('/(main)/profile') }]);
    } catch (error) { Alert.alert(t('couldNotSubmit'), error instanceof Error ? error.message : t('pleaseTryAgain')); }
    finally { setLoading(false); }
  };

  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><IconButton icon="back" onPress={() => goToParent('/(main)/settings')} accessibilityLabel={t('back')} variant="surface" size={40} /><Text style={styles.title}>{t('partnerApplicationTitle')}</Text><View style={styles.spacer} /></View>
      <Text style={styles.subtitle}>{t('partnerApplicationSubtitle')}</Text>
      <View style={styles.form}>
        <Text style={styles.label}>{t('accountType')}</Text>
        <View style={styles.choiceRow}>{(['company', 'individual'] as const).map((value) => <Pressable key={value} onPress={() => setApplicantType(value)} style={[styles.choice, applicantType === value && { borderColor: colors.accent }]}><Text style={styles.choiceText}>{value === 'company' ? t('company') : t('individual')}</Text></Pressable>)}</View>
        <Field label={t('publicDisplayName')} value={displayName} onChangeText={setDisplayName} />
        <Text style={styles.label}>{t('languagesLabel')}</Text>
        <View style={styles.choiceRow}>{(['en', 'ar', 'ru', 'tr'] as const).map((language) => <Pressable key={language} onPress={() => setLanguages((current) => current.includes(language) ? (current.length > 1 ? current.filter((item) => item !== language) : current) : [...current, language])} style={[styles.languageChoice, languages.includes(language) && { borderColor: colors.accent }]}><Text style={styles.choiceText}>{language.toUpperCase()}</Text></Pressable>)}</View>
        <Pressable onPress={() => setCountryOpen(true)} style={styles.select}><Text style={styles.selectLabel}>{t('country')}</Text><Text style={styles.selectValue}>{countryName}</Text></Pressable>
        <Pressable disabled={!countryId} onPress={() => setCityOpen(true)} style={[styles.select, !countryId && styles.disabled]}><Text style={styles.selectLabel}>{t('cityRegion')}</Text><Text style={styles.selectValue}>{cityName}</Text></Pressable>
        <Field label={t('phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label={t('publicProfileDescriptionOptional')} value={about} onChangeText={setAbout} multiline />
        <Field label={t('messageForReviewOptional')} value={message} onChangeText={setMessage} multiline />
        <Text style={styles.note}>{t('partnerApplicationPrivacyNote')}</Text>
        <Button title={t('submitApplication')} onPress={() => void submit()} loading={loading} />
      </View>
    </ScrollView>
    <BottomSheet visible={countryOpen} onClose={() => setCountryOpen(false)} title={t('chooseCountry')}>{countries.map((item) => <SheetOption key={item.id} label={item.name} active={item.id === countryId} onPress={() => selectCountry(item.id)} />)}</BottomSheet>
    <BottomSheet visible={cityOpen} onClose={() => setCityOpen(false)} title={t('chooseCityRegion')}>{cities.map((item) => <SheetOption key={item.id} label={item.name} active={item.id === cityId} onPress={() => { setCityId(item.id); setCityOpen(false); }} />)}</BottomSheet>
  </KeyboardAvoidingView>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean; keyboardType?: 'default' | 'phone-pad' | 'email-address'; autoCapitalize?: 'none' | 'sentences' }) {
  const styles = useStyles();
  return <View><Text style={styles.label}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} style={[styles.input, props.multiline && styles.multiline]} multiline={props.multiline} keyboardType={props.keyboardType} autoCapitalize={props.autoCapitalize} placeholderTextColor="#778095" /></View>;
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background }, content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd }, title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text }, spacer: { width: 40 },
  subtitle: { ...t.typography.body, color: t.colors.textSecondary, lineHeight: 22 }, form: { gap: t.spacing.smd, marginTop: t.spacing.sm }, label: { ...t.typography.label, color: t.colors.textSecondary, marginBottom: 6 },
  input: { minHeight: 48, borderRadius: t.borderRadius.md, borderWidth: 1, borderColor: t.colors.border, color: t.colors.text, paddingHorizontal: t.spacing.md, ...t.typography.body, backgroundColor: t.colors.surface }, multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  select: { minHeight: 54, borderRadius: t.borderRadius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing.md, justifyContent: 'center' }, selectLabel: { ...t.typography.tiny, color: t.colors.textMuted }, selectValue: { ...t.typography.bodyBold, color: t.colors.text, marginTop: 2 },
  choiceRow: { flexDirection: 'row', gap: t.spacing.sm }, choice: { flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: t.borderRadius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface }, languageChoice: { flex: 1, minHeight: 40, justifyContent: 'center', alignItems: 'center', borderRadius: t.borderRadius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface }, choiceText: { ...t.typography.bodyBold, color: t.colors.text }, note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 17 }, disabled: { opacity: 0.45 },
}));
