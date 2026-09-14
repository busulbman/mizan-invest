/**
 * ============================================
 * LOCALISED DATA HELPERS
 * ============================================
 *
 * `mockData.ts` stands in for an API, so it stores ids rather than
 * display strings. These helpers map an id onto its translation key, and
 * are the only place that mapping is written down.
 *
 * Usage:
 *   <Text>{t(cityNameKey(property.cityId))}</Text>
 *
 * When the real API arrives it should return localised labels and these
 * can be deleted.
 */

import { CityId, CountryCode, PropertyType, RiskLevel } from './mockData';
import { TranslationKey } from './translations';

const COUNTRY_KEYS: Record<string, TranslationKey> = {
  all: 'countryAll',
  sa: 'countrySa',
  tr: 'countryTr',
  ae: 'countryAe',
};

const CITY_KEYS: Record<CityId, TranslationKey> = {
  madinah: 'cityMadinah',
  riyadh: 'cityRiyadh',
  jeddah: 'cityJeddah',
  istanbul: 'cityIstanbul',
  antalya: 'cityAntalya',
  dubai: 'cityDubai',
};

/** Singular type label used on the detail badge */
const TYPE_KEYS: Record<PropertyType, TranslationKey> = {
  villa: 'typeVilla',
  apartment: 'typeApartment',
  land: 'typeLand',
  commercial: 'typeCommercial',
};

/** Plural type label used on category tiles and filters */
const TYPE_PLURAL_KEYS: Record<PropertyType, TranslationKey> = {
  villa: 'villas',
  apartment: 'apartments',
  land: 'lands',
  commercial: 'commercial',
};

const RISK_KEYS: Record<RiskLevel, TranslationKey> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

/** Falls back to "All" so an unknown id never renders a raw key */
export function countryNameKey(countryId: string): TranslationKey {
  return COUNTRY_KEYS[countryId] ?? 'countryAll';
}

export function cityNameKey(cityId: CityId): TranslationKey {
  return CITY_KEYS[cityId];
}

export function propertyTypeKey(type: PropertyType): TranslationKey {
  return TYPE_KEYS[type];
}

export function propertyTypePluralKey(type: PropertyType): TranslationKey {
  return TYPE_PLURAL_KEYS[type];
}

export function riskLevelKey(level: RiskLevel): TranslationKey {
  return RISK_KEYS[level];
}

/**
 * "Медина, Саудовская Аравия" — built from two translated parts rather
 * than a stored string, so it stays correct in every language.
 */
export function locationLabel(
  t: (key: TranslationKey) => string,
  cityId: CityId,
  countryCode: CountryCode
): string {
  return `${t(cityNameKey(cityId))}, ${t(countryNameKey(countryCode))}`;
}
