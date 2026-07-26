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

export type Language = 'en' | 'tr' | 'ru' | 'ar';

/**
 * Default language for the app.
 * The app must open in Russian on first launch.
 */
export const DEFAULT_LANGUAGE: Language = 'ru';

/**
 * Order used by the language switcher UI.
 */
export const LANGUAGE_ORDER: Language[] = ['ru', 'ar', 'en', 'tr'];

/**
 * Language display names (always shown in their own language)
 */
export const languageNames: Record<Language, string> = {
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
  ar: 'العربية',
};

/**
 * Short codes used by the compact language switcher
 */
export const languageCodes: Record<Language, string> = {
  en: 'EN',
  tr: 'TR',
  ru: 'RU',
  ar: 'AR',
};

/**
 * Languages that render right-to-left.
 * Full RTL layout support is planned for a later phase; this flag is
 * already exposed so screens can start opting in gradually.
 */
export const RTL_LANGUAGES: Language[] = ['ar'];

// ============================================
// ENGLISH — SOURCE OF TRUTH
// ============================================

const en = {
  // ----------------------------------------
  // APP BRANDING
  // ----------------------------------------
  appName: 'Mizan Invest',
  appSlogan: 'Global Real Estate Investments',

  // ----------------------------------------
  // ONBOARDING
  // ----------------------------------------
  onboarding1Badge: 'Verified Investments',
  onboarding1Title: 'Invest Beyond Borders',
  onboarding1Subtitle: 'Discover premium real estate opportunities across trusted global markets.',
  onboarding2Badge: 'AI Analysis',
  onboarding2Title: 'See The Numbers Before You Invest',
  onboarding2Subtitle: 'Estimated ROI, rental income, growth potential and investment insights.',
  onboarding3Badge: 'Trusted Partners',
  onboarding3Title: 'Every Opportunity Is Verified',
  onboarding3Subtitle: 'Only approved partners, developers and real estate professionals.',

  // ----------------------------------------
  // NAVIGATION
  // ----------------------------------------
  skip: 'Skip',
  next: 'Next',
  back: 'Back',
  getStarted: 'Get Started',
  seeAll: 'See all',
  viewAll: 'View all',
  explore: 'Explore',
  close: 'Close',
  cancel: 'Cancel',

  // ----------------------------------------
  // WELCOME SCREEN
  // ----------------------------------------
  welcomeTitle: 'Where Vision Meets Value',
  welcomeSubtitle: 'Join thousands of investors accessing premium global real estate opportunities.',
  continueAsGuest: 'Explore as Guest',
  investorLogin: 'Investor Login',
  partnerLogin: 'Partner Portal',
  partnerNote: 'Partner accounts require verification',

  // ----------------------------------------
  // AUTHENTICATION
  // ----------------------------------------
  email: 'Email',
  password: 'Password',
  login: 'Sign In',
  logout: 'Log Out',
  orContinueWith: 'or continue with',
  continueWithGoogle: 'Continue with Google',
  continueWithApple: 'Continue with Apple',
  forgotPassword: 'Forgot password?',
  welcomeBack: 'Welcome Back',
  signInSubtitle: 'Sign in to access your investment portfolio',
  createAccount: 'Create Account',
  alreadyHaveAccount: 'Already have an account?',

  // ----------------------------------------
  // PARTNER AUTHENTICATION
  // ----------------------------------------
  partnerPortalBadge: 'PARTNER PORTAL',
  partnerEmail: 'Partner Email',
  partnerLoginButton: 'Access Portal',
  requestPartnerAccess: 'Become a Partner',
  notPartnerYet: 'Not a partner yet?',
  partnerWelcome: 'Partner Portal',
  partnerSubtitle: 'Access your dashboard and manage listings',

  // ----------------------------------------
  // PARTNER DASHBOARD
  // ----------------------------------------
  partnerDashboard: 'Partner Dashboard',
  partnerDashboardSubtitle: 'Manage your listings and analytics',
  verifiedPartnerDemo: 'Verified Partner Access',
  activeListings: 'Active Listings',
  totalViews: 'Views',
  inquiries: 'Inquiries',
  totalValue: 'Total Value',
  addNewListing: 'Add New Listing',
  backToWelcome: 'Back to Welcome',

  // ----------------------------------------
  // HOME SCREEN
  // ----------------------------------------
  homeTitle: 'Mizan Invest',
  homeSubtitle: 'Global Real Estate',
  heroTitle: 'Discover Global Real Estate Opportunities',
  heroSubtitle: 'Verified properties, trusted partners and AI-powered investment insights.',
  exploreInvestments: 'Explore Investments',
  investorEdition: 'Investor Edition',

  // ----------------------------------------
  // SECTIONS
  // ----------------------------------------
  categories: 'Categories',
  featuredProperties: 'Featured Properties',
  handpickedInvestments: 'Handpicked investments',
  highYieldOpportunities: 'High Yield Opportunities',
  bestRoiPotential: 'Best ROI potential',
  aiInsights: 'AI Investment Insights',
  marketAnalysis: 'Market analysis preview',
  verifiedPartners: 'Verified Partners',
  trustedProfessionals: 'Trusted real estate professionals',
  allPartners: 'All partners',

  // ----------------------------------------
  // PROPERTY DETAILS
  // ----------------------------------------
  verified: 'Verified',
  verifiedProperty: 'Verified Property',
  roi: 'ROI',
  price: 'Price',
  location: 'Location',
  propertyType: 'Property Type',
  favorite: 'Favorite',
  contactPartner: 'Contact Partner',
  scheduleViewing: 'Schedule Viewing',
  saveProperty: 'Save Property',
  saved: 'Saved',
  share: 'Share',
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',

  // Property Features
  propertyFeatures: 'Property Features',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  area: 'Area',
  parking: 'Parking',
  pool: 'Pool',
  security: '24/7 Security',
  garden: 'Garden',
  seaView: 'Sea View',
  yearBuilt: 'Year Built',

  // AI Analysis Section
  aiInvestmentInsights: 'AI Investment Insights',
  aiDisclaimer: 'AI-generated estimates for demonstration purposes.',
  estimatedRoi: 'Estimated ROI',
  rentalIncome: 'Rental Income',
  monthlyIncome: 'Monthly Income',
  amortization: 'Amortization',
  amortizationPeriod: 'Amortization Period',
  years: 'years',
  growthScore: 'Growth Score',
  riskLevel: 'Risk Level',
  marketTrend: 'Market Trend',
  confidenceScore: 'Confidence',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  stable: 'Stable',
  trending: 'Trending',

  // Property Description
  aboutProperty: 'About This Property',
  readMore: 'Read More',
  readLess: 'Read Less',

  // Location Section
  locationMap: 'Location',
  viewOnMap: 'View on Map',
  city: 'City',
  country: 'Country',

  // Partner Section
  listedBy: 'Listed By',
  verifiedPartner: 'Verified Partner',
  viewPartnerProfile: 'View Profile',
  listings: 'listings',

  // Video Section
  propertyVideoTour: 'Property Video Tour',
  watchVideo: 'Watch Video',
  virtualTour: 'Virtual Tour Available',

  // Similar Properties
  similarProperties: 'Similar Properties',
  youMayAlsoLike: 'You may also like',

  // CTA
  interestedInProperty: 'Interested in this property?',
  getInTouch: 'Get in touch with our verified partner.',
  rentalYield: 'Rental Yield',

  // ----------------------------------------
  // CATEGORIES (keys match mockData category ids)
  // ----------------------------------------
  villas: 'Villas',
  apartments: 'Apartments',
  lands: 'Lands',
  commercial: 'Commercial',

  // Singular labels used on the property type badge
  typeVilla: 'Villa',
  typeApartment: 'Apartment',
  typeLand: 'Land',
  typeCommercial: 'Commercial',

  // ----------------------------------------
  // COUNTRIES (keys match mockData country ids)
  // ----------------------------------------
  countryAll: 'All',
  countryTr: 'Turkey',
  countrySa: 'Saudi Arabia',
  countryAe: 'UAE',
  countryUs: 'USA',

  // ----------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------
  home: 'Home',
  exploreTab: 'Explore',
  favorites: 'Favorites',
  profile: 'Profile',
  reels: 'Reels',
  news: 'News',

  // ----------------------------------------
  // EXPLORE SCREEN
  // ----------------------------------------
  exploreTitle: 'Explore',
  exploreSubtitle: 'Find your next investment',
  searchPlaceholder: 'Search city, country or property',
  propertiesFound: 'properties found',
  propertyFound: 'property found',
  clearSearch: 'Clear search',
  noResultsSubtitle: 'Try a different country or search term.',

  // ----------------------------------------
  // FAVORITES SCREEN
  // ----------------------------------------
  favoritesTitle: 'Favorites',
  favoritesSubtitle: 'Properties you saved',
  savedProperties: 'Saved Properties',
  favoritesEmptyTitle: 'No saved properties yet',
  favoritesEmptySubtitle: 'Tap the heart icon on any property to keep it here for quick access.',
  browseProperties: 'Browse Properties',

  // ----------------------------------------
  // PROFILE SCREEN
  // ----------------------------------------
  profileTitle: 'Profile',
  guestUser: 'Guest',
  guestUserSubtitle: 'Browsing without an account',
  signInPrompt: 'Sign in to save properties and track your portfolio',
  preferences: 'Preferences',
  language: 'Language',
  selectLanguage: 'Select Language',
  aboutSection: 'About',
  aboutApp: 'About Mizan Invest',
  appVersion: 'Version',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  helpCenter: 'Help Center',
  contactUs: 'Contact Us',
  forPartners: 'For Partners',
  partnerPortalAccess: 'Partner Portal',
  partnerPortalDescription: 'Manage listings and view analytics',

  // ----------------------------------------
  // USER STATES
  // ----------------------------------------
  guestModeActive: 'Exploring as Guest',
  exploreListings: 'Explore Listings',

  // ----------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------
  notifications: 'Notifications',
  noNotifications: 'No new notifications',

  // ----------------------------------------
  // DEMO PLACEHOLDERS
  // ----------------------------------------
  comingSoon: 'Coming Soon',
  featureComingSoon: 'This feature will be available in the full version.',
  contactPartnerMessage: 'Our team will connect you with the verified partner shortly.',

  // ----------------------------------------
  // ERRORS & MESSAGES
  // ----------------------------------------
  error: 'Error',
  success: 'Success',
  loading: 'Loading...',
  tryAgain: 'Try Again',
  noResults: 'No results found',
  networkError: 'Network error. Please check your connection.',
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
  appName: 'Mizan Invest',
  appSlogan: 'Global Gayrimenkul Yatırımları',

  onboarding1Badge: 'Doğrulanmış Yatırımlar',
  onboarding1Title: 'Sınırların Ötesine Yatırım Yapın',
  onboarding1Subtitle: 'Güvenilir global pazarlarda premium gayrimenkul fırsatlarını keşfedin.',
  onboarding2Badge: 'Yapay Zeka Analizi',
  onboarding2Title: 'Yatırım Yapmadan Önce Rakamları Görün',
  onboarding2Subtitle: 'Tahmini ROI, kira geliri, büyüme potansiyeli ve yatırım içgörüleri.',
  onboarding3Badge: 'Güvenilir Ortaklar',
  onboarding3Title: 'Her Fırsat Doğrulanmış',
  onboarding3Subtitle: 'Sadece onaylı ortaklar, geliştiriciler ve gayrimenkul profesyonelleri.',

  skip: 'Atla',
  next: 'İleri',
  back: 'Geri',
  getStarted: 'Başla',
  seeAll: 'Tümünü gör',
  viewAll: 'Tümünü gör',
  explore: 'Keşfet',
  close: 'Kapat',
  cancel: 'Vazgeç',

  welcomeTitle: 'Vizyon ve Değerin Buluştuğu Yer',
  welcomeSubtitle: 'Premium global gayrimenkul fırsatlarına erişen binlerce yatırımcıya katılın.',
  continueAsGuest: 'Misafir Olarak Keşfet',
  investorLogin: 'Yatırımcı Girişi',
  partnerLogin: 'Partner Portalı',
  partnerNote: 'Partner hesapları doğrulama gerektirir',

  email: 'E-posta',
  password: 'Şifre',
  login: 'Giriş Yap',
  logout: 'Çıkış Yap',
  orContinueWith: 'veya şununla devam edin',
  continueWithGoogle: 'Google ile Devam Et',
  continueWithApple: 'Apple ile Devam Et',
  forgotPassword: 'Şifremi unuttum',
  welcomeBack: 'Tekrar Hoş Geldiniz',
  signInSubtitle: 'Yatırım portföyünüze erişmek için giriş yapın',
  createAccount: 'Hesap Oluştur',
  alreadyHaveAccount: 'Zaten hesabınız var mı?',

  partnerPortalBadge: 'PARTNER PORTALI',
  partnerEmail: 'Partner E-posta',
  partnerLoginButton: 'Portala Eriş',
  requestPartnerAccess: 'Partner Ol',
  notPartnerYet: 'Henüz partner değil misiniz?',
  partnerWelcome: 'Partner Portalı',
  partnerSubtitle: 'Panelinize erişin ve ilanlarınızı yönetin',

  partnerDashboard: 'Partner Paneli',
  partnerDashboardSubtitle: 'İlanlarınızı ve performansınızı yönetin',
  verifiedPartnerDemo: 'Doğrulanmış Partner Erişimi',
  activeListings: 'Aktif İlan',
  totalViews: 'Görüntülenme',
  inquiries: 'Talep',
  totalValue: 'Toplam Değer',
  addNewListing: 'Yeni İlan Ekle',
  backToWelcome: 'Karşılamaya Dön',

  homeTitle: 'Mizan Invest',
  homeSubtitle: 'Global Gayrimenkul',
  heroTitle: 'Global Gayrimenkul Fırsatlarını Keşfedin',
  heroSubtitle: 'Doğrulanmış mülkler, güvenilir ortaklar ve yapay zeka destekli yatırım içgörüleri.',
  exploreInvestments: 'Yatırımları Keşfet',
  investorEdition: 'Yatırımcı Sürümü',

  categories: 'Kategoriler',
  featuredProperties: 'Öne Çıkan Mülkler',
  handpickedInvestments: 'Seçilmiş yatırımlar',
  highYieldOpportunities: 'Yüksek Getirili Fırsatlar',
  bestRoiPotential: 'En iyi ROI potansiyeli',
  aiInsights: 'AI Yatırım Analizleri',
  marketAnalysis: 'Piyasa analizi önizleme',
  verifiedPartners: 'Doğrulanmış Ortaklar',
  trustedProfessionals: 'Güvenilir gayrimenkul profesyonelleri',
  allPartners: 'Tüm ortaklar',

  verified: 'Doğrulanmış',
  verifiedProperty: 'Doğrulanmış Mülk',
  roi: 'ROI',
  price: 'Fiyat',
  location: 'Konum',
  propertyType: 'Mülk Tipi',
  favorite: 'Favori',
  contactPartner: 'Ortakla İletişime Geç',
  scheduleViewing: 'Görüşme Planla',
  saveProperty: 'Kaydet',
  saved: 'Kaydedildi',
  share: 'Paylaş',
  available: 'Satışta',
  reserved: 'Rezerve',
  sold: 'Satıldı',

  propertyFeatures: 'Mülk Özellikleri',
  bedrooms: 'Yatak Odası',
  bathrooms: 'Banyo',
  area: 'Alan',
  parking: 'Otopark',
  pool: 'Havuz',
  security: '7/24 Güvenlik',
  garden: 'Bahçe',
  seaView: 'Deniz Manzarası',
  yearBuilt: 'Yapım Yılı',

  aiInvestmentInsights: 'AI Yatırım Analizi',
  aiDisclaimer: 'Yapay zeka tarafından oluşturulmuş, tanıtım amaçlı tahmini değerlerdir.',
  estimatedRoi: 'Tahmini Getiri',
  rentalIncome: 'Kira Geliri',
  monthlyIncome: 'Aylık Gelir',
  amortization: 'Amortisman',
  amortizationPeriod: 'Amortisman Süresi',
  years: 'yıl',
  growthScore: 'Büyüme Puanı',
  riskLevel: 'Risk Seviyesi',
  marketTrend: 'Piyasa Eğilimi',
  confidenceScore: 'Güven Skoru',
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  stable: 'Sabit',
  trending: 'Yükselişte',

  aboutProperty: 'Mülk Hakkında',
  readMore: 'Devamını Oku',
  readLess: 'Daha Az Göster',

  locationMap: 'Konum',
  viewOnMap: 'Haritada Gör',
  city: 'Şehir',
  country: 'Ülke',

  listedBy: 'İlan Sahibi',
  verifiedPartner: 'Doğrulanmış Partner',
  viewPartnerProfile: 'Profili Gör',
  listings: 'ilan',

  propertyVideoTour: 'Mülk Video Turu',
  watchVideo: 'Videoyu İzle',
  virtualTour: 'Sanal Tur Mevcut',

  similarProperties: 'Benzer Mülkler',
  youMayAlsoLike: 'Bunlar da ilginizi çekebilir',

  interestedInProperty: 'Bu mülkle ilgileniyor musunuz?',
  getInTouch: 'Doğrulanmış partnerimizle iletişime geçin.',
  rentalYield: 'Kira Getirisi',

  villas: 'Villalar',
  apartments: 'Daireler',
  lands: 'Araziler',
  commercial: 'Ticari',

  typeVilla: 'Villa',
  typeApartment: 'Daire',
  typeLand: 'Arazi',
  typeCommercial: 'Ticari',

  countryAll: 'Tümü',
  countryTr: 'Türkiye',
  countrySa: 'Suudi Arabistan',
  countryAe: 'BAE',
  countryUs: 'ABD',

  home: 'Ana Sayfa',
  exploreTab: 'Keşfet',
  favorites: 'Favoriler',
  profile: 'Profil',
  reels: 'Videolar',
  news: 'Haberler',

  exploreTitle: 'Keşfet',
  exploreSubtitle: 'Bir sonraki yatırımınızı bulun',
  searchPlaceholder: 'Şehir, ülke veya mülk ara',
  propertiesFound: 'mülk bulundu',
  propertyFound: 'mülk bulundu',
  clearSearch: 'Aramayı temizle',
  noResultsSubtitle: 'Farklı bir ülke veya arama terimi deneyin.',

  favoritesTitle: 'Favoriler',
  favoritesSubtitle: 'Kaydettiğiniz mülkler',
  savedProperties: 'Kaydedilen Mülkler',
  favoritesEmptyTitle: 'Henüz kaydedilmiş mülk yok',
  favoritesEmptySubtitle: 'Hızlı erişim için beğendiğiniz mülklerdeki kalp simgesine dokunun.',
  browseProperties: 'Mülkleri İncele',

  profileTitle: 'Profil',
  guestUser: 'Misafir',
  guestUserSubtitle: 'Hesapsız olarak geziniyorsunuz',
  signInPrompt: 'Mülk kaydetmek ve portföyünüzü takip etmek için giriş yapın',
  preferences: 'Tercihler',
  language: 'Dil',
  selectLanguage: 'Dil Seçin',
  aboutSection: 'Hakkında',
  aboutApp: 'Mizan Invest Hakkında',
  appVersion: 'Sürüm',
  termsOfService: 'Kullanım Koşulları',
  privacyPolicy: 'Gizlilik Politikası',
  helpCenter: 'Yardım Merkezi',
  contactUs: 'Bize Ulaşın',
  forPartners: 'Partnerler İçin',
  partnerPortalAccess: 'Partner Portalı',
  partnerPortalDescription: 'İlanları yönetin ve performansı görüntüleyin',

  guestModeActive: 'Misafir Olarak Keşfediliyor',
  exploreListings: 'İlanları Keşfet',

  notifications: 'Bildirimler',
  noNotifications: 'Yeni bildirim yok',

  comingSoon: 'Çok Yakında',
  featureComingSoon: 'Bu özellik tam sürümde kullanıma sunulacak.',
  contactPartnerMessage: 'Ekibimiz sizi kısa süre içinde doğrulanmış partnerle buluşturacak.',

  error: 'Hata',
  success: 'Başarılı',
  loading: 'Yükleniyor...',
  tryAgain: 'Tekrar Dene',
  noResults: 'Sonuç bulunamadı',
  networkError: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
};

// ============================================
// RUSSIAN (default)
// ============================================

const ru: TranslationDictionary = {
  appName: 'Mizan Invest',
  appSlogan: 'Глобальные инвестиции в недвижимость',

  onboarding1Badge: 'Проверенные инвестиции',
  onboarding1Title: 'Инвестируйте за пределами границ',
  onboarding1Subtitle: 'Откройте премиальные объекты недвижимости на надёжных мировых рынках.',
  onboarding2Badge: 'Аналитика ИИ',
  onboarding2Title: 'Смотрите цифры до вложения средств',
  onboarding2Subtitle: 'Ожидаемая доходность, арендный доход, потенциал роста и инвестиционная аналитика.',
  onboarding3Badge: 'Надёжные партнёры',
  onboarding3Title: 'Каждый объект проверен',
  onboarding3Subtitle: 'Только аккредитованные партнёры, застройщики и профессионалы рынка недвижимости.',

  skip: 'Пропустить',
  next: 'Далее',
  back: 'Назад',
  getStarted: 'Начать',
  seeAll: 'Смотреть все',
  viewAll: 'Смотреть все',
  explore: 'Смотреть',
  close: 'Закрыть',
  cancel: 'Отмена',

  welcomeTitle: 'Где видение встречает ценность',
  welcomeSubtitle: 'Присоединяйтесь к тысячам инвесторов с доступом к премиальной мировой недвижимости.',
  continueAsGuest: 'Продолжить как гость',
  investorLogin: 'Вход для инвестора',
  partnerLogin: 'Портал партнёра',
  partnerNote: 'Аккаунты партнёров проходят верификацию',

  email: 'Эл. почта',
  password: 'Пароль',
  login: 'Войти',
  logout: 'Выйти',
  orContinueWith: 'или продолжить через',
  continueWithGoogle: 'Продолжить с Google',
  continueWithApple: 'Продолжить с Apple',
  forgotPassword: 'Забыли пароль?',
  welcomeBack: 'С возвращением',
  signInSubtitle: 'Войдите, чтобы открыть свой инвестиционный портфель',
  createAccount: 'Создать аккаунт',
  alreadyHaveAccount: 'Уже есть аккаунт?',

  partnerPortalBadge: 'ПОРТАЛ ПАРТНЁРА',
  partnerEmail: 'Эл. почта партнёра',
  partnerLoginButton: 'Войти в портал',
  requestPartnerAccess: 'Стать партнёром',
  notPartnerYet: 'Ещё не партнёр?',
  partnerWelcome: 'Портал партнёра',
  partnerSubtitle: 'Доступ к панели и управление объектами',

  partnerDashboard: 'Панель партнёра',
  partnerDashboardSubtitle: 'Управляйте объектами и аналитикой',
  verifiedPartnerDemo: 'Доступ подтверждённого партнёра',
  activeListings: 'Активных объектов',
  totalViews: 'Просмотров',
  inquiries: 'Заявок',
  totalValue: 'Общая стоимость',
  addNewListing: 'Добавить объект',
  backToWelcome: 'Вернуться на главный экран',

  homeTitle: 'Mizan Invest',
  homeSubtitle: 'Мировая недвижимость',
  heroTitle: 'Откройте глобальные возможности недвижимости',
  heroSubtitle: 'Проверенные объекты, надёжные партнёры и инвестиционная аналитика на основе ИИ.',
  exploreInvestments: 'Смотреть инвестиции',
  investorEdition: 'Издание для инвесторов',

  categories: 'Категории',
  featuredProperties: 'Избранные объекты',
  handpickedInvestments: 'Отобранные инвестиции',
  highYieldOpportunities: 'Высокодоходные объекты',
  bestRoiPotential: 'Лучший потенциал доходности',
  aiInsights: 'Инвестиционная аналитика ИИ',
  marketAnalysis: 'Предпросмотр анализа рынка',
  verifiedPartners: 'Проверенные партнёры',
  trustedProfessionals: 'Надёжные профессионалы рынка недвижимости',
  allPartners: 'Все партнёры',

  verified: 'Проверено',
  verifiedProperty: 'Проверенный объект',
  roi: 'ROI',
  price: 'Цена',
  location: 'Расположение',
  propertyType: 'Тип объекта',
  favorite: 'В избранное',
  contactPartner: 'Связаться с партнёром',
  scheduleViewing: 'Записаться на просмотр',
  saveProperty: 'Сохранить',
  saved: 'Сохранено',
  share: 'Поделиться',
  available: 'Доступен',
  reserved: 'Забронирован',
  sold: 'Продан',

  propertyFeatures: 'Характеристики объекта',
  bedrooms: 'Спальни',
  bathrooms: 'Санузлы',
  area: 'Площадь',
  parking: 'Парковка',
  pool: 'Бассейн',
  security: 'Охрана 24/7',
  garden: 'Сад',
  seaView: 'Вид на море',
  yearBuilt: 'Год постройки',

  aiInvestmentInsights: 'Инвестиционная аналитика ИИ',
  aiDisclaimer: 'Оценки сформированы ИИ и приведены в демонстрационных целях.',
  estimatedRoi: 'Ожидаемая доходность',
  rentalIncome: 'Арендный доход',
  monthlyIncome: 'Ежемесячный доход',
  amortization: 'Окупаемость',
  amortizationPeriod: 'Срок окупаемости',
  years: 'лет',
  growthScore: 'Потенциал роста',
  riskLevel: 'Уровень риска',
  marketTrend: 'Динамика рынка',
  confidenceScore: 'Достоверность',
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  stable: 'Стабильно',
  trending: 'Рост',

  aboutProperty: 'Об объекте',
  readMore: 'Подробнее',
  readLess: 'Свернуть',

  locationMap: 'Расположение',
  viewOnMap: 'Показать на карте',
  city: 'Город',
  country: 'Страна',

  listedBy: 'Объект представляет',
  verifiedPartner: 'Проверенный партнёр',
  viewPartnerProfile: 'Профиль партнёра',
  listings: 'объектов',

  propertyVideoTour: 'Видеотур по объекту',
  watchVideo: 'Смотреть видео',
  virtualTour: 'Доступен виртуальный тур',

  similarProperties: 'Похожие объекты',
  youMayAlsoLike: 'Также может подойти',

  interestedInProperty: 'Заинтересовал объект?',
  getInTouch: 'Свяжитесь с нашим проверенным партнёром.',
  rentalYield: 'Арендная доходность',

  villas: 'Виллы',
  apartments: 'Квартиры',
  lands: 'Земельные участки',
  commercial: 'Коммерческая',

  typeVilla: 'Вилла',
  typeApartment: 'Квартира',
  typeLand: 'Земельный участок',
  typeCommercial: 'Коммерческий объект',

  countryAll: 'Все',
  countryTr: 'Турция',
  countrySa: 'Саудовская Аравия',
  countryAe: 'ОАЭ',
  countryUs: 'США',

  home: 'Главная',
  exploreTab: 'Поиск',
  favorites: 'Избранное',
  profile: 'Профиль',
  reels: 'Видео',
  news: 'Новости',

  exploreTitle: 'Поиск',
  exploreSubtitle: 'Найдите свою следующую инвестицию',
  searchPlaceholder: 'Город, страна или название объекта',
  propertiesFound: 'объектов найдено',
  propertyFound: 'объект найден',
  clearSearch: 'Очистить поиск',
  noResultsSubtitle: 'Попробуйте другую страну или измените запрос.',

  favoritesTitle: 'Избранное',
  favoritesSubtitle: 'Сохранённые вами объекты',
  savedProperties: 'Сохранённые объекты',
  favoritesEmptyTitle: 'Пока нет сохранённых объектов',
  favoritesEmptySubtitle: 'Нажмите на значок сердца у объекта, чтобы вернуться к нему в один клик.',
  browseProperties: 'Перейти к объектам',

  profileTitle: 'Профиль',
  guestUser: 'Гость',
  guestUserSubtitle: 'Просмотр без аккаунта',
  signInPrompt: 'Войдите, чтобы сохранять объекты и вести портфель',
  preferences: 'Настройки',
  language: 'Язык',
  selectLanguage: 'Выберите язык',
  aboutSection: 'О приложении',
  aboutApp: 'О Mizan Invest',
  appVersion: 'Версия',
  termsOfService: 'Условия использования',
  privacyPolicy: 'Политика конфиденциальности',
  helpCenter: 'Центр поддержки',
  contactUs: 'Связаться с нами',
  forPartners: 'Для партнёров',
  partnerPortalAccess: 'Портал партнёра',
  partnerPortalDescription: 'Управление объектами и аналитика',

  guestModeActive: 'Режим гостя',
  exploreListings: 'Смотреть объекты',

  notifications: 'Уведомления',
  noNotifications: 'Нет новых уведомлений',

  comingSoon: 'Скоро',
  featureComingSoon: 'Эта функция появится в полной версии приложения.',
  contactPartnerMessage: 'Наша команда свяжет вас с проверенным партнёром в ближайшее время.',

  error: 'Ошибка',
  success: 'Готово',
  loading: 'Загрузка...',
  tryAgain: 'Повторить',
  noResults: 'Ничего не найдено',
  networkError: 'Ошибка сети. Проверьте подключение.',
};

// ============================================
// ARABIC
// Full RTL layout support is planned for a later phase.
// ============================================

const ar: TranslationDictionary = {
  appName: 'ميزان إنفست',
  appSlogan: 'استثمارات عقارية عالمية',

  onboarding1Badge: 'استثمارات موثقة',
  onboarding1Title: 'استثمر عبر الحدود',
  onboarding1Subtitle: 'اكتشف فرصاً عقارية مميزة في أسواق عالمية موثوقة.',
  onboarding2Badge: 'تحليل بالذكاء الاصطناعي',
  onboarding2Title: 'اطّلع على الأرقام قبل الاستثمار',
  onboarding2Subtitle: 'العائد المتوقع، دخل الإيجار، إمكانات النمو ورؤى استثمارية.',
  onboarding3Badge: 'شركاء موثوقون',
  onboarding3Title: 'كل فرصة موثقة',
  onboarding3Subtitle: 'فقط الشركاء والمطورون والمحترفون العقاريون المعتمدون.',

  skip: 'تخطي',
  next: 'التالي',
  back: 'رجوع',
  getStarted: 'ابدأ الآن',
  seeAll: 'عرض الكل',
  viewAll: 'عرض الكل',
  explore: 'استكشف',
  close: 'إغلاق',
  cancel: 'إلغاء',

  welcomeTitle: 'حيث تلتقي الرؤية بالقيمة',
  welcomeSubtitle: 'انضم إلى آلاف المستثمرين الذين يصلون إلى فرص عقارية عالمية مميزة.',
  continueAsGuest: 'المتابعة كضيف',
  investorLogin: 'دخول المستثمر',
  partnerLogin: 'بوابة الشريك',
  partnerNote: 'حسابات الشركاء تتطلب التحقق',

  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  orContinueWith: 'أو تابع عبر',
  continueWithGoogle: 'المتابعة مع Google',
  continueWithApple: 'المتابعة مع Apple',
  forgotPassword: 'نسيت كلمة المرور؟',
  welcomeBack: 'مرحباً بعودتك',
  signInSubtitle: 'سجّل الدخول للوصول إلى محفظتك الاستثمارية',
  createAccount: 'إنشاء حساب',
  alreadyHaveAccount: 'لديك حساب بالفعل؟',

  partnerPortalBadge: 'بوابة الشريك',
  partnerEmail: 'بريد الشريك',
  partnerLoginButton: 'دخول البوابة',
  requestPartnerAccess: 'كن شريكاً',
  notPartnerYet: 'لست شريكاً بعد؟',
  partnerWelcome: 'بوابة الشريك',
  partnerSubtitle: 'الوصول إلى لوحة التحكم وإدارة العقارات',

  partnerDashboard: 'لوحة تحكم الشريك',
  partnerDashboardSubtitle: 'أدر عقاراتك وتحليلاتك',
  verifiedPartnerDemo: 'وصول شريك موثق',
  activeListings: 'عقارات نشطة',
  totalViews: 'المشاهدات',
  inquiries: 'الاستفسارات',
  totalValue: 'القيمة الإجمالية',
  addNewListing: 'إضافة عقار جديد',
  backToWelcome: 'العودة إلى الشاشة الرئيسية',

  homeTitle: 'ميزان إنفست',
  homeSubtitle: 'العقارات العالمية',
  heroTitle: 'اكتشف فرص العقارات العالمية',
  heroSubtitle: 'عقارات موثقة، شركاء موثوقون ورؤى استثمارية بالذكاء الاصطناعي.',
  exploreInvestments: 'استكشف الاستثمارات',
  investorEdition: 'إصدار المستثمر',

  categories: 'الفئات',
  featuredProperties: 'العقارات المميزة',
  handpickedInvestments: 'استثمارات مختارة',
  highYieldOpportunities: 'فرص عالية العائد',
  bestRoiPotential: 'أفضل إمكانات العائد',
  aiInsights: 'رؤى الذكاء الاصطناعي',
  marketAnalysis: 'معاينة تحليل السوق',
  verifiedPartners: 'الشركاء الموثقون',
  trustedProfessionals: 'محترفون عقاريون موثوقون',
  allPartners: 'جميع الشركاء',

  verified: 'موثق',
  verifiedProperty: 'عقار موثق',
  roi: 'العائد',
  price: 'السعر',
  location: 'الموقع',
  propertyType: 'نوع العقار',
  favorite: 'المفضلة',
  contactPartner: 'تواصل مع الشريك',
  scheduleViewing: 'حدد موعد المعاينة',
  saveProperty: 'حفظ',
  saved: 'تم الحفظ',
  share: 'مشاركة',
  available: 'متاح',
  reserved: 'محجوز',
  sold: 'مباع',

  propertyFeatures: 'مواصفات العقار',
  bedrooms: 'غرف النوم',
  bathrooms: 'دورات المياه',
  area: 'المساحة',
  parking: 'مواقف السيارات',
  pool: 'مسبح',
  security: 'أمن على مدار الساعة',
  garden: 'حديقة',
  seaView: 'إطلالة بحرية',
  yearBuilt: 'سنة البناء',

  aiInvestmentInsights: 'رؤى استثمارية بالذكاء الاصطناعي',
  aiDisclaimer: 'تقديرات مولّدة بالذكاء الاصطناعي لأغراض العرض التوضيحي.',
  estimatedRoi: 'العائد المتوقع',
  rentalIncome: 'دخل الإيجار',
  monthlyIncome: 'الدخل الشهري',
  amortization: 'فترة الاسترداد',
  amortizationPeriod: 'مدة استرداد رأس المال',
  years: 'سنة',
  growthScore: 'مؤشر النمو',
  riskLevel: 'مستوى المخاطر',
  marketTrend: 'اتجاه السوق',
  confidenceScore: 'درجة الثقة',
  low: 'منخفض',
  medium: 'متوسط',
  high: 'مرتفع',
  stable: 'مستقر',
  trending: 'صاعد',

  aboutProperty: 'عن العقار',
  readMore: 'اقرأ المزيد',
  readLess: 'عرض أقل',

  locationMap: 'الموقع',
  viewOnMap: 'عرض على الخريطة',
  city: 'المدينة',
  country: 'الدولة',

  listedBy: 'مُدرج بواسطة',
  verifiedPartner: 'شريك موثق',
  viewPartnerProfile: 'عرض الملف',
  listings: 'عقار',

  propertyVideoTour: 'جولة فيديو للعقار',
  watchVideo: 'شاهد الفيديو',
  virtualTour: 'جولة افتراضية متاحة',

  similarProperties: 'عقارات مشابهة',
  youMayAlsoLike: 'قد يعجبك أيضاً',

  interestedInProperty: 'هل أنت مهتم بهذا العقار؟',
  getInTouch: 'تواصل مع شريكنا الموثق.',
  rentalYield: 'العائد الإيجاري',

  villas: 'فيلات',
  apartments: 'شقق',
  lands: 'أراضٍ',
  commercial: 'تجاري',

  typeVilla: 'فيلا',
  typeApartment: 'شقة',
  typeLand: 'أرض',
  typeCommercial: 'عقار تجاري',

  countryAll: 'الكل',
  countryTr: 'تركيا',
  countrySa: 'السعودية',
  countryAe: 'الإمارات',
  countryUs: 'الولايات المتحدة',

  home: 'الرئيسية',
  exploreTab: 'استكشاف',
  favorites: 'المفضلة',
  profile: 'الملف',
  reels: 'فيديو',
  news: 'أخبار',

  exploreTitle: 'استكشاف',
  exploreSubtitle: 'اعثر على استثمارك القادم',
  searchPlaceholder: 'ابحث بالمدينة أو الدولة أو العقار',
  propertiesFound: 'عقار متاح',
  propertyFound: 'عقار متاح',
  clearSearch: 'مسح البحث',
  noResultsSubtitle: 'جرّب دولة أخرى أو كلمة بحث مختلفة.',

  favoritesTitle: 'المفضلة',
  favoritesSubtitle: 'العقارات التي حفظتها',
  savedProperties: 'العقارات المحفوظة',
  favoritesEmptyTitle: 'لا توجد عقارات محفوظة بعد',
  favoritesEmptySubtitle: 'اضغط على أيقونة القلب في أي عقار للوصول إليه بسرعة من هنا.',
  browseProperties: 'تصفح العقارات',

  profileTitle: 'الملف الشخصي',
  guestUser: 'ضيف',
  guestUserSubtitle: 'تصفح بدون حساب',
  signInPrompt: 'سجّل الدخول لحفظ العقارات ومتابعة محفظتك',
  preferences: 'التفضيلات',
  language: 'اللغة',
  selectLanguage: 'اختر اللغة',
  aboutSection: 'حول التطبيق',
  aboutApp: 'حول ميزان إنفست',
  appVersion: 'الإصدار',
  termsOfService: 'شروط الاستخدام',
  privacyPolicy: 'سياسة الخصوصية',
  helpCenter: 'مركز المساعدة',
  contactUs: 'تواصل معنا',
  forPartners: 'للشركاء',
  partnerPortalAccess: 'بوابة الشريك',
  partnerPortalDescription: 'إدارة العقارات وعرض التحليلات',

  guestModeActive: 'تصفح كضيف',
  exploreListings: 'استكشف العقارات',

  notifications: 'الإشعارات',
  noNotifications: 'لا توجد إشعارات جديدة',

  comingSoon: 'قريباً',
  featureComingSoon: 'ستتوفر هذه الميزة في النسخة الكاملة.',
  contactPartnerMessage: 'سيتواصل فريقنا معك لربطك بالشريك الموثق قريباً.',

  error: 'خطأ',
  success: 'تم بنجاح',
  loading: 'جاري التحميل...',
  tryAgain: 'حاول مجدداً',
  noResults: 'لا توجد نتائج',
  networkError: 'خطأ في الشبكة. تحقق من اتصالك.',
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
