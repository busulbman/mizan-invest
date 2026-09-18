import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Badge, Button, IconButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { goBackOr } from '@/lib/navigation';

/**
 * Deliberately a navigation shell. Listing creation/review remains a later
 * phase, so this screen never fabricates portfolio totals or permissions.
 */
export default function PartnerDashboardScreen() {
  const styles = useStyles();
  const { gradients } = useTheme();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.partnerGradient} locations={[0, 0.45, 1]} style={styles.fill}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.delay(80)} style={styles.topRow}>
            <IconButton icon="back" onPress={() => goBackOr('/(main)/settings')} accessibilityLabel={t('back')} variant="glass" size={44} />
            <Badge label={t('partnerPortalBadge')} tone="accent" icon="building" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160)} style={styles.hero}>
            <Text style={styles.title} numberOfLines={2}>{t('partnerDashboard')}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{profile?.fullName || t('partnerSubtitle')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(240)} style={styles.actions}>
            <Button title={t('myProperties')} onPress={() => router.push('/(partner)/properties')} variant="glass" size="lg" icon="listings" />
            <Button title={t('addNewListing')} onPress={() => router.push('/(partner)/add-property')} variant="gold" size="lg" icon="create" />
            <Button title={t('pendingReview')} onPress={() => router.push('/(partner)/pending-review')} variant="glass" size="lg" icon="time" />
            <Button title={t('profileTitle')} onPress={() => router.push('/(partner)/profile')} variant="glass" size="lg" icon="profile" />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.backgroundDark },
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: t.spacing.screenHorizontal },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { alignItems: 'center', paddingVertical: t.spacing.section, gap: t.spacing.xs },
  title: { ...t.typography.h1, color: t.colors.onDark, textAlign: 'center' },
  subtitle: { ...t.typography.body, color: t.colors.onDarkMuted, textAlign: 'center' },
  actions: { gap: t.spacing.smd },
}));
