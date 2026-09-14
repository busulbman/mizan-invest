/**
 * ============================================
 * TRANSLATIONS
 * ============================================
 *
 * Multi-language support for Mizan Invest.
 * Supported languages: RU (default), TR, EN, AR
 *
 * HOW TO ADD NEW TEXT:
 * 1. Add the English version first (`en` object below)
 * 2. TypeScript will immediately flag TR / RU / AR as incomplete
 * 3. Use in components: const { t } = useLanguage(); t('keyName')
 *
 * KEY PARITY IS ENFORCED BY TYPESCRIPT:
 * `en` is the source of truth. Every other language is typed as
 * `TranslationDictionary`, so a missing or misspelled key is a build error.
 *
 * TODO: Consider using i18n library for production
 * TODO: Full RTL layout support for Arabic (separate phase)
 */

export type Language = "en" | "tr" | "ru" | "ar";

/**
 * Default language for the app.
 * The app must open in Russian on first launch.
 */
export const DEFAULT_LANGUAGE: Language = "ru";

/**
 * Order used by the language switcher UI.
 */
export const LANGUAGE_ORDER: Language[] = ["ru", "ar", "en", "tr"];

/**
 * Language display names (always shown in their own language)
 */
export const languageNames: Record<Language, string> = {
  en: "English",
  tr: "Türkçe",
  ru: "Русский",
  ar: "العربية",
};

/**
 * Short codes used by the compact language switcher
 */
export const languageCodes: Record<Language, string> = {
  en: "EN",
  tr: "TR",
  ru: "RU",
  ar: "AR",
};

/**
 * Languages that render right-to-left.
 * Full RTL layout support is planned for a later phase; this flag is
 * already exposed so screens can start opting in gradually.
 */
export const RTL_LANGUAGES: Language[] = ["ar"];

// ============================================
// ENGLISH — SOURCE OF TRUTH
// ============================================

const en = {
  // ----------------------------------------
  // APP BRANDING
  // ----------------------------------------
  appName: "Mizan Invest",
  appSlogan: "Global Real Estate Investments",

  // ----------------------------------------
  // ONBOARDING
  // ----------------------------------------
  onboarding1Badge: "Verified Investments",
  onboarding1Title: "Invest Beyond Borders",
  onboarding1Subtitle:
    "Discover premium real estate opportunities across trusted global markets.",
  onboarding2Badge: "AI Analysis",
  onboarding2Title: "See The Numbers Before You Invest",
  onboarding2Subtitle:
    "Estimated ROI, rental income, growth potential and investment insights.",
  onboarding3Badge: "Trusted Partners",
  onboarding3Title: "Every Opportunity Is Verified",
  onboarding3Subtitle:
    "Only approved partners, developers and real estate professionals.",

  // ----------------------------------------
  // NAVIGATION
  // ----------------------------------------
  skip: "Skip",
  next: "Next",
  back: "Back",
  getStarted: "Get Started",
  seeAll: "See all",
  viewAll: "View all",
  explore: "Explore",
  close: "Close",
  cancel: "Cancel",

  // ----------------------------------------
  // WELCOME SCREEN
  // ----------------------------------------
  welcomeTitle: "Where Vision Meets Value",
  welcomeSubtitle:
    "Join thousands of investors accessing premium global real estate opportunities.",
  continueAsGuest: "Explore as Guest",
  investorLogin: "Investor Login",
  partnerLogin: "Partner Portal",
  partnerNote: "Partner accounts require verification",

  // ----------------------------------------
  // AUTHENTICATION
  // ----------------------------------------
  email: "Email",
  password: "Password",
  login: "Sign In",
  logout: "Log Out",
  orContinueWith: "or continue with",
  continueWithGoogle: "Continue with Google",
  continueWithApple: "Continue with Apple",
  forgotPassword: "Forgot password?",
  welcomeBack: "Welcome Back",
  signInSubtitle: "Sign in to access your investment portfolio",
  createAccount: "Create Account",
  alreadyHaveAccount: "Already have an account?",

  // ----------------------------------------
  // PARTNER AUTHENTICATION
  // ----------------------------------------
  partnerPortalBadge: "PARTNER PORTAL",
  partnerEmail: "Partner Email",
  partnerLoginButton: "Access Portal",
  requestPartnerAccess: "Become a Partner",
  notPartnerYet: "Not a partner yet?",
  partnerWelcome: "Partner Portal",
  partnerSubtitle: "Access your dashboard and manage listings",

  // ----------------------------------------
  // PARTNER DASHBOARD
  // ----------------------------------------
  partnerDashboard: "Partner Dashboard",
  partnerDashboardSubtitle: "Manage your listings and analytics",
  verifiedPartnerDemo: "Verified Partner Access",
  activeListings: "Active Listings",
  totalViews: "Views",
  inquiries: "Inquiries",
  totalValue: "Total Value",
  addNewListing: "Add New Listing",
  backToWelcome: "Back to Welcome",

  // ----------------------------------------
  // HOME SCREEN
  // ----------------------------------------
  homeTitle: "Mizan Invest",
  homeSubtitle: "Global Real Estate",
  heroTitle: "Discover Global Real Estate Opportunities",
  heroSubtitle:
    "Verified properties, trusted partners and AI-powered investment insights.",
  exploreInvestments: "Explore Investments",
  investorEdition: "Investor Edition",

  // ----------------------------------------
  // SECTIONS
  // ----------------------------------------
  categories: "Categories",
  featuredProperties: "Featured Properties",
  handpickedInvestments: "Handpicked investments",
  highYieldOpportunities: "High Yield Opportunities",
  bestRoiPotential: "Best ROI potential",
  aiInsights: "AI Investment Insights",
  marketAnalysis: "Market analysis preview",
  verifiedPartners: "Verified Partners",
  trustedProfessionals: "Trusted real estate professionals",
  allPartners: "All partners",

  // ----------------------------------------
  // PROPERTY DETAILS
  // ----------------------------------------
  verified: "Verified",
  verifiedProperty: "Verified Property",
  roi: "ROI",
  price: "Price",
  location: "Location",
  propertyType: "Property Type",
  favorite: "Favorite",
  contactPartner: "Contact Partner",
  scheduleViewing: "Schedule Viewing",
  saveProperty: "Save Property",
  saved: "Saved",
  share: "Share",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",

  // Property Features
  propertyFeatures: "Property Features",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  area: "Area",
  parking: "Parking",
  pool: "Pool",
  security: "24/7 Security",
  garden: "Garden",
  seaView: "Sea View",
  yearBuilt: "Year Built",

  // AI Analysis Section
  aiInvestmentInsights: "AI Investment Insights",
  aiDisclaimer: "AI-generated estimates for demonstration purposes.",
  estimatedRoi: "Estimated ROI",
  rentalIncome: "Rental Income",
  monthlyIncome: "Monthly Income",
  amortization: "Amortization",
  amortizationPeriod: "Amortization Period",
  years: "years",
  growthScore: "Growth Score",
  riskLevel: "Risk Level",
  marketTrend: "Market Trend",
  confidenceScore: "Confidence",
  low: "Low",
  medium: "Medium",
  high: "High",
  stable: "Stable",
  trending: "Trending",

  // Property Description
  aboutProperty: "About This Property",
  readMore: "Read More",
  readLess: "Read Less",

  // Location Section
  locationMap: "Location",
  viewOnMap: "View on Map",
  city: "City",
  country: "Country",

  // Partner Section
  listedBy: "Listed By",
  verifiedPartner: "Verified Partner",
  viewPartnerProfile: "View Profile",
  listings: "listings",

  // Video Section
  propertyVideoTour: "Property Video Tour",
  watchVideo: "Watch Video",
  virtualTour: "Virtual Tour Available",

  // Similar Properties
  similarProperties: "Similar Properties",
  youMayAlsoLike: "You may also like",

  // CTA
  interestedInProperty: "Interested in this property?",
  getInTouch: "Get in touch with our verified partner.",
  rentalYield: "Rental Yield",

  // ----------------------------------------
  // CATEGORIES (keys match mockData category ids)
  // ----------------------------------------
  villas: "Villas",
  apartments: "Apartments",
  lands: "Lands",
  commercial: "Commercial",

  // Singular labels used on the property type badge
  typeVilla: "Villa",
  typeApartment: "Apartment",
  typeLand: "Land",
  typeCommercial: "Commercial",

  // ----------------------------------------
  // COUNTRIES (keys match mockData country ids)
  // ----------------------------------------
  countryAll: "All",
  countryTr: "Turkey",
  countrySa: "Saudi Arabia",
  countryAe: "UAE",
  countryUs: "USA",

  // ----------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------
  home: "Home",
  exploreTab: "Explore",
  favorites: "Favorites",
  profile: "Profile",
  reels: "Reels",
  news: "News",

  // ----------------------------------------
  // EXPLORE SCREEN
  // ----------------------------------------
  exploreTitle: "Explore",
  exploreSubtitle: "Find your next investment",
  searchPlaceholder: "Search city, country or property",
  propertiesFound: "properties found",
  propertyFound: "property found",
  clearSearch: "Clear search",
  noResultsSubtitle: "Try a different country or search term.",

  // ----------------------------------------
  // FAVORITES SCREEN
  // ----------------------------------------
  favoritesTitle: "Favorites",
  favoritesSubtitle: "Properties you saved",
  savedProperties: "Saved Properties",
  favoritesEmptyTitle: "No saved properties yet",
  favoritesEmptySubtitle:
    "Tap the heart icon on any property to keep it here for quick access.",
  browseProperties: "Browse Properties",

  // ----------------------------------------
  // PROFILE SCREEN
  // ----------------------------------------
  profileTitle: "Profile",
  guestUser: "Guest",
  guestUserSubtitle: "Browsing without an account",
  signInPrompt: "Sign in to save properties and track your portfolio",
  preferences: "Preferences",
  language: "Language",
  selectLanguage: "Select Language",
  aboutSection: "About",
  aboutApp: "About Mizan Invest",
  appVersion: "Version",
  termsOfService: "Terms of Service",
  privacyPolicy: "Privacy Policy",
  helpCenter: "Help Center",
  contactUs: "Contact Us",
  forPartners: "For Partners",
  partnerPortalAccess: "Partner Portal",
  partnerPortalDescription: "Manage listings and view analytics",

  // ----------------------------------------
  // USER STATES
  // ----------------------------------------
  guestModeActive: "Exploring as Guest",
  exploreListings: "Explore Listings",

  // ----------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------
  notifications: "Notifications",
  noNotifications: "No new notifications",

  // ----------------------------------------
  // DEMO PLACEHOLDERS
  // ----------------------------------------
  comingSoon: "Coming Soon",
  featureComingSoon: "This feature will be available in the full version.",
  contactPartnerMessage:
    "Our team will connect you with the verified partner shortly.",

  // ----------------------------------------
  // ERRORS & MESSAGES
  // ----------------------------------------
  error: "Error",
  success: "Success",
  loading: "Loading...",
  tryAgain: "Try Again",
  noResults: "No results found",
  networkError: "Network error. Please check your connection.",

  // ----------------------------------------
  // CITIES
  // ----------------------------------------
  cityMadinah: "Madinah",
  cityRiyadh: "Riyadh",
  cityJeddah: "Jeddah",
  cityIstanbul: "Istanbul",
  cityAntalya: "Antalya",
  cityDubai: "Dubai",

  // ----------------------------------------
  // HOME RAILS
  // ----------------------------------------
  featuredProjects: "Featured projects",
  featuredProjectsSubtitle: "Hand-picked by our analysts",
  madinahProjects: "Madinah projects",
  madinahProjectsSubtitle: "Close to the Holy Mosque",
  newListings: "New listings",
  newListingsSubtitle: "Added this month",
  highPotential: "High investment potential",
  highPotentialSubtitle: "Best projected returns",
  verifiedPartnersSubtitle: "Licensed developers and agencies",
  recentlyViewed: "Recently viewed",
  recentlyViewedSubtitle: "Pick up where you left off",
  popularCities: "Popular cities",
  popularCitiesSubtitle: "Where investors are buying",
  objectsShort: "listings",

  // ----------------------------------------
  // LISTING TITLES
  // ----------------------------------------
  prop1Title: "Al Haram Gate Residences",
  prop2Title: "Madinah Gardens Villa",
  prop3Title: "Quba Road Commercial Plaza",
  prop4Title: "North Madinah Investment Land",
  prop5Title: "Anwar Al Madinah Suites",
  prop6Title: "Riyadh Skyline Residences",
  prop7Title: "Diriyah Gate Villa",
  prop8Title: "KAFD Financial Tower Offices",
  prop9Title: "North Riyadh Development Land",
  prop10Title: "Jeddah Corniche Apartments",
  prop11Title: "Red Sea Marina Villa",
  prop12Title: "Jeddah Business Park Units",
  prop13Title: "Bosphorus Crest Villa",
  prop14Title: "Levent Panorama Residences",
  prop15Title: "Istanbul Airport Logistics Plot",
  prop16Title: "Galata Boutique Retail",
  prop17Title: "Antalya Sea View Residences",
  prop18Title: "Kaleici Heritage Villa",
  prop19Title: "Antalya Coastal Land",
  prop20Title: "Lara Beach Hotel Suites",
  prop21Title: "Palm Jumeirah Penthouse",
  prop22Title: "Downtown Dubai Tower Offices",
  prop23Title: "Dubai Marina Residences",
  prop24Title: "Dubai South Investment Land",

  // ----------------------------------------
  // LISTING DESCRIPTIONS
  // ----------------------------------------
  descHolyCity:
    "A residence within walking distance of the Holy Mosque, built to the standards pilgrims and long-term residents expect. Contemporary Islamic architecture, high-end finishes, 24/7 concierge and underground parking.\n\nDemand here is driven by year-round religious tourism, which historically keeps occupancy high and rental income stable through every season.",
  descLuxuryVilla:
    "A private villa designed around light, space and family life. Floor-to-ceiling glazing, natural stone floors, a landscaped garden and a heated pool sit behind a gated, staffed perimeter.\n\nProperties of this calibre are limited in supply, which supports both resale value and premium long-term rental rates.",
  descCityApartment:
    "A modern apartment in the heart of the city, minutes from the business district, transport links and international schools. Smart-home wiring, concierge service and a residents-only gym and lounge.\n\nA straightforward entry point for investors who want liquidity and a tenant pool that renews itself continuously.",
  descInvestmentLand:
    "A titled land parcel inside an active development corridor, with utilities at the boundary and zoning already in place for residential or mixed use.\n\nLand carries no rental income, so the return comes from appreciation as surrounding infrastructure completes. Typically the highest-growth, highest-patience position in a portfolio.",
  descCommercial:
    "An income-producing commercial asset with established tenants on multi-year leases. Ground-floor retail, upper-floor offices, dedicated parking and full building management.\n\nCommercial leases are longer and indexed, which makes the cash flow more predictable than residential over a full cycle.",
  descSeafront:
    "A waterfront residence with uninterrupted sea views, direct beach access and resort-grade amenities including pools, spa and private moorings.\n\nCoastal supply is physically capped, and short-let demand peaks through the tourist season — a combination that supports both yield and long-term value.",

  // ----------------------------------------
  // WHY INVEST
  // ----------------------------------------
  whyInvest: "Why invest here",
  whyInvestSubtitle: "What our analysts flagged on this listing",
  whyVilla1: "Limited supply of comparable villas in the district",
  whyVilla2: "Premium tenants sign longer leases at higher rates",
  whyVilla3: "Land component protects value through market cycles",
  whyApartment1: "Continuous tenant demand from professionals and families",
  whyApartment2: "Easiest asset class to resell when you need liquidity",
  whyApartment3: "Management and maintenance costs stay predictable",
  whyLand1: "Highest appreciation potential in the portfolio",
  whyLand2: "No tenants, no maintenance, no operating costs",
  whyLand3: "Infrastructure already under construction nearby",
  whyCommercial1: "Multi-year leases with indexed rent increases",
  whyCommercial2: "Yield above the residential average in this market",
  whyCommercial3: "Tenants cover most operating and fit-out costs",

  // ----------------------------------------
  // INVESTMENT SCORE
  // ----------------------------------------
  investmentScore: "Investment score",
  investmentScoreHint:
    "Composite of yield, growth, risk and partner track record",

  // ----------------------------------------
  // CURRENCY
  // ----------------------------------------
  currency: "Currency",
  selectCurrency: "Select currency",
  demoExchangeRate: "Demo exchange rate",
  demoRateNote: "Rates are fixed demo values and are not live market rates.",

  // ----------------------------------------
  // APPEARANCE
  // ----------------------------------------
  settings: "Settings",
  appearance: "Appearance",
  selectAppearance: "Select appearance",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",

  // ----------------------------------------
  // REELS
  // ----------------------------------------
  viewListing: "View listing",
  soundOn: "Sound on",
  soundOff: "Sound off",
  reel1Title: "Madinah villa tour",
  reel1Caption:
    "Five bedrooms, private garden, ten minutes from the Holy Mosque.",
  reel2Title: "New Riyadh development",
  reel2Caption: "Vision 2030 district — first residential tower now released.",
  reel3Title: "Bosphorus view apartment",
  reel3Caption: "Waterfront living on the European side of Istanbul.",
  reel4Title: "Dubai investment project",
  reel4Caption: "Palm Jumeirah penthouse with 360° views of the Gulf.",
  reel5Title: "Land investment explained",
  reel5Caption:
    "How a development plot compounds while infrastructure is built.",
  reel6Title: "Commercial plaza walkthrough",
  reel6Caption: "Fully leased retail and office space on Quba Road.",

  // ----------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------
  markAllRead: "Mark all as read",
  allNotificationsRead: "You are all caught up",
  unreadLabel: "New",
  notifNewProjectTitle: "New project added",
  notifNewProjectBody: "Anwar Al Madinah Suites is now open for reservations.",
  notifPriceUpdateTitle: "Price updated",
  notifPriceUpdateBody:
    "A listing in your favourites has a revised asking price.",
  notifPartnerReplyTitle: "Partner replied",
  notifPartnerReplyBody:
    "Aegean Premier answered your enquiry about the Bosphorus villa.",
  notifMadinahTitle: "New Madinah investment",
  notifMadinahBody:
    "Quba Road Commercial Plaza published with a 10.4% projected ROI.",
  notifVideoAddedTitle: "New video added",
  notifVideoAddedBody: "A saved listing now has a full project tour.",
  notifMarketReportTitle: "Monthly market report",
  notifMarketReportBody:
    "Gulf and Turkey real estate outlook for this quarter.",
  timeNow: "now",
  timeMinutes: "min",
  timeHours: "h",
  timeDays: "d",

  // ----------------------------------------
  // GALLERY & VIDEO
  // ----------------------------------------
  photos: "Photos",
  zoomHint: "Pinch or double-tap to zoom",
  videoTourSubtitle: "Walk through the project before you travel",
  playVideo: "Play",
  pauseVideo: "Pause",

  // ----------------------------------------
  // FILTERS
  // ----------------------------------------
  filters: "Filters",
  applyFilters: "Show results",
  resetFilters: "Reset",
  priceRange: "Price range",
  propertyTypeFilter: "Property type",
  cityFilter: "City",
  countryFilter: "Country",
  verifiedOnly: "Verified partners only",
  minInvestmentScore: "Minimum investment score",
  anyValue: "Any",
  activeFilters: "active",
  upTo: "up to",

  // ----------------------------------------
  // CONTACT CTA
  // ----------------------------------------
  whatsappContact: "WhatsApp",
  callPartner: "Call",
  imInterested: "I'm interested",
  requestSent: "Request sent",
  requestSentBody: "The partner will contact you within one business day.",
  demoAction: "Demo mode",
  demoActionBody: "This action is simulated for the partner demo.",
  contactDetails: "Contact details",
  contactDetailsHint: "Leave a phone number or email so our Mizan Invest team can reply.",
  name: "Name",
  phone: "Phone",
  message: "Message",
  optional: "Optional",
  submitRequest: "Send request",
  phoneOrEmailRequired: "Enter a phone number or email address.",
  invalidPhoneNumber: "Enter a valid international phone number, for example +966501234567.",
  invalidEmailAddress: "Enter a valid email address.",
  requestReceived: "Request received",
  requestReceivedBody: "Our Mizan Invest team will contact you soon.",
  leadReference: "Reference",
  requestPreparationFailed: "Could not prepare your request. Please try again.",
  companyWhatsAppUnavailable: "Company WhatsApp is not configured yet.",
  companyPhoneUnavailable: "Company phone is not configured yet.",
  unableToOpenWhatsApp: "Your request was recorded, but WhatsApp could not be opened.",
  unableToOpenPhone: "Your request was recorded, but the phone app could not be opened.",

  // ----------------------------------------
  // MISC
  // ----------------------------------------
  perMonth: "/mo",
  listedAgo: "Listed",
  daysAgo: "days ago",
  addedToFavorites: "Added to favourites",
  removedFromFavorites: "Removed from favourites",
  propertyNotFound: "This listing is no longer available",
  backToHome: "Back to home",
  investmentBasics: "Key figures",

  // ----------------------------------------
  // PARTNER PROFILES
  // ----------------------------------------
  partner1Description:
    "Exclusive partner for premium residential and commercial projects around the Holy City, operating in Madinah since 2009.",
  partner2Description:
    "Investment firm focused on Vision 2030 development zones across Riyadh and the central region.",
  partner3Description:
    "Coastal specialist covering Jeddah and the Red Sea corridor, from marina villas to leased business parks.",
  partner4Description:
    "Luxury developer on the Turkish coast and in Istanbul, with more than fifteen years of delivery history.",
  partner5Description:
    "Dubai-based agency handling prime residential and office assets for international investors.",
} as const;

/**
 * Every translation key available to `t()`
 */
export type TranslationKey = keyof typeof en;

/**
 * Shape every language must satisfy.
 * A missing key or a typo becomes a TypeScript error.
 */
export type TranslationDictionary = Record<TranslationKey, string>;

// ============================================
// TURKISH
// ============================================

const tr: TranslationDictionary = {
  appName: "Mizan Invest",
  appSlogan: "Global Gayrimenkul Yatırımları",

  onboarding1Badge: "Doğrulanmış Yatırımlar",
  onboarding1Title: "Sınırların Ötesine Yatırım Yapın",
  onboarding1Subtitle:
    "Güvenilir global pazarlarda premium gayrimenkul fırsatlarını keşfedin.",
  onboarding2Badge: "Yapay Zeka Analizi",
  onboarding2Title: "Yatırım Yapmadan Önce Rakamları Görün",
  onboarding2Subtitle:
    "Tahmini ROI, kira geliri, büyüme potansiyeli ve yatırım içgörüleri.",
  onboarding3Badge: "Güvenilir Ortaklar",
  onboarding3Title: "Her Fırsat Doğrulanmış",
  onboarding3Subtitle:
    "Sadece onaylı ortaklar, geliştiriciler ve gayrimenkul profesyonelleri.",

  skip: "Atla",
  next: "İleri",
  back: "Geri",
  getStarted: "Başla",
  seeAll: "Tümünü gör",
  viewAll: "Tümünü gör",
  explore: "Keşfet",
  close: "Kapat",
  cancel: "Vazgeç",

  welcomeTitle: "Vizyon ve Değerin Buluştuğu Yer",
  welcomeSubtitle:
    "Premium global gayrimenkul fırsatlarına erişen binlerce yatırımcıya katılın.",
  continueAsGuest: "Misafir Olarak Keşfet",
  investorLogin: "Yatırımcı Girişi",
  partnerLogin: "Partner Portalı",
  partnerNote: "Partner hesapları doğrulama gerektirir",

  email: "E-posta",
  password: "Şifre",
  login: "Giriş Yap",
  logout: "Çıkış Yap",
  orContinueWith: "veya şununla devam edin",
  continueWithGoogle: "Google ile Devam Et",
  continueWithApple: "Apple ile Devam Et",
  forgotPassword: "Şifremi unuttum",
  welcomeBack: "Tekrar Hoş Geldiniz",
  signInSubtitle: "Yatırım portföyünüze erişmek için giriş yapın",
  createAccount: "Hesap Oluştur",
  alreadyHaveAccount: "Zaten hesabınız var mı?",

  partnerPortalBadge: "PARTNER PORTALI",
  partnerEmail: "Partner E-posta",
  partnerLoginButton: "Portala Eriş",
  requestPartnerAccess: "Partner Ol",
  notPartnerYet: "Henüz partner değil misiniz?",
  partnerWelcome: "Partner Portalı",
  partnerSubtitle: "Panelinize erişin ve ilanlarınızı yönetin",

  partnerDashboard: "Partner Paneli",
  partnerDashboardSubtitle: "İlanlarınızı ve performansınızı yönetin",
  verifiedPartnerDemo: "Doğrulanmış Partner Erişimi",
  activeListings: "Aktif İlan",
  totalViews: "Görüntülenme",
  inquiries: "Talep",
  totalValue: "Toplam Değer",
  addNewListing: "Yeni İlan Ekle",
  backToWelcome: "Karşılamaya Dön",

  homeTitle: "Mizan Invest",
  homeSubtitle: "Global Gayrimenkul",
  heroTitle: "Global Gayrimenkul Fırsatlarını Keşfedin",
  heroSubtitle:
    "Doğrulanmış mülkler, güvenilir ortaklar ve yapay zeka destekli yatırım içgörüleri.",
  exploreInvestments: "Yatırımları Keşfet",
  investorEdition: "Yatırımcı Sürümü",

  categories: "Kategoriler",
  featuredProperties: "Öne Çıkan Mülkler",
  handpickedInvestments: "Seçilmiş yatırımlar",
  highYieldOpportunities: "Yüksek Getirili Fırsatlar",
  bestRoiPotential: "En iyi ROI potansiyeli",
  aiInsights: "AI Yatırım Analizleri",
  marketAnalysis: "Piyasa analizi önizleme",
  verifiedPartners: "Doğrulanmış Ortaklar",
  trustedProfessionals: "Güvenilir gayrimenkul profesyonelleri",
  allPartners: "Tüm ortaklar",

  verified: "Doğrulanmış",
  verifiedProperty: "Doğrulanmış Mülk",
  roi: "ROI",
  price: "Fiyat",
  location: "Konum",
  propertyType: "Mülk Tipi",
  favorite: "Favori",
  contactPartner: "Ortakla İletişime Geç",
  scheduleViewing: "Görüşme Planla",
  saveProperty: "Kaydet",
  saved: "Kaydedildi",
  share: "Paylaş",
  available: "Satışta",
  reserved: "Rezerve",
  sold: "Satıldı",

  propertyFeatures: "Mülk Özellikleri",
  bedrooms: "Yatak Odası",
  bathrooms: "Banyo",
  area: "Alan",
  parking: "Otopark",
  pool: "Havuz",
  security: "7/24 Güvenlik",
  garden: "Bahçe",
  seaView: "Deniz Manzarası",
  yearBuilt: "Yapım Yılı",

  aiInvestmentInsights: "AI Yatırım Analizi",
  aiDisclaimer:
    "Yapay zeka tarafından oluşturulmuş, tanıtım amaçlı tahmini değerlerdir.",
  estimatedRoi: "Tahmini Getiri",
  rentalIncome: "Kira Geliri",
  monthlyIncome: "Aylık Gelir",
  amortization: "Amortisman",
  amortizationPeriod: "Amortisman Süresi",
  years: "yıl",
  growthScore: "Büyüme Puanı",
  riskLevel: "Risk Seviyesi",
  marketTrend: "Piyasa Eğilimi",
  confidenceScore: "Güven Skoru",
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  stable: "Sabit",
  trending: "Yükselişte",

  aboutProperty: "Mülk Hakkında",
  readMore: "Devamını Oku",
  readLess: "Daha Az Göster",

  locationMap: "Konum",
  viewOnMap: "Haritada Gör",
  city: "Şehir",
  country: "Ülke",

  listedBy: "İlan Sahibi",
  verifiedPartner: "Doğrulanmış Partner",
  viewPartnerProfile: "Profili Gör",
  listings: "ilan",

  propertyVideoTour: "Mülk Video Turu",
  watchVideo: "Videoyu İzle",
  virtualTour: "Sanal Tur Mevcut",

  similarProperties: "Benzer Mülkler",
  youMayAlsoLike: "Bunlar da ilginizi çekebilir",

  interestedInProperty: "Bu mülkle ilgileniyor musunuz?",
  getInTouch: "Doğrulanmış partnerimizle iletişime geçin.",
  rentalYield: "Kira Getirisi",

  villas: "Villalar",
  apartments: "Daireler",
  lands: "Araziler",
  commercial: "Ticari",

  typeVilla: "Villa",
  typeApartment: "Daire",
  typeLand: "Arazi",
  typeCommercial: "Ticari",

  countryAll: "Tümü",
  countryTr: "Türkiye",
  countrySa: "Suudi Arabistan",
  countryAe: "BAE",
  countryUs: "ABD",

  home: "Ana Sayfa",
  exploreTab: "Keşfet",
  favorites: "Favoriler",
  profile: "Profil",
  reels: "Videolar",
  news: "Haberler",

  exploreTitle: "Keşfet",
  exploreSubtitle: "Bir sonraki yatırımınızı bulun",
  searchPlaceholder: "Şehir, ülke veya mülk ara",
  propertiesFound: "mülk bulundu",
  propertyFound: "mülk bulundu",
  clearSearch: "Aramayı temizle",
  noResultsSubtitle: "Farklı bir ülke veya arama terimi deneyin.",

  favoritesTitle: "Favoriler",
  favoritesSubtitle: "Kaydettiğiniz mülkler",
  savedProperties: "Kaydedilen Mülkler",
  favoritesEmptyTitle: "Henüz kaydedilmiş mülk yok",
  favoritesEmptySubtitle:
    "Hızlı erişim için beğendiğiniz mülklerdeki kalp simgesine dokunun.",
  browseProperties: "Mülkleri İncele",

  profileTitle: "Profil",
  guestUser: "Misafir",
  guestUserSubtitle: "Hesapsız olarak geziniyorsunuz",
  signInPrompt: "Mülk kaydetmek ve portföyünüzü takip etmek için giriş yapın",
  preferences: "Tercihler",
  language: "Dil",
  selectLanguage: "Dil Seçin",
  aboutSection: "Hakkında",
  aboutApp: "Mizan Invest Hakkında",
  appVersion: "Sürüm",
  termsOfService: "Kullanım Koşulları",
  privacyPolicy: "Gizlilik Politikası",
  helpCenter: "Yardım Merkezi",
  contactUs: "Bize Ulaşın",
  forPartners: "Partnerler İçin",
  partnerPortalAccess: "Partner Portalı",
  partnerPortalDescription: "İlanları yönetin ve performansı görüntüleyin",

  guestModeActive: "Misafir Olarak Keşfediliyor",
  exploreListings: "İlanları Keşfet",

  notifications: "Bildirimler",
  noNotifications: "Yeni bildirim yok",

  comingSoon: "Çok Yakında",
  featureComingSoon: "Bu özellik tam sürümde kullanıma sunulacak.",
  contactPartnerMessage:
    "Ekibimiz sizi kısa süre içinde doğrulanmış partnerle buluşturacak.",

  error: "Hata",
  success: "Başarılı",
  loading: "Yükleniyor...",
  tryAgain: "Tekrar Dene",
  noResults: "Sonuç bulunamadı",
  networkError: "Ağ hatası. Lütfen bağlantınızı kontrol edin.",

  cityMadinah: "Medine",
  cityRiyadh: "Riyad",
  cityJeddah: "Cidde",
  cityIstanbul: "İstanbul",
  cityAntalya: "Antalya",
  cityDubai: "Dubai",

  featuredProjects: "Öne çıkan projeler",
  featuredProjectsSubtitle: "Analistlerimizin seçtiği fırsatlar",
  madinahProjects: "Medine projeleri",
  madinahProjectsSubtitle: "Mescid-i Nebevî’ye yakın",
  newListings: "Yeni eklenenler",
  newListingsSubtitle: "Bu ay yayına alındı",
  highPotential: "Yüksek yatırım potansiyeli",
  highPotentialSubtitle: "En yüksek beklenen getiri",
  verifiedPartnersSubtitle: "Lisanslı geliştirici ve danışmanlar",
  recentlyViewed: "Son görüntülenenler",
  recentlyViewedSubtitle: "Kaldığınız yerden devam edin",
  popularCities: "Popüler şehirler",
  popularCitiesSubtitle: "Yatırımcıların tercih ettiği şehirler",
  objectsShort: "ilan",

  prop1Title: "Harem Kapısı Rezidansları",
  prop2Title: "Medine Bahçeleri Villası",
  prop3Title: "Kuba Yolu Ticaret Merkezi",
  prop4Title: "Kuzey Medine Yatırım Arsası",
  prop5Title: "Envar Al Medine Suitleri",
  prop6Title: "Riyad Silüet Rezidansları",
  prop7Title: "Diriyah Kapısı Villası",
  prop8Title: "KAFD Finans Kulesi Ofisleri",
  prop9Title: "Kuzey Riyad Gelişim Arsası",
  prop10Title: "Cidde Kordon Daireleri",
  prop11Title: "Kızıldeniz Marina Villası",
  prop12Title: "Cidde İş Parkı Üniteleri",
  prop13Title: "Boğaz Tepesi Villası",
  prop14Title: "Levent Panorama Rezidansları",
  prop15Title: "İstanbul Havalimanı Lojistik Arsası",
  prop16Title: "Galata Butik Mağazası",
  prop17Title: "Antalya Deniz Manzaralı Rezidanslar",
  prop18Title: "Kaleiçi Tarihi Villası",
  prop19Title: "Antalya Sahil Arsası",
  prop20Title: "Lara Plajı Otel Suitleri",
  prop21Title: "Palm Jumeirah Çatı Katı",
  prop22Title: "Downtown Dubai Kule Ofisleri",
  prop23Title: "Dubai Marina Rezidansları",
  prop24Title: "Dubai South Yatırım Arsası",

  descHolyCity:
    "Mescid-i Nebevî’ye yürüme mesafesinde, hem hacılar hem de uzun süreli sakinler için tasarlanmış bir rezidans. Çağdaş İslami mimari, üst segment malzemeler, 24 saat concierge ve kapalı otopark.\n\nBölgedeki talep yıl boyu süren dini turizmden besleniyor; bu da doluluk oranını yüksek, kira gelirini istikrarlı tutuyor.",
  descLuxuryVilla:
    "Işık, ferahlık ve aile yaşamı düşünülerek tasarlanmış özel bir villa. Tavandan tabana camlar, doğal taş zeminler, peyzajlı bahçe ve ısıtmalı havuz; güvenlikli ve kapalı bir sitede.\n\nBu nitelikteki arzın sınırlı olması hem satış değerini hem de uzun vadeli kira seviyesini destekliyor.",
  descCityApartment:
    "Şehrin merkezinde, iş merkezine, ulaşım hatlarına ve uluslararası okullara dakikalar uzaklıkta modern bir daire. Akıllı ev altyapısı, concierge hizmeti ve sakinlere özel spor salonu.\n\nLikidite arayan ve sürekli yenilenen bir kiracı havuzu isteyen yatırımcılar için net bir giriş noktası.",
  descInvestmentLand:
    "Aktif bir gelişim koridorunda, altyapısı parsel sınırına kadar getirilmiş, konut veya karma kullanım imarı hazır tapulu arsa.\n\nArsa kira geliri üretmez; getiri, çevredeki altyapı tamamlandıkça oluşan değer artışından gelir. Portföydeki en yüksek büyümeli ve en sabır isteyen pozisyondur.",
  descCommercial:
    "Çok yıllık sözleşmelerle kiracıları oturmuş, gelir üreten bir ticari varlık. Zemin katta perakende, üst katlarda ofis, tahsisli otopark ve tam bina yönetimi.\n\nTicari kira sözleşmeleri daha uzun ve endeksli olduğu için nakit akışı konuta göre daha öngörülebilirdir.",
  descSeafront:
    "Kesintisiz deniz manzaralı, plaja doğrudan erişimli; havuz, spa ve özel iskele gibi tatil köyü standardında olanaklara sahip sahil rezidansı.\n\nSahil arzı fiziksel olarak sınırlı, kısa dönem kiralama talebi ise sezon boyunca zirve yapıyor — bu birleşim hem getiriyi hem de uzun vadeli değeri destekliyor.",

  whyInvest: "Neden burada yatırım yapmalı",
  whyInvestSubtitle: "Analistlerimizin bu ilanda öne çıkardıkları",
  whyVilla1: "Bölgede benzer nitelikte villa arzı sınırlı",
  whyVilla2:
    "Üst segment kiracılar daha uzun ve yüksek bedelli sözleşme yapıyor",
  whyVilla3: "Arsa payı, piyasa dalgalanmalarında değeri koruyor",
  whyApartment1:
    "Profesyonellerden ve ailelerden gelen kesintisiz kiracı talebi",
  whyApartment2: "Nakde ihtiyaç duyulduğunda en kolay satılan varlık sınıfı",
  whyApartment3: "Yönetim ve bakım maliyetleri öngörülebilir kalıyor",
  whyLand1: "Portföydeki en yüksek değer artışı potansiyeli",
  whyLand2: "Kiracı yok, bakım yok, işletme gideri yok",
  whyLand3: "Çevredeki altyapı çalışmaları hâlihazırda sürüyor",
  whyCommercial1: "Endeksli kira artışlı, çok yıllık sözleşmeler",
  whyCommercial2: "Bu piyasada konut ortalamasının üzerinde getiri",
  whyCommercial3: "İşletme ve tadilat maliyetlerinin çoğunu kiracı karşılıyor",

  investmentScore: "Yatırım skoru",
  investmentScoreHint: "Getiri, büyüme, risk ve partner geçmişinin bileşimi",

  currency: "Para birimi",
  selectCurrency: "Para birimi seçin",
  demoExchangeRate: "Demo kur",
  demoRateNote: "Kurlar sabit demo değerleridir, canlı piyasa kuru değildir.",

  settings: "Ayarlar",
  appearance: "Görünüm",
  selectAppearance: "Görünüm seçin",
  themeLight: "Açık tema",
  themeDark: "Koyu tema",
  themeSystem: "Sistem ayarı",

  viewListing: "İlanı görüntüle",
  soundOn: "Ses açık",
  soundOff: "Ses kapalı",
  reel1Title: "Medine villa turu",
  reel1Caption: "Beş yatak odası, özel bahçe, Mescid-i Nebevî’ye on dakika.",
  reel2Title: "Yeni Riyad projesi",
  reel2Caption: "Vizyon 2030 bölgesi — ilk konut kulesi satışa açıldı.",
  reel3Title: "Boğaz manzaralı daire",
  reel3Caption: "İstanbul’un Avrupa yakasında sahil yaşamı.",
  reel4Title: "Dubai yatırım projesi",
  reel4Caption: "Palm Jumeirah’ta körfeze 360° bakan çatı katı.",
  reel5Title: "Arsa yatırımı analizi",
  reel5Caption: "Altyapı yapılırken bir gelişim arsası nasıl değer kazanır.",
  reel6Title: "Ticari merkez turu",
  reel6Caption: "Kuba Yolu’nda tamamı kiralanmış mağaza ve ofis alanı.",

  markAllRead: "Tümünü okundu işaretle",
  allNotificationsRead: "Her şeyi okudunuz",
  unreadLabel: "Yeni",
  notifNewProjectTitle: "Yeni proje eklendi",
  notifNewProjectBody: "Envar Al Medine Suitleri rezervasyona açıldı.",
  notifPriceUpdateTitle: "Fiyat güncellendi",
  notifPriceUpdateBody:
    "Favorilerinizdeki bir ilanın fiyatı yeniden belirlendi.",
  notifPartnerReplyTitle: "Partner yanıtladı",
  notifPartnerReplyBody:
    "Aegean Premier, Boğaz villası hakkındaki sorunuzu yanıtladı.",
  notifMadinahTitle: "Yeni Medine yatırımı",
  notifMadinahBody:
    "Kuba Yolu Ticaret Merkezi %10,4 beklenen getiriyle yayınlandı.",
  notifVideoAddedTitle: "Yeni video eklendi",
  notifVideoAddedBody: "Kaydettiğiniz bir ilana proje turu videosu eklendi.",
  notifMarketReportTitle: "Aylık piyasa raporu",
  notifMarketReportBody: "Körfez ve Türkiye gayrimenkul görünümü bu çeyrek.",
  timeNow: "şimdi",
  timeMinutes: "dk",
  timeHours: "sa",
  timeDays: "g",

  photos: "Fotoğraflar",
  zoomHint: "Yakınlaştırmak için sıkıştırın veya çift dokunun",
  videoTourSubtitle: "Yola çıkmadan önce projeyi gezin",
  playVideo: "Oynat",
  pauseVideo: "Duraklat",

  filters: "Filtreler",
  applyFilters: "Sonuçları göster",
  resetFilters: "Sıfırla",
  priceRange: "Fiyat aralığı",
  propertyTypeFilter: "Gayrimenkul türü",
  cityFilter: "Şehir",
  countryFilter: "Ülke",
  verifiedOnly: "Yalnızca doğrulanmış partnerler",
  minInvestmentScore: "Minimum yatırım skoru",
  anyValue: "Tümü",
  activeFilters: "aktif",
  upTo: "üst sınır",

  whatsappContact: "WhatsApp",
  callPartner: "Ara",
  imInterested: "İlgileniyorum",
  requestSent: "Talebiniz iletildi",
  requestSentBody: "Partner bir iş günü içinde sizinle iletişime geçecek.",
  demoAction: "Demo modu",
  demoActionBody: "Bu işlem partner demosu için simüle edilmiştir.",
  contactDetails: "İletişim bilgileri",
  contactDetailsHint: "Mizan Invest ekibimizin dönüş yapabilmesi için telefon veya e-posta bırakın.",
  name: "Ad",
  phone: "Telefon",
  message: "Mesaj",
  optional: "Opsiyonel",
  submitRequest: "Talep gönder",
  phoneOrEmailRequired: "Telefon numarası veya e-posta girin.",
  invalidPhoneNumber: "Geçerli bir uluslararası telefon numarası girin; örneğin +966501234567.",
  invalidEmailAddress: "Geçerli bir e-posta adresi girin.",
  requestReceived: "Talebiniz alındı",
  requestReceivedBody: "Mizan Invest ekibimiz kısa süre içinde sizinle iletişime geçecek.",
  leadReference: "Referans",
  requestPreparationFailed: "Talebiniz hazırlanamadı. Lütfen tekrar deneyin.",
  companyWhatsAppUnavailable: "Şirket WhatsApp numarası henüz yapılandırılmadı.",
  companyPhoneUnavailable: "Şirket telefon numarası henüz yapılandırılmadı.",
  unableToOpenWhatsApp: "Talebiniz kaydedildi, ancak WhatsApp açılamadı.",
  unableToOpenPhone: "Talebiniz kaydedildi, ancak telefon uygulaması açılamadı.",

  perMonth: "/ay",
  listedAgo: "Yayında",
  daysAgo: "gün önce",
  addedToFavorites: "Favorilere eklendi",
  removedFromFavorites: "Favorilerden çıkarıldı",
  propertyNotFound: "Bu ilan artık yayında değil",
  backToHome: "Ana sayfaya dön",
  investmentBasics: "Temel bilgiler",

  partner1Description:
    "Kutsal şehir çevresindeki üst segment konut ve ticari projelerin ayrıcalıklı partneri; 2009’dan bu yana Medine’de faaliyette.",
  partner2Description:
    "Riyad ve orta bölgedeki Vizyon 2030 gelişim alanlarına odaklanan yatırım şirketi.",
  partner3Description:
    "Cidde ve Kızıldeniz hattında uzmanlaşmış; marina villalarından kiralı iş parklarına uzanan portföy.",
  partner4Description:
    "Türkiye kıyıları ve İstanbul’da lüks konut geliştiricisi; on beş yılı aşkın teslim geçmişi.",
  partner5Description:
    "Uluslararası yatırımcılar için birinci sınıf konut ve ofis varlıkları yöneten Dubai merkezli danışmanlık.",
};

// ============================================
// RUSSIAN (default)
// ============================================

const ru: TranslationDictionary = {
  appName: "Mizan Invest",
  appSlogan: "Глобальные инвестиции в недвижимость",

  onboarding1Badge: "Проверенные инвестиции",
  onboarding1Title: "Инвестируйте за пределами границ",
  onboarding1Subtitle:
    "Откройте премиальные объекты недвижимости на надёжных мировых рынках.",
  onboarding2Badge: "Аналитика ИИ",
  onboarding2Title: "Смотрите цифры до вложения средств",
  onboarding2Subtitle:
    "Ожидаемая доходность, арендный доход, потенциал роста и инвестиционная аналитика.",
  onboarding3Badge: "Надёжные партнёры",
  onboarding3Title: "Каждый объект проверен",
  onboarding3Subtitle:
    "Только аккредитованные партнёры, застройщики и профессионалы рынка недвижимости.",

  skip: "Пропустить",
  next: "Далее",
  back: "Назад",
  getStarted: "Начать",
  seeAll: "Смотреть все",
  viewAll: "Смотреть все",
  explore: "Смотреть",
  close: "Закрыть",
  cancel: "Отмена",

  welcomeTitle: "Где видение встречает ценность",
  welcomeSubtitle:
    "Присоединяйтесь к тысячам инвесторов с доступом к премиальной мировой недвижимости.",
  continueAsGuest: "Продолжить как гость",
  investorLogin: "Вход для инвестора",
  partnerLogin: "Портал партнёра",
  partnerNote: "Аккаунты партнёров проходят верификацию",

  email: "Эл. почта",
  password: "Пароль",
  login: "Войти",
  logout: "Выйти",
  orContinueWith: "или продолжить через",
  continueWithGoogle: "Продолжить с Google",
  continueWithApple: "Продолжить с Apple",
  forgotPassword: "Забыли пароль?",
  welcomeBack: "С возвращением",
  signInSubtitle: "Войдите, чтобы открыть свой инвестиционный портфель",
  createAccount: "Создать аккаунт",
  alreadyHaveAccount: "Уже есть аккаунт?",

  partnerPortalBadge: "ПОРТАЛ ПАРТНЁРА",
  partnerEmail: "Эл. почта партнёра",
  partnerLoginButton: "Войти в портал",
  requestPartnerAccess: "Стать партнёром",
  notPartnerYet: "Ещё не партнёр?",
  partnerWelcome: "Портал партнёра",
  partnerSubtitle: "Доступ к панели и управление объектами",

  partnerDashboard: "Панель партнёра",
  partnerDashboardSubtitle: "Управляйте объектами и аналитикой",
  verifiedPartnerDemo: "Доступ подтверждённого партнёра",
  activeListings: "Активных объектов",
  totalViews: "Просмотров",
  inquiries: "Заявок",
  totalValue: "Общая стоимость",
  addNewListing: "Добавить объект",
  backToWelcome: "Вернуться на главный экран",

  homeTitle: "Mizan Invest",
  homeSubtitle: "Мировая недвижимость",
  heroTitle: "Откройте глобальные возможности недвижимости",
  heroSubtitle:
    "Проверенные объекты, надёжные партнёры и инвестиционная аналитика на основе ИИ.",
  exploreInvestments: "Смотреть инвестиции",
  investorEdition: "Издание для инвесторов",

  categories: "Категории",
  featuredProperties: "Избранные объекты",
  handpickedInvestments: "Отобранные инвестиции",
  highYieldOpportunities: "Высокодоходные объекты",
  bestRoiPotential: "Лучший потенциал доходности",
  aiInsights: "Инвестиционная аналитика ИИ",
  marketAnalysis: "Предпросмотр анализа рынка",
  verifiedPartners: "Проверенные партнёры",
  trustedProfessionals: "Надёжные профессионалы рынка недвижимости",
  allPartners: "Все партнёры",

  verified: "Проверено",
  verifiedProperty: "Проверенный объект",
  roi: "ROI",
  price: "Цена",
  location: "Расположение",
  propertyType: "Тип объекта",
  favorite: "В избранное",
  contactPartner: "Связаться с партнёром",
  scheduleViewing: "Записаться на просмотр",
  saveProperty: "Сохранить",
  saved: "Сохранено",
  share: "Поделиться",
  available: "Доступен",
  reserved: "Забронирован",
  sold: "Продан",

  propertyFeatures: "Характеристики объекта",
  bedrooms: "Спальни",
  bathrooms: "Санузлы",
  area: "Площадь",
  parking: "Парковка",
  pool: "Бассейн",
  security: "Охрана 24/7",
  garden: "Сад",
  seaView: "Вид на море",
  yearBuilt: "Год постройки",

  aiInvestmentInsights: "Инвестиционная аналитика ИИ",
  aiDisclaimer: "Оценки сформированы ИИ и приведены в демонстрационных целях.",
  estimatedRoi: "Ожидаемая доходность",
  rentalIncome: "Арендный доход",
  monthlyIncome: "Ежемесячный доход",
  amortization: "Окупаемость",
  amortizationPeriod: "Срок окупаемости",
  years: "лет",
  growthScore: "Потенциал роста",
  riskLevel: "Уровень риска",
  marketTrend: "Динамика рынка",
  confidenceScore: "Достоверность",
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  stable: "Стабильно",
  trending: "Рост",

  aboutProperty: "Об объекте",
  readMore: "Подробнее",
  readLess: "Свернуть",

  locationMap: "Расположение",
  viewOnMap: "Показать на карте",
  city: "Город",
  country: "Страна",

  listedBy: "Объект представляет",
  verifiedPartner: "Проверенный партнёр",
  viewPartnerProfile: "Профиль партнёра",
  listings: "объектов",

  propertyVideoTour: "Видеотур по объекту",
  watchVideo: "Смотреть видео",
  virtualTour: "Доступен виртуальный тур",

  similarProperties: "Похожие объекты",
  youMayAlsoLike: "Также может подойти",

  interestedInProperty: "Заинтересовал объект?",
  getInTouch: "Свяжитесь с нашим проверенным партнёром.",
  rentalYield: "Арендная доходность",

  villas: "Виллы",
  apartments: "Квартиры",
  lands: "Земельные участки",
  commercial: "Коммерческая",

  typeVilla: "Вилла",
  typeApartment: "Квартира",
  typeLand: "Земельный участок",
  typeCommercial: "Коммерческий объект",

  countryAll: "Все",
  countryTr: "Турция",
  countrySa: "Саудовская Аравия",
  countryAe: "ОАЭ",
  countryUs: "США",

  home: "Главная",
  exploreTab: "Поиск",
  favorites: "Избранное",
  profile: "Профиль",
  reels: "Reels",
  news: "Новости",

  exploreTitle: "Поиск",
  exploreSubtitle: "Найдите свою следующую инвестицию",
  searchPlaceholder: "Город, страна или название объекта",
  propertiesFound: "объектов найдено",
  propertyFound: "объект найден",
  clearSearch: "Очистить поиск",
  noResultsSubtitle: "Попробуйте другую страну или измените запрос.",

  favoritesTitle: "Избранное",
  favoritesSubtitle: "Сохранённые вами объекты",
  savedProperties: "Сохранённые объекты",
  favoritesEmptyTitle: "Пока нет сохранённых объектов",
  favoritesEmptySubtitle:
    "Нажмите на значок сердца у объекта, чтобы вернуться к нему в один клик.",
  browseProperties: "Перейти к объектам",

  profileTitle: "Профиль",
  guestUser: "Гость",
  guestUserSubtitle: "Просмотр без аккаунта",
  signInPrompt: "Войдите, чтобы сохранять объекты и вести портфель",
  preferences: "Настройки",
  language: "Язык",
  selectLanguage: "Выберите язык",
  aboutSection: "О приложении",
  aboutApp: "О Mizan Invest",
  appVersion: "Версия",
  termsOfService: "Условия использования",
  privacyPolicy: "Политика конфиденциальности",
  helpCenter: "Центр поддержки",
  contactUs: "Связаться с нами",
  forPartners: "Для партнёров",
  partnerPortalAccess: "Портал партнёра",
  partnerPortalDescription: "Управление объектами и аналитика",

  guestModeActive: "Режим гостя",
  exploreListings: "Смотреть объекты",

  notifications: "Уведомления",
  noNotifications: "Нет новых уведомлений",

  comingSoon: "Скоро",
  featureComingSoon: "Эта функция появится в полной версии приложения.",
  contactPartnerMessage:
    "Наша команда свяжет вас с проверенным партнёром в ближайшее время.",

  error: "Ошибка",
  success: "Готово",
  loading: "Загрузка...",
  tryAgain: "Повторить",
  noResults: "Ничего не найдено",
  networkError: "Ошибка сети. Проверьте подключение.",

  cityMadinah: "Медина",
  cityRiyadh: "Эр-Рияд",
  cityJeddah: "Джидда",
  cityIstanbul: "Стамбул",
  cityAntalya: "Анталья",
  cityDubai: "Дубай",

  featuredProjects: "Избранные проекты",
  featuredProjectsSubtitle: "Отобраны нашими аналитиками",
  madinahProjects: "Проекты в Медине",
  madinahProjectsSubtitle: "Рядом с Мечетью Пророка",
  newListings: "Новые объекты",
  newListingsSubtitle: "Добавлены в этом месяце",
  highPotential: "Высокий потенциал",
  highPotentialSubtitle: "Лучшая ожидаемая доходность",
  verifiedPartnersSubtitle: "Лицензированные застройщики и агентства",
  recentlyViewed: "Вы недавно смотрели",
  recentlyViewedSubtitle: "Продолжите с того же места",
  popularCities: "Популярные города",
  popularCitiesSubtitle: "Где покупают инвесторы",
  objectsShort: "объектов",

  prop1Title: "Резиденции «Ворота Аль-Харам»",
  prop2Title: "Вилла «Сады Медины»",
  prop3Title: "Торговый центр на дороге Куба",
  prop4Title: "Участок на севере Медины",
  prop5Title: "Апартаменты «Анвар аль-Мадина»",
  prop6Title: "Резиденции «Панорама Эр-Рияда»",
  prop7Title: "Вилла «Ворота Дирии»",
  prop8Title: "Офисы в башне KAFD",
  prop9Title: "Участок на севере Эр-Рияда",
  prop10Title: "Апартаменты на набережной Джидды",
  prop11Title: "Вилла «Марина Красного моря»",
  prop12Title: "Офисы в бизнес-парке Джидды",
  prop13Title: "Вилла «Босфор Крест»",
  prop14Title: "Резиденции «Левент Панорама»",
  prop15Title: "Участок у аэропорта Стамбула",
  prop16Title: "Бутик-помещение в Галате",
  prop17Title: "Резиденции с видом на море",
  prop18Title: "Историческая вилла в Калеичи",
  prop19Title: "Прибрежный участок в Анталье",
  prop20Title: "Отельные сьюты на пляже Лара",
  prop21Title: "Пентхаус на Палм-Джумейра",
  prop22Title: "Офисы в башне Даунтаун Дубай",
  prop23Title: "Резиденции в Дубай Марина",
  prop24Title: "Участок в Дубай Саут",

  descHolyCity:
    "Резиденция в пешей доступности от Мечети Пророка, построенная по стандартам, которых ждут паломники и постоянные жители. Современная исламская архитектура, отделка премиум-класса, консьерж 24/7 и подземный паркинг.\n\nСпрос здесь формирует круглогодичный религиозный туризм: это исторически удерживает высокую заполняемость и стабильный арендный доход в любой сезон.",
  descLuxuryVilla:
    "Частная вилла, спроектированная вокруг света, простора и семейной жизни. Панорамное остекление, полы из натурального камня, ландшафтный сад и подогреваемый бассейн — на закрытой охраняемой территории.\n\nПредложение такого уровня ограничено, что поддерживает и цену перепродажи, и премиальную ставку долгосрочной аренды.",
  descCityApartment:
    "Современные апартаменты в центре города, в нескольких минутах от делового квартала, транспорта и международных школ. Проводка «умного дома», консьерж-сервис, спортзал и лаундж только для резидентов.\n\nПонятная точка входа для инвестора, которому важны ликвидность и постоянно обновляющийся пул арендаторов.",
  descInvestmentLand:
    "Участок с оформленным титулом в активном коридоре застройки: коммуникации подведены к границе, назначение под жилую или смешанную застройку уже утверждено.\n\nЗемля не приносит арендного дохода — доходность формируется за счёт роста стоимости по мере ввода окружающей инфраструктуры. Как правило, это самая растущая и самая «терпеливая» позиция в портфеле.",
  descCommercial:
    "Коммерческий актив, уже приносящий доход: арендаторы сидят на многолетних договорах. Ритейл на первом этаже, офисы выше, выделенный паркинг и полное управление зданием.\n\nКоммерческие договоры длиннее и индексируются, поэтому денежный поток предсказуемее жилого на всём цикле.",
  descSeafront:
    "Резиденция на первой линии с открытым видом на море, прямым выходом на пляж и инфраструктурой курортного уровня: бассейны, спа и собственные причалы.\n\nПредложение на побережье физически ограничено, а спрос на короткую аренду достигает пика в сезон — сочетание, которое поддерживает и доходность, и стоимость в долгую.",

  whyInvest: "Почему стоит инвестировать",
  whyInvestSubtitle: "На что обратили внимание наши аналитики",
  whyVilla1: "Ограниченное предложение сопоставимых вилл в районе",
  whyVilla2: "Премиальные арендаторы заключают договоры дольше и дороже",
  whyVilla3: "Земельная составляющая защищает стоимость в любой фазе рынка",
  whyApartment1: "Постоянный спрос со стороны специалистов и семей",
  whyApartment2: "Самый ликвидный класс активов при необходимости выйти",
  whyApartment3: "Расходы на управление и обслуживание предсказуемы",
  whyLand1: "Наибольший потенциал роста стоимости в портфеле",
  whyLand2: "Нет арендаторов, обслуживания и операционных расходов",
  whyLand3: "Инфраструктура рядом уже строится",
  whyCommercial1: "Многолетние договоры с индексацией ставки",
  whyCommercial2: "Доходность выше средней по жилому сегменту рынка",
  whyCommercial3: "Большую часть операционных затрат несёт арендатор",

  investmentScore: "Инвестиционный рейтинг",
  investmentScoreHint: "Учитывает доходность, рост, риск и опыт партнёра",

  currency: "Валюта",
  selectCurrency: "Выберите валюту",
  demoExchangeRate: "Демо-курс",
  demoRateNote: "Курсы — фиксированные демо-значения, а не котировки рынка.",

  settings: "Настройки",
  appearance: "Оформление",
  selectAppearance: "Выберите оформление",
  themeLight: "Светлая тема",
  themeDark: "Тёмная тема",
  themeSystem: "Как в системе",

  viewListing: "Открыть объект",
  soundOn: "Звук включён",
  soundOff: "Звук выключен",
  reel1Title: "Тур по вилле в Медине",
  reel1Caption: "Пять спален, свой сад, десять минут до Мечети Пророка.",
  reel2Title: "Новый проект в Эр-Рияде",
  reel2Caption: "Район «Видение 2030» — первая жилая башня в продаже.",
  reel3Title: "Квартира с видом на Босфор",
  reel3Caption: "Жизнь у воды на европейской стороне Стамбула.",
  reel4Title: "Инвестпроект в Дубае",
  reel4Caption: "Пентхаус на Палм-Джумейра с обзором залива на 360°.",
  reel5Title: "Разбор инвестиций в землю",
  reel5Caption: "Как участок растёт в цене, пока строится инфраструктура.",
  reel6Title: "Обход торгового центра",
  reel6Caption: "Полностью сданные площади ритейла и офисов на дороге Куба.",

  markAllRead: "Отметить все прочитанными",
  allNotificationsRead: "Новых уведомлений нет",
  unreadLabel: "Новое",
  notifNewProjectTitle: "Добавлен новый проект",
  notifNewProjectBody:
    "Апартаменты «Анвар аль-Мадина» открыты для бронирования.",
  notifPriceUpdateTitle: "Цена обновлена",
  notifPriceUpdateBody: "У объекта из избранного изменилась цена предложения.",
  notifPartnerReplyTitle: "Партнёр ответил",
  notifPartnerReplyBody:
    "Aegean Premier ответил на ваш вопрос о вилле на Босфоре.",
  notifMadinahTitle: "Новая инвестиция в Медине",
  notifMadinahBody:
    "Торговый центр на дороге Куба опубликован с прогнозом 10,4%.",
  notifVideoAddedTitle: "Добавлено новое видео",
  notifVideoAddedBody: "У сохранённого объекта появился полный тур по проекту.",
  notifMarketReportTitle: "Ежемесячный обзор рынка",
  notifMarketReportBody: "Прогноз по недвижимости Залива и Турции на квартал.",
  timeNow: "сейчас",
  timeMinutes: "мин",
  timeHours: "ч",
  timeDays: "дн",

  photos: "Фотографии",
  zoomHint: "Сведите пальцы или коснитесь дважды",
  videoTourSubtitle: "Осмотрите проект, не выезжая на объект",
  playVideo: "Смотреть",
  pauseVideo: "Пауза",

  filters: "Фильтры",
  applyFilters: "Показать результаты",
  resetFilters: "Сбросить",
  priceRange: "Диапазон цены",
  propertyTypeFilter: "Тип недвижимости",
  cityFilter: "Город",
  countryFilter: "Страна",
  verifiedOnly: "Только проверенные партнёры",
  minInvestmentScore: "Минимальный рейтинг",
  anyValue: "Любой",
  activeFilters: "активно",
  upTo: "до",

  whatsappContact: "WhatsApp",
  callPartner: "Позвонить",
  imInterested: "Мне интересно",
  requestSent: "Заявка отправлена",
  requestSentBody: "Партнёр свяжется с вами в течение одного рабочего дня.",
  demoAction: "Демо-режим",
  demoActionBody: "Действие смоделировано для демонстрации партнёрам.",
  contactDetails: "Контактные данные",
  contactDetailsHint: "Оставьте телефон или email, чтобы команда Mizan Invest могла ответить.",
  name: "Имя",
  phone: "Телефон",
  message: "Сообщение",
  optional: "Необязательно",
  submitRequest: "Отправить заявку",
  phoneOrEmailRequired: "Укажите номер телефона или email.",
  invalidPhoneNumber: "Укажите корректный международный номер, например +966501234567.",
  invalidEmailAddress: "Укажите корректный email.",
  requestReceived: "Заявка получена",
  requestReceivedBody: "Команда Mizan Invest свяжется с вами в ближайшее время.",
  leadReference: "Номер заявки",
  requestPreparationFailed: "Не удалось подготовить заявку. Попробуйте ещё раз.",
  companyWhatsAppUnavailable: "Корпоративный WhatsApp пока не настроен.",
  companyPhoneUnavailable: "Корпоративный телефон пока не настроен.",
  unableToOpenWhatsApp: "Заявка сохранена, но WhatsApp не удалось открыть.",
  unableToOpenPhone: "Заявка сохранена, но приложение телефона не удалось открыть.",

  perMonth: "/мес",
  listedAgo: "Опубликовано",
  daysAgo: "дн. назад",
  addedToFavorites: "Добавлено в избранное",
  removedFromFavorites: "Удалено из избранного",
  propertyNotFound: "Объект больше не доступен",
  backToHome: "На главную",
  investmentBasics: "Ключевые показатели",

  partner1Description:
    "Эксклюзивный партнёр по премиальным жилым и коммерческим проектам вокруг Священного города; работает в Медине с 2009 года.",
  partner2Description:
    "Инвестиционная компания, сфокусированная на зонах развития «Видение 2030» в Эр-Рияде и центральном регионе.",
  partner3Description:
    "Специалист по побережью: Джидда и коридор Красного моря — от вилл у марины до сданных бизнес-парков.",
  partner4Description:
    "Девелопер премиального жилья на побережье Турции и в Стамбуле; более пятнадцати лет сданных проектов.",
  partner5Description:
    "Агентство из Дубая, ведущее первоклассные жилые и офисные активы для международных инвесторов.",
};

// ============================================
// ARABIC
// Full RTL layout support is planned for a later phase.
// ============================================

const ar: TranslationDictionary = {
  appName: "ميزان إنفست",
  appSlogan: "استثمارات عقارية عالمية",

  onboarding1Badge: "استثمارات موثقة",
  onboarding1Title: "استثمر عبر الحدود",
  onboarding1Subtitle: "اكتشف فرصاً عقارية مميزة في أسواق عالمية موثوقة.",
  onboarding2Badge: "تحليل بالذكاء الاصطناعي",
  onboarding2Title: "اطّلع على الأرقام قبل الاستثمار",
  onboarding2Subtitle:
    "العائد المتوقع، دخل الإيجار، إمكانات النمو ورؤى استثمارية.",
  onboarding3Badge: "شركاء موثوقون",
  onboarding3Title: "كل فرصة موثقة",
  onboarding3Subtitle: "فقط الشركاء والمطورون والمحترفون العقاريون المعتمدون.",

  skip: "تخطي",
  next: "التالي",
  back: "رجوع",
  getStarted: "ابدأ الآن",
  seeAll: "عرض الكل",
  viewAll: "عرض الكل",
  explore: "استكشف",
  close: "إغلاق",
  cancel: "إلغاء",

  welcomeTitle: "حيث تلتقي الرؤية بالقيمة",
  welcomeSubtitle:
    "انضم إلى آلاف المستثمرين الذين يصلون إلى فرص عقارية عالمية مميزة.",
  continueAsGuest: "المتابعة كضيف",
  investorLogin: "دخول المستثمر",
  partnerLogin: "بوابة الشريك",
  partnerNote: "حسابات الشركاء تتطلب التحقق",

  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  login: "تسجيل الدخول",
  logout: "تسجيل الخروج",
  orContinueWith: "أو تابع عبر",
  continueWithGoogle: "المتابعة مع Google",
  continueWithApple: "المتابعة مع Apple",
  forgotPassword: "نسيت كلمة المرور؟",
  welcomeBack: "مرحباً بعودتك",
  signInSubtitle: "سجّل الدخول للوصول إلى محفظتك الاستثمارية",
  createAccount: "إنشاء حساب",
  alreadyHaveAccount: "لديك حساب بالفعل؟",

  partnerPortalBadge: "بوابة الشريك",
  partnerEmail: "بريد الشريك",
  partnerLoginButton: "دخول البوابة",
  requestPartnerAccess: "كن شريكاً",
  notPartnerYet: "لست شريكاً بعد؟",
  partnerWelcome: "بوابة الشريك",
  partnerSubtitle: "الوصول إلى لوحة التحكم وإدارة العقارات",

  partnerDashboard: "لوحة تحكم الشريك",
  partnerDashboardSubtitle: "أدر عقاراتك وتحليلاتك",
  verifiedPartnerDemo: "وصول شريك موثق",
  activeListings: "عقارات نشطة",
  totalViews: "المشاهدات",
  inquiries: "الاستفسارات",
  totalValue: "القيمة الإجمالية",
  addNewListing: "إضافة عقار جديد",
  backToWelcome: "العودة إلى الشاشة الرئيسية",

  homeTitle: "ميزان إنفست",
  homeSubtitle: "العقارات العالمية",
  heroTitle: "اكتشف فرص العقارات العالمية",
  heroSubtitle: "عقارات موثقة، شركاء موثوقون ورؤى استثمارية بالذكاء الاصطناعي.",
  exploreInvestments: "استكشف الاستثمارات",
  investorEdition: "إصدار المستثمر",

  categories: "الفئات",
  featuredProperties: "العقارات المميزة",
  handpickedInvestments: "استثمارات مختارة",
  highYieldOpportunities: "فرص عالية العائد",
  bestRoiPotential: "أفضل إمكانات العائد",
  aiInsights: "رؤى الذكاء الاصطناعي",
  marketAnalysis: "معاينة تحليل السوق",
  verifiedPartners: "الشركاء الموثقون",
  trustedProfessionals: "محترفون عقاريون موثوقون",
  allPartners: "جميع الشركاء",

  verified: "موثق",
  verifiedProperty: "عقار موثق",
  roi: "العائد",
  price: "السعر",
  location: "الموقع",
  propertyType: "نوع العقار",
  favorite: "المفضلة",
  contactPartner: "تواصل مع الشريك",
  scheduleViewing: "حدد موعد المعاينة",
  saveProperty: "حفظ",
  saved: "تم الحفظ",
  share: "مشاركة",
  available: "متاح",
  reserved: "محجوز",
  sold: "مباع",

  propertyFeatures: "مواصفات العقار",
  bedrooms: "غرف النوم",
  bathrooms: "دورات المياه",
  area: "المساحة",
  parking: "مواقف السيارات",
  pool: "مسبح",
  security: "أمن على مدار الساعة",
  garden: "حديقة",
  seaView: "إطلالة بحرية",
  yearBuilt: "سنة البناء",

  aiInvestmentInsights: "رؤى استثمارية بالذكاء الاصطناعي",
  aiDisclaimer: "تقديرات مولّدة بالذكاء الاصطناعي لأغراض العرض التوضيحي.",
  estimatedRoi: "العائد المتوقع",
  rentalIncome: "دخل الإيجار",
  monthlyIncome: "الدخل الشهري",
  amortization: "فترة الاسترداد",
  amortizationPeriod: "مدة استرداد رأس المال",
  years: "سنة",
  growthScore: "مؤشر النمو",
  riskLevel: "مستوى المخاطر",
  marketTrend: "اتجاه السوق",
  confidenceScore: "درجة الثقة",
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
  stable: "مستقر",
  trending: "صاعد",

  aboutProperty: "عن العقار",
  readMore: "اقرأ المزيد",
  readLess: "عرض أقل",

  locationMap: "الموقع",
  viewOnMap: "عرض على الخريطة",
  city: "المدينة",
  country: "الدولة",

  listedBy: "مُدرج بواسطة",
  verifiedPartner: "شريك موثق",
  viewPartnerProfile: "عرض الملف",
  listings: "عقار",

  propertyVideoTour: "جولة فيديو للعقار",
  watchVideo: "شاهد الفيديو",
  virtualTour: "جولة افتراضية متاحة",

  similarProperties: "عقارات مشابهة",
  youMayAlsoLike: "قد يعجبك أيضاً",

  interestedInProperty: "هل أنت مهتم بهذا العقار؟",
  getInTouch: "تواصل مع شريكنا الموثق.",
  rentalYield: "العائد الإيجاري",

  villas: "فيلات",
  apartments: "شقق",
  lands: "أراضٍ",
  commercial: "تجاري",

  typeVilla: "فيلا",
  typeApartment: "شقة",
  typeLand: "أرض",
  typeCommercial: "عقار تجاري",

  countryAll: "الكل",
  countryTr: "تركيا",
  countrySa: "السعودية",
  countryAe: "الإمارات",
  countryUs: "الولايات المتحدة",

  home: "الرئيسية",
  exploreTab: "استكشاف",
  favorites: "المفضلة",
  profile: "الملف",
  reels: "فيديو",
  news: "أخبار",

  exploreTitle: "استكشاف",
  exploreSubtitle: "اعثر على استثمارك القادم",
  searchPlaceholder: "ابحث بالمدينة أو الدولة أو العقار",
  propertiesFound: "عقار متاح",
  propertyFound: "عقار متاح",
  clearSearch: "مسح البحث",
  noResultsSubtitle: "جرّب دولة أخرى أو كلمة بحث مختلفة.",

  favoritesTitle: "المفضلة",
  favoritesSubtitle: "العقارات التي حفظتها",
  savedProperties: "العقارات المحفوظة",
  favoritesEmptyTitle: "لا توجد عقارات محفوظة بعد",
  favoritesEmptySubtitle:
    "اضغط على أيقونة القلب في أي عقار للوصول إليه بسرعة من هنا.",
  browseProperties: "تصفح العقارات",

  profileTitle: "الملف الشخصي",
  guestUser: "ضيف",
  guestUserSubtitle: "تصفح بدون حساب",
  signInPrompt: "سجّل الدخول لحفظ العقارات ومتابعة محفظتك",
  preferences: "التفضيلات",
  language: "اللغة",
  selectLanguage: "اختر اللغة",
  aboutSection: "حول التطبيق",
  aboutApp: "حول ميزان إنفست",
  appVersion: "الإصدار",
  termsOfService: "شروط الاستخدام",
  privacyPolicy: "سياسة الخصوصية",
  helpCenter: "مركز المساعدة",
  contactUs: "تواصل معنا",
  forPartners: "للشركاء",
  partnerPortalAccess: "بوابة الشريك",
  partnerPortalDescription: "إدارة العقارات وعرض التحليلات",

  guestModeActive: "تصفح كضيف",
  exploreListings: "استكشف العقارات",

  notifications: "الإشعارات",
  noNotifications: "لا توجد إشعارات جديدة",

  comingSoon: "قريباً",
  featureComingSoon: "ستتوفر هذه الميزة في النسخة الكاملة.",
  contactPartnerMessage: "سيتواصل فريقنا معك لربطك بالشريك الموثق قريباً.",

  error: "خطأ",
  success: "تم بنجاح",
  loading: "جاري التحميل...",
  tryAgain: "حاول مجدداً",
  noResults: "لا توجد نتائج",
  networkError: "خطأ في الشبكة. تحقق من اتصالك.",

  cityMadinah: "المدينة المنورة",
  cityRiyadh: "الرياض",
  cityJeddah: "جدة",
  cityIstanbul: "إسطنبول",
  cityAntalya: "أنطاليا",
  cityDubai: "دبي",

  featuredProjects: "مشاريع مختارة",
  featuredProjectsSubtitle: "اختارها محللونا بعناية",
  madinahProjects: "مشاريع المدينة المنورة",
  madinahProjectsSubtitle: "قريبة من المسجد النبوي",
  newListings: "أحدث العروض",
  newListingsSubtitle: "أُضيفت هذا الشهر",
  highPotential: "إمكانات استثمارية عالية",
  highPotentialSubtitle: "أعلى عائد متوقع",
  verifiedPartnersSubtitle: "مطورون ووكالات مرخصة",
  recentlyViewed: "شاهدتها مؤخراً",
  recentlyViewedSubtitle: "أكمل من حيث توقفت",
  popularCities: "مدن مطلوبة",
  popularCitiesSubtitle: "حيث يشتري المستثمرون",
  objectsShort: "عقاراً",

  prop1Title: "مساكن بوابة الحرم",
  prop2Title: "فيلا حدائق المدينة",
  prop3Title: "مجمع قباء التجاري",
  prop4Title: "أرض استثمارية شمال المدينة",
  prop5Title: "أجنحة أنوار المدينة",
  prop6Title: "مساكن أفق الرياض",
  prop7Title: "فيلا بوابة الدرعية",
  prop8Title: "مكاتب برج كافد المالي",
  prop9Title: "أرض تطوير شمال الرياض",
  prop10Title: "شقق كورنيش جدة",
  prop11Title: "فيلا مرسى البحر الأحمر",
  prop12Title: "وحدات منتزه جدة للأعمال",
  prop13Title: "فيلا قمة البوسفور",
  prop14Title: "مساكن ليفنت بانوراما",
  prop15Title: "أرض لوجستية قرب مطار إسطنبول",
  prop16Title: "متجر غالاتا الفاخر",
  prop17Title: "مساكن أنطاليا بإطلالة بحرية",
  prop18Title: "فيلا كاليتشي التراثية",
  prop19Title: "أرض ساحلية في أنطاليا",
  prop20Title: "أجنحة فندقية بشاطئ لارا",
  prop21Title: "بنتهاوس نخلة جميرا",
  prop22Title: "مكاتب برج وسط دبي",
  prop23Title: "مساكن مرسى دبي",
  prop24Title: "أرض استثمارية في دبي الجنوب",

  descHolyCity:
    "سكن على مسافة قريبة سيراً من المسجد النبوي، بمعايير يتوقعها الحجاج والمقيمون على حد سواء. عمارة إسلامية معاصرة وتشطيبات راقية وخدمة استقبال على مدار الساعة ومواقف تحت الأرض.\n\nيغذي الطلب هنا موسم سياحة دينية ممتد طوال العام، وهو ما يحافظ تاريخياً على إشغال مرتفع ودخل إيجاري مستقر في كل موسم.",
  descLuxuryVilla:
    "فيلا خاصة صُممت حول الضوء والاتساع وحياة العائلة. واجهات زجاجية ممتدة وأرضيات حجر طبيعي وحديقة منسقة ومسبح مُدفأ داخل مجمع مسور وآمن.\n\nالمعروض بهذا المستوى محدود، وهو ما يدعم قيمة إعادة البيع ومستوى الإيجار طويل الأجل معاً.",
  descCityApartment:
    "شقة عصرية في قلب المدينة على بُعد دقائق من منطقة الأعمال ووسائل النقل والمدارس الدولية. تجهيزات منزل ذكي وخدمة استقبال وصالة رياضية خاصة بالسكان.\n\nنقطة دخول واضحة لمن يبحث عن سيولة وقاعدة مستأجرين تتجدد باستمرار.",
  descInvestmentLand:
    "قطعة أرض بصك داخل ممر تطوير نشط، الخدمات موصولة حتى حدودها والتصنيف جاهز للاستخدام السكني أو المختلط.\n\nالأرض لا تدرّ إيجاراً، والعائد يأتي من ارتفاع القيمة مع اكتمال البنية التحتية المحيطة. عادةً ما تكون الأعلى نمواً والأكثر حاجة إلى الصبر في المحفظة.",
  descCommercial:
    "أصل تجاري مدرّ للدخل بمستأجرين على عقود متعددة السنوات. تجزئة في الدور الأرضي ومكاتب في الأدوار العليا ومواقف مخصصة وإدارة كاملة للمبنى.\n\nالعقود التجارية أطول ومرتبطة بمؤشر، ما يجعل التدفق النقدي أكثر قابلية للتوقع من السكني عبر الدورة الكاملة.",
  descSeafront:
    "سكن على الواجهة البحرية بإطلالة مفتوحة ووصول مباشر إلى الشاطئ ومرافق بمستوى المنتجعات تشمل المسابح والسبا ومراسي خاصة.\n\nالمعروض الساحلي محدود بطبيعته، وطلب الإيجار القصير يبلغ ذروته في الموسم — تركيبة تدعم العائد والقيمة على المدى الطويل.",

  whyInvest: "لماذا الاستثمار هنا",
  whyInvestSubtitle: "ما رصده محللونا في هذا العرض",
  whyVilla1: "معروض محدود من الفلل المماثلة في الحي",
  whyVilla2: "المستأجرون المميزون يوقعون عقوداً أطول وبأسعار أعلى",
  whyVilla3: "مكوّن الأرض يحمي القيمة عبر دورات السوق",
  whyApartment1: "طلب متواصل من المهنيين والعائلات",
  whyApartment2: "أسهل فئة أصول لإعادة البيع عند الحاجة إلى سيولة",
  whyApartment3: "تكاليف الإدارة والصيانة تبقى قابلة للتوقع",
  whyLand1: "أعلى إمكانات لارتفاع القيمة في المحفظة",
  whyLand2: "لا مستأجرين ولا صيانة ولا مصاريف تشغيل",
  whyLand3: "البنية التحتية المجاورة قيد الإنشاء فعلياً",
  whyCommercial1: "عقود متعددة السنوات بزيادات إيجار مرتبطة بمؤشر",
  whyCommercial2: "عائد أعلى من متوسط السكني في هذا السوق",
  whyCommercial3: "المستأجر يتحمل معظم تكاليف التشغيل والتجهيز",

  investmentScore: "مؤشر الاستثمار",
  investmentScoreHint: "يجمع العائد والنمو والمخاطر وسجل الشريك",

  currency: "العملة",
  selectCurrency: "اختر العملة",
  demoExchangeRate: "سعر صرف تجريبي",
  demoRateNote: "الأسعار قيم تجريبية ثابتة وليست أسعار سوق حية.",

  settings: "الإعدادات",
  appearance: "المظهر",
  selectAppearance: "اختر المظهر",
  themeLight: "فاتح",
  themeDark: "داكن",
  themeSystem: "حسب النظام",

  viewListing: "عرض العقار",
  soundOn: "الصوت مفعّل",
  soundOff: "الصوت مكتوم",
  reel1Title: "جولة في فيلا بالمدينة",
  reel1Caption: "خمس غرف نوم وحديقة خاصة وعشر دقائق من المسجد النبوي.",
  reel2Title: "مشروع جديد في الرياض",
  reel2Caption: "منطقة رؤية 2030 — أول برج سكني مطروح الآن.",
  reel3Title: "شقة بإطلالة على البوسفور",
  reel3Caption: "حياة على الواجهة المائية في الجانب الأوروبي من إسطنبول.",
  reel4Title: "مشروع استثماري في دبي",
  reel4Caption: "بنتهاوس في نخلة جميرا بإطلالة 360° على الخليج.",
  reel5Title: "تحليل الاستثمار في الأراضي",
  reel5Caption: "كيف ترتفع قيمة أرض التطوير أثناء إنشاء البنية التحتية.",
  reel6Title: "جولة في المجمع التجاري",
  reel6Caption: "مساحات تجزئة ومكاتب مؤجرة بالكامل على طريق قباء.",

  markAllRead: "تعليم الكل كمقروء",
  allNotificationsRead: "لا جديد لديك",
  unreadLabel: "جديد",
  notifNewProjectTitle: "أُضيف مشروع جديد",
  notifNewProjectBody: "أجنحة أنوار المدينة متاحة الآن للحجز.",
  notifPriceUpdateTitle: "تحديث السعر",
  notifPriceUpdateBody: "تغيّر السعر المطلوب لعقار في مفضلتك.",
  notifPartnerReplyTitle: "رد الشريك",
  notifPartnerReplyBody: "أجاب Aegean Premier على استفسارك حول فيلا البوسفور.",
  notifMadinahTitle: "استثمار جديد في المدينة",
  notifMadinahBody: "نُشر مجمع قباء التجاري بعائد متوقع 10.4%.",
  notifVideoAddedTitle: "أُضيف فيديو جديد",
  notifVideoAddedBody: "أصبح لعقار محفوظ لديك جولة كاملة في المشروع.",
  notifMarketReportTitle: "تقرير السوق الشهري",
  notifMarketReportBody: "توقعات عقارات الخليج وتركيا لهذا الربع.",
  timeNow: "الآن",
  timeMinutes: "د",
  timeHours: "س",
  timeDays: "ي",

  photos: "الصور",
  zoomHint: "قرّب بإصبعين أو انقر مرتين",
  videoTourSubtitle: "تجوّل في المشروع قبل السفر",
  playVideo: "تشغيل",
  pauseVideo: "إيقاف مؤقت",

  filters: "التصفية",
  applyFilters: "عرض النتائج",
  resetFilters: "إعادة تعيين",
  priceRange: "نطاق السعر",
  propertyTypeFilter: "نوع العقار",
  cityFilter: "المدينة",
  countryFilter: "الدولة",
  verifiedOnly: "الشركاء الموثوقون فقط",
  minInvestmentScore: "الحد الأدنى للمؤشر",
  anyValue: "الكل",
  activeFilters: "نشط",
  upTo: "حتى",

  whatsappContact: "واتساب",
  callPartner: "اتصال",
  imInterested: "أنا مهتم",
  requestSent: "تم إرسال الطلب",
  requestSentBody: "سيتواصل معك الشريك خلال يوم عمل واحد.",
  demoAction: "وضع تجريبي",
  demoActionBody: "هذا الإجراء محاكاة لأغراض العرض التقديمي.",
  contactDetails: "بيانات التواصل",
  contactDetailsHint: "اترك رقم هاتف أو بريداً إلكترونياً ليتمكن فريق Mizan Invest من الرد.",
  name: "الاسم",
  phone: "الهاتف",
  message: "الرسالة",
  optional: "اختياري",
  submitRequest: "إرسال الطلب",
  phoneOrEmailRequired: "أدخل رقم هاتف أو بريداً إلكترونياً.",
  invalidPhoneNumber: "أدخل رقم هاتف دولياً صالحاً، مثل +966501234567.",
  invalidEmailAddress: "أدخل بريداً إلكترونياً صالحاً.",
  requestReceived: "تم استلام طلبك",
  requestReceivedBody: "سيتواصل فريق Mizan Invest معك قريباً.",
  leadReference: "المرجع",
  requestPreparationFailed: "تعذر تجهيز طلبك. يرجى المحاولة مجدداً.",
  companyWhatsAppUnavailable: "رقم WhatsApp الخاص بالشركة غير مهيأ بعد.",
  companyPhoneUnavailable: "رقم هاتف الشركة غير مهيأ بعد.",
  unableToOpenWhatsApp: "تم تسجيل طلبك، ولكن تعذر فتح WhatsApp.",
  unableToOpenPhone: "تم تسجيل طلبك، ولكن تعذر فتح تطبيق الهاتف.",

  perMonth: "/شهرياً",
  listedAgo: "نُشر",
  daysAgo: "يوماً",
  addedToFavorites: "أُضيف إلى المفضلة",
  removedFromFavorites: "أُزيل من المفضلة",
  propertyNotFound: "هذا العرض لم يعد متاحاً",
  backToHome: "العودة للرئيسية",
  investmentBasics: "المؤشرات الأساسية",

  partner1Description:
    "شريك حصري للمشاريع السكنية والتجارية الراقية حول المدينة المنورة، ويعمل فيها منذ 2009.",
  partner2Description:
    "شركة استثمار تركز على مناطق التطوير ضمن رؤية 2030 في الرياض والمنطقة الوسطى.",
  partner3Description:
    "متخصص في الساحل يغطي جدة وممر البحر الأحمر، من فلل المرسى إلى منتزهات الأعمال المؤجرة.",
  partner4Description:
    "مطوّر مشاريع فاخرة على الساحل التركي وفي إسطنبول، بسجل تسليم يتجاوز خمسة عشر عاماً.",
  partner5Description:
    "وكالة مقرها دبي تدير أصولاً سكنية ومكتبية متميزة لمستثمرين دوليين.",
};

/**
 * All translations organized by language.
 * Typed as Record<Language, TranslationDictionary> so every language
 * is guaranteed to expose exactly the same keys as `en`.
 */
export const translations: Record<Language, TranslationDictionary> = {
  en,
  tr,
  ru,
  ar,
};
