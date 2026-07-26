/**
 * ============================================
 * PROPERTY FEATURES COMPONENT
 * ============================================
 *
 * Property amenities and features grid.
 * Shows: Bedrooms, Bathrooms, Area, Pool, etc.
 *
 * Used in: Property Detail Screen
 */

import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { PropertyFeatures as PropertyFeaturesType, formatArea } from '@/constants/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { AppIcon } from '@/components/ui/AppIcon';
import { IconName } from '@/constants/icons';

// ============================================
// TYPES
// ============================================

export interface PropertyFeaturesProps {
  features: PropertyFeaturesType;
}

// ============================================
// FEATURE ITEM SUB-COMPONENT
// ============================================

interface FeatureItemProps {
  icon: IconName;
  label: string;
  value: string | number;
  highlight?: boolean;
}

function FeatureItem({ icon, label, value, highlight = false }: FeatureItemProps) {
  return (
    <View style={[styles.featureItem, highlight && styles.featureItemHighlight]}>
      <AppIcon name={icon} size="lg" color={theme.colors.accent} />
      <Text style={styles.featureValue}>{value}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

// ============================================
// COMPONENT
// ============================================

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <Text style={styles.title}>{t('propertyFeatures')}</Text>

      {/* Main Features Grid */}
      <View style={styles.mainGrid}>
        <FeatureItem
          icon="bedroom"
          label={t('bedrooms')}
          value={features.bedrooms}
          highlight
        />
        <FeatureItem
          icon="bathroom"
          label={t('bathrooms')}
          value={features.bathrooms}
          highlight
        />
        <FeatureItem
          icon="area"
          label={t('area')}
          value={formatArea(features.area)}
          highlight
        />
        <FeatureItem
          icon="parking"
          label={t('parking')}
          value={features.parking}
          highlight
        />
      </View>

      {/* Amenities */}
      <View style={styles.amenitiesGrid}>
        {features.pool && (
          <View style={styles.amenityBadge}>
            <AppIcon name="pool" size="sm" color={theme.colors.success} />
            <Text style={styles.amenityText}>{t('pool')}</Text>
          </View>
        )}
        {features.security && (
          <View style={styles.amenityBadge}>
            <AppIcon name="security" size="sm" color={theme.colors.success} />
            <Text style={styles.amenityText}>{t('security')}</Text>
          </View>
        )}
        {features.garden && (
          <View style={styles.amenityBadge}>
            <AppIcon name="garden" size="sm" color={theme.colors.success} />
            <Text style={styles.amenityText}>{t('garden')}</Text>
          </View>
        )}
        {features.seaView && (
          <View style={styles.amenityBadge}>
            <AppIcon name="seaView" size="sm" color={theme.colors.success} />
            <Text style={styles.amenityText}>{t('seaView')}</Text>
          </View>
        )}
        {features.yearBuilt && (
          <View style={styles.amenityBadge}>
            <AppIcon name="calendar" size="sm" color={theme.colors.success} />
            <Text style={styles.amenityText}>{features.yearBuilt}</Text>
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
    paddingVertical: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureItemHighlight: {
    borderColor: theme.colors.accentOverlay.medium,
  },
  featureValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.textDark,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  featureLabel: {
    ...theme.typography.tiny,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successOverlay.light,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  amenityText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: '600',
  },
});

export default PropertyFeatures;
