/**
 * ============================================
 * THEME
 * ============================================
 *
 * One object holds every design decision: colours, type scale, spacing,
 * radii, shadows and motion. It is built per (appearance × language) and
 * handed out by `useTheme()` from `@/context/ThemeContext`.
 *
 * In a component:
 *   const { colors } = useTheme();
 *   const styles = useStyles();          // from makeStyles(...)
 *
 * Never import a raw colour or font family into a screen.
 */

import { Dimensions, Platform } from 'react-native';

import { ThemeColors, ThemeGradients, buildGradients, darkColors, lightColors } from './palette';
import { Typography, buildTypography } from './fonts';

export * from './palette';
export * from './fonts';

// ============================================
// SCREEN METRICS
// ============================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Layout facts the whole app agrees on.
 *
 * `isSmall` covers the iPhone SE / 13 mini class of device, where the
 * default 20pt gutter plus a 2-up card grid leaves Russian labels no
 * room. Padding and card widths step down instead of shrinking text.
 */
export const metrics = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  /** iPhone SE (375pt) and narrower */
  isSmall: SCREEN_WIDTH < 380,

  /** iPhone Pro Max class */
  isLarge: SCREEN_WIDTH >= 428,

  /** Minimum tappable square required by iOS HIG */
  minTouch: 44,

  /** Standard control height so buttons in a row always line up */
  controlHeight: 52,
  controlHeightSmall: 44,
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  /** 4 */
  xs: 4,
  /** 8 */
  sm: 8,
  /** 12 */
  smd: 12,
  /** 16 */
  md: 16,
  /** 20 */
  lg: 20,
  /** 24 */
  xl: 24,
  /** 28 */
  xxl: 28,
  /** 32 */
  section: 32,
  /** 48 */
  sectionLg: 48,

  /** Horizontal screen gutter — tightens on small phones */
  screenHorizontal: metrics.isSmall ? 16 : 20,

  /** Standard card padding */
  cardPadding: metrics.isSmall ? 12 : 16,

  /** Vertical gap between home sections */
  sectionGap: 28,
} as const;

// ============================================
// RADIUS
// ============================================

export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  hero: 24,
  feature: 28,
  full: 999,
} as const;

// ============================================
// MOTION
// ============================================

export const animation = {
  fast: 180,
  normal: 260,
  slow: 420,
  pageTransition: 500,
  splashDuration: 2000,
} as const;

// ============================================
// SHADOWS
// ============================================

export interface ThemeShadows {
  card: object;
  elevated: object;
  floating: object;
  gold: object;
  primary: object;
}

/**
 * Shadows are mode-aware: a soft grey drop shadow disappears on a dark
 * background, so dark mode uses a deeper, tighter shadow and leans on
 * borders for separation instead.
 */
function buildShadows(colors: ThemeColors, isDark: boolean): ThemeShadows {
  const shadowColor = isDark ? '#000000' : '#0F172A';
  const scale = isDark ? 1.6 : 1;

  return {
    card: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05 * scale,
      shadowRadius: 8,
      elevation: 2,
    },
    elevated: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08 * scale,
      shadowRadius: 12,
      elevation: 4,
    },
    floating: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14 * scale,
      shadowRadius: 18,
      elevation: 8,
    },
    gold: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.28 : 0.32,
      shadowRadius: 14,
      elevation: 6,
    },
    primary: {
      shadowColor: isDark ? '#000000' : colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.35 : 0.22,
      shadowRadius: 14,
      elevation: 5,
    },
  };
}

// ============================================
// THEME OBJECT
// ============================================

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  gradients: ThemeGradients;
  typography: Typography;
  shadows: ThemeShadows;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  animation: typeof animation;
  metrics: typeof metrics;
}

/** Builds the full theme for an appearance and a language */
export function buildTheme(mode: ThemeMode, isArabic: boolean): AppTheme {
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    mode,
    isDark,
    colors,
    gradients: buildGradients(colors),
    typography: buildTypography(isArabic),
    shadows: buildShadows(colors, isDark),
    spacing,
    borderRadius,
    animation,
    metrics,
  };
}

/**
 * Static light theme.
 *
 * Only for code that runs outside React (route options, module-level
 * constants). Anything rendered inside a component must read the live
 * theme through `useTheme()` or it will not follow dark mode.
 */
export const theme = buildTheme('light', false);

/** Blur tint that matches the active appearance */
export function blurTint(isDark: boolean): 'light' | 'dark' {
  return isDark ? 'dark' : 'light';
}

/** Platform-aware hairline that stays visible on Android */
export const hairline = Platform.select({ ios: 0.5, default: 1 });

export default theme;
