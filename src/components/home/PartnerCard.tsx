/**
 * ============================================
 * PARTNER CARD COMPONENT
 * ============================================
 *
 * Verified partner card with logo and stats.
 * Used in: Home screen partners section
 *
 * TODO: Add navigation to partner profile screen
 * TODO: Replace placeholder logos with actual partner logos
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '@/theme';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface PartnerCardProps {
  name: string;
  country: string;
  listings: number;
  rating: number;
  logo: string;
  onPress?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function PartnerCard({ name, country, listings, rating, logo, onPress }: PartnerCardProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: logo }} style={styles.logo} />

      <View style={styles.content}>
        {/* Header: Name + Rating */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.ratingContainer}>
            <AppIcon name="star" size="sm" color={theme.colors.warning} />
            <Text style={styles.rating}>{rating}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <AppIcon name="location" size="xs" color={theme.colors.textLight} />
          <Text style={styles.country}>{country}</Text>
        </View>

        {/* Footer: Verified badge + Listings count */}
        <View style={styles.footer}>
          <View style={styles.verifiedBadge}>
            <AppIcon name="verified" size="xs" color={theme.colors.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
          <View style={styles.listingsContainer}>
            <AppIcon name="listings" size="xs" color={theme.colors.textLight} />
            <Text style={styles.listings}>{listings}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: 14,
    marginRight: theme.spacing.smd,
    ...theme.shadows.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logo: {
    width: '100%',
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.smd,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    ...theme.typography.small,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginRight: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  country: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successOverlay.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
    gap: 4,
  },
  verifiedText: {
    ...theme.typography.tiny,
    color: theme.colors.success,
  },
  listingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listings: {
    ...theme.typography.label,
    color: theme.colors.textLight,
  },
});

export default PartnerCard;
