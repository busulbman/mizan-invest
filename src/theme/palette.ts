/**
 * ============================================
 * COLOR PALETTES — LIGHT & DARK
 * ============================================
 *
 * Every colour the app renders comes from here. Screens must never
 * hardcode a hex value; they read `useTheme().colors` instead so both
 * appearances stay in sync.
 *
 * BRAND ANCHORS (unchanged in both modes)
 * - Navy  #0F172A — trust, the primary brand voice
 * - Gold  #D4B483 — premium accent, used sparingly
 * - Ivory #F8FAF7 — the calm light surface
 *
 * SEMANTIC NAMING
 * Keys describe a role, not a colour. `surface` is "the card behind
 * content" — white in light mode, raised navy in dark mode. That is why
 * `colors.white` still exists but only means "literal white", e.g. text
 * drawn over a photo overlay.
 */

export interface ThemeColors {
  // ---- Brand -------------------------------------------------
  /** Navy brand colour — identical in both modes */
  brand: string;
  /** Gold accent — CTAs, active tab, verified badge, premium score */
  accent: string;
  accentLight: string;
  accentDark: string;

  // ---- Surfaces ----------------------------------------------
  /** Screen background */
  background: string;
  /** Card / sheet background */
  surface: string;
  /** Secondary surface — icon tiles, inputs, chips */
  surfaceAlt: string;
  /** Tab bar / sticky bar background */
  bar: string;

  // ---- Primary action ----------------------------------------
  /** Solid primary button / active chip background */
  primary: string;
  /** Text and icons drawn on `primary` */
  onPrimary: string;
  /** Text and icons drawn on `accent` */
  onAccent: string;

  // ---- Text --------------------------------------------------
  text: string;
  textSecondary: string;
  textMuted: string;
  /** Always-white text used over photos and dark overlays */
  onDark: string;
  onDarkMuted: string;

  // ---- Lines -------------------------------------------------
  border: string;
  borderStrong: string;

  // ---- Status ------------------------------------------------
  success: string;
  error: string;
  info: string;
  warning: string;

  // ---- Literals ----------------------------------------------
  /** Literal white — overlay text, badge fills over images */
  white: string;
  /** Deep navy used by splash and full-screen media backgrounds */
  backgroundDark: string;

  // ---- Translucent helpers -----------------------------------
  overlay: {
    light: string;
    medium: string;
    dark: string;
    darker: string;
  };
  accentOverlay: {
    light: string;
    medium: string;
  };
  successOverlay: {
    light: string;
    medium: string;
  };
  errorOverlay: {
    light: string;
  };
  infoOverlay: {
    light: string;
  };

  // ---- Back-compat aliases -----------------------------------
  // Older screens read these names. They resolve to the semantic
  // values above so nothing renders with the wrong appearance.
  /** @deprecated use `text` */
  textDark: string;
  /** @deprecated use `textSecondary` */
  textLight: string;
  /** @deprecated use `onDark` */
  textOnDark: string;
  /** @deprecated use `onDarkMuted` */
  textOnDarkMuted: string;
}

// ============================================
// LIGHT
// ============================================

export const lightColors: ThemeColors = {
  brand: '#0F172A',
  accent: '#C99A4E',
  accentLight: '#E8D4B8',
  accentDark: '#A87C33',

  background: '#F8FAF7',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F4F3',
  bar: '#FFFFFF',

  primary: '#0F172A',
  onPrimary: '#FFFFFF',
  onAccent: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#5B6472',
  textMuted: '#8B94A1',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255, 255, 255, 0.72)',

  border: '#E4E8E9',
  borderStrong: '#D2D8DA',

  success: '#0E8F62',
  error: '#DC2626',
  info: '#2563EB',
  warning: '#D97706',

  white: '#FFFFFF',
  backgroundDark: '#0A0F1A',

  overlay: {
    light: 'rgba(255, 255, 255, 0.14)',
    medium: 'rgba(255, 255, 255, 0.24)',
    dark: 'rgba(15, 23, 42, 0.6)',
    darker: 'rgba(15, 23, 42, 0.85)',
  },
  accentOverlay: {
    light: 'rgba(201, 154, 78, 0.12)',
    medium: 'rgba(201, 154, 78, 0.28)',
  },
  successOverlay: {
    light: 'rgba(14, 143, 98, 0.12)',
    medium: 'rgba(14, 143, 98, 0.3)',
  },
  errorOverlay: {
    light: 'rgba(220, 38, 38, 0.12)',
  },
  infoOverlay: {
    light: 'rgba(37, 99, 235, 0.12)',
  },

  textDark: '#0F172A',
  textLight: '#5B6472',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.72)',
};

// ============================================
// DARK
// ============================================
//
// Dark mode is a full re-map, not an inverted background: cards,
// borders, inputs, muted text and the tab bar each get their own value
// so nothing drops below a readable contrast ratio.

export const darkColors: ThemeColors = {
  brand: '#0F172A',
  accent: '#E0BE86',
  accentLight: '#F0DDBB',
  accentDark: '#C4A473',

  background: '#080D18',
  surface: '#121B2E',
  surfaceAlt: '#1B263E',
  bar: '#0C1424',

  primary: '#26375A',
  onPrimary: '#FFFFFF',
  onAccent: '#0F172A',

  text: '#F2F5FA',
  textSecondary: '#A8B3C5',
  textMuted: '#78849A',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255, 255, 255, 0.72)',

  border: '#22304D',
  borderStrong: '#31415F',

  success: '#34D399',
  error: '#F87171',
  info: '#60A5FA',
  warning: '#FBBF24',

  white: '#FFFFFF',
  backgroundDark: '#05090F',

  overlay: {
    light: 'rgba(255, 255, 255, 0.12)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(3, 7, 18, 0.65)',
    darker: 'rgba(3, 7, 18, 0.88)',
  },
  accentOverlay: {
    light: 'rgba(224, 190, 134, 0.14)',
    medium: 'rgba(224, 190, 134, 0.32)',
  },
  successOverlay: {
    light: 'rgba(52, 211, 153, 0.15)',
    medium: 'rgba(52, 211, 153, 0.32)',
  },
  errorOverlay: {
    light: 'rgba(248, 113, 113, 0.16)',
  },
  infoOverlay: {
    light: 'rgba(96, 165, 250, 0.16)',
  },

  textDark: '#F2F5FA',
  textLight: '#A8B3C5',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.72)',
};

// ============================================
// GRADIENTS
// ============================================

export interface ThemeGradients {
  gold: readonly [string, string];
  goldPremium: readonly [string, string, string];
  darkOverlay: readonly [string, string, string];
  heroOverlay: readonly [string, string, string, string];
  darkBackground: readonly [string, string, string];
  partnerGradient: readonly [string, string, string];
  /** Bottom-up scrim used on full-screen media (Reels, gallery) */
  mediaScrim: readonly [string, string, string];
}

export function buildGradients(c: ThemeColors): ThemeGradients {
  return {
    gold: [c.accentLight, c.accent],
    goldPremium: [c.accentLight, c.accent, c.accentDark],
    darkOverlay: ['transparent', 'rgba(8, 13, 24, 0.55)', 'rgba(8, 13, 24, 0.94)'],
    heroOverlay: [
      'transparent',
      'rgba(8, 13, 24, 0.35)',
      'rgba(8, 13, 24, 0.9)',
      '#080D18',
    ],
    darkBackground: ['#05090F', '#0F172A', '#05090F'],
    partnerGradient: ['#0F172A', '#1E3A5F', '#0F172A'],
    mediaScrim: ['transparent', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.85)'],
  };
}
