/**
 * Privacy-safe listing actions.
 *
 * Every customer action is attributed through create_lead before it can open a
 * company contact channel. Partner phone, WhatsApp and email are deliberately
 * absent from this component.
 */

import { useState } from 'react';
import { Alert, Linking, Platform, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, IconButton } from '@/components/ui';
import { CompanyContact, companyWhatsAppUrl } from '@/constants/companyContact';
import { AppConfig } from '@/constants/config';
import type { Language } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { createLead, LeadPlatform, LeadSource } from '@/lib/leads';

export interface BottomCTAProps {
  propertyId: string;
  propertyReferenceCode: string;
  preferredLanguage: Language;
}

type PendingAction = 'whatsapp' | 'phone' | 'interested' | null;

function appPlatform(): LeadPlatform | undefined {
  return Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
    ? Platform.OS
    : undefined;
}

function normalizePhone(value: string): string {
  return value.trim().replace(/[\s()-]/g, '');
}

function isValidPhone(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

function isValidEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export function BottomCTA({ propertyId, propertyReferenceCode, preferredLanguage }: BottomCTAProps) {
  const styles = useStyles();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const create = (source: LeadSource, details?: Pick<Parameters<typeof createLead>[0], 'contactName' | 'contactPhone' | 'contactEmail' | 'message'>) =>
    createLead({
      propertyId,
      source,
      preferredLanguage,
      appVersion: AppConfig.version,
      platform: appPlatform(),
      ...details,
    });

  const reportLeadError = (context: string, error: unknown) => {
    if (__DEV__) {
      console.error(`[leads] ${context} failed`, error);
    }
    Alert.alert(t('error'), t('requestPreparationFailed'));
  };

  const handleWhatsApp = async () => {
    const urlForCompany = CompanyContact.whatsapp;
    if (!urlForCompany || pendingAction) {
      if (!urlForCompany) Alert.alert(t('error'), t('companyWhatsAppUnavailable'));
      return;
    }

    setPendingAction('whatsapp');
    try {
      const lead = await create('whatsapp');
      const messageForCompany = `Hello, I'm interested in ${propertyReferenceCode}.\nRef: ${lead.referenceCode}`;
      const url = companyWhatsAppUrl(messageForCompany);
      if (!url) throw new Error('Company WhatsApp became unavailable');

      if (__DEV__) {
        console.info(`[leads] WhatsApp URL prepared for ${lead.referenceCode}: ${url}`);
      }

      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(
          t('unableToOpenWhatsApp'),
          `${t('leadReference')}: ${lead.referenceCode}`,
        );
      }
    } catch (error) {
      reportLeadError('whatsapp', error);
    } finally {
      setPendingAction(null);
    }
  };

  const handlePhone = async () => {
    if (!CompanyContact.phone || pendingAction) {
      if (!CompanyContact.phone) Alert.alert(t('error'), t('companyPhoneUnavailable'));
      return;
    }

    setPendingAction('phone');
    try {
      const lead = await create('phone_call');
      try {
        await Linking.openURL(`tel:${CompanyContact.phone}`);
      } catch {
        Alert.alert(t('unableToOpenPhone'), `${t('leadReference')}: ${lead.referenceCode}`);
      }
    } catch (error) {
      reportLeadError('phone_call', error);
    } finally {
      setPendingAction(null);
    }
  };

  const handleInterest = async () => {
    if (pendingAction) return;

    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = email.trim();
    if (!normalizedPhone && !normalizedEmail) {
      setFormError(t('phoneOrEmailRequired'));
      return;
    }
    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      setFormError(t('invalidPhoneNumber'));
      return;
    }
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setFormError(t('invalidEmailAddress'));
      return;
    }

    setFormError(null);
    setPendingAction('interested');
    try {
      const lead = await create('interested_button', {
        contactName: name,
        contactPhone: normalizedPhone,
        contactEmail: normalizedEmail,
        message,
      });
      setFormOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      Alert.alert(
        t('requestReceived'),
        `${t('requestReceivedBody')}\n${t('leadReference')}: ${lead.referenceCode}`,
      );
    } catch (error) {
      reportLeadError('interested_button', error);
    } finally {
      setPendingAction(null);
    }
  };

  const actionPending = pendingAction !== null;

  return (
    <>
      <View style={styles.container}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 0}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}
        >
          <Text style={styles.lead} numberOfLines={1} ellipsizeMode="tail">
            {t('interestedInProperty')}
          </Text>

          <View style={styles.row}>
            <IconButton
              icon="whatsapp"
              onPress={handleWhatsApp}
              accessibilityLabel={t('whatsappContact')}
              variant="surface"
              size={52}
              disabled={actionPending || !CompanyContact.whatsapp}
            />
            <IconButton
              icon="call"
              onPress={handlePhone}
              accessibilityLabel={t('callPartner')}
              variant="surface"
              size={52}
              disabled={actionPending || !CompanyContact.phone}
            />
            <Button
              title={t('imInterested')}
              onPress={() => {
                setFormError(null);
                setFormOpen(true);
              }}
              variant="gold"
              size="lg"
              style={styles.primary}
              disabled={actionPending}
            />
          </View>
        </BlurView>
      </View>

      <BottomSheet
        visible={formOpen}
        onClose={() => !actionPending && setFormOpen(false)}
        title={t('contactDetails')}
        subtitle={t('contactDetailsHint')}
        footer={
          <Button
            title={t('submitRequest')}
            onPress={handleInterest}
            variant="gold"
            size="lg"
            loading={pendingAction === 'interested'}
          />
        }
      >
        <View style={styles.form}>
          <LeadField label={`${t('name')} (${t('optional')})`} value={name} onChangeText={setName} />
          <LeadField
            label={t('phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+966501234567"
          />
          <LeadField
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <LeadField
            label={`${t('message')} (${t('optional')})`}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          {formError && <Text style={styles.formError}>{formError}</Text>}
        </View>
      </BottomSheet>
    </>
  );
}

function LeadField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none';
  multiline?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        maxLength={multiline ? 2000 : undefined}
        style={[styles.input, multiline && styles.messageInput]}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    backgroundColor: t.colors.bar,
  },
  bar: { paddingHorizontal: t.spacing.screenHorizontal, paddingTop: t.spacing.smd, gap: t.spacing.sm },
  lead: { ...t.typography.caption, color: t.colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  primary: { flex: 1, minWidth: 0 },
  form: { gap: t.spacing.md, paddingBottom: t.spacing.smd },
  field: { gap: t.spacing.xs },
  fieldLabel: { ...t.typography.captionBold, color: t.colors.text },
  input: {
    minHeight: t.metrics.controlHeight,
    paddingHorizontal: t.spacing.smd,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceAlt,
    ...t.typography.body,
    color: t.colors.text,
  },
  messageInput: { minHeight: 100, paddingTop: t.spacing.smd, textAlignVertical: 'top' },
  formError: { ...t.typography.caption, color: t.colors.error },
}));

export default BottomCTA;
