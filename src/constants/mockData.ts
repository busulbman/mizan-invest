/**
 * ============================================
 * MOCK DATA
 * ============================================
 *
 * Mock data for development and testing.
 * Replace with API data in production.
 *
 * TODO: Replace mock property data with production API
 * TODO: Connect to Firebase/Supabase for real data
 * TODO: Implement data caching strategy
 */

import { Images } from './images';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  countryCode: string;
  price: number;
  roi: number;
  rentalYield?: number;
  image: string;
  images?: string[];
  verified: boolean;
  favorite?: boolean;
  type: 'villa' | 'apartment' | 'land' | 'commercial';
  status?: 'available' | 'reserved' | 'sold';
  description?: string;
  features?: PropertyFeatures;
  aiAnalysis?: AIAnalysis;
  partner?: Partner;
  videoUrl?: string;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number; // sqm
  parking: number;
  pool: boolean;
  security: boolean;
  garden: boolean;
  seaView: boolean;
  yearBuilt?: number;
}

export interface AIAnalysis {
  estimatedRoi: number;
  rentalIncome: number; // monthly
  amortizationYears: number;
  growthScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  marketTrend: 'up' | 'stable' | 'down';
  confidenceScore: number; // 0-100
}

export interface Partner {
  id: string;
  name: string;
  country: string;
  listings: number;
  rating: number;
  logo: string;
  verified?: boolean;
  description?: string;
  contactEmail?: string;
  phone?: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
  icon: import('./icons').IconName;
  count: number;
}

export interface AIInsight {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  category: string;
}

// ============================================
// COUNTRIES
// TODO: Add/remove countries based on business requirements
// ============================================

export const countries: Country[] = [
  { id: 'all', name: 'All', flag: '🌍', code: 'ALL' },
  { id: 'tr', name: 'Turkey', flag: '🇹🇷', code: 'TR' },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { id: 'ae', name: 'UAE', flag: '🇦🇪', code: 'AE' },
  { id: 'us', name: 'USA', flag: '🇺🇸', code: 'US' },
  // TODO: Add more countries
  // { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', code: 'UK' },
  // { id: 'de', name: 'Germany', flag: '🇩🇪', code: 'DE' },
];

// ============================================
// CATEGORIES
// TODO: Update counts from API
// ============================================

export const categories: Category[] = [
  { id: 'villas', name: 'Villas', icon: 'villa', count: 124 },
  { id: 'apartments', name: 'Apartments', icon: 'apartment', count: 287 },
  { id: 'lands', name: 'Lands', icon: 'land', count: 89 },
  { id: 'commercial', name: 'Commercial', icon: 'commercial', count: 56 },
];

// ============================================
// VERIFIED PARTNERS
// TODO: Replace with partner data from API
// ============================================

export const verifiedPartners: Partner[] = [
  {
    id: '1',
    name: 'Aegean Premier',
    country: 'Turkey',
    listings: 42,
    rating: 4.9,
    logo: Images.partners.partner1,
    verified: true,
    description: 'Leading luxury real estate developer on the Aegean coast with over 15 years of experience.',
    contactEmail: 'contact@aegeanpremier.com',
    phone: '+90 232 123 4567',
  },
  {
    id: '2',
    name: 'Najd Capital',
    country: 'Saudi Arabia',
    listings: 27,
    rating: 4.8,
    logo: Images.partners.partner2,
    verified: true,
    description: 'Premium investment firm specializing in Saudi Arabian real estate development projects.',
    contactEmail: 'invest@najdcapital.sa',
    phone: '+966 11 234 5678',
  },
  {
    id: '3',
    name: 'Madinah Elite Properties',
    country: 'Saudi Arabia',
    listings: 31,
    rating: 4.9,
    logo: Images.partners.partner3,
    verified: true,
    description: 'Exclusive real estate partner for premium properties near the Holy City.',
    contactEmail: 'info@madinahelite.sa',
    phone: '+966 14 345 6789',
  },
];

// ============================================
// FEATURED PROPERTIES (DETAILED)
// TODO: Replace mock property data with production API
// ============================================

export const featuredProperties: Property[] = [
  {
    id: '1',
    title: 'Bosphorus Crest Villa',
    location: 'Istanbul, Turkey',
    city: 'Istanbul',
    country: 'Turkey',
    countryCode: 'tr',
    price: 4250000,
    roi: 8.4,
    rentalYield: 6.2,
    image: Images.properties.villa1,
    images: [
      Images.properties.villa1,
      Images.properties.residence1,
      Images.properties.penthouse1,
      Images.properties.residence2,
    ],
    verified: true,
    favorite: false,
    type: 'villa',
    status: 'available',
    description: `Experience unparalleled luxury at Bosphorus Crest Villa, a masterpiece of contemporary architecture situated on the prestigious shores of the Bosphorus Strait. This exceptional residence offers breathtaking panoramic views of both European and Asian continents.

The villa features premium Italian marble flooring, floor-to-ceiling windows, and a state-of-the-art smart home system. The expansive living areas seamlessly connect to a stunning infinity pool overlooking the strait.

Perfect for discerning investors seeking a trophy asset in one of the world's most desirable locations, this property combines historical significance with modern luxury living.`,
    features: {
      bedrooms: 6,
      bathrooms: 8,
      area: 850,
      parking: 4,
      pool: true,
      security: true,
      garden: true,
      seaView: true,
      yearBuilt: 2022,
    },
    aiAnalysis: {
      estimatedRoi: 8.4,
      rentalIncome: 28500,
      amortizationYears: 12,
      growthScore: 87,
      riskLevel: 'low',
      marketTrend: 'up',
      confidenceScore: 92,
    },
    partner: verifiedPartners[0],
    videoUrl: 'https://youtube.com/watch?v=example',
  },
  {
    id: '2',
    title: 'Madinah Premium Residences',
    location: 'Madinah, Saudi Arabia',
    city: 'Madinah',
    country: 'Saudi Arabia',
    countryCode: 'sa',
    price: 680000,
    roi: 7.8,
    rentalYield: 8.5,
    image: Images.properties.residence1,
    images: [
      Images.properties.residence1,
      Images.properties.villa1,
      Images.properties.commercial1,
    ],
    verified: true,
    favorite: true,
    type: 'apartment',
    status: 'available',
    description: `Madinah Premium Residences offers an exceptional investment opportunity just minutes from the Prophet's Mosque. This modern development combines spiritual proximity with premium living standards.

Each residence features contemporary Islamic architecture, high-end finishes, and thoughtfully designed spaces that cater to both residents and pilgrims. The development includes 24/7 concierge services, underground parking, and direct shuttle services to the Haram.

An ideal investment for those seeking stable returns backed by consistent demand from religious tourism.`,
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 185,
      parking: 1,
      pool: false,
      security: true,
      garden: false,
      seaView: false,
      yearBuilt: 2023,
    },
    aiAnalysis: {
      estimatedRoi: 7.8,
      rentalIncome: 4800,
      amortizationYears: 10,
      growthScore: 82,
      riskLevel: 'low',
      marketTrend: 'up',
      confidenceScore: 88,
    },
    partner: verifiedPartners[2],
  },
  {
    id: '3',
    title: 'Riyadh Skyline Residences',
    location: 'Riyadh, Saudi Arabia',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'sa',
    price: 1950000,
    roi: 7.6,
    rentalYield: 5.8,
    image: Images.properties.residence2,
    images: [
      Images.properties.residence2,
      Images.properties.commercial1,
      Images.properties.penthouse1,
    ],
    verified: true,
    favorite: false,
    type: 'apartment',
    status: 'available',
    description: `Located in the heart of Riyadh's financial district, Skyline Residences represents the pinnacle of urban luxury living in the Kingdom. This landmark development is part of Saudi Arabia's Vision 2030 transformation.

The penthouse units offer unobstructed views of the city skyline, private elevator access, and exclusive rooftop amenities. Residents enjoy world-class facilities including a championship golf simulator, spa, and fine dining restaurants.

A strategic investment positioned at the center of the Kingdom's economic growth story.`,
    features: {
      bedrooms: 4,
      bathrooms: 5,
      area: 320,
      parking: 3,
      pool: true,
      security: true,
      garden: false,
      seaView: false,
      yearBuilt: 2024,
    },
    aiAnalysis: {
      estimatedRoi: 7.6,
      rentalIncome: 9500,
      amortizationYears: 14,
      growthScore: 91,
      riskLevel: 'low',
      marketTrend: 'up',
      confidenceScore: 85,
    },
    partner: verifiedPartners[1],
  },
  {
    id: '4',
    title: 'Palm Jumeirah Penthouse',
    location: 'Dubai, UAE',
    city: 'Dubai',
    country: 'UAE',
    countryCode: 'ae',
    price: 6800000,
    roi: 9.1,
    rentalYield: 7.2,
    image: Images.properties.penthouse1,
    images: [
      Images.properties.penthouse1,
      Images.properties.villa1,
      Images.properties.residence2,
      Images.properties.commercial1,
    ],
    verified: true,
    favorite: false,
    type: 'villa',
    status: 'available',
    description: `This signature penthouse on the iconic Palm Jumeirah represents the ultimate expression of Dubai luxury. Spanning the entire top floor with 360-degree views of the Arabian Gulf and Dubai skyline.

Features include a private helipad, infinity pool, cinema room, and dedicated staff quarters. The residence comes fully furnished by a world-renowned interior designer with custom pieces throughout.

A rare opportunity to own one of Dubai's most prestigious addresses with exceptional rental potential from ultra-high-net-worth tenants.`,
    features: {
      bedrooms: 7,
      bathrooms: 9,
      area: 1200,
      parking: 6,
      pool: true,
      security: true,
      garden: true,
      seaView: true,
      yearBuilt: 2021,
    },
    aiAnalysis: {
      estimatedRoi: 9.1,
      rentalIncome: 52000,
      amortizationYears: 11,
      growthScore: 94,
      riskLevel: 'low',
      marketTrend: 'up',
      confidenceScore: 90,
    },
    partner: verifiedPartners[0],
    videoUrl: 'https://youtube.com/watch?v=example2',
  },
];

// ============================================
// HIGH YIELD PROPERTIES
// TODO: Replace with dynamic high-ROI listings from API
// ============================================

export const highYieldProperties: Property[] = [
  {
    id: '5',
    title: 'NEOM Investment Land',
    location: 'Tabuk, Saudi Arabia',
    city: 'Tabuk',
    country: 'Saudi Arabia',
    countryCode: 'sa',
    price: 2200000,
    roi: 14.6,
    rentalYield: 0,
    image: Images.properties.land1,
    verified: true,
    type: 'land',
    status: 'available',
    description: 'Strategic land parcel in the NEOM development zone with exceptional appreciation potential.',
    features: {
      bedrooms: 0,
      bathrooms: 0,
      area: 5000,
      parking: 0,
      pool: false,
      security: false,
      garden: false,
      seaView: true,
    },
    aiAnalysis: {
      estimatedRoi: 14.6,
      rentalIncome: 0,
      amortizationYears: 7,
      growthScore: 96,
      riskLevel: 'medium',
      marketTrend: 'up',
      confidenceScore: 78,
    },
    partner: verifiedPartners[1],
  },
  {
    id: '6',
    title: 'Aegean Coastal Land',
    location: 'Bodrum, Turkey',
    city: 'Bodrum',
    country: 'Turkey',
    countryCode: 'tr',
    price: 880000,
    roi: 11.2,
    image: Images.properties.land2,
    verified: true,
    type: 'land',
    status: 'available',
    partner: verifiedPartners[0],
  },
  {
    id: '7',
    title: 'Downtown Dubai Tower Office',
    location: 'Dubai, UAE',
    city: 'Dubai',
    country: 'UAE',
    countryCode: 'ae',
    price: 3400000,
    roi: 9.8,
    image: Images.properties.commercial1,
    verified: true,
    type: 'commercial',
    status: 'available',
    partner: verifiedPartners[0],
  },
];

// ============================================
// AI INSIGHTS (DASHBOARD)
// TODO: Replace with real AI analysis data from API
// ============================================

export const aiInsights: AIInsight[] = [
  { id: '1', label: 'Estimated ROI', value: '8.4%', trend: 'up', color: '#10B981' },
  { id: '2', label: 'Rental Yield', value: '6.2%', trend: 'up', color: '#3B82F6' },
  { id: '3', label: 'Growth Score', value: '87', trend: 'up', color: '#8B5CF6' },
  { id: '4', label: 'Risk Level', value: 'Low', trend: 'stable', color: '#D4B483' },
];

// ============================================
// NEWS ITEMS
// TODO: Replace with news API integration
// ============================================

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Saudi Arabia Real Estate Market Sees 15% Growth',
    summary: 'NEOM and Red Sea projects driving unprecedented investment opportunities.',
    image: Images.properties.land1,
    date: '2024-01-15',
    category: 'Market Update',
  },
  {
    id: '2',
    title: 'Turkey Citizenship Investment Threshold Updated',
    summary: 'New regulations for foreign investors in Turkish real estate market.',
    image: Images.properties.villa1,
    date: '2024-01-14',
    category: 'Regulation',
  },
  {
    id: '3',
    title: 'Dubai Property Prices Hit Record High',
    summary: 'Palm Jumeirah and Downtown areas lead the surge in luxury segment.',
    image: Images.properties.penthouse1,
    date: '2024-01-13',
    category: 'Market Update',
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format price to display string
 * @param price - Price in USD
 * @returns Formatted price string (e.g., "$4.3M", "$680K")
 */
export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  return `$${price}`;
};

/**
 * Format price with full number
 * @param price - Price in USD
 * @returns Formatted price string (e.g., "$4,250,000")
 */
export const formatPriceFull = (price: number): string => {
  return `$${price.toLocaleString()}`;
};

/**
 * Format ROI percentage
 * @param roi - ROI percentage
 * @returns Formatted ROI string
 */
export const formatROI = (roi: number): string => {
  return `${roi.toFixed(1)}%`;
};

/**
 * Format area with unit
 * @param area - Area in sqm
 * @returns Formatted area string
 */
export const formatArea = (area: number): string => {
  return `${area.toLocaleString()} m²`;
};

/**
 * Format monthly income
 * @param income - Monthly income in USD
 * @returns Formatted income string
 */
export const formatMonthlyIncome = (income: number): string => {
  return `$${income.toLocaleString()}/mo`;
};

/**
 * Get properties filtered by country
 * @param countryId - Country ID to filter
 * @param properties - Properties array
 * @returns Filtered properties
 */
export const filterByCountry = (countryId: string, properties: Property[]): Property[] => {
  if (countryId === 'all') return properties;
  return properties.filter((p) => p.countryCode === countryId);
};

/**
 * Get property by ID
 * @param id - Property ID
 * @returns Property or undefined
 */
export const getPropertyById = (id: string): Property | undefined => {
  return [...featuredProperties, ...highYieldProperties].find((p) => p.id === id);
};

/**
 * Get similar properties
 * @param property - Current property
 * @param limit - Maximum number of results
 * @returns Similar properties array
 */
export const getSimilarProperties = (property: Property, limit: number = 3): Property[] => {
  return featuredProperties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.countryCode === property.countryCode))
    .slice(0, limit);
};

/**
 * Get risk level color
 * @param level - Risk level
 * @returns Color string
 */
export const getRiskLevelColor = (level: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
  };
  return colors[level];
};

/**
 * Get property type label
 * @param type - Property type
 * @returns Translated label
 */
export const getPropertyTypeLabel = (type: Property['type']): string => {
  const labels = {
    villa: 'Villa',
    apartment: 'Apartment',
    land: 'Land',
    commercial: 'Commercial',
  };
  return labels[type];
};
