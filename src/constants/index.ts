/**
 * ============================================
 * CONSTANTS INDEX
 * ============================================
 *
 * Single import surface for app constants.
 * Import: import { AppConfig, Images, properties } from '@/constants';
 *
 * Colours and the type scale are NOT re-exported here — they live on the
 * theme and must be read through `useTheme()` so dark mode works.
 */

export { AppConfig } from './config';
export { Images, LocalImages, LocalVideos } from './images';
export { icons, iconSizes } from './icons';
export type { IconName, IconSize } from './icons';

export {
  translations,
  DEFAULT_LANGUAGE,
  LANGUAGE_ORDER,
  languageNames,
  languageCodes,
} from './translations';
export type { Language, TranslationKey } from './translations';

export {
  CURRENCY_ORDER,
  currencies,
  formatPrice,
  formatPriceFull,
  rateLabel,
} from './currency';
export type { CurrencyCode } from './currency';

export {
  properties,
  featuredProperties,
  madinahProperties,
  newestProperties,
  highYieldProperties,
  recentlyViewedProperties,
  verifiedPartners,
  countries,
  cities,
  categories,
  aiInsights,
  getPropertyById,
  getPropertiesByIds,
  getPartnerById,
  getSimilarProperties,
  countPropertiesByType,
  countPropertiesByCity,
  formatROI,
  formatArea,
} from './mockData';

export type {
  Property,
  Partner,
  CityId,
  CityInfo,
  CountryCode,
  CountryInfo,
  CategoryInfo,
  PropertyType,
  PropertyStatus,
  PropertyFeatures,
  AIAnalysis,
  AIInsight,
  RiskLevel,
} from './mockData';

export { reels } from './reelsData';
export type { Reel } from './reelsData';

export { demoNotifications, relativeTime } from './notificationsData';
export type { DemoNotification } from './notificationsData';
