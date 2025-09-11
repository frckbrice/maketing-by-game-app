// Core Types
export type ID = string;
export type Timestamp = number;
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED' | 'FAILED';
export type SortOrder = 'asc' | 'desc';
export type Environment = 'development' | 'production' | 'test';

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// User and Authentication Types
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserRole = 'USER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  // Enhanced profile fields
  bio?: string;
  timezone?: string;
  preferredCurrency?: string;
  notificationPreferences?: UserNotificationPreferences;
  defaultShippingAddressId?: string;
  // Additional fields used by firebase services
  preferences?: {
    language: string;
    theme: string;
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    timezone: string;
    currency: string;
  };
  followedShops?: string[];
  likedProducts?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    marketing: boolean;
    gameUpdates: boolean;
    winnerAnnouncements: boolean;
  };
  privacySettings?: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowContact: boolean;
    dataSharing: boolean;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  businessProfile?: {
    companyName: string;
    businessType: string;
    taxId: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    contactPerson: {
      name: string;
      email: string;
      phone: string;
    };
    paymentMethods: any[];
    subscriptionStatus: string;
    subscriptionPlan: string;
    maxGames: number;
    canCreateGames: boolean;
    canManageUsers: boolean;
    verificationStatus: string;
    documents: any[];
  };
}

// Enhanced User Notification Preferences
export interface UserNotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  orderUpdates: boolean;
  gameUpdates: boolean;
  winnerAnnouncements: boolean;
  paymentNotifications: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  newMessages: boolean;
  priceDrops: boolean;
  restockAlerts: boolean;
  deliveryUpdates: boolean;
}

// Game Types
export type GameType = 'daily' | 'weekly' | 'monthly' | 'special';
export type PrizeType = 'cash' | 'product' | 'service' | 'experience';

export interface GameCategory {
  id: ID;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Prize {
  id: ID;
  name: string;
  description: string;
  type: PrizeType;
  value: number;
  currency: string;
  image?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GameRule {
  id: ID;
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GameImage {
  id: ID;
  url: string;
  alt: string;
  type?: string;
  order: number;
  isPrimary: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LotteryGame {
  id: ID;
  title: string;
  description: string;
  type: GameType;
  categoryId: ID;
  category: GameCategory;
  ticketPrice: number;
  currency: string;
  maxParticipants: number;
  currentParticipants: number;
  totalTickets: number;
  totalTicketsSold: number;
  videoUrl?: string;
  totalPrizePool: number;
  prizes: Prize[];
  rules: GameRule[];
  images: GameImage[];
  startDate: Timestamp;
  endDate: Timestamp;
  drawDate: Timestamp;
  status: 'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSED';
  isActive: boolean;
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shop?: {
    id: ID;
    name: string;
    website?: string;
    logo?: string;
    description?: string;
  };
}

// Ticket Types
export interface LotteryTicket {
  id: ID;
  gameId: ID;
  userId: ID;
  vendorId: ID;
  ticketNumber: string; // Primary user-facing number (formatted, e.g., "123-456")
  alternativeNumbers?: {
    readable: string; // LT-2024-ABC123
    simple: string; // 123456
    formatted: string; // 123-456
  };
  purchaseDate: Timestamp;
  price: number;
  currency: string;
  status: 'valid' | 'used' | 'expired' | 'cancelled';
  isWinner: boolean;
  prizeId?: ID;
  prizeAmount?: number;
  claimedAt?: Timestamp;
  expiresAt?: Timestamp;
  lastScanAt?: Timestamp;
  lastScanBy?: 'player' | 'vendor';
  redemption?: {
    vendorId: string;
    redeemedAt: Timestamp;
    device: 'web' | 'mobile';
    method?: 'qr' | 'manual'; // How the ticket was validated
  };
  coupon?: {
    code: string;
    amountOff: number;
    minPurchase?: number;
    expiresAt?: Timestamp;
    used: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TicketPurchase {
  gameId: ID;
  quantity: number;
  paymentMethodId: ID;
  totalAmount: number;
  currency: string;
}

export interface ScanEvent {
  id: ID;
  ticketId: ID;
  scannedBy: 'player' | 'vendor';
  vendorId?: ID;
  userId?: ID;
  appVersion?: string;
  device: 'web' | 'mobile';
  result: 'VALIDATED' | 'VALID' | 'ALREADY_USED' | 'INVALID' | 'EXPIRED';
  createdAt: Timestamp;
  ip?: string;
}

// Business Profile Types
export interface BusinessProfile {
  companyName: string;
  businessType: 'individual' | 'corporation' | 'partnership' | 'llc';
  taxId: string;
  address: BusinessAddress;
  contactPerson: BusinessContact;
  paymentMethods: string[];
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  maxGames: number;
  canCreateGames: boolean;
  canManageUsers: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: BusinessDocument[];
}

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BusinessContact {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'id_document' | 'other';
  name: string;
  url: string;
  uploadedAt: Timestamp;
  verifiedAt?: Timestamp;
}

// Common Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Order and Delivery Types
export interface Address {
  id: string;
  userId: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  estimatedDays: number;
  isAvailable: boolean;
  type: 'PICKUP' | 'HOME_DELIVERY';
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  size?: string;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  shopName: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  totalAmount: number;
  currency: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: Address;
  shippingAddress?: Address;
  paymentMethod: 'MOBILE_MONEY' | 'CREDIT_CARD' | 'PAYPAL';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: number;
  updatedAt: number;
  estimatedDeliveryDate?: number;
  actualDeliveryDate?: number;
  orderNumber: string;
}

// Gamification Types
export type LoyaltyPointTransactionType =
  | 'EARNED_GAME_PLAY'
  | 'EARNED_REFERRAL'
  | 'EARNED_PURCHASE'
  | 'EARNED_DAILY_LOGIN'
  | 'EARNED_STREAK_BONUS'
  | 'REDEEMED_TICKET'
  | 'REDEEMED_DISCOUNT'
  | 'REDEEMED_PRIZE'
  | 'EXPIRED'
  | 'ADJUSTMENT';

export interface LoyaltyPointTransaction {
  id: ID;
  userId: ID;
  type: LoyaltyPointTransactionType;
  points: number; // positive for earned, negative for spent
  description: string;
  referenceId?: ID; // game ID, order ID, etc.
  referenceType?: 'GAME' | 'ORDER' | 'REFERRAL' | 'DAILY_LOGIN' | 'STREAK';
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  metadata?: Record<string, any>;
}

export interface UserLoyaltyProfile {
  userId: ID;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentBalance: number;
  pointsExpiring30Days: number;
  consecutiveDaysStreak: number;
  longestStreak: number;
  lastLoginDate: Timestamp;
  level: number;
  levelName: string;
  nextLevelThreshold: number;
  lifetimeGamesPlayed: number;
  lifetimeReferrals: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LoyaltyLevel {
  id: ID;
  level: number;
  name: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  bonusMultiplier: number; // 1.0 = no bonus, 1.5 = 50% bonus
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface ReferralReward {
  id: ID;
  type: 'POINTS' | 'FREE_TICKETS' | 'DISCOUNT_COUPON';
  value: number;
  description: string;
  isActive: boolean;
  minimumGamePlays?: number; // referee must play X games to trigger reward
}

export interface Referral {
  id: ID;
  referrerId: ID; // user who referred
  refereeId: ID; // user who was referred
  referralCode: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  rewardClaimed: boolean;
  refereeGamesPlayed: number;
  completedAt?: Timestamp;
  rewardClaimedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    refereeFirstPurchase?: Timestamp;
    refereeFirstGamePlay?: Timestamp;
    bonusPointsAwarded?: number;
  };
}

export interface UserReferralProfile {
  userId: ID;
  personalReferralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number;
  lastReferralAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DailyStreak {
  id: ID;
  userId: ID;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Timestamp;
  streakBonuses: {
    day: number;
    pointsAwarded: number;
    awardedAt: Timestamp;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GamePlayReward {
  id: ID;
  gameType: 'PLAY' | 'WIN' | 'LOSE';
  basePoints: number;
  bonusMultiplier: number;
  description: string;
  isActive: boolean;
}

export interface LoyaltyRedemption {
  id: ID;
  name: string;
  description: string;
  type: 'FREE_TICKET' | 'DISCOUNT_COUPON' | 'PRIZE' | 'BONUS_POINTS';
  pointsCost: number;
  value: number; // ticket value, discount amount, etc.
  maxRedemptions?: number;
  currentRedemptions: number;
  isActive: boolean;
  validUntil?: Timestamp;
  requirements: {
    minLevel?: number;
    minLifetimePoints?: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserRedemption {
  id: ID;
  userId: ID;
  redemptionId: ID;
  pointsUsed: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  couponCode?: string;
  usedAt?: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  metadata?: Record<string, any>;
}

// Badge/Achievement Types
export interface Badge {
  id: ID;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'PROGRESS' | 'MILESTONE' | 'SPECIAL';
  category: 'GAMING' | 'SOCIAL' | 'SPENDING' | 'LOYALTY';
  requirements: {
    gamesPlayed?: number;
    totalSpent?: number;
    referrals?: number;
    consecutiveDays?: number;
    [key: string]: any;
  };
  rewardPoints: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface UserBadge {
  id: ID;
  userId: ID;
  badgeId: ID;
  earnedAt: Timestamp;
  progress?: number; // for progress-based badges
  metadata?: Record<string, any>;
}

// Notification Types for Gamification
export interface GamificationNotification {
  id: ID;
  userId: ID;
  type:
    | 'POINTS_EARNED'
    | 'LEVEL_UP'
    | 'BADGE_EARNED'
    | 'STREAK_BONUS'
    | 'REFERRAL_REWARD';
  title: string;
  message: string;
  points?: number;
  badgeId?: ID;
  level?: number;
  isRead: boolean;
  createdAt: Timestamp;
}

// Product Types (Unified for marketplace and games)
export interface Product {
  id: ID;
  name: string;
  description: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  category: string;
  tags: string[];
  shop: Partial<Shop>;
  rating: number;
  reviewsCount: number;
  likeCount: number;
  shareCount: number;
  viewsCount?: number; // Track product page views for analytics
  isAvailable: boolean;
  isFeatured: boolean;
  isNew: boolean;
  stockQuantity?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isLotteryEnabled: boolean;
  lotteryPrice?: number;
  playedCount: number;
  features?: string[];
  specifications?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Payment Types
export interface Payment {
  id: ID;
  userId: ID;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  method: string;
  transactionId?: string;
  ticketId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Winner Types
export interface Winner {
  id: ID;
  gameId: ID;
  userId: ID;
  productId?: ID;
  prize: string;
  prizeValue: number;
  currency: string;
  status: 'PENDING' | 'CLAIMED' | 'DELIVERED' | 'CANCELLED';
  isClaimed?: boolean;
  claimedAt?: Timestamp;
  claimMethod?: 'AUTOMATIC' | 'MANUAL';
  deliveredAt?: Timestamp;
  deliveryMethod?: string;
  trackingNumber?: string;
  deliveryNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Realtime Types
export interface GameCounter {
  gameId: string;
  participants: number;
  maxParticipants: number;
  status: 'active' | 'closed' | 'ended';
  lastUpdate: number;
  winners?: string[];
  prizesClaimed?: number;
  totalPrizeValue?: number;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: number;
  currentPage?: string;
  device?: 'web' | 'mobile';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  read: boolean;
  shopId?: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface LiveNotification {
  id: string;
  userId: string;
  type: 'game_update' | 'new_message' | 'winner_announcement' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

// Marketplace Types
export interface ShopBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  isVerified?: boolean;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  productsCount?: number;
  ordersCount?: number;
  totalRevenue?: number;
  averageResponseTime?: string;
  contactInfo?: {
    email: string;
    phone: string;
    website: string;
  };
  categories: string[];
  tags: string[];
  ownerId: string;
  banners?: ShopBanner[];
  createdAt: number;
  updatedAt: number;
}

export interface ProductPerformanceData {
  productId: string;
  productName: string;
  shopName: string;
  sales: number;
  revenue: number;
  likes: number;
  views: number;
  conversionRate: number;
  rating: number;
}

export interface MarketplaceStats {
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalMarketplaceRevenue: number;
  totalLikes: number;
  totalFollows: number;
  totalReviews: number;
  averageShopRating: number;
  activeShops: number;
  pendingShopApplications: number;
}

export interface VendorApplication {
  id: ID;
  userId: ID;
  userEmail: string;
  userName: string;
  companyName: string;
  businessRegistrationNumber: string;
  companyWebsite?: string;
  contactEmail: string;
  contactPhone: string;
  companyLogoUrl?: string;
  businessCertificateUrl?: string;
  productCategory: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  rejectionReason?: string;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: ID;
  updatedAt: Timestamp;
}

export interface MarketplaceTrends {
  period: string;
  orders: number;
  revenue: number;
  newShops: number;
  newProducts: number;
  activeUsers: number;
}

export interface Review {
  id: ID;
  userId: ID;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
  likes: number;
  productId: ID;
}

// Note: Marketplace types are defined inline to avoid circular imports
