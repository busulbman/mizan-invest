/**
 * ============================================
 * STICKY BOTTOM CTA
 * ============================================
 *
 * Pinned action bar on the listing page: WhatsApp, call, and the primary
 * "I'm interested" button.
 *
 * WhatsApp and call use real deep links (`whatsapp://`, `tel:`) with the
 * partner's number, and fall back to an explanatory alert when the
 * device cannot open them — a simulator, or a phone without WhatsApp.
 * "I'm interested" confirms the request locally; there is no CRM or lead
 * backend in this demo and none should be added here.
 *
 * The bar sits above the home indicator and blurs the content behind it,
 * so the page keeps scrolling underneath instead of ending in a wall.
 */

import { Alert, Linking, Platform, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/ui';
import { Partner } from '@/constants/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export interface BottomCTAProps {
  partner?: Partner;
  /** Listing title, quoted in the pre-filled WhatsApp message */
  propertyTitle: string;
}

export function BottomCTA({ partner, propertyTitle }: BottomCTAProps) {
  const styles = useStyles();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const openLink = async (url: string, fallbackTitle: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // Fall through to the explanatory alert below
    }
    Alert.alert(fallbackTitle, t('demoActionBody'));
  };

  const handleWhatsApp = () => {
    if (!partner) return;
    const message = encodeURIComponent(`${t('imInterested')}: ${propertyTitle}`);
    const number = partner.whatsapp.replace(/[^\d]/g, '');
    openLink(`whatsapp://send?phone=${number}&text=${message}`, t('whatsappContact'));
  };

  const handleCall = () => {
    if (!partner) return;
    openLink(`tel:${partner.phone.replace(/\s/g, '')}`, t('callPartner'));
  };

  const handleInterest = () => {
    Alert.alert(t('requestSent'), t('requestSentBody'));
  };

  return (
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
          />
          <IconButton
            icon="call"
            onPress={handleCall}
            accessibilityLabel={t('callPartner')}
            variant="surface"
            size={52}
          />
          {/* Primary action takes the remaining width */}
          <Button
            title={t('imInterested')}
            onPress={handleInterest}
            variant="gold"
            size="lg"
            style={styles.primary}
          />
        </View>
      </BlurView>
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
    // Android has no blur, so the bar needs a solid backing there
    backgroundColor: t.colors.bar,
  },
  bar: {
    paddingHorizontal: t.spacing.screenHorizontal,
    paddingTop: t.spacing.smd,
    gap: t.spacing.sm,
  },
  lead: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  primary: {
    flex: 1,
    minWidth: 0,
  },
}));

export default BottomCTA;
