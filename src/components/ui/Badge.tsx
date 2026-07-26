/**
 * ============================================
 * BADGE COMPONENT
 * ============================================
 *
 * Status badge for labels, tags, and indicators.
 * Used for: Verified, ROI, Status labels, etc.
 *
 * Usage:
 * <Badge label="Verified" variant="success" />
 * <Badge label="14.6% ROI" variant="gold" />
 * <Badge label="NEW" variant="primary" />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface BadgeProps {
  /** Badge text */
  label: string;

  /** Badge style variant */
  variant?: 'default' | 'primary' | 'gold' | 'success' | 'glass';

  /** Optional icon (emoji or component) */
  icon?: string | React.ReactNode;

  /** Show dot indicator */
  showDot?: boolean;

  /** Custom container style */
  style?: ViewStyle;

  /** Badge size */
  size?: 'small' | 'medium';
}

// ============================================
// COMPONENT
// ============================================

export function Badge({
  label,
  variant = 'default',
  icon,
  showDot = false,
  style,
  size = 'medium',
}: BadgeProps) {
  const isSmall = size === 'small';

  // Glass variant with blur
  if (variant === 'glass') {
    return (
      <View style={[styles.glassContainer, style]}>
        <BlurView intensity={30} tint="dark" style={styles.glassBlur}>
          {showDot && <View style={[styles.dot, styles.dotGold]} />}
          {icon && (
            <Text style={[styles.icon, isSmall && styles.iconSmall]}>
              {typeof icon === 'string' ? icon : null}
            </Text>
          )}
          <Text style={[styles.glassText, isSmall && styles.textSmall]}>{label}</Text>
        </BlurView>
      </View>
    );
  }

  // Get variant styles
  const variantStyles = {
    default: { container: styles.defaultContainer, text: styles.defaultText, dot: styles.dotDefault },
    primary: { container: styles.primaryContainer, text: styles.primaryText, dot: styles.dotPrimary },
    gold: { container: styles.goldContainer, text: styles.goldText, dot: styles.dotGold },
    success: { container: styles.successContainer, text: styles.successText, dot: styles.dotSuccess },
  }[variant] || { container: styles.defaultContainer, text: styles.defaultText, dot: styles.dotDefault };

  return (
    <View style={[styles.base, variantStyles.container, isSmall && styles.containerSmall, style]}>
      {showDot && <View style={[styles.dot, variantStyles.dot]} />}
      {icon && (
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>
          {typeof icon === 'string' ? icon : null}
        </Text>
      )}
      <Text style={[styles.text, variantStyles.text, isSmall && styles.textSmall]}>{label}</Text>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  containerSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  text: {
    ...theme.typography.label,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: 10,
  },
  icon: {
    fontSize: 12,
  },
  iconSmall: {
    fontSize: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Default variant
  defaultContainer: {
    backgroundColor: theme.colors.background,
  },
  defaultText: {
    color: theme.colors.textLight,
  },
  dotDefault: {
    backgroundColor: theme.colors.textLight,
  },

  // Primary variant
  primaryContainer: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors.white,
  },
  dotPrimary: {
    backgroundColor: theme.colors.white,
  },

  // Gold variant
  goldContainer: {
    backgroundColor: theme.colors.accentOverlay.light,
  },
  goldText: {
    color: theme.colors.accent,
  },
  dotGold: {
    backgroundColor: theme.colors.accent,
  },

  // Success variant
  successContainer: {
    backgroundColor: theme.colors.successOverlay.light,
    borderWidth: 1,
    borderColor: theme.colors.successOverlay.medium,
  },
  successText: {
    color: theme.colors.success,
  },
  dotSuccess: {
    backgroundColor: theme.colors.success,
  },

  // Glass variant
  glassContainer: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.accentOverlay.medium,
  },
  glassBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  glassText: {
    ...theme.typography.label,
    color: theme.colors.accent,
    textTransform: 'uppercase',
  },
});

export default Badge;
