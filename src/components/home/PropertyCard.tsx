/**
 * ============================================
 * PROPERTY CARD COMPONENT
 * ============================================
 *
 * Featured property card with image, price, and ROI.
 * Used in: Home screen featured properties section
 *
 * TODO: Add navigation to property detail screen
 * TODO: Connect favorite action to backend
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { theme } from '@/theme';
import { formatPrice } from '@/constants/mockData';
import { AppIcon } from '@/components/ui/AppIcon';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

// ============================================
// TYPES
// ============================================

export interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  roi: number;
  image: string;
  verified: boolean;
  favorite?: boolean;
  onPress?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function PropertyCard({
  id,
  title,
  location,
  price,
  roi,
  image,
  verified,
  favorite = false,
  onPress,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(favorite);

  const handleFavorite = () => {
    // TODO: Connect to backend/storage
    setIsFavorite(!isFavorite);
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={theme.gradients.darkOverlay}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        >
          {/* Header: Verified badge + Favorite */}
          <View style={styles.header}>
            {verified && (
              <BlurView intensity={30} tint="dark" style={styles.verifiedBadge}>
                <AppIcon name="verified" size="xs" color={theme.colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </BlurView>
            )}
            <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
              <BlurView intensity={30} tint="dark" style={styles.favoriteBlur}>
                <AppIcon
                  name={isFavorite ? 'favoriteFilled' : 'favorite'}
                  size="md"
                  color={isFavorite ? theme.colors.error : theme.colors.white}
                />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={styles.locationRow}>
              <AppIcon name="location" size="sm" color={theme.colors.textOnDarkMuted} />
              <Text style={styles.location}>{location}</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.price}>{formatPrice(price)}</Text>
              <View style={styles.roiContainer}>
                <Text style={styles.roiLabel}>ROI</Text>
                <Text style={styles.roiValue}>{roi}%</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: theme.borderRadius.hero,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
    ...theme.shadows.floating,
  },
  imageBackground: {
    flex: 1,
  },
  image: {
    borderRadius: theme.borderRadius.hero,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.successOverlay.medium,
    gap: 4,
  },
  verifiedText: {
    ...theme.typography.tiny,
    color: theme.colors.success,
  },
  favoriteButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  favoriteBlur: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.overlay.light,
  },
  content: {
    gap: 4,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  location: {
    ...theme.typography.small,
    color: theme.colors.textOnDarkMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...theme.typography.price,
    color: theme.colors.white,
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentOverlay.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  roiLabel: {
    ...theme.typography.tiny,
    color: 'rgba(212, 180, 131, 0.8)',
  },
  roiValue: {
    ...theme.typography.small,
    fontWeight: '700',
    color: theme.colors.accent,
  },
});

export default PropertyCard;
