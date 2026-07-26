/**
 * ============================================
 * ICON MAPPINGS
 * ============================================
 *
 * Centralized icon definitions for Mizan Invest.
 * All icons used in the app should be referenced from here.
 *
 * To change the icon pack:
 * 1. Update the icon names below
 * 2. Update AppIcon.tsx to use the new icon library
 *
 * Current icon pack: Ionicons (@expo/vector-icons)
 */

/**
 * Icon names mapped to Ionicons identifiers
 */
export const icons = {
  // ----------------------------------------
  // NAVIGATION
  // ----------------------------------------
  home: 'home-outline',
  homeFilled: 'home',
  explore: 'compass-outline',
  exploreFilled: 'compass',
  reels: 'play-circle-outline',
  reelsFilled: 'play-circle',
  news: 'newspaper-outline',
  newsFilled: 'newspaper',
  profile: 'person-outline',
  profileFilled: 'person',

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------
  favorite: 'heart-outline',
  favoriteFilled: 'heart',
  notification: 'notifications-outline',
  notificationFilled: 'notifications',
  search: 'search-outline',
  share: 'share-outline',
  back: 'arrow-back',
  forward: 'arrow-forward',
  arrowForward: 'arrow-forward',
  arrowUp: 'arrow-up',
  arrowDown: 'arrow-down',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',
  close: 'close',
  menu: 'menu',
  filter: 'options-outline',
  sort: 'swap-vertical-outline',

  // ----------------------------------------
  // PROPERTY & REAL ESTATE
  // ----------------------------------------
  villa: 'home-outline',
  apartment: 'business-outline',
  land: 'map-outline',
  commercial: 'storefront-outline',
  location: 'location-outline',
  locationFilled: 'location',
  map: 'map-outline',
  verified: 'checkmark-circle',
  verifiedOutline: 'checkmark-circle-outline',

  // ----------------------------------------
  // FEATURES & AMENITIES
  // ----------------------------------------
  bedroom: 'bed-outline',
  bathroom: 'water-outline',
  area: 'resize-outline',
  parking: 'car-outline',
  pool: 'water-outline',
  security: 'shield-checkmark-outline',
  garden: 'leaf-outline',
  seaView: 'boat-outline',
  calendar: 'calendar-outline',

  // ----------------------------------------
  // BUSINESS & PARTNER
  // ----------------------------------------
  partner: 'briefcase-outline',
  partnerFilled: 'briefcase',
  building: 'business-outline',
  star: 'star',
  starOutline: 'star-outline',
  listings: 'list-outline',

  // ----------------------------------------
  // AI & ANALYTICS
  // ----------------------------------------
  ai: 'sparkles-outline',
  aiFilled: 'sparkles',
  analytics: 'analytics-outline',
  trendUp: 'trending-up',
  trendDown: 'trending-down',
  trendStable: 'remove-outline',
  chart: 'bar-chart-outline',
  target: 'flag-outline',
  risk: 'alert-circle-outline',

  // ----------------------------------------
  // MEDIA
  // ----------------------------------------
  video: 'videocam-outline',
  videoFilled: 'videocam',
  play: 'play',
  playCircle: 'play-circle-outline',
  image: 'image-outline',
  camera: 'camera-outline',

  // ----------------------------------------
  // COMMUNICATION
  // ----------------------------------------
  message: 'chatbubble-outline',
  messageFilled: 'chatbubble',
  call: 'call-outline',
  email: 'mail-outline',

  // ----------------------------------------
  // MISC
  // ----------------------------------------
  settings: 'settings-outline',
  info: 'information-circle-outline',
  help: 'help-circle-outline',
  warning: 'warning-outline',
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
  time: 'time-outline',
  wallet: 'wallet-outline',
  globe: 'globe-outline',
  language: 'language-outline',
} as const;

export type IconName = keyof typeof icons;

/**
 * Icon sizes for consistent sizing across the app
 */
export const iconSizes = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
  xxl: 40,
} as const;

export type IconSize = keyof typeof iconSizes;
