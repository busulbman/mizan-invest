/**
 * ============================================
 * MIZAN MANAGEMENT — DASHBOARD
 * ============================================
 *
 * Real counts only, read through admin RLS.
 *
 * NO DEAD ROWS
 * The previous version listed six sections, three of which routed nowhere —
 * they highlighted on press and did nothing. Every destination here exists and
 * works; Activity is a secondary route rather than a tab because it is an
 * occasional audit lookup, not a daily surface.
 *
 * A failed read shows an error with Retry, never zeros: "0 awaiting review"
 * would be indistinguishable from an empty queue, and an admin would stop
 * checking a queue that was actually full.
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { getAdminDashboardCounts, type AdminDashboardCounts } from '@/lib/admin';

type AdminRoute = '/(admin)/properties' | '/(admin)/partners' | '/(admin)/leads';

interface MetricCard {
  key: keyof AdminDashboardCounts;
  labelKey: TranslationKey;
  route: AdminRoute;
  tone: 'neutral' | 'info' | 'success' | 'warning';
}

const CARDS: MetricCard[] = [
  { key: 'pendingProperties', labelKey: 'awaitingReviewCount', route: '/(admin)/properties', tone: 'warning' },
  { key: 'publishedProperties', labelKey: 'publishedCount', route: '/(admin)/properties', tone: 'success' },
  { key: 'pendingApplications', labelKey: 'pendingApplicationsCount', route: '/(admin)/partners', tone: 'info' },
  { key: 'activePartners', labelKey: 'activePartnersCount', route: '/(admin)/partners', tone: 'neutral' },
  { key: 'newLeads', labelKey: 'newLeadsCount', route: '/(admin)/leads', tone: 'info' },
  { key: 'totalLeads', labelKey: 'totalLeadsCount', route: '/(admin)/leads', tone: 'neutral' },
];

export default function AdminDashboardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [counts, setCounts] = useState<AdminDashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setCounts(await getAdminDashboardCounts());
    } catch {
      // Never substitute invented management numbers for a failed read.
      setCounts(null);
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const toneColor = {
    neutral: colors.textSecondary,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={styles.eyebrow}>{t('adminWorkspace')}</Text>
        <Text style={styles.title}>{t('mizanManagement')}</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : failed || !counts ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{t('couldNotLoadCounts')}</Text>
            <Button title={t('tryAgain')} size="sm" variant="outline" fullWidth={false} onPress={() => void load()} />
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {CARDS.map((card) => {
                const value = counts[card.key];
                return (
                  <Pressable
                    key={String(card.key)}
                    onPress={() => router.push(card.route)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t(card.labelKey)}: ${value}`}
                    style={({ pressed }) => [styles.metric, pressed && styles.pressed]}
                  >
                    <Text style={[styles.metricValue, { color: toneColor[card.tone] }]}>{value}</Text>
                    <Text style={styles.metricLabel} numberOfLines={2}>
                      {t(card.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {counts.pendingProperties > 0 ? (
              <Pressable
                onPress={() => router.push('/(admin)/properties')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.alert, pressed && styles.pressed]}
              >
                <AppIcon name="time" size="sm" color={colors.warning} />
                <Text style={styles.alertText} numberOfLines={2}>
                  {t('reviewQueue')}
                </Text>
                <AppIcon name="arrowForward" size="xs" color={colors.warning} />
              </Pressable>
            ) : null}
          </>
        )}

        <Text style={styles.section}>{t('quickActions')}</Text>
        <View style={styles.actions}>
          <Button
            title={t('viewActivity')}
            icon="time"
            variant="secondary"
            size="lg"
            onPress={() => router.push('/(admin)/activity')}
          />
          {/* Plain navigation into the customer app. No mode flag, no persisted
              state; the way back is "Back to Mizan Management" in investor
              Profile and Settings. */}
          <Button
            title={t('viewAsInvestor')}
            icon="home"
            variant="secondary"
            size="lg"
            onPress={() => router.push('/(main)/home')}
          />
        </View>
        <Text style={styles.note}>{t('viewAsInvestorNote')}</Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal, gap: t.spacing.sm },
  eyebrow: { ...t.typography.tiny, color: t.colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { ...t.typography.h2, color: t.colors.text, marginBottom: t.spacing.md },
  loader: { marginTop: t.spacing.xl },
  stateCard: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.smd,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.spacing.md,
  },
  stateText: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  metric: {
    width: (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.sm) / 2,
    minHeight: 92,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    justifyContent: 'space-between',
  },
  metricValue: { ...t.typography.h1 },
  metricLabel: { ...t.typography.caption, color: t.colors.textSecondary },
  pressed: { opacity: 0.72 },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    marginTop: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.lg,
    borderWidth: 1,
    borderColor: t.colors.warning,
    backgroundColor: t.colors.surface,
  },
  alertText: { flex: 1, minWidth: 0, ...t.typography.caption, color: t.colors.text },
  section: {
    ...t.typography.label,
    color: t.colors.textSecondary,
    marginTop: t.spacing.xl,
    marginBottom: t.spacing.xs,
  },
  actions: { gap: t.spacing.sm },
  note: { ...t.typography.tiny, color: t.colors.textMuted, lineHeight: 16, marginTop: t.spacing.xs },
}));
