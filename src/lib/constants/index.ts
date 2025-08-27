// =============================================================================
// APP CONSTANTS
// =============================================================================

import {
  Award,
  BarChart3,
  DollarSign,
  Gamepad2,
  LucideIcon,
  Plus,
  Settings,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

export const APP_CONFIG = {
  name: 'Lottery App',
  version: '1.0.0',
  description:
    'A modern lottery application with internationalization and PWA support',
  author: 'Lottery App Team',
  repository: 'https://github.com/your-org/lottery-app',
  license: 'Proprietary',
  environment: 'development' as 'development' | 'production' | 'test',
} as const;

// =============================================================================
// INTERNATIONALIZATION CONSTANTS
// =============================================================================

export const I18N_CONFIG = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'] as const,
  fallbackLocale: 'en',
} as const;

export type SupportedLocale = (typeof I18N_CONFIG.supportedLocales)[number];

// =============================================================================
// THEME CONSTANTS
// =============================================================================

export const THEME_CONFIG = {
  colors: {
    primary: '#FF5722',
    secondary: '#FF9800',
    accent: '#4CAF50',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    background: {
      light: '#f5f5f5',
      dark: '#1a1a1a',
      darker: '#0a0a0a',
      card: '#ffffff',
      'card-foreground': '#1a1a1a',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      muted: '#999999',
      inverse: '#ffffff',
    },
    border: {
      primary: '#FF5722',
      secondary: '#FF9800',
      muted: '#e0e0e0',
      accent: '#4CAF50',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
} as const;

// =============================================================================
// LOTTERY GAME CONSTANTS
// =============================================================================

export const LOTTERY_CONFIG = {
  gameTypes: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    SPECIAL: 'special',
  },
  maxTicketsPerUser: 10,
  maxParticipants: 1000,
  minTicketPrice: 1,
  maxTicketPrice: 100,
  drawInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  autoDraw: true,
  prizeDistribution: {
    first: 0.5, // 50% of prize pool
    second: 0.3, // 30% of prize pool
    third: 0.2, // 20% of prize pool
  },
  categories: ['standard', 'premium', 'vip', 'charity'] as const,
} as const;

// =============================================================================
// STATS CONSTANTS
// =============================================================================

export const STATS_CONFIG = {
  defaultStats: [
    { number: 25, label: 'Active Games' },
    { number: 1247, label: 'Participants' },
    { number: '99.9%', label: 'Uptime' },
  ],
  refreshInterval: 30000, // 30 seconds
  maxDataPoints: 100,
  chartColors: ['#FF5722', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0'],
} as const;

// =============================================================================
// NAVIGATION CONSTANTS
// =============================================================================

export const NAVIGATION_CONFIG = {
  mainMenu: [
    { name: 'Home', href: '/', icon: 'home' },
    { name: 'Games', href: '/games', icon: 'gamepad' },
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Profile', href: '/profile', icon: 'user' },
  ],
  footerLinks: [
    { name: 'About', href: '/about' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Contact', href: '/contact' },
  ],
  socialLinks: [
    {
      name: 'Twitter',
      href: 'https://twitter.com/lotteryapp',
      icon: 'twitter',
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/lotteryapp',
      icon: 'facebook',
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/lotteryapp',
      icon: 'instagram',
    },
  ],
} as const;

// =============================================================================
// FEATURE FLAGS CONSTANTS
// =============================================================================

export const FEATURE_FLAGS = {
  darkMode: true,
  pwa: true,
  notifications: true,
  analytics: true,
  socialLogin: true,
  twoFactorAuth: false,
  liveChat: false,
  multiLanguage: true,
  advancedStats: false,
  adminPanel: true,
} as const;

// =============================================================================
// API CONSTANTS
// =============================================================================

export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 10000,
  retries: 3,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      verify: '/auth/verify',
    },
    games: {
      list: '/games',
      create: '/games',
      update: '/games/:id',
      delete: '/games/:id',
      join: '/games/:id/join',
      leave: '/games/:id/leave',
    },
    tickets: {
      list: '/tickets',
      create: '/tickets',
      validate: '/tickets/:id/validate',
    },
    payments: {
      create: '/payments',
      confirm: '/payments/:id/confirm',
      cancel: '/payments/:id/cancel',
    },
    winners: {
      list: '/winners',
      announce: '/winners/announce',
    },
  },
} as const;

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  email: {
    maxLength: 254,
    allowSubdomains: true,
    allowIPs: false,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    allowedChars: /^[a-zA-Z0-9_-]+$/,
  },
  phone: {
    format: /^\+?[1-9]\d{1,14}$/,
    maxLength: 15,
  },
} as const;

// =============================================================================
// PAGINATION CONSTANTS
// =============================================================================

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
  showFirstLast: true,
  showPageNumbers: true,
  maxPageNumbers: 5,
} as const;

// =============================================================================
// CACHE CONSTANTS
// =============================================================================

export const CACHE_CONFIG = {
  ttl: {
    short: 5 * 60 * 1000, // 5 minutes
    medium: 15 * 60 * 1000, // 15 minutes
    long: 60 * 60 * 1000, // 1 hour
    veryLong: 24 * 60 * 60 * 1000, // 24 hours
  },
  maxSize: 100,
  strategy: 'lru' as const,
} as const;

// =============================================================================
// ERROR MESSAGES CONSTANTS
// =============================================================================

export const ERROR_MESSAGES = {
  common: {
    somethingWentWrong: 'Something went wrong. Please try again.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to access this resource.',
    forbidden: 'Access to this resource is forbidden.',
    serverError: 'Internal server error. Please try again later.',
    networkError: 'Network error. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    validationError: 'Please check your input and try again.',
  },
  auth: {
    invalidCredentials: 'Invalid email or password.',
    accountNotFound: 'No account found with this email.',
    emailAlreadyExists: 'An account with this email already exists.',
    weakPassword: 'Password is too weak. Please choose a stronger password.',
    emailNotVerified: 'Please verify your email address before continuing.',
    phoneNotVerified: 'Please verify your phone number before continuing.',
    tooManyAttempts: 'Too many login attempts. Please try again later.',
    sessionExpired: 'Your session has expired. Please log in again.',
  },
  games: {
    gameNotFound: 'Game not found.',
    gameFull: 'This game is full. Please try another game.',
    gameClosed: 'This game is closed for new participants.',
    insufficientFunds: 'Insufficient funds to purchase ticket.',
    ticketLimitReached:
      'You have reached the maximum number of tickets for this game.',
    invalidGameState: 'Game is not in a valid state for this action.',
  },
  payments: {
    paymentFailed: 'Payment failed. Please try again.',
    insufficientFunds: 'Insufficient funds for this transaction.',
    invalidPaymentMethod: 'Invalid payment method.',
    paymentTimeout: 'Payment timed out. Please try again.',
    refundFailed: 'Refund failed. Please contact support.',
  },
} as const;

// =============================================================================
// SUCCESS MESSAGES CONSTANTS
// =============================================================================

export const SUCCESS_MESSAGES = {
  common: {
    operationSuccessful: 'Operation completed successfully.',
    saved: 'Changes saved successfully.',
    deleted: 'Item deleted successfully.',
    created: 'Item created successfully.',
    updated: 'Item updated successfully.',
  },
  auth: {
    loginSuccessful: 'Login successful. Welcome back!',
    logoutSuccessful: 'Logout successful. See you soon!',
    registrationSuccessful:
      'Registration successful! Please check your email to verify your account.',
    passwordResetSent: 'Password reset email sent. Please check your inbox.',
    passwordChanged: 'Password changed successfully.',
    emailVerified: 'Email verified successfully.',
    phoneVerified: 'Phone number verified successfully.',
  },
  games: {
    gameJoined: 'Successfully joined the game!',
    ticketPurchased: 'Ticket purchased successfully!',
    gameCreated: 'Game created successfully!',
    gameUpdated: 'Game updated successfully!',
    gameDeleted: 'Game deleted successfully!',
  },
  payments: {
    paymentSuccessful: 'Payment completed successfully!',
    refundSuccessful: 'Refund processed successfully!',
  },
} as const;

// =============================================================================
// DATE FORMATS CONSTANTS
// =============================================================================

export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  time: 'HH:mm:ss',
  dateTime: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  relative: 'relative',
} as const;

// =============================================================================
// CURRENCY CONSTANTS
// =============================================================================

export const CURRENCY_CONFIG = {
  default: 'USD',
  supported: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'] as const,
  symbols: {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
    CNY: '¥',
  },
  exchangeRates: {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    CAD: 1.25,
    AUD: 1.35,
    JPY: 110.0,
    CHF: 0.92,
    CNY: 6.45,
  },
} as const;

export type SupportedCurrency = (typeof CURRENCY_CONFIG.supported)[number];

// Role-specific configurations
export const ROLE_CONFIG = {
  USER: {
    maxGames: 0,
    canCreateGames: false,
    canManageUsers: false,
    subscriptionTier: 'free',
  },
  VENDOR: {
    maxGames: 10,
    canCreateGames: true,
    canManageUsers: false,
    subscriptionTier: 'basic',
  },
  ADMIN: {
    maxGames: -1, // unlimited
    canCreateGames: true,
    canManageUsers: true,
    subscriptionTier: 'enterprise',
  },
};

export const WINNERS = [
  {
    name: 'Alex Anderson',
    date: '24/12/2024',
    contest: '1043',
    numbers: '20, 21',
    image: '/images/winner_1.jpg', // Placeholder
  },
  {
    name: 'Taylor Madinsen',
    date: '24/12/2024',
    contest: '1043',
    numbers: '20, 21',
    image: '/images/winner_2.jpg', // Placeholder
  },
  {
    name: 'Cinderella Joe',
    date: '24/12/2024',
    contest: '1043',
    numbers: '20, 21',
    image: '/images/winner_3.jpg', // Placeholder
  },
  {
    name: 'James Peter',
    date: '24/12/2024',
    contest: '1043',
    numbers: '20, 21',
    image: '/images/winner_4.jpg', // Placeholder
  },
];

export const STATS = [
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12%',
    icon: Users,
    color: 'from-lottery-500 to-lottery-600',
  },
  {
    title: 'Active Games',
    value: '24',
    change: '+5%',
    icon: Gamepad2,
    color: 'from-lottery-600 to-lottery-700',
  },
  {
    title: 'Revenue',
    value: '$45,230',
    change: '+18%',
    icon: DollarSign,
    color: 'from-lottery-700 to-lottery-800',
  },
  {
    title: 'Winners',
    value: '156',
    change: '+8%',
    icon: Award,
    color: 'from-lottery-800 to-lottery-900',
  },
];

export const QUICK_ACTIONS = [
  {
    title: 'Create Game',
    description: 'Start a new lottery game',
    icon: Plus,
    href: '/admin/create-game',
    color: 'from-lottery-500 to-lottery-600',
  },
  {
    title: 'Manage Products',
    description: 'Add or edit lottery products',
    icon: Gamepad2,
    href: '/admin/products',
    color: 'from-lottery-600 to-lottery-700',
  },
  {
    title: 'User Management',
    description: 'View and manage users',
    icon: Users,
    href: '/admin/users',
    color: 'from-lottery-700 to-lottery-800',
  },
  {
    title: 'Analytics',
    description: 'View detailed statistics',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'from-lottery-800 to-lottery-900',
  },
  {
    title: 'Settings',
    description: 'Configure system settings',
    icon: Settings,
    href: '/admin/settings',
    color: 'from-lottery-900 to-lottery-950',
  },
];

// Mock data
export const MOCK_STATS = [
  { number: '50K+', label: 'Active Players' },
  { number: '$2B+', label: 'Total Prizes' },
  { number: '99.9%', label: 'Uptime' },
];

export const MOCK_WINNERS = [
  {
    name: 'Alex Anderson',
    country: 'INDONESIA',
    prize: 'POWERBALL',
    amount: '$50M',
    date: '2024',
    image: '👨‍💼',
  },
  {
    name: 'Taylor Madison',
    country: 'AUSTRALIA',
    prize: 'MEGA MILLIONS',
    amount: '$25M',
    date: '2024',
    image: '👩‍💼',
  },
  {
    name: 'Cinderella Joe',
    country: 'INDONESIA',
    prize: 'EUROJACKPOT',
    amount: '$15M',
    date: '2024',
    image: '👩‍🦰',
  },
  {
    name: 'James Peter',
    country: 'AUSTRALIA',
    prize: 'LOTTO MAX',
    amount: '$30M',
    date: '2024',
    image: '👨‍🚀',
  },
];

// --- add immediately above the STEPS export ---
type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
};

// step displayed on homepage.
export const STEPS = (isDark: boolean): readonly Step[] => [
  {
    icon: Target,
    title: isDark ? 'Pick & Play' : 'Choose Numbers',
    description: isDark
      ? 'Choose your favorite lottery game and select your lucky numbers'
      : 'Select your lucky numbers from our lottery games',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Zap,
    title: isDark ? 'Spin to Win' : 'Buy Tickets',
    description: isDark
      ? 'Watch the draw live and see if fortune favors you today'
      : 'Purchase your lottery tickets securely online',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: DollarSign,
    title: isDark ? 'Enter, Wait, Win' : 'Wait for Results',
    description: isDark
      ? 'Enter the draw and wait for the results with anticipation'
      : 'Wait for the official draw results',
    color: 'from-green-500 to-blue-500',
  },
  {
    icon: Trophy,
    title: isDark ? 'Prizes Delivered' : 'Claim Prizes',
    description: isDark
      ? 'Instant payouts directly to your account when you win'
      : 'Claim your winnings instantly and securely',
    color: 'from-purple-500 to-pink-500',
  },
];

export const PRIZES = [
  { name: 'Mega Jackpot', amount: '$50,000,000', emoji: '💎' },
  { name: 'Daily Bonus', amount: '$100,000', emoji: '💰' },
  { name: 'Weekly Prize', amount: '$1,000,000', emoji: '🏆' },
];
