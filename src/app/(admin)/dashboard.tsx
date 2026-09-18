import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppIcon, Button, IconButton } from '@/components/ui';
import { getAdminDashboardCounts, type AdminDashboardCounts } from '@/lib/admin';
import type { TranslationKey } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';

/**
 * Section ids are stable and never user-visible; the label beside each one is
 * a translation key so the menu reads in the user's language.
 */
const SECTIONS = ['dashboard', 'properties', 'partners', 'leads', 'content', 'activity'] as const;

type AdminSection = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<AdminSection, TranslationKey> = {
  dashboard: 'adminDashboard',
  properties: 'propertiesTitle',
  partners: 'partners',
  leads: 'leads',
  content: 'contentSection',
  activity: 'activitySection',
};

function sectionRoute(section: AdminSection) {
  if (section === 'properties') return '/(admin)/properties';
  if (section === 'partners') return '/(admin)/partners';
  if (section === 'activity') return '/(admin)/activity';
  return null;
}

export default function AdminDashboardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [counts, setCounts] = useState<AdminDashboardCounts | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setCounts(await getAdminDashboardCounts());
    } catch {
      // Do not substitute made-up management numbers when an RLS/network read
      // cannot complete.
      setCounts(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const metrics = counts
    ? [
        [t('publishedProperties'), counts.publishedProperties],
        [t('pendingProperties'), counts.pendingProperties],
        [t('partners'), counts.partners],
        [t('leads'), counts.leads],
      ] as const
    : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn} style={styles.header}>
          <IconButton icon="back" onPress={() => goBackOr('/(main)/settings')} accessibilityLabel={t('back')} variant="surface" size={44} />
          <Text style={styles.title}>{t('mizanManagement')}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80)} style={styles.section}>
          <Text style={styles.heading}>{t('adminDashboard')}</Text>
          {loading ? (
            <View style={styles.state}><ActivityIndicator color={colors.accent} /></View>
          ) : error ? (
            <View style={styles.state}><Text style={styles.stateText}>{t('networkError')}</Text><Button title={t('tryAgain')} onPress={() => void load()} size="sm" variant="outline" fullWidth={false} /></View>
          ) : (
            <View style={styles.grid}>
              {metrics.map(([label, value]) => <View key={label} style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>)}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140)} style={styles.section}>
          <View style={styles.group}>
            {SECTIONS.map((section, index) => (
              <Pressable key={section} accessibilityRole="button" onPress={() => { const route = sectionRoute(section); if (route) router.push(route); }} style={({ pressed }) => [styles.row, index > 0 && styles.divider, pressed && styles.pressed]}>
                <AppIcon name={section === 'dashboard' ? 'analytics' : section === 'leads' ? 'message' : section === 'partners' ? 'building' : 'listings'} size="md" color={colors.accent} />
                <Text style={styles.rowLabel}>{t(SECTION_LABELS[section])}</Text>
                <AppIcon name="arrowForward" size="sm" color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingBottom: t.spacing.section },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, paddingHorizontal: t.spacing.screenHorizontal },
  title: { flex: 1, minWidth: 0, ...t.typography.h3, color: t.colors.text, textAlign: 'center' },
  headerSpacer: { width: 44 },
  section: { marginTop: t.spacing.xl },
  heading: { ...t.typography.label, color: t.colors.textSecondary, marginHorizontal: t.spacing.screenHorizontal, marginBottom: t.spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginHorizontal: t.spacing.screenHorizontal },
  metric: { width: (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.sm) / 2, minHeight: 102, padding: t.spacing.md, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, justifyContent: 'space-between' },
  metricValue: { ...t.typography.h1, color: t.colors.accent },
  metricLabel: { ...t.typography.caption, color: t.colors.textSecondary },
  state: { marginHorizontal: t.spacing.screenHorizontal, minHeight: 110, alignItems: 'center', justifyContent: 'center', gap: t.spacing.smd, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  stateText: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center' },
  group: { marginHorizontal: t.spacing.screenHorizontal, borderRadius: t.borderRadius.xl, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.smd, minHeight: 58, paddingHorizontal: t.spacing.cardPadding },
  rowLabel: { flex: 1, minWidth: 0, ...t.typography.bodyBold, color: t.colors.text },
  divider: { borderTopWidth: 1, borderTopColor: t.colors.border },
  pressed: { opacity: 0.72 },
}));
