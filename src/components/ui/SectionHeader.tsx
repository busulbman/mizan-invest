/**
 * ============================================
 * SECTION HEADER COMPONENT
 * ============================================
 *
 * Header for content sections with title and action.
 * Used for: Home screen sections, lists, etc.
 *
 * Usage:
 * <SectionHeader title="Featured Properties" />
 * <SectionHeader title="Partners" subtitle="Verified" actionText="See all" />
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { AppIcon } from './AppIcon';

// ============================================
// TYPES
// ============================================

export interface SectionHeaderProps {
  /** Section title */
  title: string;

  /** Optional subtitle */
  subtitle?: string;

  /** Action button text */
  actionText?: string;

  /** Action button press handler */
  onActionPress?: () => void;

  /** Custom container style */
  style?: ViewStyle;
}

// ============================================
// COMPONENT
// ============================================

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {actionText && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionText}</Text>
          <AppIcon name="arrowForward" size="sm" color={theme.colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textDark,
  },
  subtitle: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  actionText: {
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  actionArrow: {
    fontSize: 14,
    color: theme.colors.accent,
  },
});

export default SectionHeader;
