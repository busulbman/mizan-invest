/**
 * ============================================
 * BOTTOM CTA COMPONENT
 * ============================================
 *
 * Sticky bottom action bar.
 * Shows: Contact Partner + Save Property buttons
 *
 * Used in: Property Detail Screen
 *
 * TODO: Lead Generation System
 * TODO: CRM Tracking
 * TODO: Commission Tracking
 * TODO: Connect to messaging system
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface BottomCTAProps {
  onContactPartner?: () => void;
  onSaveProperty?: () => void;
  isSaved?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function BottomCTA({ onContactPartner, onSaveProperty, isSaved = false }: BottomCTAProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={[styles.blur, { paddingBottom: insets.bottom + 8 }]}>
        {/* Info text */}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{t('interestedInProperty')}</Text>
          <Text style={styles.infoSubtext}>{t('getInTouch')}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          {/* Save Property - Secondary */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSaveProperty}
            activeOpacity={0.8}
          >
            <AppIcon
              name={isSaved ? 'favoriteFilled' : 'favorite'}
              size="md"
              color={isSaved ? theme.colors.error : theme.colors.textDark}
            />
            <Text style={styles.saveText}>{t('saveProperty')}</Text>
          </TouchableOpacity>

          {/* Contact Partner - Primary */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={onContactPartner}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={theme.gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactGradient}
            >
              <AppIcon name="message" size="md" color={theme.colors.primary} />
              <Text style={styles.contactText}>{t('contactPartner')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  blur: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing.md,
  },
  infoRow: {
    marginBottom: theme.spacing.smd,
  },
  infoText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
  },
  infoSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.smd,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  saveText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
  },
  contactButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.gold,
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  contactText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});

export default BottomCTA;
