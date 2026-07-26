/**
 * ============================================
 * LOCATION SECTION COMPONENT
 * ============================================
 *
 * Property location with map placeholder.
 * Shows: Address and map preview
 *
 * Used in: Property Detail Screen
 *
 * TODO: Integrate Google Maps
 * TODO: Add directions functionality
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';

// ============================================
// TYPES
// ============================================

export interface LocationSectionProps {
  city: string;
  country: string;
  onViewMap?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function LocationSection({ city, country, onViewMap }: LocationSectionProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('locationMap')}</Text>
        <View style={styles.locationBadge}>
          <AppIcon name="location" size="sm" color={theme.colors.textLight} />
          <Text style={styles.locationText}>{city}, {country}</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <TouchableOpacity
        style={styles.mapContainer}
        onPress={onViewMap}
        activeOpacity={0.9}
      >
        {/* TODO: Integrate Google Maps */}
        <LinearGradient
          colors={['#E8F4F8', '#D1E8F0', '#B8DCE8']}
          style={styles.mapPlaceholder}
        >
          {/* Decorative map elements */}
          <View style={styles.mapDecoration}>
            <View style={styles.mapRoad1} />
            <View style={styles.mapRoad2} />
            <View style={styles.mapMarker}>
              <AppIcon name="locationFilled" size="lg" color={theme.colors.error} />
            </View>
          </View>

          {/* View on map overlay */}
          <View style={styles.mapOverlay}>
            <View style={styles.viewMapButton}>
              <AppIcon name="map" size="md" color={theme.colors.white} />
              <Text style={styles.viewMapText}>{t('viewOnMap')}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Location details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <AppIcon name="building" size="lg" color={theme.colors.accent} />
          <View>
            <Text style={styles.detailLabel}>{t('city')}</Text>
            <Text style={styles.detailValue}>{city}</Text>
          </View>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <AppIcon name="globe" size="lg" color={theme.colors.accent} />
          <View>
            <Text style={styles.detailLabel}>{t('country')}</Text>
            <Text style={styles.detailValue}>{country}</Text>
          </View>
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  mapContainer: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  mapPlaceholder: {
    height: 180,
    position: 'relative',
  },
  mapDecoration: {
    flex: 1,
    position: 'relative',
  },
  mapRoad1: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ rotate: '-5deg' }],
  },
  mapRoad2: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    width: 4,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ rotate: '15deg' }],
  },
  mapMarker: {
    position: 'absolute',
    top: '35%',
    left: '45%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.floating,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  viewMapText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.white,
  },
  details: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.tiny,
    color: theme.colors.textLight,
  },
  detailValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
  },
  detailDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
});

export default LocationSection;
