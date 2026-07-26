/**
 * ============================================
 * CATEGORY CARD COMPONENT
 * ============================================
 *
 * Property category card (Villas, Apartments, etc.)
 * Used in: Home screen categories section
 *
 * TODO: Add navigation to category listings
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';

// ============================================
// TYPES
// ============================================

export interface CategoryCardProps {
  name: string;
  icon: IconName;
  count: number;
  onPress?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function CategoryCard({ name, icon, count, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconContainer}>
        <AppIcon name={icon} size="xl" color={theme.colors.primary} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: 2,
  },
  count: {
    ...theme.typography.label,
    color: theme.colors.textLight,
  },
});

export default CategoryCard;
