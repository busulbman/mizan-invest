/**
 * ============================================
 * TRANSLATIONS
 * ============================================
 *
 * Multi-language support for Mizan Invest.
 * Supported languages: EN, TR, RU, AR
 *
 * HOW TO ADD NEW TEXT:
 * 1. Add the English version first (en object)
 * 2. Add translations for TR, RU, AR
 * 3. Use in components: const { t } = useLanguage(); t('keyName')
 *
 * TODO: Consider using i18n library for production
 * TODO: Add RTL support for Arabic
 */

export type Language = 'en' | 'tr' | 'ru' | 'ar';

/**
 * Default language for the app
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Language display names
 */
export const languageNames: Record<Language, string> = {
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
  ar: 'العربية',
};

/**
 * All translations organized by language
 */
export const translations = {
  // ============================================
  // ENGLISH (Default)
  // ============================================
  en: {
    // ----------------------------------------
    // APP BRANDING
    // ----------------------------------------
    appName: 'Mizan Invest',
    appSlogan: 'Global Real Estate Investments',

    // ----------------------------------------
    // ONBOARDING
    // ----------------------------------------
    onboarding1Title: 'Invest Beyond Borders',
    onboarding1Subtitle: 'Discover premium real estate opportunities across trusted global markets.',
    onboarding2Title: 'See The Numbers Before You Invest',
    onboarding2Subtitle: 'Estimated ROI, rental income, growth potential and investment insights.',
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
    partnerEmail: 'Partner Email',
    partnerLoginButton: 'Access Portal',
    requestPartnerAccess: 'Become a Partner',
    partnerWelcome: 'Partner Portal',
    partnerSubtitle: 'Access your dashboard and manage listings',

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
    // CATEGORIES
    // ----------------------------------------
    villas: 'Villas',
    apartments: 'Apartments',
    lands: 'Lands',
    commercial: 'Commercial',

    // ----------------------------------------
    // BOTTOM NAVIGATION
    // ----------------------------------------
    home: 'Home',
    exploreTab: 'Explore',
    reels: 'Reels',
    news: 'News',
    profile: 'Profile',

    // ----------------------------------------
    // USER STATES
    // ----------------------------------------
    guestModeActive: 'Exploring as Guest',
    partnerDashboard: 'Partner Dashboard',
    verifiedPartnerDemo: 'Verified Partner Access',
    backToWelcome: 'Back to Welcome',
    exploreListings: 'Explore Listings',

    // ----------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------
    notifications: 'Notifications',
    noNotifications: 'No new notifications',

    // ----------------------------------------
    // ERRORS & MESSAGES
    // ----------------------------------------
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    tryAgain: 'Try Again',
    noResults: 'No results found',
    networkError: 'Network error. Please check your connection.',
  },

  // ============================================
  // TURKISH
  // ============================================
  tr: {
    appName: 'Mizan Invest',
    appSlogan: 'Global Gayrimenkul Yatırımları',

    onboarding1Title: 'Sınırların Ötesine Yatırım Yapın',
    onboarding1Subtitle: 'Güvenilir global pazarlarda premium gayrimenkul fırsatlarını keşfedin.',
    onboarding2Title: 'Yatırım Yapmadan Önce Rakamları Görün',
    onboarding2Subtitle: 'Tahmini ROI, kira geliri, büyüme potansiyeli ve yatırım içgörüleri.',
    onboarding3Title: 'Her Fırsat Doğrulanmış',
    onboarding3Subtitle: 'Sadece onaylı ortaklar, geliştiriciler ve gayrimenkul profesyonelleri.',

    skip: 'Atla',
    next: 'İleri',
    back: 'Geri',
    getStarted: 'Başla',
    seeAll: 'Tümünü gör',
    viewAll: 'Tümünü gör',
    explore: 'Keşfet',

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
    continueWithGoogle: 'Google ile Devam Et',
    continueWithApple: 'Apple ile Devam Et',
    forgotPassword: 'Şifremi unuttum',
    welcomeBack: 'Tekrar Hoş Geldiniz',
    signInSubtitle: 'Yatırım portföyünüze erişmek için giriş yapın',
    createAccount: 'Hesap Oluştur',
    alreadyHaveAccount: 'Zaten hesabınız var mı?',

    partnerEmail: 'Partner E-posta',
    partnerLoginButton: 'Portala Eriş',
    requestPartnerAccess: 'Partner Ol',
    partnerWelcome: 'Partner Portalı',
    partnerSubtitle: 'Panelinize erişin ve ilanlarınızı yönetin',

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
    roi: 'ROI',
    price: 'Fiyat',
    location: 'Konum',
    propertyType: 'Mülk Tipi',
    favorite: 'Favori',
    contactPartner: 'Ortakla İletişim',
    scheduleViewing: 'Görüşme Planla',

    villas: 'Villalar',
    apartments: 'Daireler',
    lands: 'Araziler',
    commercial: 'Ticari',

    home: 'Ana Sayfa',
    exploreTab: 'Keşfet',
    reels: 'Videolar',
    news: 'Haberler',
    profile: 'Profil',

    guestModeActive: 'Misafir Olarak Keşfediliyor',
    partnerDashboard: 'Partner Paneli',
    verifiedPartnerDemo: 'Doğrulanmış Partner Erişimi',
    backToWelcome: 'Karşılamaya Dön',
    exploreListings: 'İlanları Keşfet',

    notifications: 'Bildirimler',
    noNotifications: 'Yeni bildirim yok',

    error: 'Hata',
    success: 'Başarılı',
    loading: 'Yükleniyor...',
    tryAgain: 'Tekrar Dene',
    noResults: 'Sonuç bulunamadı',
    networkError: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
  },

  // ============================================
  // RUSSIAN
  // ============================================
  ru: {
    appName: 'Mizan Invest',
    appSlogan: 'Глобальные инвестиции в недвижимость',

    onboarding1Title: 'Инвестируйте за пределами границ',
    onboarding1Subtitle: 'Откройте премиальные возможности недвижимости на надёжных мировых рынках.',
    onboarding2Title: 'Смотрите цифры перед инвестицией',
    onboarding2Subtitle: 'Расчётная рентабельность, арендный доход, потенциал роста и инвестиционные инсайты.',
    onboarding3Title: 'Каждая возможность проверена',
    onboarding3Subtitle: 'Только одобренные партнёры, застройщики и профессионалы рынка недвижимости.',

    skip: 'Пропустить',
    next: 'Далее',
    back: 'Назад',
    getStarted: 'Начать',
    seeAll: 'Смотреть все',
    viewAll: 'Смотреть все',
    explore: 'Исследовать',

    welcomeTitle: 'Где видение встречает ценность',
    welcomeSubtitle: 'Присоединяйтесь к тысячам инвесторов с доступом к премиальной мировой недвижимости.',
    continueAsGuest: 'Исследовать как гость',
    investorLogin: 'Вход инвестора',
    partnerLogin: 'Портал партнёра',
    partnerNote: 'Аккаунты партнёров требуют верификации',

    email: 'Эл. почта',
    password: 'Пароль',
    login: 'Войти',
    logout: 'Выйти',
    continueWithGoogle: 'Продолжить с Google',
    continueWithApple: 'Продолжить с Apple',
    forgotPassword: 'Забыли пароль?',
    welcomeBack: 'С возвращением',
    signInSubtitle: 'Войдите для доступа к инвестиционному портфелю',
    createAccount: 'Создать аккаунт',
    alreadyHaveAccount: 'Уже есть аккаунт?',

    partnerEmail: 'Эл. почта партнёра',
    partnerLoginButton: 'Войти в портал',
    requestPartnerAccess: 'Стать партнёром',
    partnerWelcome: 'Портал партнёра',
    partnerSubtitle: 'Доступ к панели и управление объявлениями',

    homeTitle: 'Mizan Invest',
    homeSubtitle: 'Мировая недвижимость',
    heroTitle: 'Откройте глобальные возможности недвижимости',
    heroSubtitle: 'Проверенные объекты, надёжные партнёры и аналитика на основе ИИ.',
    exploreInvestments: 'Смотреть инвестиции',
    investorEdition: 'Издание инвестора',

    categories: 'Категории',
    featuredProperties: 'Избранные объекты',
    handpickedInvestments: 'Отобранные инвестиции',
    highYieldOpportunities: 'Высокодоходные возможности',
    bestRoiPotential: 'Лучший потенциал ROI',
    aiInsights: 'AI инвестиционная аналитика',
    marketAnalysis: 'Предпросмотр анализа рынка',
    verifiedPartners: 'Проверенные партнёры',
    trustedProfessionals: 'Надёжные профессионалы рынка',
    allPartners: 'Все партнёры',

    verified: 'Проверено',
    roi: 'ROI',
    price: 'Цена',
    location: 'Расположение',
    propertyType: 'Тип объекта',
    favorite: 'Избранное',
    contactPartner: 'Связаться с партнёром',
    scheduleViewing: 'Запланировать просмотр',

    villas: 'Виллы',
    apartments: 'Квартиры',
    lands: 'Земельные участки',
    commercial: 'Коммерческая',

    home: 'Главная',
    exploreTab: 'Поиск',
    reels: 'Видео',
    news: 'Новости',
    profile: 'Профиль',

    guestModeActive: 'Режим гостя',
    partnerDashboard: 'Панель партнёра',
    verifiedPartnerDemo: 'Доступ подтверждённого партнёра',
    backToWelcome: 'Вернуться к приветствию',
    exploreListings: 'Смотреть объекты',

    notifications: 'Уведомления',
    noNotifications: 'Нет новых уведомлений',

    error: 'Ошибка',
    success: 'Успешно',
    loading: 'Загрузка...',
    tryAgain: 'Повторить',
    noResults: 'Ничего не найдено',
    networkError: 'Ошибка сети. Проверьте подключение.',
  },

  // ============================================
  // ARABIC
  // TODO: Add RTL support
  // ============================================
  ar: {
    appName: 'ميزان إنفست',
    appSlogan: 'استثمارات عقارية عالمية',

    onboarding1Title: 'استثمر عبر الحدود',
    onboarding1Subtitle: 'اكتشف فرص عقارية مميزة في أسواق عالمية موثوقة.',
    onboarding2Title: 'شاهد الأرقام قبل الاستثمار',
    onboarding2Subtitle: 'العائد المتوقع، دخل الإيجار، إمكانات النمو ورؤى الاستثمار.',
    onboarding3Title: 'كل فرصة موثقة',
    onboarding3Subtitle: 'فقط الشركاء والمطورون والمحترفون العقاريون المعتمدون.',

    skip: 'تخطي',
    next: 'التالي',
    back: 'رجوع',
    getStarted: 'ابدأ الآن',
    seeAll: 'عرض الكل',
    viewAll: 'عرض الكل',
    explore: 'استكشف',

    welcomeTitle: 'حيث تلتقي الرؤية بالقيمة',
    welcomeSubtitle: 'انضم إلى آلاف المستثمرين الذين يصلون إلى فرص عقارية عالمية مميزة.',
    continueAsGuest: 'استكشف كضيف',
    investorLogin: 'دخول المستثمر',
    partnerLogin: 'بوابة الشريك',
    partnerNote: 'حسابات الشركاء تتطلب التحقق',

    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    continueWithGoogle: 'المتابعة مع Google',
    continueWithApple: 'المتابعة مع Apple',
    forgotPassword: 'نسيت كلمة المرور؟',
    welcomeBack: 'مرحباً بعودتك',
    signInSubtitle: 'سجل الدخول للوصول إلى محفظتك الاستثمارية',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',

    partnerEmail: 'بريد الشريك',
    partnerLoginButton: 'دخول البوابة',
    requestPartnerAccess: 'كن شريكاً',
    partnerWelcome: 'بوابة الشريك',
    partnerSubtitle: 'الوصول إلى لوحة التحكم وإدارة القوائم',

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
    roi: 'العائد',
    price: 'السعر',
    location: 'الموقع',
    propertyType: 'نوع العقار',
    favorite: 'المفضلة',
    contactPartner: 'تواصل مع الشريك',
    scheduleViewing: 'حدد موعد المعاينة',

    villas: 'فيلات',
    apartments: 'شقق',
    lands: 'أراضي',
    commercial: 'تجاري',

    home: 'الرئيسية',
    exploreTab: 'استكشاف',
    reels: 'فيديو',
    news: 'أخبار',
    profile: 'الملف',

    guestModeActive: 'استكشاف كضيف',
    partnerDashboard: 'لوحة تحكم الشريك',
    verifiedPartnerDemo: 'وصول الشريك الموثق',
    backToWelcome: 'العودة إلى الترحيب',
    exploreListings: 'استكشف العقارات',

    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات جديدة',

    error: 'خطأ',
    success: 'نجاح',
    loading: 'جاري التحميل...',
    tryAgain: 'حاول مجدداً',
    noResults: 'لا توجد نتائج',
    networkError: 'خطأ في الشبكة. تحقق من اتصالك.',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
