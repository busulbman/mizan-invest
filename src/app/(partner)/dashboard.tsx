/**
 * ============================================
 * PARTNER DASHBOARD
 * ============================================
 *
 * The workspace landing screen, showing the partner's real portfolio state.
 *
 * REAL DATA ONLY
 * Every number comes from `publication_status` on the partner's own rows via
 * `getPartnerPropertyCounts`. Nothing is estimated, and a failed read shows an
 * error with a retry rather than zeros — a fabricated "0 published" would be
 * indistinguishable from a real empty portfolio and would be worse than saying
 * the read failed.
 *
 * "Needs changes" is not a status: a rejected listing is `unpublished` with a
 * `rejection_reason`. The data layer separates the two so this screen does not
 * have to know that.
 *
 * Each card carries a status into Properties, which opens filtered on it.
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Button } from '@/components/ui';
import type { TranslationKey } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import {
  EMPTY_PARTNER_COUNTS,
  getPartnerPropertyCounts,
  type PartnerPropertyCounts,
} from '@/lib/partner';
import type { PropertyListFilter } from '@/lib/partnerFilters';

interface MetricCard {
  key: keyof PartnerPropertyCounts;
  labelKey: TranslationKey;
  filter: PropertyListFilter;
  tone: 'neutral' | 'info' | 'success' | 'warning';
}

const CARDS: MetricCard[] = [
  { key: 'total', labelKey: 'totalProperties', filter: 'all', tone: 'neutral' },
  { key: 'drafts', labelKey: 'draftsCount', filter: 'draft', tone: 'neutral' },
  { key: 'pendingReview', labelKey: 'pendingReviewCount', filter: 'pending_review', tone: 'info' },
  { key: 'published', labelKey: 'publishedCount', filter: 'published', tone: 'success' },
  { key: 'needsChanges', labelKey: 'needsChangesCount', filter: 'needs_changes', tone: 'warning' },
];

export default function PartnerDashboardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { profile, partnerMemberships } = useAuth();
  const insets = useSafeAreaInsets();

  const partnerId = partnerMemberships[0]?.partnerId;

  const [counts, setCounts] = useState<PartnerPropertyCounts>(EMPTY_PARTNER_COUNTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }
    setFailed(false);
    try {
      setCounts(await getPartnerPropertyCounts(partnerId));
    } catch {
      // No invented numbers when the read cannot complete.
      setCounts(EMPTY_PARTNER_COUNTS);
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partnerId]);

  // Re-read on focus so submitting or saving elsewhere is reflected here.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const openFiltered = (filter: PropertyListFilter) =>
    router.push({ pathname: '/(partner)/properties', params: { filter } });

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
        <Text style={styles.eyebrow}>{t('partnerPortalBadge')}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {profile?.fullName || t('partnerDashboard')}
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : failed ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{t('couldNotLoadDashboard')}</Text>
            <Button title={t('tryAgain')} size="sm" variant="outline" fullWidth={false} onPress={() => void load()} />
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {CARDS.map((card) => (
                <Pressable
                  key={card.key}
                  onPress={() => openFiltered(card.filter)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(card.labelKey)}: ${counts[card.key]}`}
                  style={({ pressed }) => [styles.metric, pressed && styles.pressed]}
                >
                  <Text style={[styles.metricValue, { color: toneColor[card.tone] }]}>{counts[card.key]}</Text>
                  <Text style={styles.metricLabel} numberOfLines={2}>
                    {t(card.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {counts.total === 0 ? <Text style={styles.empty}>{t('noPropertiesYetDashboard')}</Text> : null}

            {counts.needsChanges > 0 ? (
              <Pressable
                onPress={() => openFiltered('needs_changes')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.alert, pressed && styles.pressed]}
              >
                <AppIcon name="warning" size="sm" color={colors.warning} />
                <Text style={styles.alertText} numberOfLines={2}>
                  {t('hintChangesRequested')}
                </Text>
                <AppIcon name="arrowForward" size="xs" color={colors.warning} />
              </Pressable>
            ) : null}
          </>
        )}

        <Text style={styles.section}>{t('quickActions')}</Text>
        <View style={styles.actions}>
          <Button
            title={t('addNewListing')}
            icon="create"
            variant="gold"
            size="lg"
            onPress={() => router.push('/(partner)/add-property')}
          />
          <Button
            title={t('myProperties')}
            icon="listings"
            variant="secondary"
            size="lg"
            onPress={() => openFiltered('all')}
          />
        </View>
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
  empty: { ...t.typography.caption, color: t.colors.textMuted, lineHeight: 18, marginTop: t.spacing.sm },
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
}));
