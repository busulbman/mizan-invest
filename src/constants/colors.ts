/**
 * ============================================
 * COLOR PALETTE
 * ============================================
 *
 * Central color definitions for Mizan Invest.
 * All colors used in the app should be imported from here.
 *
 * BRAND COLORS:
 * - Primary Navy: Professional, trustworthy, premium
 * - Accent Gold: Luxury, value, investment
 * - Background: Clean, sophisticated, readable
 *
 * To update branding colors:
 * 1. Edit the values below
 * 2. The entire app will update automatically
 */

export const Colors = {
  // ----------------------------------------
  // PRIMARY BRAND COLORS
  // ----------------------------------------

  /** Primary navy - main brand color, headers, buttons */
  primary: '#0F172A',

  /** Accent gold - CTAs, highlights, premium elements */
  accent: '#D4B483',

  /** Secondary gold variant - gradients, hover states */
  accentLight: '#E8D4B8',

  /** Darker gold - pressed states */
  accentDark: '#C4A473',

  // ----------------------------------------
  // BACKGROUND COLORS
  // ----------------------------------------

  /** Main app background */
  background: '#F8FAF7',

  /** Pure white - cards, inputs */
  white: '#FFFFFF',

  /** Dark background - splash, overlays */
  backgroundDark: '#0A0F1A',

  // ----------------------------------------
  // TEXT COLORS
  // ----------------------------------------

  /** Primary text - headings, body */
  textDark: '#111827',

  /** Secondary text - subtitles, descriptions */
  textLight: '#6B7280',

  /** Muted text - placeholders, hints */
  textMuted: '#9CA3AF',

  /** Text on dark backgrounds */
  textOnDark: '#FFFFFF',

  /** Text on dark backgrounds - secondary */
  textOnDarkMuted: 'rgba(255, 255, 255, 0.6)',

  // ----------------------------------------
  // UI ELEMENT COLORS
  // ----------------------------------------

  /** Borders, dividers */
  border: '#E5E7EB',

  /** Success states, verified badges */
  success: '#10B981',

  /** Error states, warnings */
  error: '#EF4444',

  /** Info states */
  info: '#3B82F6',

  /** Warning states */
  warning: '#F59E0B',

  // ----------------------------------------
  // TRANSPARENCY HELPERS
  // Used for overlays, glassmorphism effects
  // ----------------------------------------

  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(15, 23, 42, 0.6)',
    darker: 'rgba(15, 23, 42, 0.85)',
  },

  /** Gold with transparency - for badges, backgrounds */
  accentOverlay: {
    light: 'rgba(212, 180, 131, 0.15)',
    medium: 'rgba(212, 180, 131, 0.3)',
  },

  /** Success with transparency */
  successOverlay: {
    light: 'rgba(16, 185, 129, 0.1)',
    medium: 'rgba(16, 185, 129, 0.3)',
  },
} as const;

// Type for accessing colors
export type ColorKey = keyof typeof Colors;

/**
 * Gradient presets for consistent styling
 */
export const Gradients = {
  /** Primary gold gradient - buttons, accents */
  gold: [Colors.accent, Colors.accentDark] as const,

  /** Premium gold gradient - hero sections */
  goldPremium: [Colors.accent, Colors.accentLight, Colors.accent] as const,

  /** Dark overlay - image overlays */
  darkOverlay: ['transparent', 'rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.95)'] as const,

  /** Hero section overlay */
  heroOverlay: ['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.95)', Colors.primary] as const,

  /** Dark background gradient */
  darkBackground: ['#0A0F1A', Colors.primary, '#0A0F1A'] as const,

  /** Partner login gradient */
  partnerGradient: [Colors.primary, '#1E3A5F', Colors.primary] as const,
} as const;
