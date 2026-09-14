/**
 * ============================================
 * LOGO MARK COMPONENT
 * ============================================
 *
 * MAIN APP LOGO
 * This component displays the Mizan Invest logo.
 * It loads the logo from: assets/images/icon.png
 *
 * To update branding:
 * Replace assets/images/icon.png with your new logo.
 * The entire app will update automatically.
 *
 * Usage:
 * <LogoMark />
 * <LogoMark size="small" />
 * <LogoMark size="large" showShadow />
 */

import React from 'react';
import { ImageStyle, StyleProp, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LocalImages } from '@/constants/images';

// ============================================
// TYPES
// ============================================

export interface LogoMarkProps {
  /** Size variant: small (44px), medium (64px), large (100px) */
  size?: 'small' | 'medium' | 'large';

  /** Show gold accent shadow behind logo */
  showShadow?: boolean;

  /** Custom container style */
  style?: StyleProp<ImageStyle>;
}

// ============================================
// SIZE CONFIGURATIONS
// ============================================

const SIZES = {
  small: {
    image: 36,
    borderRadius: 10,
  },
  medium: {
    image: 56,
    borderRadius: 16,
  },
  large: {
    image: 92,
    borderRadius: 24,
  },
} as const;

// ============================================
// COMPONENT
// ============================================

export function LogoMark({
  size = 'medium',
  showShadow = true,
  style,
}: LogoMarkProps) {
  const dimensions = SIZES[size];

  return (
    <Image
      source={LocalImages.logo}
      contentFit="contain"
      cachePolicy="memory-disk"
      accessibilityLabel="Mizan Invest"
      style={[
        showShadow && styles.shadow,
        {
          width: dimensions.image,
          height: dimensions.image,
          borderRadius: dimensions.borderRadius,
        },
        style,
      ]}
    />
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#D4B483',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
});

export default LogoMark;
