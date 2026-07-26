/**
 * ============================================
 * CONSTANTS INDEX
 * ============================================
 *
 * Export all constants from a single file.
 * Import: import { AppConfig, Colors, Images } from '@/constants';
 */

export { AppConfig } from './config';
export { Colors, Gradients } from './colors';
export { Images, LocalImages } from './images';
export { translations, DEFAULT_LANGUAGE, languageNames } from './translations';
export type { Language, TranslationKey } from './translations';

// Mock data exports
export {
  featuredProperties,
  highYieldProperties,
  verifiedPartners,
  countries,
  categories,
  aiInsights,
  newsItems,
  formatPrice,
  formatROI,
  filterByCountry,
} from './mockData';

export type {
  Property,
  Partner,
  Country,
  Category,
  AIInsight,
  NewsItem,
} from './mockData';
