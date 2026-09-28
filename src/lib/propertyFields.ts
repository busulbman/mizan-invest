/**
 * ============================================
 * PROPERTY FIELD MATRIX
 * ============================================
 *
 * Which fields a listing form shows, decided by `property_type`.
 *
 * WHY THIS EXISTS
 * The form used to be one generic field set for every type, so choosing "Land"
 * still asked for bedrooms, bathrooms, parking, year built and a pool. Those
 * questions have no answer for a plot of land, and a partner filling them in
 * was recording noise.
 *
 * NO SCHEMA CHANGE IS NEEDED FOR THIS
 * `bedrooms`, `bathrooms` and `parking_spaces` are NOT NULL DEFAULT 0, so
 * hiding a field simply means persisting the column default. Hiding is purely
 * presentational; nothing here relaxes a constraint or invents a column. Every
 * field below already exists on `public.properties` (or on
 * `property_translations` for title/description/highlights).
 *
 * ONE SOURCE FOR ADD AND EDIT
 * Add Property and Edit Property both read this matrix, which is what stops
 * them drifting apart again — Add previously collected 10 fields while Edit
 * collected 17, so a partner had to create a half-empty draft and then
 * discover the rest.
 *
 * AREA IS ONE COLUMN WITH FOUR MEANINGS
 * `area_sqm` is the built area of an apartment, the built area of a villa, the
 * plot area of land and the usable area of a commercial unit. The column is
 * shared; only the LABEL changes, so the data stays comparable.
 */

import type { TranslationKey } from '@/constants/translations';

export const PROPERTY_TYPES = ['apartment', 'villa', 'land', 'commercial'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_STATUSES = ['available', 'reserved', 'sold'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CURRENCIES = ['SAR', 'AED', 'USD', 'TRY', 'RUB', 'EUR', 'GBP'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Optional, type-dependent fields. Fields every type needs are not listed. */
export type OptionalPropertyField =
  | 'bedrooms'
  | 'bathrooms'
  | 'parkingSpaces'
  | 'yearBuilt'
  | 'hasPool'
  | 'hasGarden'
  | 'hasSecurity'
  | 'hasSeaView'
  | 'hasCityView';

export interface PropertyTypeProfile {
  /** Label for the shared `area_sqm` column. */
  areaLabelKey: TranslationKey;
  /** Placeholder guidance for `highlights[]`, which carries the attributes
   *  this type needs but has no typed column for (land zoning, for example). */
  highlightsHintKey: TranslationKey;
  /** Exactly the optional fields this type should collect. */
  fields: ReadonlySet<OptionalPropertyField>;
}

const RESIDENTIAL: OptionalPropertyField[] = [
  'bedrooms',
  'bathrooms',
  'parkingSpaces',
  'yearBuilt',
  'hasPool',
  'hasGarden',
  'hasSecurity',
  'hasSeaView',
  'hasCityView',
];

export const PROPERTY_TYPE_PROFILES: Record<PropertyType, PropertyTypeProfile> = {
  apartment: {
    areaLabelKey: 'fieldAreaApartment',
    highlightsHintKey: 'highlightsHintApartment',
    fields: new Set(RESIDENTIAL),
  },
  villa: {
    areaLabelKey: 'fieldAreaVilla',
    highlightsHintKey: 'highlightsHintVilla',
    fields: new Set(RESIDENTIAL),
  },
  land: {
    // Land has no rooms, no parking, no build year and no pool or garden.
    // Views are kept: a sea-facing plot is a real, priceable attribute.
    areaLabelKey: 'fieldAreaLand',
    highlightsHintKey: 'highlightsHintLand',
    fields: new Set<OptionalPropertyField>(['hasSeaView', 'hasCityView']),
  },
  commercial: {
    // No bedrooms and no pool/garden, but bathrooms, parking, build year and
    // security all matter for a commercial unit.
    areaLabelKey: 'fieldAreaCommercial',
    highlightsHintKey: 'highlightsHintCommercial',
    fields: new Set<OptionalPropertyField>([
      'bathrooms',
      'parkingSpaces',
      'yearBuilt',
      'hasSecurity',
      'hasSeaView',
      'hasCityView',
    ]),
  },
};

export function profileFor(type: PropertyType): PropertyTypeProfile {
  return PROPERTY_TYPE_PROFILES[type];
}

export function showsField(type: PropertyType, field: OptionalPropertyField): boolean {
  return PROPERTY_TYPE_PROFILES[type].fields.has(field);
}

/** True when this type shows at least one of the five feature toggles. */
export function showsAnyFeature(type: PropertyType): boolean {
  const { fields } = PROPERTY_TYPE_PROFILES[type];
  return (
    fields.has('hasPool')
    || fields.has('hasGarden')
    || fields.has('hasSecurity')
    || fields.has('hasSeaView')
    || fields.has('hasCityView')
  );
}

/** Enum value -> existing translation key, so pickers read in the user's language. */
export const TYPE_LABEL_KEYS: Record<PropertyType, TranslationKey> = {
  apartment: 'typeApartment',
  villa: 'typeVilla',
  land: 'typeLand',
  commercial: 'typeCommercial',
};

export const LISTING_STATUS_LABEL_KEYS: Record<ListingStatus, TranslationKey> = {
  available: 'available',
  reserved: 'reserved',
  sold: 'sold',
};

/**
 * Clears values that the chosen type does not collect.
 *
 * Called when the type changes so a listing switched from Apartment to Land
 * does not silently keep 3 bedrooms it no longer displays. The defaults match
 * the column defaults exactly, so the row stays valid either way.
 */
export function clearHiddenFields<T extends {
  bedrooms: string;
  bathrooms: string;
  parking: string;
  yearBuilt: string;
  hasPool: boolean;
  hasGarden: boolean;
  hasSecurity: boolean;
  hasSeaView: boolean;
  hasCityView: boolean;
}>(form: T, type: PropertyType): T {
  const shows = (field: OptionalPropertyField) => showsField(type, field);
  return {
    ...form,
    bedrooms: shows('bedrooms') ? form.bedrooms : '0',
    bathrooms: shows('bathrooms') ? form.bathrooms : '0',
    parking: shows('parkingSpaces') ? form.parking : '0',
    yearBuilt: shows('yearBuilt') ? form.yearBuilt : '',
    hasPool: shows('hasPool') ? form.hasPool : false,
    hasGarden: shows('hasGarden') ? form.hasGarden : false,
    hasSecurity: shows('hasSecurity') ? form.hasSecurity : false,
    hasSeaView: shows('hasSeaView') ? form.hasSeaView : false,
    hasCityView: shows('hasCityView') ? form.hasCityView : false,
  };
}
