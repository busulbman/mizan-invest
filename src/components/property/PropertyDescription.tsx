/**
 * ============================================
 * PROPERTY DESCRIPTION COMPONENT
 * ============================================
 *
 * Expandable property description text.
 * Shows: Full description with read more/less
 *
 * Used in: Property Detail Screen
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface PropertyDescriptionProps {
  description: string;
  maxLines?: number;
}

// ============================================
// COMPONENT
// ============================================

export function PropertyDescription({ description, maxLines = 4 }: PropertyDescriptionProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <Text style={styles.title}>{t('aboutProperty')}</Text>

      {/* Description text */}
      <Text
        style={styles.description}
        numberOfLines={isExpanded ? undefined : maxLines}
      >
        {description}
      </Text>

      {/* Read more/less button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.toggleText}>
          {isExpanded ? t('readLess') : t('readMore')}
        </Text>
        <AppIcon
          name={isExpanded ? 'chevronUp' : 'chevronDown'}
          size="sm"
          color={theme.colors.accent}
        />
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.screenHorizontal,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    lineHeight: 26,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: 4,
  },
  toggleText: {
    ...theme.typography.bodyBold,
    color: theme.colors.accent,
  },
  toggleArrow: {
    fontSize: 14,
    color: theme.colors.accent,
  },
});

export default PropertyDescription;
