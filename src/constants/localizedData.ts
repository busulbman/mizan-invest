/**
 * ============================================
 * LOCALIZED MOCK DATA HELPERS
 * ============================================
 *
 * The mock data in `mockData.ts` stores English display names because it
 * stands in for an API response. These helpers map a record id onto the
 * matching translation key so lists render in the active language.
 *
 * When the real API arrives it should return localized labels directly
 * and these helpers can be removed.
 */

import { Property } from './mockData';
import { TranslationKey } from './translations';

/** country.id -> translation key */
const COUNTRY_KEYS: Record<string, TranslationKey> = {
  all: 'countryAll',
  tr: 'countryTr',
  sa: 'countrySa',
  ae: 'countryAe',
  us: 'countryUs',
};

/** category.id -> translation key */
const CATEGORY_KEYS: Record<string, TranslationKey> = {
  villas: 'villas',
  apartments: 'apartments',
  lands: 'lands',
  commercial: 'commercial',
};

/**
 * Translation key for a country chip.
 * Falls back to "All" for unknown ids so the UI never renders a raw key.
 */
export function countryNameKey(countryId: string): TranslationKey {
  return COUNTRY_KEYS[countryId] ?? 'countryAll';
}

/**
 * Translation key for a property category.
 */
export function categoryNameKey(categoryId: string): TranslationKey {
  return CATEGORY_KEYS[categoryId] ?? 'categories';
}

/** property.type -> singular translation key, used on the type badge */
const PROPERTY_TYPE_KEYS: Record<Property['type'], TranslationKey> = {
  villa: 'typeVilla',
  apartment: 'typeApartment',
  land: 'typeLand',
  commercial: 'typeCommercial',
};

/**
 * Translation key for a property type badge.
 * Replaces getPropertyTypeLabel(), which returned English only.
 */
export function propertyTypeKey(type: Property['type']): TranslationKey {
  return PROPERTY_TYPE_KEYS[type];
}
