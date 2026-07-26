/**
 * ============================================
 * PRIMARY BUTTON COMPONENT
 * ============================================
 *
 * Main call-to-action button with gold gradient.
 * Used for: Submit, Continue, Explore, etc.
 *
 * Usage:
 * <PrimaryButton title="Continue" onPress={handlePress} />
 * <PrimaryButton title="Loading" loading />
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface PrimaryButtonProps {
  /** Button label text */
  title: string;

  /** Press handler */
  onPress: () => void;

  /** Custom container style */
  style?: ViewStyle;

  /** Show loading spinner */
  loading?: boolean;

  /** Disable button interaction */
  disabled?: boolean;

  /** Use gold gradient (default) or solid primary */
  variant?: 'gold' | 'primary';
}

// ============================================
// COMPONENT
// ============================================

export function PrimaryButton({
  title,
  onPress,
  style,
  loading = false,
  disabled = false,
  variant = 'gold',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  // Gold gradient variant
  if (variant === 'gold') {
    return (
      <TouchableOpacity
        style={[styles.container, style, isDisabled && styles.disabled]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={theme.gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.textGold}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Solid primary variant
  return (
    <TouchableOpacity
      style={[styles.container, styles.primaryBg, style, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={styles.textPrimary}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.gold,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBg: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.primary,
  },
  textGold: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  textPrimary: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default PrimaryButton;
