/**
 * ============================================
 * ADMIN — PARTNER APPLICATIONS
 * ============================================
 *
 * Approving an application is what grants a Partner Portal membership, so the
 * decision is deliberate and the rejection reason is mandatory.
 *
 * REJECTION
 * The reason is collected through PromptSheet rather than `Alert.prompt`:
 * `Alert.prompt` is iOS-only and silently does nothing on Android, which would
 * let an admin tap Reject and never learn the application was untouched.
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton, PromptSheet } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';
import { getAdminPartnerApplications, reviewPartnerApplication, type PartnerApplication } from '@/lib/partner';

const APPLICANT_TYPE_LABELS: Record<string, TranslationKey> = {
  company: 'company',
  individual: 'individual',
};

const APPLICATION_STATUS_LABELS: Record<string, TranslationKey> = {
  pending: 'applicationStatusPending',
  approved: 'applicationStatusApproved',
  rejected: 'applicationStatusRejected',
};

export default function AdminPartnersScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PartnerApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAdminPartnerApplications());
    } catch {
      Alert.alert(t('couldNotLoadApplications'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (item: PartnerApplication, decision: 'approved' | 'rejected', reason?: string) => {
    setBusyId(item.id);
    try {
      await reviewPartnerApplication(item.id, decision, reason);
      await load();
      Alert.alert(
        decision === 'approved' ? t('partnerApproved') : t('applicationRejected'),
        decision === 'approved'
          ? `${item.displayName} — ${t('partnerApprovedBody')}`
          : t('applicationRejectedBody')
      );
    } catch (error) {
      Alert.alert(t('couldNotReview'), error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={() => goBackOr('/(admin)/dashboard')}
            accessibilityLabel={t('back')}
            variant="surface"
            size={40}
          />
          <Text style={styles.title}>{t('partnerApplications')}</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{t('noPartnerApplications')}</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.meta}>
                {APPLICANT_TYPE_LABELS[item.applicantType]
                  ? t(APPLICANT_TYPE_LABELS[item.applicantType])
                  : item.applicantType}{' '}
                ·{' '}
                {APPLICATION_STATUS_LABELS[item.status] ? t(APPLICATION_STATUS_LABELS[item.status]) : item.status}
              </Text>
              <Text style={styles.meta}>
                {t('languagesLabel')}: {item.languages.join(', ')}
              </Text>
              {item.about ? <Text style={styles.detail}>{item.about}</Text> : null}

              {item.status === 'pending' ? (
                <View style={styles.actions}>
                  <Button
                    title={t('approve')}
                    size="sm"
                    onPress={() => void review(item, 'approved')}
                    loading={busyId === item.id}
                  />
                  <Button
                    title={t('reject')}
                    variant="outline"
                    size="sm"
                    onPress={() => setRejecting(item)}
                    disabled={busyId === item.id}
                  />
                </View>
              ) : null}

              {item.rejectionReason ? (
                <Text style={styles.reject}>
                  {t('reasonLabel')}: {item.rejectionReason}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <PromptSheet
        visible={rejecting !== null}
        title={t('rejectApplication')}
        subtitle={rejecting?.displayName}
        label={t('reasonShownToApplicant')}
        placeholder={t('rejectApplicationPlaceholder')}
        confirmTitle={t('reject')}
        minLength={10}
        busy={busyId === rejecting?.id}
        onCancel={() => setRejecting(null)}
        onConfirm={(reason) => {
          const target = rejecting;
          setRejecting(null);
          if (target) void review(target, 'rejected', reason);
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd },
  title: { flex: 1, textAlign: 'center', ...t.typography.h3, color: t.colors.text },
  spacer: { width: 40 },
  loader: { marginTop: t.spacing.xl },
  empty: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xl },
  card: { gap: 7, padding: t.spacing.md, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  actions: { flexDirection: 'row', gap: t.spacing.sm },
  name: { ...t.typography.bodyBold, color: t.colors.text },
  meta: { ...t.typography.caption, color: t.colors.textSecondary },
  detail: { ...t.typography.caption, color: t.colors.text },
  reject: { ...t.typography.caption, color: t.colors.error },
}));
