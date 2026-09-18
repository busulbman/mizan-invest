/**
 * Read-only property data layer.
 *
 * This module is the only place the app should query the public property
 * catalogue. It maps the relational Supabase response into a display-oriented
 * model while keeping remote titles and descriptions as literal, localized
 * content (rather than the static translation keys used by mock data).
 */

import type {
  Property,
  PropertyFeatures,
  PropertyStatus,
  PropertyType,
  RiskLevel,
} from '@/constants/mockData';
import { Images } from '@/constants/images';
import type { Language } from '@/constants/translations';
import { supabase } from '@/lib/supabase';

export type ListingCurrencyCode = 'USD' | 'SAR' | 'AED' | 'TRY' | 'RUB' | 'EUR' | 'GBP';
export type PublicationStatus = 'draft' | 'pending_review' | 'published' | 'unpublished' | 'archived';
type MarketTrend = 'up' | 'stable' | 'down';

interface TranslationRow {
  language: Language;
  title?: string;
  description?: string | null;
  highlights?: string[] | null;
  name?: string;
}

interface PropertyMediaRow {
  storage_bucket: string;
  storage_path: string;
  media_type: 'image' | 'video' | 'reel_video' | 'floor_plan' | 'document';
  sort_order: number;
  is_cover: boolean;
}

interface PropertyDatabaseRow {
  id: string;
  reference_code: string;
  publication_status: PublicationStatus;
  property_type: PropertyType;
  listing_status: PropertyStatus;
  price_amount: number;
  price_currency: ListingCurrencyCode;
  price_usd_cents: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  parking_spaces: number;
  has_pool: boolean;
  has_security: boolean;
  has_garden: boolean;
  has_sea_view: boolean;
  has_city_view: boolean;
  year_built: number | null;
  featured: boolean;
  verified: boolean;
  roi_pct: number | null;
  rental_yield_pct: number | null;
  monthly_rent_usd_cents: number | null;
  amortization_years: number | null;
  investment_score: number | null;
  growth_score: number | null;
  risk_level: RiskLevel | null;
  market_trend: MarketTrend | null;
  published_at: string | null;
  partners: {
    id: string;
    display_name: string;
    logo_path: string | null;
    rating: number | null;
    listings_count: number;
    verified: boolean;
  };
  cities: {
    id: string;
    slug: string;
    city_translations: TranslationRow[];
  };
  countries: {
    id: string;
    iso2: string;
    flag_emoji: string | null;
    country_translations: TranslationRow[];
  };
  property_translations: TranslationRow[];
  property_media: PropertyMediaRow[];
}

export interface PropertyLocation {
  id: string;
  slug: string;
  name: string;
}

export interface PropertyCountry {
  id: string;
  code: string;
  name: string;
  flag: string | null;
}

export interface PropertyPartner {
  id: string;
  name: string;
  logoPath: string | null;
  rating: number | null;
  listings: number;
  verified: boolean;
}

export interface PropertyMedia {
  type: PropertyMediaRow['media_type'];
  url: string;
  isCover: boolean;
}

/** Extra remote-only amenity supported by the production schema. */
export interface RemotePropertyFeatures extends PropertyFeatures {
  cityView: boolean;
}

/** Database-backed investment metrics preserve missing values as null. */
export interface RemoteInvestmentAnalysis {
  estimatedRoi: number | null;
  rentalIncome: number | null;
  amortizationYears: number | null;
  growthScore: number | null;
  riskLevel: RiskLevel | null;
  marketTrend: MarketTrend | null;
  confidenceScore: number | null;
}

/**
 * Keeps the existing card/detail model's shared fields while replacing the
 * mock-only translation keys and static location IDs with remote content.
 */
export interface RemoteProperty
  extends Omit<
    Property,
    | 'titleKey'
    | 'descriptionKey'
    | 'cityId'
    | 'countryCode'
    | 'price'
    | 'image'
    | 'images'
    | 'partnerId'
    | 'roi'
    | 'rentalYield'
    | 'investmentScore'
    | 'aiAnalysis'
    | 'features'
  > {
  referenceCode: string;
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  title: string;
  description: string | null;
  highlights: string[];
  city: PropertyLocation;
  country: PropertyCountry;
  /** Listing-currency major units, e.g. 2,500,000 SAR. */
  price: number;
  /** Exact integer minor units returned by the database. */
  priceAmount: number;
  priceCurrency: ListingCurrencyCode;
  /** Derived USD major units, for future cross-currency presentation. */
  priceUsd: number;
  /** Kept nullable so detail UI never turns an absent DB area into 0 m². */
  areaSqm: number | null;
  image: string;
  images: string[];
  media: PropertyMedia[];
  partnerId: string;
  partner: PropertyPartner;
  roi: number | null;
  rentalYield: number | null;
  investmentScore: number | null;
  features: RemotePropertyFeatures;
  aiAnalysis: RemoteInvestmentAnalysis;
}

const PROPERTY_SELECT = `
  id,
  reference_code,
  publication_status,
  property_type,
  listing_status,
  price_amount,
  price_currency,
  price_usd_cents,
  bedrooms,
  bathrooms,
  area_sqm,
  parking_spaces,
  has_pool,
  has_security,
  has_garden,
  has_sea_view,
  has_city_view,
  year_built,
  featured,
  verified,
  roi_pct,
  rental_yield_pct,
  monthly_rent_usd_cents,
  amortization_years,
  investment_score,
  growth_score,
  risk_level,
  market_trend,
  published_at,
  partners!inner (
    id,
    display_name,
    logo_path,
    rating,
    listings_count,
    verified
  ),
  cities!inner (
    id,
    slug,
    city_translations ( language, name )
  ),
  countries!inner (
    id,
    iso2,
    flag_emoji,
    country_translations ( language, name )
  ),
  property_translations ( language, title, description, highlights ),
  property_media ( storage_bucket, storage_path, media_type, sort_order, is_cover )
`;

function publishedPropertiesQuery() {
  return supabase.from('properties').select(PROPERTY_SELECT).eq('publication_status', 'published');
}

function throwIfQueryFailed(error: { code?: string; message: string } | null): void {
  if (error) {
    throw new Error(`[properties] ${error.code ?? 'unknown'}: ${error.message}`);
  }
}

function selectTranslation<T extends TranslationRow>(translations: T[], language: Language): T | undefined {
  return translations.find((translation) => translation.language === language)
    ?? translations.find((translation) => translation.language === 'en');
}

function amountInMajorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

function daysSince(date: string | null): number {
  if (!date) return 0;

  const timestamp = Date.parse(date);
  if (Number.isNaN(timestamp)) return 0;

  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

const publicPropertyMediaBuckets = new Set(
  (process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_PROPERTY_BUCKETS ?? '')
    .split(',')
    .map((bucket) => bucket.trim())
    .filter(Boolean),
);

async function mediaUrl(storageBucket: string, storagePath: string): Promise<string | null> {
  if (!storageBucket || !storagePath) return null;

  // A storage path is not proof that a bucket is public. Only construct a
  // public URL after that bucket has been explicitly configured as public.
  if (publicPropertyMediaBuckets.has(storageBucket)) {
    // getPublicUrl only constructs a URL locally; it performs no write.
    const { data } = supabase.storage.from(storageBucket).getPublicUrl(storagePath);
    return data.publicUrl || null;
  }

  // Private buckets must not be guessed as public URLs. Storage RLS authorizes
  // this signed URL request against the matching published property_media row.
  const { data, error } = await supabase.storage.from(storageBucket).createSignedUrl(storagePath, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

async function mapMedia(mediaRows: PropertyMediaRow[]): Promise<PropertyMedia[]> {
  const sortedMedia = [...mediaRows]
    .sort((left, right) => Number(right.is_cover) - Number(left.is_cover) || left.sort_order - right.sort_order)
  const resolved = await Promise.all(sortedMedia.map(async (media) => {
    const url = await mediaUrl(media.storage_bucket, media.storage_path);
    return url ? { type: media.media_type, url, isCover: media.is_cover } : null;
  }));
  return resolved.filter((media): media is PropertyMedia => media !== null);
}

async function mapProperty(row: PropertyDatabaseRow, language: Language): Promise<RemoteProperty> {
  const translation = selectTranslation(row.property_translations ?? [], language);
  const cityTranslation = selectTranslation(row.cities.city_translations ?? [], language);
  const countryTranslation = selectTranslation(row.countries.country_translations ?? [], language);
  const media = await mapMedia(row.property_media ?? []);
  const imageUrls = media.filter((item) => item.type === 'image').map((item) => item.url);
  const images = imageUrls.length > 0 ? imageUrls : [Images.placeholders.property];

  const features: RemotePropertyFeatures = {
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area_sqm ?? 0,
    parking: row.parking_spaces,
    pool: row.has_pool,
    security: row.has_security,
    garden: row.has_garden,
    seaView: row.has_sea_view,
    cityView: row.has_city_view,
    ...(row.year_built === null ? {} : { yearBuilt: row.year_built }),
  };

  const aiAnalysis: RemoteInvestmentAnalysis = {
    estimatedRoi: row.roi_pct,
    rentalIncome:
      row.monthly_rent_usd_cents === null ? null : amountInMajorUnits(row.monthly_rent_usd_cents),
    amortizationYears: row.amortization_years,
    growthScore: row.growth_score,
    riskLevel: row.risk_level,
    marketTrend: row.market_trend,
    confidenceScore: row.investment_score,
  };

  return {
    id: row.id,
    referenceCode: row.reference_code,
    publicationStatus: row.publication_status,
    publishedAt: row.published_at,
    title: translation?.title ?? row.reference_code,
    description: translation?.description ?? null,
    highlights: translation?.highlights ?? [],
    city: {
      id: row.cities.id,
      slug: row.cities.slug,
      name: cityTranslation?.name ?? row.cities.slug,
    },
    country: {
      id: row.countries.id,
      code: row.countries.iso2,
      name: countryTranslation?.name ?? row.countries.iso2.toUpperCase(),
      flag: row.countries.flag_emoji,
    },
    price: amountInMajorUnits(row.price_amount),
    priceAmount: row.price_amount,
    priceCurrency: row.price_currency,
    priceUsd: amountInMajorUnits(row.price_usd_cents),
    areaSqm: row.area_sqm,
    image: images[0],
    images,
    media,
    type: row.property_type,
    status: row.listing_status,
    verified: row.verified,
    featured: row.featured,
    roi: row.roi_pct,
    rentalYield: row.rental_yield_pct,
    investmentScore: row.investment_score,
    features,
    aiAnalysis,
    partnerId: row.partners.id,
    partner: {
      id: row.partners.id,
      name: row.partners.display_name,
      logoPath: row.partners.logo_path,
      rating: row.partners.rating,
      listings: row.partners.listings_count,
      verified: row.partners.verified,
    },
    addedDaysAgo: daysSince(row.published_at),
    hasVideo: media.some((item) => item.type === 'video'),
  };
}

/** Returns all publicly readable, published properties in the requested language. */
export async function getPublishedProperties(language: Language): Promise<RemoteProperty[]> {
  const { data, error } = await publishedPropertiesQuery()
    .order('published_at', { ascending: false })
    .returns<PropertyDatabaseRow[]>();

  throwIfQueryFailed(error);
  return Promise.all((data ?? []).map((row) => mapProperty(row, language)));
}

/** Returns one publicly readable, published property, or null when it is absent. */
export async function getPropertyById(id: string, language: Language): Promise<RemoteProperty | null> {
  const { data, error } = await publishedPropertiesQuery()
    .eq('id', id)
    .maybeSingle()
    .returns<PropertyDatabaseRow>();

  throwIfQueryFailed(error);
  return data ? mapProperty(data, language) : null;
}

/** Returns published properties selected for the featured rail. */
export async function getFeaturedProperties(language: Language): Promise<RemoteProperty[]> {
  const { data, error } = await publishedPropertiesQuery()
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .returns<PropertyDatabaseRow[]>();

  throwIfQueryFailed(error);
  return Promise.all((data ?? []).map((row) => mapProperty(row, language)));
}

/** Returns published properties for an ISO-2 country code, such as `sa`. */
export async function getPropertiesByCountry(
  countryCode: string,
  language: Language,
): Promise<RemoteProperty[]> {
  const { data, error } = await publishedPropertiesQuery()
    .eq('countries.iso2', countryCode.trim().toLowerCase())
    .order('published_at', { ascending: false })
    .returns<PropertyDatabaseRow[]>();

  throwIfQueryFailed(error);
  return Promise.all((data ?? []).map((row) => mapProperty(row, language)));
}

/** Compact display format that always retains the listing's own currency code. */
export function formatListingPrice(
  amount: number,
  currency: ListingCurrencyCode,
  language: Language,
): string {
  const formattedAmount = new Intl.NumberFormat(language, {
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency} ${formattedAmount}`;
}

export type RemotePropertySort =
  | 'recommended'
  | 'newest'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'roi_high_to_low';

export type RemotePropertyAmenity = 'pool' | 'security' | 'garden' | 'seaView' | 'cityView';

export interface RemotePropertyFilters {
  countryCode?: string | null;
  /** Stable UUID avoids collisions when future markets reuse a city slug. */
  cityId?: string | null;
  citySlug?: string | null;
  propertyType?: PropertyType | null;
  listingStatus?: RemoteProperty['status'] | null;
  /** A studio is an apartment whose database bedroom count is zero. */
  studioOnly?: boolean;
  /** Listing-currency bounds, used when the active market has one currency. */
  minPrice?: number | null;
  maxPrice?: number | null;
  priceCurrency?: ListingCurrencyCode | null;
  /** Legacy cross-market USD bounds retained for existing callers. */
  minPriceUsd?: number | null;
  maxPriceUsd?: number | null;
  minBedrooms?: number | null;
  minBathrooms?: number | null;
  minAreaSqm?: number | null;
  maxAreaSqm?: number | null;
  amenities?: RemotePropertyAmenity[];
  verifiedOnly?: boolean;
  /** Uses the partner's public verified flag, never private contact data. */
  verifiedPartnerOnly?: boolean;
  featuredOnly?: boolean;
  minInvestmentScore?: number | null;
  minRoi?: number | null;
  search?: string;
}

function nullableDescending(left: number | null, right: number | null): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return right - left;
}

function publishedTimestamp(property: RemoteProperty): number {
  return property.publishedAt ? Date.parse(property.publishedAt) || 0 : 0;
}

/**
 * Client-side browse logic for the current small catalogue. Keeping it here
 * makes later migration to server filters and pagination a contained change.
 * Price filters compare the database's derived USD amount; displayed prices
 * always remain in the listing's native currency.
 */
export function filterAndSortRemoteProperties(
  properties: RemoteProperty[],
  filters: RemotePropertyFilters,
  sort: RemotePropertySort = 'recommended',
): RemoteProperty[] {
  const needle = filters.search?.trim().toLocaleLowerCase() ?? '';
  const countryCode = filters.countryCode?.toLowerCase();
  const cityId = filters.cityId?.toLowerCase();
  const citySlug = filters.citySlug?.toLowerCase();

  const filtered = properties.filter((property) => {
    if (countryCode && property.country.code.toLowerCase() !== countryCode) return false;
    if (cityId && property.city.id.toLowerCase() !== cityId) return false;
    if (citySlug && property.city.slug.toLowerCase() !== citySlug) return false;
    if (filters.propertyType && property.type !== filters.propertyType) return false;
    if (filters.listingStatus && property.status !== filters.listingStatus) return false;
    if (filters.studioOnly && (property.type !== 'apartment' || property.features.bedrooms !== 0)) return false;
    if (filters.priceCurrency && property.priceCurrency !== filters.priceCurrency) return false;
    if (filters.minPrice !== undefined && filters.minPrice !== null && property.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && property.price > filters.maxPrice) {
      return false;
    }
    if (filters.minPriceUsd !== undefined && filters.minPriceUsd !== null && property.priceUsd < filters.minPriceUsd) {
      return false;
    }
    if (filters.maxPriceUsd !== undefined && filters.maxPriceUsd !== null && property.priceUsd > filters.maxPriceUsd) {
      return false;
    }
    if (filters.minBedrooms && property.features.bedrooms < filters.minBedrooms) return false;
    if (filters.minBathrooms && property.features.bathrooms < filters.minBathrooms) return false;
    if (filters.minAreaSqm !== undefined && filters.minAreaSqm !== null
      && (property.areaSqm === null || property.areaSqm < filters.minAreaSqm)) return false;
    if (filters.maxAreaSqm !== undefined && filters.maxAreaSqm !== null
      && (property.areaSqm === null || property.areaSqm > filters.maxAreaSqm)) return false;
    if (filters.amenities?.some((amenity) => !property.features[amenity])) return false;
    if (filters.verifiedOnly && !property.verified) return false;
    if (filters.verifiedPartnerOnly && !property.partner.verified) return false;
    if (filters.featuredOnly && !property.featured) return false;
    if (
      filters.minInvestmentScore
      && (property.investmentScore === null || property.investmentScore < filters.minInvestmentScore)
    ) {
      return false;
    }
    if (filters.minRoi && (property.roi === null || property.roi < filters.minRoi)) return false;
    if (!needle) return true;

    return [
      property.title,
      property.city.name,
      property.country.name,
      property.partner.name,
      property.type,
      property.referenceCode,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(needle);
  });

  return [...filtered].sort((left, right) => {
    if (sort === 'newest') return publishedTimestamp(right) - publishedTimestamp(left);
    if (sort === 'price_low_to_high') return left.priceUsd - right.priceUsd;
    if (sort === 'price_high_to_low') return right.priceUsd - left.priceUsd;
    if (sort === 'roi_high_to_low') return nullableDescending(left.roi, right.roi);

    return (
      Number(right.featured) - Number(left.featured)
      || Number(right.verified) - Number(left.verified)
      || nullableDescending(left.investmentScore, right.investmentScore)
      || publishedTimestamp(right) - publishedTimestamp(left)
    );
  });
}
