/**
 * ============================================
 * SECONDARY BUTTON COMPONENT
 * ============================================
 *
 * Secondary action button with glass/outlined style.
 * Used for: Alternative actions, navigation, etc.
 *
 * Usage:
 * <SecondaryButton title="Login" onPress={handleLogin} />
 * <SecondaryButton title="Skip" variant="ghost" />
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface SecondaryButtonProps {
  /** Button label text */
  title: string;

  /** Press handler */
  onPress: () => void;

  /** Custom container style */
  style?: ViewStyle;

  /** Optional icon component */
  icon?: React.ReactNode;

  /** Button style variant */
  variant?: 'outlined' | 'ghost' | 'glass';

  /** Disable button interaction */
  disabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function SecondaryButton({
  title,
  onPress,
  style,
  icon,
  variant = 'outlined',
  disabled = false,
}: SecondaryButtonProps) {
  // Glass variant with blur effect
  if (variant === 'glass') {
    return (
      <TouchableOpacity
        style={[styles.glassContainer, style, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <BlurView intensity={20} tint="dark" style={styles.glassBlur}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.glassText}>{title}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  }

  // Ghost variant (transparent)
  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        style={[styles.ghostContainer, style, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.ghostText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  // Default outlined variant
  return (
    <TouchableOpacity
      style={[styles.outlinedContainer, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.outlinedText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Outlined variant
  outlinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  outlinedText: {
    ...theme.typography.button,
    color: theme.colors.textDark,
  },

  // Ghost variant
  ghostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'transparent',
  },
  ghostText: {
    ...theme.typography.button,
    color: theme.colors.textLight,
  },

  // Glass variant
  glassContainer: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  glassBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  glassText: {
    flex: 1,
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },

  // Shared
  iconContainer: {
    marginRight: 12,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default SecondaryButton;
