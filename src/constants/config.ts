/**
 * ============================================
 * APP CONFIGURATION
 * ============================================
 *
 * Central configuration file for Mizan Invest.
 * Edit this file to update app-wide settings.
 *
 * TODO: Update these values before production release
 */

export const AppConfig = {
  // ----------------------------------------
  // BRAND IDENTITY
  // ----------------------------------------

  /** Main application name */
  appName: 'Mizan Invest',

  /** App tagline/slogan displayed on splash and marketing */
  appSlogan: 'Global Real Estate Investments',

  /** Short app description */
  appDescription: 'Premium real estate investment platform with verified properties, trusted partners, and AI-powered insights.',

  // ----------------------------------------
  // VERSION INFO
  // ----------------------------------------

  /** Current app version - update with each release */
  version: '1.0.0',

  /** Build number for app stores */
  buildNumber: '1',

  // ----------------------------------------
  // CONTACT INFORMATION
  // TODO: Replace with production contact details
  // ----------------------------------------

  contact: {
    email: 'info@mizaninvest.com',
    phone: '+1 (555) 123-4567',
    address: 'Dubai, United Arab Emirates',
    supportEmail: 'support@mizaninvest.com',
  },

  // ----------------------------------------
  // SOCIAL MEDIA LINKS
  // TODO: Replace with actual social media URLs
  // ----------------------------------------

  social: {
    instagram: 'https://instagram.com/mizaninvest',
    twitter: 'https://twitter.com/mizaninvest',
    linkedin: 'https://linkedin.com/company/mizaninvest',
    facebook: 'https://facebook.com/mizaninvest',
    youtube: 'https://youtube.com/@mizaninvest',
  },

  // ----------------------------------------
  // EXTERNAL LINKS
  // TODO: Replace with production URLs
  // ----------------------------------------

  links: {
    website: 'https://mizaninvest.com',
    termsOfService: 'https://mizaninvest.com/terms',
    privacyPolicy: 'https://mizaninvest.com/privacy',
    helpCenter: 'https://help.mizaninvest.com',
  },

  // ----------------------------------------
  // FEATURE FLAGS
  // Toggle features on/off for different releases
  // ----------------------------------------

  features: {
    /** Enable guest mode access */
    guestMode: true,

    /** Enable AI investment insights */
    aiInsights: true,

    /** Enable partner registration */
    partnerRegistration: true,

    /** Enable push notifications */
    pushNotifications: false, // TODO: Enable after Firebase setup

    /** Enable analytics tracking */
    analytics: false, // TODO: Enable after analytics setup
  },

  // ----------------------------------------
  // API CONFIGURATION
  // TODO: Replace with production API endpoints
  // ----------------------------------------

  api: {
    baseUrl: 'https://api.mizaninvest.com',
    version: 'v1',
    timeout: 30000, // 30 seconds
  },
} as const;

export type AppConfigType = typeof AppConfig;
