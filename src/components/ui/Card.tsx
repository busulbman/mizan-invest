/**
 * ============================================
 * CARD COMPONENT
 * ============================================
 *
 * Reusable card container with consistent styling.
 * Used for: Property cards, info cards, etc.
 *
 * Usage:
 * <Card>Content here</Card>
 * <Card variant="elevated">Elevated content</Card>
 * <Card variant="glass">Glass effect content</Card>
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface CardProps {
  /** Card content */
  children: React.ReactNode;

  /** Custom container style */
  style?: ViewStyle;

  /** Card style variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';

  /** Make card pressable */
  onPress?: () => void;

  /** Padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
}

// ============================================
// COMPONENT
// ============================================

export function Card({
  children,
  style,
  variant = 'default',
  onPress,
  padding = 'medium',
}: CardProps) {
  const paddingValue = {
    none: 0,
    small: theme.spacing.sm,
    medium: theme.spacing.md,
    large: theme.spacing.xl,
  }[padding];

  // Glass variant with blur
  if (variant === 'glass') {
    const content = (
      <BlurView intensity={20} tint="dark" style={[styles.glassBlur, { padding: paddingValue }]}>
        {children}
      </BlurView>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={[styles.glassContainer, style]}
          onPress={onPress}
          activeOpacity={0.9}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return <View style={[styles.glassContainer, style]}>{content}</View>;
  }

  // Standard variants
  const variantStyles = {
    default: styles.default,
    elevated: styles.elevated,
    outlined: styles.outlined,
  }[variant] || styles.default;

  const content = (
    <View style={[variantStyles, { padding: paddingValue }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  default: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.card,
  },
  elevated: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.floating,
  },
  outlined: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  glassContainer: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  glassBlur: {
    // Padding applied dynamically
  },
});

export default Card;
