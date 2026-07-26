/**
 * ============================================
 * SIMILAR PROPERTIES COMPONENT
 * ============================================
 *
 * Horizontal scroll of related properties.
 * Shows: Similar type or location properties
 *
 * Used in: Property Detail Screen
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { Property, formatPrice } from '@/constants/mockData';
import { useLanguage } from '@/context/LanguageContext';

// ============================================
// TYPES
// ============================================

export interface SimilarPropertiesProps {
  properties: Property[];
  onPropertyPress?: (property: Property) => void;
}

// ============================================
// MINI PROPERTY CARD
// ============================================

interface MiniPropertyCardProps {
  property: Property;
  onPress?: () => void;
}

function MiniPropertyCard({ property, onPress }: MiniPropertyCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: property.image }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.cardLocation}>{property.location}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{formatPrice(property.price)}</Text>
            <View style={styles.cardRoi}>
              <Text style={styles.cardRoiText}>{property.roi}%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// COMPONENT
// ============================================

export function SimilarProperties({ properties, onPropertyPress }: SimilarPropertiesProps) {
  const { t } = useLanguage();

  if (properties.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('similarProperties')}</Text>
        <Text style={styles.subtitle}>{t('youMayAlsoLike')}</Text>
      </View>

      {/* Properties Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {properties.map((property) => (
          <MiniPropertyCard
            key={property.id}
            property={property}
            onPress={() => onPropertyPress?.(property)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.textDark,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    gap: theme.spacing.smd,
  },
  card: {
    width: 200,
    height: 240,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginRight: theme.spacing.smd,
    ...theme.shadows.elevated,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: theme.spacing.smd,
  },
  cardContent: {
    gap: 2,
  },
  cardTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
  cardLocation: {
    ...theme.typography.caption,
    color: theme.colors.textOnDarkMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cardPrice: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
  cardRoi: {
    backgroundColor: theme.colors.accentOverlay.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
  },
  cardRoiText: {
    ...theme.typography.tiny,
    color: theme.colors.accent,
  },
});

export default SimilarProperties;
