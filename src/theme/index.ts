/**
 * ============================================
 * THEME CONFIGURATION
 * ============================================
 *
 * Central theme system for Mizan Invest.
 * Import and use: import { theme } from '@/theme';
 *
 * Usage:
 * - theme.colors.primary
 * - theme.spacing.md
 * - theme.typography.heading
 * - theme.borderRadius.lg
 */

import { Colors, Gradients } from '@/constants/colors';

// ============================================
// SPACING
// ============================================

export const spacing = {
  /** 4px - Minimal spacing */
  xs: 4,

  /** 8px - Small spacing */
  sm: 8,

  /** 12px - Small-medium spacing */
  smd: 12,

  /** 16px - Medium spacing */
  md: 16,

  /** 20px - Medium-large spacing */
  lg: 20,

  /** 24px - Large spacing */
  xl: 24,

  /** 28px - Extra large spacing */
  xxl: 28,

  /** 32px - Section spacing */
  section: 32,

  /** 48px - Large section spacing */
  sectionLg: 48,

  /** Screen horizontal padding */
  screenHorizontal: 24,

  /** Card padding */
  cardPadding: 16,
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  /** Hero titles - 42px */
  hero: {
    fontSize: 42,
    fontWeight: '700' as const,
    lineHeight: 50,
    letterSpacing: -1,
  },

  /** Large headings - 32px */
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  /** Section headings - 28px */
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  /** Card headings - 20px */
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    letterSpacing: -0.3,
  },

  /** Subheadings - 18px */
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  /** Body text - 16px */
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },

  /** Body bold - 16px */
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  /** Small text - 14px */
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  /** Caption text - 13px */
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },

  /** Label text - 12px */
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  /** Tiny text - 11px */
  tiny: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
  },

  /** Price display - 24px */
  price: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 28,
  },

  /** Button text - 17px */
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  /** 6px - Small elements */
  xs: 6,

  /** 8px - Chips, small buttons */
  sm: 8,

  /** 12px - Inputs, small cards */
  md: 12,

  /** 14px - Buttons */
  lg: 14,

  /** 16px - Cards */
  xl: 16,

  /** 20px - Large cards */
  xxl: 20,

  /** 24px - Hero cards */
  hero: 24,

  /** 28px - Feature cards */
  feature: 28,

  /** Full round - Pills, avatars */
  full: 100,
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  /** Subtle shadow for cards */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  /** Medium shadow for elevated elements */
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  /** Large shadow for floating elements */
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  /** Gold accent shadow for CTAs */
  gold: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  /** Primary shadow for buttons */
  primary: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// ============================================
// ANIMATIONS
// ============================================

export const animation = {
  /** Fast animation - 200ms */
  fast: 200,

  /** Normal animation - 300ms */
  normal: 300,

  /** Slow animation - 500ms */
  slow: 500,

  /** Page transition - 600ms */
  pageTransition: 600,

  /** Splash screen delay - 2000ms */
  splashDuration: 2000,
} as const;

// ============================================
// COMBINED THEME OBJECT
// ============================================

export const theme = {
  colors: Colors,
  gradients: Gradients,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
} as const;

export type Theme = typeof theme;

// Default export for convenience
export default theme;
