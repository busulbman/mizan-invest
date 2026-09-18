/**
 * ============================================
 * WELCOME
 * ============================================
 *
 * The choice screen after onboarding: continue as guest, sign in as an
 * investor, or enter the partner portal.
 *
 * Always dark — it sits on photography in both appearances, so the copy
 * is white and the controls are glass. The language switcher is here
 * because this is the first screen where someone in the room might want
 * to change it before the walkthrough starts.
 *
 * The content column is a ScrollView so that on a small phone the third
 * button and the footnote stay reachable instead of being clipped.
 */

import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Images } from '@/constants/images';
import { AppIcon, Badge, Button, LanguagePicker, LogoMark, RemoteImage } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useMarket } from '@/context/MarketContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export default function WelcomeScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { t } = useLanguage();
  const { hasChosenMarket } = useMarket();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <RemoteImage uri={Images.hero.welcome} style={styles.background} />

      <LinearGradient
        colors={gradients.heroOverlay}
        locations={[0, 0.3, 0.62, 0.88]}
        style={styles.fill}
      >
        {/* Language switcher */}
        <Animated.View
          entering={FadeIn.delay(150)}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <LanguagePicker variant="glass" />
        </Animated.View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(220).duration(600)} style={styles.brand}>
            <LogoMark size="large" showShadow />
            <Text
              style={styles.appName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {t('appName')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(360).duration(600)} style={styles.hero}>
            <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
              {t('welcomeTitle')}
            </Text>
            <Text style={styles.subtitle} numberOfLines={4} ellipsizeMode="tail">
              {t('welcomeSubtitle')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.actions}>
            <Button
              title={t('continueAsGuest')}
              onPress={() => router.replace(hasChosenMarket ? '/(main)/home' : '/(auth)/market')}
              variant="gold"
              size="lg"
            />

            <Button
              title={t('investorLogin')}
              onPress={() => router.push('/(auth)/investor-login')}
              variant="glass"
              size="lg"
              icon="wallet"
              iconRight="arrowForward"
            />

            {/* Partner entry carries the PRO marker */}
            <View style={styles.partnerWrap}>
              <Button
                title={t('partnerLogin')}
                onPress={() => router.push('/(auth)/partner-login')}
                variant="glass"
                size="lg"
                icon="building"
              />
              <View style={styles.proBadge} pointerEvents="none">
                <Badge label="PRO" tone="accent" small />
              </View>
            </View>

            <View style={styles.noteRow}>
              <AppIcon name="security" size="xs" color={colors.onDarkMuted} />
              <Text style={styles.note} numberOfLines={2} ellipsizeMode="tail">
                {t('partnerNote')}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.backgroundDark,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fill: {
    flex: 1,
  },

  header: {
    paddingHorizontal: t.spacing.screenHorizontal,
    alignItems: 'flex-end',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: t.spacing.smd,
  },
  appName: {
    ...t.typography.h2,
    color: t.colors.onDark,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: t.spacing.xl,
  },
  title: {
    ...t.typography.hero,
    fontSize: t.metrics.isSmall ? 28 : 34,
    lineHeight: t.metrics.isSmall ? 36 : 42,
    color: t.colors.onDark,
    textAlign: 'center',
    marginBottom: t.spacing.smd,
  },
  subtitle: {
    ...t.typography.body,
    color: t.colors.onDarkMuted,
    textAlign: 'center',
  },
  actions: {
    gap: t.spacing.smd,
  },
  partnerWrap: {
    position: 'relative',
  },
  proBadge: {
    position: 'absolute',
    right: t.spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
  },
  note: {
    flexShrink: 1,
    ...t.typography.tiny,
    color: t.colors.onDarkMuted,
    textAlign: 'center',
  },
}));
