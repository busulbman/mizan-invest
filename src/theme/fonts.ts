/**
 * ============================================
 * FONT SYSTEM
 * ============================================
 *
 * Two families cover every language the app ships with:
 *
 * - Manrope           → Latin, Latin-ext (Turkish) and Cyrillic (Russian)
 * - Noto Sans Arabic  → Arabic
 *
 * Manrope has no Arabic coverage, so the active language selects the
 * family (`fontStackFor`). Russian is the default language, so Cyrillic
 * is on the primary family and always renders with real glyphs rather
 * than a system fallback.
 *
 * WHY FAMILIES INSTEAD OF fontWeight
 * With a custom font, iOS ignores `fontWeight` unless the exact weight
 * is registered as its own family. Every weight is therefore loaded as a
 * separate file and typography emits `fontFamily`, never `fontWeight`.
 * Never write `fontFamily` in a screen — take a role from
 * `useTheme().typography`.
 */

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_700Bold,
} from '@expo-google-fonts/noto-sans-arabic';

/** Font map handed to `useFonts` at app start */
export const fontAssets = {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_700Bold,
};

export interface FontStack {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
}

const manrope: FontStack = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

// Noto Sans Arabic ships no 800 — bold doubles as the heaviest weight.
const notoArabic: FontStack = {
  regular: 'NotoSansArabic_400Regular',
  medium: 'NotoSansArabic_500Medium',
  semibold: 'NotoSansArabic_600SemiBold',
  bold: 'NotoSansArabic_700Bold',
  extrabold: 'NotoSansArabic_700Bold',
};

/** Picks the family that actually has glyphs for the active language */
export function fontStackFor(isArabic: boolean): FontStack {
  return isArabic ? notoArabic : manrope;
}

export interface TextRole {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  letterSpacing?: number;
}

export interface Typography {
  hero: TextRole;
  h1: TextRole;
  h2: TextRole;
  h3: TextRole;
  h4: TextRole;
  body: TextRole;
  bodyBold: TextRole;
  small: TextRole;
  smallBold: TextRole;
  caption: TextRole;
  captionBold: TextRole;
  label: TextRole;
  tiny: TextRole;
  price: TextRole;
  priceLarge: TextRole;
  button: TextRole;
  buttonSmall: TextRole;
}

/**
 * Builds the type scale for a language.
 *
 * Arabic gets `letterSpacing: 0` everywhere — any tracking breaks the
 * cursive joins between letters — and slightly taller lines, because
 * Arabic ascenders and descenders need the extra room.
 */
export function buildTypography(isArabic: boolean): Typography {
  const f = fontStackFor(isArabic);
  const lh = (value: number) => (isArabic ? Math.round(value * 1.12) : value);
  const ls = (value: number) => (isArabic ? 0 : value);

  return {
    hero: { fontSize: 36, lineHeight: lh(44), fontFamily: f.extrabold, letterSpacing: ls(-0.8) },
    h1: { fontSize: 28, lineHeight: lh(36), fontFamily: f.bold, letterSpacing: ls(-0.5) },
    h2: { fontSize: 24, lineHeight: lh(31), fontFamily: f.bold, letterSpacing: ls(-0.4) },
    h3: { fontSize: 19, lineHeight: lh(25), fontFamily: f.bold, letterSpacing: ls(-0.2) },
    h4: { fontSize: 17, lineHeight: lh(23), fontFamily: f.semibold, letterSpacing: ls(-0.1) },

    body: { fontSize: 15, lineHeight: lh(23), fontFamily: f.regular },
    bodyBold: { fontSize: 15, lineHeight: lh(23), fontFamily: f.semibold },

    small: { fontSize: 14, lineHeight: lh(20), fontFamily: f.regular },
    smallBold: { fontSize: 14, lineHeight: lh(20), fontFamily: f.semibold },

    caption: { fontSize: 13, lineHeight: lh(18), fontFamily: f.regular },
    captionBold: { fontSize: 13, lineHeight: lh(18), fontFamily: f.semibold },

    label: { fontSize: 12, lineHeight: lh(16), fontFamily: f.semibold, letterSpacing: ls(0.2) },
    tiny: { fontSize: 11, lineHeight: lh(15), fontFamily: f.semibold, letterSpacing: ls(0.2) },

    price: { fontSize: 19, lineHeight: lh(25), fontFamily: f.extrabold, letterSpacing: ls(-0.3) },
    priceLarge: { fontSize: 24, lineHeight: lh(30), fontFamily: f.extrabold, letterSpacing: ls(-0.5) },

    button: { fontSize: 16, lineHeight: lh(21), fontFamily: f.bold, letterSpacing: ls(0.1) },
    buttonSmall: { fontSize: 14, lineHeight: lh(19), fontFamily: f.semibold, letterSpacing: ls(0.1) },
  };
}
