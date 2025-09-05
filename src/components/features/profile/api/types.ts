import { ID, Timestamp } from '@/types';

// User Profile Types
export interface UserProfile {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  bio?: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExtendedUserProfile extends UserProfile {
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  socialMedia: SocialMediaLinks;
  statistics: UserStatistics;
}

// User Preferences Types
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailUpdates: boolean;
  smsUpdates: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStart: 'monday' | 'sunday';
}

// Notification Settings Types
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  gameUpdates: boolean;
  winnerAnnouncements: boolean;
  paymentNotifications: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

// Privacy Settings Types
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  showDateOfBirth: boolean;
  showLocation: boolean;
  allowContact: boolean;
  dataSharing: boolean;
  searchable: boolean;
  showGameHistory: boolean;
  showWinnings: boolean;
}

// Social Media Types
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  snapchat?: string;
}

// User Statistics Types
export interface UserStatistics {
  totalGames: number;
  gamesWon: number;
  totalWinnings: number;
  favoriteCategory: string;
  totalTickets: number;
  averageTicketPrice: number;
  memberSince: Timestamp;
  lastActive: Timestamp;
  streak: number;
  level: number;
  experience: number;
}

// Profile Update Types
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  bio?: string;
  isPublic?: boolean;
}

export interface PreferencesUpdateData {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailUpdates?: boolean;
  smsUpdates?: boolean;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  weekStart?: 'monday' | 'sunday';
}

export interface NotificationSettingsUpdateData {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
  marketing?: boolean;
  gameUpdates?: boolean;
  winnerAnnouncements?: boolean;
  paymentNotifications?: boolean;
  securityAlerts?: boolean;
  weeklyDigest?: boolean;
}

export interface PrivacySettingsUpdateData {
  profileVisibility?: 'public' | 'private' | 'friends';
  showEmail?: boolean;
  showPhone?: boolean;
  showDateOfBirth?: boolean;
  showLocation?: boolean;
  allowContact?: boolean;
  dataSharing?: boolean;
  searchable?: boolean;
  showGameHistory?: boolean;
  showWinnings?: boolean;
}

// Profile API Response Types
export interface ProfileResponse {
  success: boolean;
  data: ExtendedUserProfile;
  error?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data: ExtendedUserProfile;
  message?: string;
  error?: string;
}

// Profile API Request Types
export interface ProfileQueryParams {
  includePreferences?: boolean;
  includeStatistics?: boolean;
  includeSocialMedia?: boolean;
}

// Avatar Upload Types
export interface AvatarUpload {
  file: File;
  userId: ID;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AvatarUploadResponse {
  success: boolean;
  data: {
    avatarUrl: string;
    thumbnailUrl: string;
  };
  error?: string;
}

// Profile Verification Types
export interface ProfileVerification {
  id: ID;
  userId: ID;
  type: 'EMAIL' | 'PHONE' | 'ID_DOCUMENT' | 'ADDRESS';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentUrl?: string;
  verifiedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Profile Activity Types
export interface ProfileActivity {
  id: ID;
  userId: ID;
  type:
    | 'PROFILE_UPDATE'
    | 'PREFERENCE_CHANGE'
    | 'PRIVACY_CHANGE'
    | 'AVATAR_UPLOAD';
  description: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

// Profile API Request Types
export interface ProfileActivityQueryParams {
  type?: string;
  limit?: number;
  page?: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  sortBy?: 'timestamp' | 'type';
  sortOrder?: 'asc' | 'desc';
}
