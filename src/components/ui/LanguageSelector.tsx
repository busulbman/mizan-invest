/**
 * ============================================
 * LANGUAGE SELECTOR COMPONENT
 * ============================================
 *
 * Language switcher with glassmorphism style.
 * Supports: EN, TR, RU, AR
 *
 * Usage:
 * <LanguageSelector />
 *
 * TODO: Add RTL support for Arabic
 * TODO: Persist language preference
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';
import { Language } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';

// ============================================
// LANGUAGE OPTIONS
// ============================================

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
  { code: 'ru', label: 'RU' },
  { code: 'ar', label: 'AR' },
];

// ============================================
// TYPES
// ============================================

export interface LanguageSelectorProps {
  /** Custom container style */
  style?: ViewStyle;
}

// ============================================
// COMPONENT
// ============================================

export function LanguageSelector({ style }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <BlurView intensity={30} tint="dark" style={[styles.container, style]}>
      {languages.map((lang, index) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            language === lang.code && styles.active,
            index < languages.length - 1 && styles.buttonWithBorder,
          ]}
          onPress={() => setLanguage(lang.code)}
          activeOpacity={0.7}
        >
          <Text style={[styles.text, language === lang.code && styles.activeText]}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </BlurView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonWithBorder: {
    borderRightWidth: 1,
    borderRightColor: theme.colors.overlay.light,
  },
  active: {
    backgroundColor: theme.colors.accentOverlay.light,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.textOnDarkMuted,
  },
  activeText: {
    color: theme.colors.accent,
  },
});

export default LanguageSelector;
