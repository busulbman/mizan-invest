/**
 * ============================================
 * DEMO CATALOGUE
 * ============================================
 *
 * 24 listings across six cities and four property types, plus the
 * partners that publish them.
 *
 * LOCALISATION
 * Display copy is stored as translation keys (`titleKey`,
 * `descriptionKey`, `cityId`), never as literal English. A listing card
 * therefore renders in Russian, Turkish, English or Arabic without any
 * screen having to special-case a language.
 *
 * MONEY
 * `price`, `rentalIncome` and every other figure are in USD. The display
 * currency is applied at render time by `useCurrency()`.
 *
 * TODO: Replace with the production listings API
 */

import { Images } from './images';
import { TranslationKey } from './translations';

// ============================================
// TYPES
// ============================================

export type CityId = 'madinah' | 'riyadh' | 'jeddah' | 'istanbul' | 'antalya' | 'dubai';
export type CountryCode = 'sa' | 'tr' | 'ae';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'commercial';
export type PropertyStatus = 'available' | 'reserved' | 'sold';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  /** Square metres */
  area: number;
  parking: number;
  pool: boolean;
  security: boolean;
  garden: boolean;
  seaView: boolean;
  yearBuilt?: number;
}

export interface AIAnalysis {
  estimatedRoi: number;
  /** Monthly, USD */
  rentalIncome: number;
  amortizationYears: number;
  /** 0–100 */
  growthScore: number;
  riskLevel: RiskLevel;
  marketTrend: 'up' | 'stable' | 'down';
  /** 0–100 */
  confidenceScore: number;
}

export interface Partner {
  id: string;
  name: string;
  countryCode: CountryCode;
  listings: number;
  rating: number;
  logo: string;
  verified: boolean;
  descriptionKey: TranslationKey;
  phone: string;
  whatsapp: string;
  contactEmail: string;
}

export interface Property {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  cityId: CityId;
  countryCode: CountryCode;
  /** USD */
  price: number;
  roi: number;
  rentalYield?: number;
  image: string;
  images: string[];
  verified: boolean;
  type: PropertyType;
  status: PropertyStatus;
  /** 0–100 premium investment score shown with a gold accent */
  investmentScore: number;
  features: PropertyFeatures;
  aiAnalysis: AIAnalysis;
  partnerId: string;
  /** Drives the "New listings" rail and the detail-screen date */
  addedDaysAgo: number;
  featured?: boolean;
  /** Bundled demo tour; `undefined` hides the video section */
  hasVideo?: boolean;
}

export interface CityInfo {
  id: CityId;
  countryCode: CountryCode;
  image: string;
}

export interface CountryInfo {
  id: string;
  flag: string;
}

export interface CategoryInfo {
  id: PropertyType;
  icon: import('./icons').IconName;
}

// ============================================
// COUNTRIES & CITIES
// ============================================

export const countries: CountryInfo[] = [
  { id: 'all', flag: '🌍' },
  { id: 'sa', flag: '🇸🇦' },
  { id: 'tr', flag: '🇹🇷' },
  { id: 'ae', flag: '🇦🇪' },
];

export const cities: CityInfo[] = [
  { id: 'madinah', countryCode: 'sa', image: Images.properties.madinah1 },
  { id: 'riyadh', countryCode: 'sa', image: Images.properties.riyadh1 },
  { id: 'jeddah', countryCode: 'sa', image: Images.properties.residence4 },
  { id: 'istanbul', countryCode: 'tr', image: Images.properties.istanbul1 },
  { id: 'antalya', countryCode: 'tr', image: Images.properties.land3 },
  { id: 'dubai', countryCode: 'ae', image: Images.properties.penthouse2 },
];

export const categories: CategoryInfo[] = [
  { id: 'apartment', icon: 'apartment' },
  { id: 'villa', icon: 'villa' },
  { id: 'land', icon: 'land' },
  { id: 'commercial', icon: 'commercial' },
];

// ============================================
// PARTNERS
// ============================================

export const verifiedPartners: Partner[] = [
  {
    id: 'p1',
    name: 'Madinah Elite Properties',
    countryCode: 'sa',
    listings: 38,
    rating: 4.9,
    logo: Images.partners.partner3,
    verified: true,
    descriptionKey: 'partner1Description',
    phone: '+966143456789',
    whatsapp: '+966143456789',
    contactEmail: 'info@madinahelite.sa',
  },
  {
    id: 'p2',
    name: 'Najd Capital',
    countryCode: 'sa',
    listings: 27,
    rating: 4.8,
    logo: Images.partners.partner2,
    verified: true,
    descriptionKey: 'partner2Description',
    phone: '+966112345678',
    whatsapp: '+966112345678',
    contactEmail: 'invest@najdcapital.sa',
  },
  {
    id: 'p3',
    name: 'Red Sea Development Partners',
    countryCode: 'sa',
    listings: 19,
    rating: 4.7,
    logo: Images.partners.partner5,
    verified: true,
    descriptionKey: 'partner3Description',
    phone: '+966126789012',
    whatsapp: '+966126789012',
    contactEmail: 'hello@redseapartners.sa',
  },
  {
    id: 'p4',
    name: 'Aegean Premier',
    countryCode: 'tr',
    listings: 42,
    rating: 4.9,
    logo: Images.partners.partner1,
    verified: true,
    descriptionKey: 'partner4Description',
    phone: '+902321234567',
    whatsapp: '+902321234567',
    contactEmail: 'contact@aegeanpremier.com',
  },
  {
    id: 'p5',
    name: 'Gulf Horizon Realty',
    countryCode: 'ae',
    listings: 31,
    rating: 4.8,
    logo: Images.partners.partner4,
    verified: true,
    descriptionKey: 'partner5Description',
    phone: '+97145550123',
    whatsapp: '+97145550123',
    contactEmail: 'invest@gulfhorizon.ae',
  },
];

export function getPartnerById(id: string): Partner | undefined {
  return verifiedPartners.find((partner) => partner.id === id);
}

// ============================================
// LISTINGS
// ============================================

const P = Images.properties;

export const properties: Property[] = [
  // ---------- MADINAH ----------
  {
    id: '1',
    titleKey: 'prop1Title',
    descriptionKey: 'descHolyCity',
    cityId: 'madinah',
    countryCode: 'sa',
    price: 680000,
    roi: 7.8,
    rentalYield: 8.5,
    image: P.madinah1,
    images: [P.madinah1, P.interior1, P.residence1, P.interior3],
    verified: true,
    type: 'apartment',
    status: 'available',
    investmentScore: 92,
    features: { bedrooms: 3, bathrooms: 3, area: 185, parking: 1, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2023 },
    aiAnalysis: { estimatedRoi: 7.8, rentalIncome: 4800, amortizationYears: 10, growthScore: 88, riskLevel: 'low', marketTrend: 'up', confidenceScore: 91 },
    partnerId: 'p1',
    addedDaysAgo: 3,
    featured: true,
    hasVideo: true,
  },
  {
    id: '2',
    titleKey: 'prop2Title',
    descriptionKey: 'descLuxuryVilla',
    cityId: 'madinah',
    countryCode: 'sa',
    price: 1450000,
    roi: 8.2,
    rentalYield: 6.4,
    image: P.villa2,
    images: [P.villa2, P.interior2, P.interior4, P.madinah2],
    verified: true,
    type: 'villa',
    status: 'available',
    investmentScore: 89,
    features: { bedrooms: 5, bathrooms: 6, area: 520, parking: 3, pool: true, security: true, garden: true, seaView: false, yearBuilt: 2024 },
    aiAnalysis: { estimatedRoi: 8.2, rentalIncome: 7700, amortizationYears: 12, growthScore: 85, riskLevel: 'low', marketTrend: 'up', confidenceScore: 87 },
    partnerId: 'p1',
    addedDaysAgo: 11,
    featured: true,
  },
  {
    id: '3',
    titleKey: 'prop3Title',
    descriptionKey: 'descCommercial',
    cityId: 'madinah',
    countryCode: 'sa',
    price: 2350000,
    roi: 10.4,
    rentalYield: 9.1,
    image: P.commercial4,
    images: [P.commercial4, P.commercial1, P.madinah2],
    verified: true,
    type: 'commercial',
    status: 'available',
    investmentScore: 94,
    features: { bedrooms: 0, bathrooms: 6, area: 1400, parking: 24, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2022 },
    aiAnalysis: { estimatedRoi: 10.4, rentalIncome: 17800, amortizationYears: 9, growthScore: 93, riskLevel: 'low', marketTrend: 'up', confidenceScore: 89 },
    partnerId: 'p1',
    addedDaysAgo: 6,
    featured: true,
  },
  {
    id: '4',
    titleKey: 'prop4Title',
    descriptionKey: 'descInvestmentLand',
    cityId: 'madinah',
    countryCode: 'sa',
    price: 1180000,
    roi: 13.6,
    image: P.land1,
    images: [P.land1, P.land2, P.madinah1],
    verified: true,
    type: 'land',
    status: 'available',
    investmentScore: 95,
    features: { bedrooms: 0, bathrooms: 0, area: 4200, parking: 0, pool: false, security: false, garden: false, seaView: false },
    aiAnalysis: { estimatedRoi: 13.6, rentalIncome: 0, amortizationYears: 7, growthScore: 96, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 81 },
    partnerId: 'p1',
    addedDaysAgo: 2,
    hasVideo: true,
  },
  {
    id: '5',
    titleKey: 'prop5Title',
    descriptionKey: 'descHolyCity',
    cityId: 'madinah',
    countryCode: 'sa',
    price: 420000,
    roi: 9.2,
    rentalYield: 9.8,
    image: P.hotel1,
    images: [P.hotel1, P.interior5, P.madinah2],
    verified: true,
    type: 'apartment',
    status: 'reserved',
    investmentScore: 87,
    features: { bedrooms: 2, bathrooms: 2, area: 96, parking: 1, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2024 },
    aiAnalysis: { estimatedRoi: 9.2, rentalIncome: 3400, amortizationYears: 9, growthScore: 84, riskLevel: 'low', marketTrend: 'up', confidenceScore: 86 },
    partnerId: 'p1',
    addedDaysAgo: 1,
  },

  // ---------- RIYADH ----------
  {
    id: '6',
    titleKey: 'prop6Title',
    descriptionKey: 'descCityApartment',
    cityId: 'riyadh',
    countryCode: 'sa',
    price: 1950000,
    roi: 7.6,
    rentalYield: 5.8,
    image: P.riyadh1,
    images: [P.riyadh1, P.residence2, P.interior3, P.penthouse1],
    verified: true,
    type: 'apartment',
    status: 'available',
    investmentScore: 90,
    features: { bedrooms: 4, bathrooms: 5, area: 320, parking: 3, pool: true, security: true, garden: false, seaView: false, yearBuilt: 2024 },
    aiAnalysis: { estimatedRoi: 7.6, rentalIncome: 9500, amortizationYears: 14, growthScore: 91, riskLevel: 'low', marketTrend: 'up', confidenceScore: 85 },
    partnerId: 'p2',
    addedDaysAgo: 8,
    featured: true,
    hasVideo: true,
  },
  {
    id: '7',
    titleKey: 'prop7Title',
    descriptionKey: 'descLuxuryVilla',
    cityId: 'riyadh',
    countryCode: 'sa',
    price: 3100000,
    roi: 8.9,
    rentalYield: 6.1,
    image: P.villa3,
    images: [P.villa3, P.interior2, P.interior4, P.villa4],
    verified: true,
    type: 'villa',
    status: 'available',
    investmentScore: 91,
    features: { bedrooms: 6, bathrooms: 7, area: 780, parking: 4, pool: true, security: true, garden: true, seaView: false, yearBuilt: 2023 },
    aiAnalysis: { estimatedRoi: 8.9, rentalIncome: 15700, amortizationYears: 11, growthScore: 90, riskLevel: 'low', marketTrend: 'up', confidenceScore: 88 },
    partnerId: 'p2',
    addedDaysAgo: 19,
  },
  {
    id: '8',
    titleKey: 'prop8Title',
    descriptionKey: 'descCommercial',
    cityId: 'riyadh',
    countryCode: 'sa',
    price: 4600000,
    roi: 9.7,
    rentalYield: 8.2,
    image: P.commercial2,
    images: [P.commercial2, P.commercial3, P.riyadh1],
    verified: true,
    type: 'commercial',
    status: 'available',
    investmentScore: 93,
    features: { bedrooms: 0, bathrooms: 8, area: 2100, parking: 40, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2021 },
    aiAnalysis: { estimatedRoi: 9.7, rentalIncome: 31400, amortizationYears: 10, growthScore: 92, riskLevel: 'low', marketTrend: 'up', confidenceScore: 90 },
    partnerId: 'p2',
    addedDaysAgo: 26,
  },
  {
    id: '9',
    titleKey: 'prop9Title',
    descriptionKey: 'descInvestmentLand',
    cityId: 'riyadh',
    countryCode: 'sa',
    price: 2200000,
    roi: 14.6,
    image: P.land2,
    images: [P.land2, P.land1, P.riyadh1],
    verified: true,
    type: 'land',
    status: 'available',
    investmentScore: 96,
    features: { bedrooms: 0, bathrooms: 0, area: 5000, parking: 0, pool: false, security: false, garden: false, seaView: false },
    aiAnalysis: { estimatedRoi: 14.6, rentalIncome: 0, amortizationYears: 7, growthScore: 96, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 78 },
    partnerId: 'p2',
    addedDaysAgo: 5,
  },

  // ---------- JEDDAH ----------
  {
    id: '10',
    titleKey: 'prop10Title',
    descriptionKey: 'descSeafront',
    cityId: 'jeddah',
    countryCode: 'sa',
    price: 890000,
    roi: 8.1,
    rentalYield: 6.9,
    image: P.residence4,
    images: [P.residence4, P.interior1, P.interior5],
    verified: true,
    type: 'apartment',
    status: 'available',
    investmentScore: 86,
    features: { bedrooms: 3, bathrooms: 3, area: 210, parking: 2, pool: true, security: true, garden: false, seaView: true, yearBuilt: 2023 },
    aiAnalysis: { estimatedRoi: 8.1, rentalIncome: 5100, amortizationYears: 12, growthScore: 83, riskLevel: 'low', marketTrend: 'up', confidenceScore: 84 },
    partnerId: 'p3',
    addedDaysAgo: 14,
  },
  {
    id: '11',
    titleKey: 'prop11Title',
    descriptionKey: 'descSeafront',
    cityId: 'jeddah',
    countryCode: 'sa',
    price: 2750000,
    roi: 9.4,
    rentalYield: 7.1,
    image: P.villa1,
    images: [P.villa1, P.interior4, P.interior2, P.land3],
    verified: true,
    type: 'villa',
    status: 'available',
    investmentScore: 90,
    features: { bedrooms: 5, bathrooms: 6, area: 610, parking: 3, pool: true, security: true, garden: true, seaView: true, yearBuilt: 2022 },
    aiAnalysis: { estimatedRoi: 9.4, rentalIncome: 16300, amortizationYears: 11, growthScore: 89, riskLevel: 'low', marketTrend: 'up', confidenceScore: 87 },
    partnerId: 'p3',
    addedDaysAgo: 22,
    featured: true,
  },
  {
    id: '12',
    titleKey: 'prop12Title',
    descriptionKey: 'descCommercial',
    cityId: 'jeddah',
    countryCode: 'sa',
    price: 1650000,
    roi: 10.1,
    rentalYield: 8.8,
    image: P.commercial1,
    images: [P.commercial1, P.commercial3, P.residence4],
    verified: true,
    type: 'commercial',
    status: 'available',
    investmentScore: 88,
    features: { bedrooms: 0, bathrooms: 4, area: 950, parking: 18, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2020 },
    aiAnalysis: { estimatedRoi: 10.1, rentalIncome: 12100, amortizationYears: 9, growthScore: 86, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 82 },
    partnerId: 'p3',
    addedDaysAgo: 31,
  },

  // ---------- ISTANBUL ----------
  {
    id: '13',
    titleKey: 'prop13Title',
    descriptionKey: 'descLuxuryVilla',
    cityId: 'istanbul',
    countryCode: 'tr',
    price: 4250000,
    roi: 8.4,
    rentalYield: 6.2,
    image: P.villa1,
    images: [P.villa1, P.istanbul1, P.interior2, P.interior4],
    verified: true,
    type: 'villa',
    status: 'available',
    investmentScore: 91,
    features: { bedrooms: 6, bathrooms: 8, area: 850, parking: 4, pool: true, security: true, garden: true, seaView: true, yearBuilt: 2022 },
    aiAnalysis: { estimatedRoi: 8.4, rentalIncome: 28500, amortizationYears: 12, growthScore: 87, riskLevel: 'low', marketTrend: 'up', confidenceScore: 92 },
    partnerId: 'p4',
    addedDaysAgo: 9,
    featured: true,
    hasVideo: true,
  },
  {
    id: '14',
    titleKey: 'prop14Title',
    descriptionKey: 'descCityApartment',
    cityId: 'istanbul',
    countryCode: 'tr',
    price: 740000,
    roi: 8.8,
    rentalYield: 7.4,
    image: P.residence3,
    images: [P.residence3, P.istanbul1, P.interior3],
    verified: true,
    type: 'apartment',
    status: 'available',
    investmentScore: 85,
    features: { bedrooms: 3, bathrooms: 2, area: 165, parking: 1, pool: true, security: true, garden: false, seaView: false, yearBuilt: 2024 },
    aiAnalysis: { estimatedRoi: 8.8, rentalIncome: 4600, amortizationYears: 11, growthScore: 84, riskLevel: 'low', marketTrend: 'up', confidenceScore: 83 },
    partnerId: 'p4',
    addedDaysAgo: 4,
  },
  {
    id: '15',
    titleKey: 'prop15Title',
    descriptionKey: 'descInvestmentLand',
    cityId: 'istanbul',
    countryCode: 'tr',
    price: 1320000,
    roi: 12.9,
    image: P.land1,
    images: [P.land1, P.land2],
    verified: true,
    type: 'land',
    status: 'available',
    investmentScore: 92,
    features: { bedrooms: 0, bathrooms: 0, area: 8600, parking: 0, pool: false, security: false, garden: false, seaView: false },
    aiAnalysis: { estimatedRoi: 12.9, rentalIncome: 0, amortizationYears: 8, growthScore: 94, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 76 },
    partnerId: 'p4',
    addedDaysAgo: 16,
  },
  {
    id: '16',
    titleKey: 'prop16Title',
    descriptionKey: 'descCommercial',
    cityId: 'istanbul',
    countryCode: 'tr',
    price: 980000,
    roi: 11.2,
    rentalYield: 9.4,
    image: P.commercial3,
    images: [P.commercial3, P.istanbul1, P.commercial1],
    verified: true,
    type: 'commercial',
    status: 'available',
    investmentScore: 89,
    features: { bedrooms: 0, bathrooms: 3, area: 480, parking: 6, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2019 },
    aiAnalysis: { estimatedRoi: 11.2, rentalIncome: 7700, amortizationYears: 9, growthScore: 88, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 80 },
    partnerId: 'p4',
    addedDaysAgo: 28,
  },

  // ---------- ANTALYA ----------
  {
    id: '17',
    titleKey: 'prop17Title',
    descriptionKey: 'descSeafront',
    cityId: 'antalya',
    countryCode: 'tr',
    price: 395000,
    roi: 9.6,
    rentalYield: 8.2,
    image: P.residence1,
    images: [P.residence1, P.land3, P.interior1],
    verified: true,
    type: 'apartment',
    status: 'available',
    investmentScore: 87,
    features: { bedrooms: 2, bathrooms: 2, area: 118, parking: 1, pool: true, security: true, garden: true, seaView: true, yearBuilt: 2024 },
    aiAnalysis: { estimatedRoi: 9.6, rentalIncome: 2900, amortizationYears: 10, growthScore: 85, riskLevel: 'low', marketTrend: 'up', confidenceScore: 84 },
    partnerId: 'p4',
    addedDaysAgo: 7,
    featured: true,
  },
  {
    id: '18',
    titleKey: 'prop18Title',
    descriptionKey: 'descLuxuryVilla',
    cityId: 'antalya',
    countryCode: 'tr',
    price: 1120000,
    roi: 10.3,
    rentalYield: 7.8,
    image: P.villa4,
    images: [P.villa4, P.interior4, P.land3, P.interior2],
    verified: true,
    type: 'villa',
    status: 'available',
    investmentScore: 88,
    features: { bedrooms: 4, bathrooms: 4, area: 340, parking: 2, pool: true, security: true, garden: true, seaView: true, yearBuilt: 2021 },
    aiAnalysis: { estimatedRoi: 10.3, rentalIncome: 7300, amortizationYears: 10, growthScore: 87, riskLevel: 'low', marketTrend: 'up', confidenceScore: 86 },
    partnerId: 'p4',
    addedDaysAgo: 13,
  },
  {
    id: '19',
    titleKey: 'prop19Title',
    descriptionKey: 'descInvestmentLand',
    cityId: 'antalya',
    countryCode: 'tr',
    price: 880000,
    roi: 11.2,
    image: P.land3,
    images: [P.land3, P.land2],
    verified: true,
    type: 'land',
    status: 'available',
    investmentScore: 90,
    features: { bedrooms: 0, bathrooms: 0, area: 6400, parking: 0, pool: false, security: false, garden: false, seaView: true },
    aiAnalysis: { estimatedRoi: 11.2, rentalIncome: 0, amortizationYears: 9, growthScore: 91, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 77 },
    partnerId: 'p4',
    addedDaysAgo: 24,
    hasVideo: true,
  },
  {
    id: '20',
    titleKey: 'prop20Title',
    descriptionKey: 'descCommercial',
    cityId: 'antalya',
    countryCode: 'tr',
    price: 1480000,
    roi: 12.4,
    rentalYield: 10.2,
    image: P.hotel1,
    images: [P.hotel1, P.interior5, P.land3],
    verified: true,
    type: 'commercial',
    status: 'available',
    investmentScore: 91,
    features: { bedrooms: 0, bathrooms: 12, area: 1200, parking: 20, pool: true, security: true, garden: true, seaView: true, yearBuilt: 2020 },
    aiAnalysis: { estimatedRoi: 12.4, rentalIncome: 12600, amortizationYears: 8, growthScore: 90, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 81 },
    partnerId: 'p4',
    addedDaysAgo: 35,
  },

  // ---------- DUBAI ----------
  {
    id: '21',
    titleKey: 'prop21Title',
    descriptionKey: 'descLuxuryVilla',
    cityId: 'dubai',
    countryCode: 'ae',
    price: 6800000,
    roi: 9.1,
    rentalYield: 7.2,
    image: P.penthouse1,
    images: [P.penthouse1, P.penthouse2, P.interior2, P.interior3],
    verified: true,
    type: 'villa',
    status: 'available',
    investmentScore: 94,
    features: { bedrooms: 7, bathrooms: 9, area: 1200, parking: 6, pool: true, security: true, garden: true, seaView: true, yearBuilt: 2021 },
    aiAnalysis: { estimatedRoi: 9.1, rentalIncome: 52000, amortizationYears: 11, growthScore: 94, riskLevel: 'low', marketTrend: 'up', confidenceScore: 90 },
    partnerId: 'p5',
    addedDaysAgo: 12,
    featured: true,
    hasVideo: true,
  },
  {
    id: '22',
    titleKey: 'prop22Title',
    descriptionKey: 'descCommercial',
    cityId: 'dubai',
    countryCode: 'ae',
    price: 3400000,
    roi: 9.8,
    rentalYield: 8.4,
    image: P.commercial2,
    images: [P.commercial2, P.penthouse2, P.commercial3],
    verified: true,
    type: 'commercial',
    status: 'available',
    investmentScore: 92,
    features: { bedrooms: 0, bathrooms: 6, area: 1600, parking: 30, pool: false, security: true, garden: false, seaView: false, yearBuilt: 2022 },
    aiAnalysis: { estimatedRoi: 9.8, rentalIncome: 23800, amortizationYears: 10, growthScore: 91, riskLevel: 'low', marketTrend: 'up', confidenceScore: 88 },
    partnerId: 'p5',
    addedDaysAgo: 18,
  },
  {
    id: '23',
    titleKey: 'prop23Title',
    descriptionKey: 'descCityApartment',
    cityId: 'dubai',
    countryCode: 'ae',
    price: 1250000,
    roi: 8.6,
    rentalYield: 7.0,
    image: P.penthouse2,
    images: [P.penthouse2, P.interior1, P.interior5, P.residence2],
    verified: true,
    type: 'apartment',
    status: 'available',
    investmentScore: 89,
    features: { bedrooms: 2, bathrooms: 3, area: 145, parking: 2, pool: true, security: true, garden: false, seaView: true, yearBuilt: 2024 },
    aiAnalysis: { estimatedRoi: 8.6, rentalIncome: 7300, amortizationYears: 12, growthScore: 89, riskLevel: 'low', marketTrend: 'up', confidenceScore: 87 },
    partnerId: 'p5',
    addedDaysAgo: 2,
  },
  {
    id: '24',
    titleKey: 'prop24Title',
    descriptionKey: 'descInvestmentLand',
    cityId: 'dubai',
    countryCode: 'ae',
    price: 2950000,
    roi: 13.1,
    image: P.land2,
    images: [P.land2, P.land1, P.penthouse2],
    verified: true,
    type: 'land',
    status: 'available',
    investmentScore: 93,
    features: { bedrooms: 0, bathrooms: 0, area: 9200, parking: 0, pool: false, security: false, garden: false, seaView: false },
    aiAnalysis: { estimatedRoi: 13.1, rentalIncome: 0, amortizationYears: 8, growthScore: 95, riskLevel: 'medium', marketTrend: 'up', confidenceScore: 79 },
    partnerId: 'p5',
    addedDaysAgo: 21,
  },
];

// ============================================
// DERIVED COLLECTIONS
// Home rails read from these so a listing is defined exactly once.
// ============================================

/** "Featured projects" — hand-picked by the editorial team */
export const featuredProperties = properties.filter((property) => property.featured);

/** "Madinah projects" — the flagship market for this demo */
export const madinahProperties = properties.filter((property) => property.cityId === 'madinah');

/** "New listings" — most recently published first */
export const newestProperties = [...properties]
  .sort((a, b) => a.addedDaysAgo - b.addedDaysAgo)
  .slice(0, 8);

/** "High investment potential" — best ROI first */
export const highYieldProperties = [...properties]
  .sort((a, b) => b.roi - a.roi)
  .slice(0, 8);

/** "Recently viewed" — a fixed demo trail, not real telemetry */
export const recentlyViewedProperties = ['13', '3', '17', '21', '6']
  .map((id) => properties.find((property) => property.id === id))
  .filter((property): property is Property => property !== undefined);

// ============================================
// LOOKUPS
// ============================================

export function getPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id);
}

export function getPropertiesByIds(ids: string[]): Property[] {
  return ids
    .map((id) => getPropertyById(id))
    .filter((property): property is Property => property !== undefined);
}

/** Same type first, then same city — never returns the current listing */
export function getSimilarProperties(property: Property, limit = 6): Property[] {
  const sameType = properties.filter(
    (item) => item.id !== property.id && item.type === property.type
  );
  const sameCity = properties.filter(
    (item) =>
      item.id !== property.id &&
      item.cityId === property.cityId &&
      !sameType.some((typed) => typed.id === item.id)
  );
  return [...sameType, ...sameCity].slice(0, limit);
}

export function countPropertiesByType(type: PropertyType): number {
  return properties.filter((property) => property.type === type).length;
}

export function countPropertiesByCity(cityId: CityId): number {
  return properties.filter((property) => property.cityId === cityId).length;
}

// ============================================
// FORMATTING HELPERS (currency-independent)
// Prices live in `@/constants/currency` — these are the rest.
// ============================================

export function formatROI(roi: number): string {
  return `${roi.toFixed(1)}%`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('en-US').replace(/,/g, ' ')} m²`;
}

export function riskLevelColorKey(level: RiskLevel): 'success' | 'warning' | 'error' {
  if (level === 'low') return 'success';
  if (level === 'medium') return 'warning';
  return 'error';
}

// ============================================
// AI INSIGHT TILES (home dashboard)
// ============================================

export interface AIInsight {
  id: string;
  labelKey: TranslationKey;
  value: string;
  trend: 'up' | 'down' | 'stable';
  tone: 'success' | 'info' | 'accent' | 'warning';
}

export const aiInsights: AIInsight[] = [
  { id: '1', labelKey: 'estimatedRoi', value: '9.8%', trend: 'up', tone: 'success' },
  { id: '2', labelKey: 'rentalYield', value: '7.4%', trend: 'up', tone: 'info' },
  { id: '3', labelKey: 'growthScore', value: '90', trend: 'up', tone: 'accent' },
  { id: '4', labelKey: 'riskLevel', value: 'low', trend: 'stable', tone: 'warning' },
];
