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
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
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
  style?: ViewStyle;
}

// ============================================
// SIZE CONFIGURATIONS
// ============================================

const SIZES = {
  small: {
    container: 44,
    image: 32,
    borderRadius: 12,
  },
  medium: {
    container: 64,
    image: 48,
    borderRadius: 18,
  },
  large: {
    container: 100,
    image: 72,
    borderRadius: 28,
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
    <View
      style={[
        styles.container,
        showShadow && styles.shadow,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.borderRadius,
        },
        style,
      ]}
    >
      {/*
        MAIN APP LOGO
        Replace assets/images/icon.png to update branding everywhere
      */}
      <Image
        source={LocalImages.logo}
        style={[
          styles.image,
          {
            width: dimensions.image,
            height: dimensions.image,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    // Image will be sized by the dimensions prop
  },
});

export default LogoMark;
