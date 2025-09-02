import { 
  UserLoyaltyProfile, 
  UserReferralProfile, 
  DailyStreak,
  UserBadge,
  GamificationNotification,
  LoyaltyPointTransaction 
} from '@/types';

export interface GamificationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoyaltyProfileResponse extends GamificationResponse<UserLoyaltyProfile> {
  profile?: UserLoyaltyProfile;
}

export interface ReferralProfileResponse extends GamificationResponse<UserReferralProfile> {
  profile?: UserReferralProfile;
}

export interface StreakResponse extends GamificationResponse<DailyStreak> {
  streak?: DailyStreak;
  streakUpdated?: boolean;
  pointsAwarded?: number;
}

export interface UserBadgeWithDetails extends UserBadge {
  badgeDetails?: {
    name: string;
    description: string;
    icon: string;
    color: string;
    type: 'PROGRESS' | 'MILESTONE' | 'SPECIAL';
    category: 'GAMING' | 'SOCIAL' | 'SPENDING' | 'LOYALTY';
    rewardPoints: number;
  };
}

export interface BadgesResponse extends GamificationResponse<UserBadgeWithDetails[]> {
  badges?: UserBadgeWithDetails[];
  newBadges?: UserBadgeWithDetails[];
}

export interface NotificationsResponse extends GamificationResponse<GamificationNotification[]> {
  notifications?: GamificationNotification[];
}

export interface AwardPointsRequest {
  action: 'award_points';
  points: number;
  description?: string;
  referenceId?: string;
  referenceType?: 'GAME' | 'ORDER' | 'REFERRAL' | 'DAILY_LOGIN' | 'STREAK';
}

export interface GenerateReferralCodeRequest {
  action: 'generate_code';
}

export interface ApplyReferralRequest {
  action: 'apply_referral';
  referralCode: string;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface PointsTransactionHistory {
  transactions: LoyaltyPointTransaction[];
  total: number;
  hasMore: boolean;
}