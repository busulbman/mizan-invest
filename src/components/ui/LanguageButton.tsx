/**
 * ============================================
 * LANGUAGE BUTTON COMPONENT
 * ============================================
 *
 * Compact language switcher for light screens (Home header, Profile).
 * Shows a globe icon plus the active language code and opens a small
 * bottom sheet with RU / AR / EN / TR.
 *
 * The glassmorphism `LanguageSelector` is still used on the dark
 * Welcome screen; this variant is the light-surface counterpart.
 *
 * Usage:
 *   <LanguageButton />
 *   <LanguageButton variant="row" />
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { LANGUAGE_ORDER, Language, languageCodes, languageNames } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';

export interface LanguageButtonProps {
  /**
   * `compact` — icon + code pill, made for headers (default)
   * `row` — full-width settings row showing the language name
   */
  variant?: 'compact' | 'row';

  /** Custom container style */
  style?: ViewStyle;
}

export function LanguageButton({ variant = 'compact', style }: LanguageButtonProps) {
  const { language, setLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <>
      {variant === 'compact' ? (
        <TouchableOpacity
          style={[styles.compact, style]}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('selectLanguage')}
        >
          <AppIcon name="globe" size="sm" color={theme.colors.textDark} />
          <Text style={styles.compactText}>{languageCodes[language]}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.row, style]}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('selectLanguage')}
        >
          <View style={styles.rowIcon}>
            <AppIcon name="language" size="md" color={theme.colors.primary} />
          </View>
          <Text style={styles.rowLabel}>{t('language')}</Text>
          <Text style={styles.rowValue}>{languageNames[language]}</Text>
          <AppIcon name="chevronDown" size="sm" color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.lg }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{t('selectLanguage')}</Text>

            {LANGUAGE_ORDER.map((lang) => {
              const isActive = lang === language;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => handleSelect(lang)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.codeChip, isActive && styles.codeChipActive]}>
                    <Text style={[styles.codeText, isActive && styles.codeTextActive]}>
                      {languageCodes[lang]}
                    </Text>
                  </View>
                  <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                    {languageNames[lang]}
                  </Text>
                  {isActive && (
                    <AppIcon name="verified" size="md" color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Compact header pill
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textDark,
  },

  // Settings row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.cardPadding,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textDark,
  },
  rowValue: {
    ...theme.typography.small,
    color: theme.colors.textLight,
  },

  // Bottom sheet
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay.dark,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.hero,
    borderTopRightRadius: theme.borderRadius.hero,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.smd,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  sheetTitle: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.smd,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smd,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.smd,
    borderRadius: theme.borderRadius.md,
  },
  optionActive: {
    backgroundColor: theme.colors.accentOverlay.light,
  },
  codeChip: {
    width: 44,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  codeChipActive: {
    backgroundColor: theme.colors.primary,
  },
  codeText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textLight,
  },
  codeTextActive: {
    color: theme.colors.white,
  },
  optionLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textDark,
  },
  optionLabelActive: {
    fontWeight: '600',
  },
});

export default LanguageButton;
