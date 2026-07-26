/**
 * ============================================
 * PROPERTY INFO COMPONENT
 * ============================================
 *
 * Main property information header.
 * Shows: Title, Location, Type, Price, ROI, Status
 *
 * Used in: Property Detail Screen
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme';
import { Property, formatPriceFull } from '@/constants/mockData';
import { propertyTypeKey } from '@/constants/localizedData';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/context/LanguageContext';

// ============================================
// TYPES
// ============================================

export interface PropertyInfoProps {
  property: Property;
  onFavoritePress?: () => void;
  onSharePress?: () => void;
  isFavorite?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function PropertyInfo({
  property,
  onFavoritePress,
  onSharePress,
  isFavorite = false,
}: PropertyInfoProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Header: Title + Actions */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.locationRow}>
            <AppIcon name="location" size="xs" color={theme.colors.textLight} />
            <Text style={styles.location}>{property.location}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSharePress}
            accessibilityRole="button"
            accessibilityLabel={t('share')}
          >
            <AppIcon name="share" size="md" color={theme.colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onFavoritePress}
            accessibilityRole="button"
            accessibilityLabel={t('favorite')}
          >
            <AppIcon
              name={isFavorite ? 'favoriteFilled' : 'favorite'}
              size="md"
              color={isFavorite ? theme.colors.error : theme.colors.textDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Property type badge + Status */}
      <View style={styles.badgeRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {t(propertyTypeKey(property.type))}
          </Text>
        </View>
        {property.status && (
          <View
            style={[
              styles.statusBadge,
              property.status === 'available' && styles.statusAvailable,
              property.status === 'reserved' && styles.statusReserved,
              property.status === 'sold' && styles.statusSold,
            ]}
          >
            <Text style={styles.statusText}>
              {t(property.status)}
            </Text>
          </View>
        )}
      </View>

      {/* Price + ROI Cards */}
      <View style={styles.statsRow}>
        {/* Price card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('price')}</Text>
          <Text style={styles.priceValue}>{formatPriceFull(property.price)}</Text>
        </View>

        {/* ROI card */}
        <LinearGradient
          colors={theme.gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.roiCard}
        >
          <Text style={styles.roiLabel}>{t('roi')}</Text>
          <Text style={styles.roiValue}>{property.roi}%</Text>
        </LinearGradient>

        {/* Rental Yield card (if available) */}
        {property.rentalYield && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('rentalYield')}</Text>
            <Text style={styles.yieldValue}>{property.rentalYield}%</Text>
          </View>
        )}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.hero,
    borderTopRightRadius: theme.borderRadius.hero,
    marginTop: -24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  typeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  typeBadgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  statusAvailable: {
    backgroundColor: theme.colors.successOverlay.light,
  },
  statusReserved: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusSold: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    ...theme.typography.label,
    color: theme.colors.success,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    ...theme.typography.label,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textDark,
  },
  yieldValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.info,
  },
  roiCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  roiLabel: {
    ...theme.typography.label,
    color: 'rgba(15, 23, 42, 0.6)',
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default PropertyInfo;
