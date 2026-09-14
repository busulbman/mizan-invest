/**
 * ============================================
 * SETTINGS
 * ============================================
 *
 * The three preferences that change how the whole app renders:
 * language, display currency and appearance.
 *
 * Each row opens the same bottom-sheet picker used elsewhere, and each
 * choice is persisted locally — appropriate for a demo, and the reason
 * none of this touches a backend.
 */

import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppConfig } from '@/constants/config';
import {
  AppearancePicker,
  CurrencyPicker,
  IconButton,
  LanguagePicker,
} from '@/components/ui';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const styles = useStyles();
  const { t } = useLanguage();
  const { rate } = useCurrency();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <IconButton
          icon="back"
          onPress={() => router.back()}
          accessibilityLabel={t('back')}
          variant="surface"
          size={40}
        />
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t('settings')}
        </Text>
        <View style={styles.spacer} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(60)} style={styles.section}>
          <Text style={styles.sectionLabel} numberOfLines={1}>
            {t('preferences')}
          </Text>
          <View style={styles.group}>
            <LanguagePicker variant="row" />
            <View style={styles.divider} />
            <CurrencyPicker variant="row" />
            <View style={styles.divider} />
            <AppearancePicker variant="row" />
          </View>

          {/* Demo-rate disclaimer, stated plainly next to the setting */}
          <Text style={styles.note} numberOfLines={3}>
            {t('demoExchangeRate')}: {rate}. {t('demoRateNote')}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120)} style={styles.section}>
          <Text style={styles.sectionLabel} numberOfLines={1}>
            {t('aboutSection')}
          </Text>
          <View style={styles.group}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel} numberOfLines={1}>
                {t('appName')}
              </Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {AppConfig.appName}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel} numberOfLines={1}>
                {t('appVersion')}
              </Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {AppConfig.version}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingBottom: t.spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    ...t.typography.h3,
    color: t.colors.text,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  content: {
    paddingBottom: t.spacing.section,
  },
  section: {
    marginTop: t.spacing.md,
  },
  sectionLabel: {
    ...t.typography.label,
    color: t.colors.textSecondary,
    paddingHorizontal: t.spacing.screenHorizontal,
    marginBottom: t.spacing.sm,
  },
  group: {
    marginHorizontal: t.spacing.screenHorizontal,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: t.spacing.cardPadding + 36 + t.spacing.smd,
    backgroundColor: t.colors.border,
  },
  note: {
    ...t.typography.tiny,
    color: t.colors.textMuted,
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.smd,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.smd,
    minHeight: 52,
    paddingHorizontal: t.spacing.cardPadding,
  },
  infoLabel: {
    flexShrink: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
  },
  infoValue: {
    flexShrink: 0,
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
}));
