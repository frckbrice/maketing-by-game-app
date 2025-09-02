import { ID, Timestamp } from '@/types';

// Authentication Types
export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface PasswordReset {
  email: string;
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: Timestamp;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// User Profile Types - Imported from profile feature
export type { UserProfile } from '../../profile/api/types';

// Session Types
export interface UserSession {
  id: ID;
  userId: ID;
  token: string;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  isActive: boolean;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  lastActivityAt: Timestamp;
}

// Two-Factor Authentication Types
export interface TwoFactorSetup {
  userId: ID;
  secret: string;
  qrCode: string;
  backupCodes: string[];
  isEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TwoFactorVerification {
  userId: ID;
  code: string;
  method: 'totp' | 'sms' | 'email';
  isValid: boolean;
  createdAt: Timestamp;
}

// Password Security Types
export interface PasswordHistory {
  userId: ID;
  passwordHash: string;
  createdAt: Timestamp;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords to prevent reuse
}
