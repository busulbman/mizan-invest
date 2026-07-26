/**
 * ============================================
 * IMAGE ASSETS
 * ============================================
 *
 * Central image URL definitions for Mizan Invest.
 * All external images should be referenced from here.
 *
 * TODO: Replace all placeholder URLs with production CDN URLs
 * TODO: Add fallback images for offline mode
 *
 * IMAGE GUIDELINES:
 * - Use high-quality images (min 1200px width)
 * - Optimize for web/mobile (WebP when possible)
 * - Include ?w=XXX&q=80 for Unsplash optimization
 */

export const Images = {
  // ----------------------------------------
  // ONBOARDING IMAGES
  // TODO: Replace with branded onboarding images
  // ----------------------------------------

  onboarding: {
    /** Slide 1 - Luxury villa representing global investments */
    slide1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',

    /** Slide 2 - Analytics/data visualization */
    slide2: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',

    /** Slide 3 - Professional/business imagery */
    slide3: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1200&q=80',
  },

  // ----------------------------------------
  // HERO/BANNER IMAGES
  // TODO: Replace with branded hero images
  // ----------------------------------------

  hero: {
    /** Welcome screen background */
    welcome: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',

    /** Home screen hero card */
    home: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',

    /** Guest home background */
    guestHome: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  },

  // ----------------------------------------
  // PROPERTY IMAGES
  // TODO: Replace with actual property images from API
  // ----------------------------------------

  properties: {
    /** Luxury villa - Istanbul */
    villa1: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',

    /** Premium residence - Saudi Arabia */
    residence1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',

    /** Skyline residence */
    residence2: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',

    /** Penthouse - Dubai */
    penthouse1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',

    /** Investment land */
    land1: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',

    /** Coastal land */
    land2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',

    /** Commercial building */
    commercial1: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },

  // ----------------------------------------
  // PARTNER IMAGES
  // TODO: Replace with actual partner logos
  // ----------------------------------------

  partners: {
    /** Partner company placeholder 1 */
    partner1: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',

    /** Partner company placeholder 2 */
    partner2: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=80',

    /** Partner company placeholder 3 */
    partner3: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=200&q=80',
  },

  // ----------------------------------------
  // PLACEHOLDER IMAGES
  // Used when actual images are loading or unavailable
  // ----------------------------------------

  placeholders: {
    /** Generic property placeholder */
    property: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=60',

    /** User avatar placeholder */
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',

    /** Company logo placeholder */
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
  },
} as const;

/**
 * Local asset paths
 * These are bundled with the app
 */
export const LocalImages = {
  // ----------------------------------------
  // APP ICONS & LOGOS
  // ----------------------------------------

  /**
   * MAIN APP LOGO
   * Replace assets/images/icon.png to update branding everywhere
   */
  logo: require('../../assets/images/icon.png'),

  /** Splash screen logo (if different from main) */
  splashLogo: require('../../assets/images/icon.png'),

  /** Adaptive icon foreground (Android) */
  adaptiveIconForeground: require('../../assets/images/android-icon-foreground.png'),
} as const;
