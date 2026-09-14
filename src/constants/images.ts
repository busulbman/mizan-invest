/**
 * ============================================
 * IMAGE & VIDEO ASSETS
 * ============================================
 *
 * Every remote image URL the demo uses lives here so the whole catalogue
 * can be swapped for a production CDN in one edit.
 *
 * Photography is served from Unsplash with `?w=&q=` sizing hints. Screens
 * must render them through `RemoteImage`, which falls back to a branded
 * placeholder if a URL ever 404s — the gallery requirement.
 *
 * Demo videos are bundled locally (assets/videos) rather than streamed,
 * so Reels and the property tour still play with no network.
 *
 * TODO: Replace with production CDN URLs and real project footage
 */

const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;

export const Images = {
  // ----------------------------------------
  // ONBOARDING / HERO
  // ----------------------------------------

  onboarding: {
    slide1: unsplash('1600596542815-ffad4c1539a9', 1200),
    slide2: unsplash('1512453979798-5ea266f8880c', 1200),
    slide3: unsplash('1590674899484-d5640e854abe', 1200),
  },

  hero: {
    welcome: unsplash('1600607687939-ce8a6c25118c', 1200),
    home: unsplash('1590674899484-d5640e854abe', 1200),
    guestHome: unsplash('1600585154340-be6161a56a0c', 1200),
  },

  // ----------------------------------------
  // PROPERTY PHOTOGRAPHY
  // Grouped by the look they provide, not by listing, so listings can
  // mix and match without duplicating URLs.
  // ----------------------------------------

  properties: {
    villa1: unsplash('1613490493576-7fde63acd811', 900),
    villa2: unsplash('1600047509807-ba8f99d2cdde', 900),
    villa3: unsplash('1512917774080-9991f1c4c750', 900),
    villa4: unsplash('1518780664697-55e3ad937233', 900),

    residence1: unsplash('1600596542815-ffad4c1539a9', 900),
    residence2: unsplash('1600607687939-ce8a6c25118c', 900),
    residence3: unsplash('1545324418-cc1a3fa10c00', 900),
    residence4: unsplash('1580418827493-f2b22c0a76cb', 900),

    penthouse1: unsplash('1600585154340-be6161a56a0c', 900),
    penthouse2: unsplash('1512453979798-5ea266f8880c', 900),

    interior1: unsplash('1560448204-e02f11c3d0e2', 900),
    interior2: unsplash('1600566753086-00f18fb6b3ea', 900),
    interior3: unsplash('1600210492486-724fe5c67fb0', 900),
    interior4: unsplash('1600573472550-8090b5e0745e', 900),
    interior5: unsplash('1571896349842-33c89424de2d', 900),

    land1: unsplash('1500382017468-9049fed747ef', 900),
    land2: unsplash('1506905925346-21bda4d32df4', 900),
    land3: unsplash('1524231757912-21f4fe3a7200', 900),

    commercial1: unsplash('1486406146926-c627a92ad1ab', 900),
    commercial2: unsplash('1497366754035-f200968a6e72', 900),
    commercial3: unsplash('1497366811353-6870744d04b2', 900),
    commercial4: unsplash('1577495508048-b635879837f1', 900),

    madinah1: unsplash('1590674899484-d5640e854abe', 900),
    madinah2: unsplash('1591604129939-f1efa4d9f7fa', 900),
    riyadh1: unsplash('1565552645632-d725f8bfc19a', 900),
    istanbul1: unsplash('1541432901042-2d8bd64b4a9b', 900),
    hotel1: unsplash('1566073771259-6a8506099945', 900),
  },

  // ----------------------------------------
  // PARTNER LOGOS
  // ----------------------------------------

  partners: {
    partner1: unsplash('1486406146926-c627a92ad1ab', 300),
    partner2: unsplash('1497366754035-f200968a6e72', 300),
    partner3: unsplash('1590674899484-d5640e854abe', 300),
    partner4: unsplash('1512453979798-5ea266f8880c', 300),
    partner5: unsplash('1545324418-cc1a3fa10c00', 300),
  },

  // ----------------------------------------
  // FALLBACKS
  // Rendered by RemoteImage when a URL fails to load.
  // ----------------------------------------

  placeholders: {
    property: unsplash('1600596542815-ffad4c1539a9', 500),
    avatar: unsplash('1472099645785-5658abf4ff4e', 300),
    logo: unsplash('1486406146926-c627a92ad1ab', 300),
  },
} as const;

/**
 * Bundled assets.
 *
 * Videos are small (0.6–1.1 MB each) on purpose: the demo has to launch
 * and play instantly on a partner's phone without streaming.
 */
export const LocalImages = {
  logo: require('../../assets/images/icon.png'),
  splashLogo: require('../../assets/images/icon.png'),
  adaptiveIconForeground: require('../../assets/images/android-icon-foreground.png'),
} as const;

export const LocalVideos = {
  madinah: require('../../assets/videos/reel-madinah.mp4'),
  dubai: require('../../assets/videos/reel-dubai.mp4'),
  land: require('../../assets/videos/reel-land.mp4'),
  propertyTour: require('../../assets/videos/property-tour.mp4'),
} as const;

export type LocalVideoKey = keyof typeof LocalVideos;
