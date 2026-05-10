// Constants for Utsav marketplace
// Nepal's First Ceremony Service Marketplace

// Currency
export const CURRENCY = {
  CODE: 'NPR',
  SYMBOL: '₹',
  NAME: 'Nepalese Rupee',
  LOCALE: 'ne-NP',
} as const;

// Location
export const LOCATION = {
  DEFAULT_CITY: 'Kathmandu',
  DEFAULT_COUNTRY: 'Nepal',
  DEFAULT_LAT: 27.7172,
  DEFAULT_LNG: 85.324,
  DEFAULT_RADIUS_KM: 25,
  MAX_RADIUS_KM: 100,
} as const;

// Service Categories
export const SERVICE_CATEGORIES = [
  { id: 'photographer', name: 'Photographer', slug: 'photographer', icon: '📷' },
  { id: 'caterer', name: 'Caterer', slug: 'caterer', icon: '🍽️' },
  { id: 'decorator', name: 'Decorator', slug: 'decorator', icon: '🎨' },
  { id: 'tent-supplier', name: 'Tent Supplier', slug: 'tent-supplier', icon: '⛺' },
  { id: 'venue', name: 'Venue', slug: 'venue', icon: '🏛️' },
  { id: 'band', name: 'Band', slug: 'band', icon: '🎵' },
  { id: 'dj', name: 'DJ', slug: 'dj', icon: '🎧' },
  { id: 'makeup-artist', name: 'Makeup Artist', slug: 'makeup-artist', icon: '💄' },
  { id: 'flower-decorator', name: 'Flower Decorator', slug: 'flower-decorator', icon: '💐' },
  { id: 'mehndi-artist', name: 'Mehndi Artist', slug: 'mehndi-artist', icon: '🖐️' },
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File Upload
export const UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_SERVICE: 10,
  AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

// Booking
export const BOOKING = {
  MIN_ADVANCE_DAYS: 1,
  MAX_ADVANCE_MONTHS: 12,
  COMMISSION_RATE: 0.10, // 10%
  PLATFORM_FEE: 0.02, // 2%
} as const;

// Auth
export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
} as const;

// Review
export const REVIEW = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  CAN_REVIEW_AFTER_DAYS: 1,
} as const;

// API
export const API = {
  VERSION: 'v1',
  BASE_PATH: '/api/v1',
  RATE_LIMIT: 100,
  RATE_LIMIT_WINDOW: 60, // seconds
} as const;

// Nepal Payment Gateways
export const PAYMENT_GATEWAYS = {
  ESEWA: {
    NAME: 'eSewa',
    CODE: 'esewa',
  },
  KHALTI: {
    NAME: 'Khalti',
    CODE: 'khalti',
  },
} as const;

// App Info
export const APP = {
  NAME: 'Utsav',
  TAGLINE: 'Nepal\'s Ceremony Service Marketplace',
  SUPPORT_EMAIL: 'support@utsav.com.np',
  SUPPORT_PHONE: '+977-1-5XXXXXX',
  WEBSITE: 'https://utsav.com.np',
} as const;