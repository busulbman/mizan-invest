/**
 * ============================================
 * HIGH YIELD CARD COMPONENT
 * ============================================
 *
 * Gold-accent card for high ROI properties.
 * Used in: Home screen high yield section
 *
 * TODO: Add navigation to property detail screen
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme';
import { formatPrice } from '@/constants/mockData';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface HighYieldCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  roi: number;
  image: string;
  onPress?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function HighYieldCard({ id, title, location, price, roi, image, onPress }: HighYieldCardProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={[theme.colors.accentOverlay.light, 'rgba(212, 180, 131, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.content}>
          {/* ROI Badge */}
          <View style={styles.roiBadge}>
            <AppIcon name="trendUp" size="sm" color={theme.colors.accent} />
            <Text style={styles.roiValue}>{roi}% ROI</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.locationRow}>
            <AppIcon name="location" size="xs" color={theme.colors.textLight} />
            <Text style={styles.location}>{location}</Text>
          </View>
          <Text style={styles.price}>{formatPrice(price)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.accentOverlay.light,
    marginBottom: theme.spacing.smd,
  },
  gradient: {
    flexDirection: 'row',
    padding: 14,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  roiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accentOverlay.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
    marginBottom: theme.spacing.sm,
    gap: 4,
  },
  roiValue: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  title: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  location: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  price: {
    ...theme.typography.h4,
    color: theme.colors.primary,
  },
});

export default HighYieldCard;
