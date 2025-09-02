import { ID, Timestamp } from '@/types';

// Vendor Types
export interface Vendor {
  id: ID;
  userId: ID;
  companyName: string;
  businessType: 'individual' | 'corporation' | 'partnership' | 'llc';
  businessRegistrationNumber: string;
  companyWebsite?: string;
  contactEmail: string;
  contactPhone: string;
  companyLogo?: string;
  businessCertificate?: string;
  productCategory: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isActive: boolean;
  rating: number;
  reviewCount: number;
  totalGames: number;
  totalRevenue: number;
  followerCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: ID;
  rejectionReason?: string;
}

export interface VendorProfile extends Vendor {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
  };
  businessProfile: {
    address: BusinessAddress;
    contactPerson: BusinessContact;
    paymentMethods: string[];
    subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';
    subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
    maxGames: number;
    canCreateGames: boolean;
    canManageUsers: boolean;
  };
  documents: BusinessDocument[];
  analytics: VendorAnalytics;
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
  id: ID;
  type: 'business_license' | 'tax_certificate' | 'id_document' | 'other';
  name: string;
  url: string;
  uploadedAt: Timestamp;
  verifiedAt?: Timestamp;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface VendorAnalytics {
  totalViews: number;
  totalFollowers: number;
  totalProducts: number;
  totalRevenue: number;
  averageRating: number;
  monthlyStats: Array<{
    month: string;
    views: number;
    followers: number;
    revenue: number;
    games: number;
  }>;
  topProducts: Array<{
    id: ID;
    name: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
}

// Vendor Application Types - Imported from vendor-application feature
export type { VendorApplication } from '../../vendor-application/api/types';

// Vendor Game Management Types
export interface VendorGame {
  id: ID;
  vendorId: ID;
  title: string;
  description: string;
  category: string;
  ticketPrice: number;
  currency: string;
  maxParticipants: number;
  currentParticipants: number;
  totalPrizePool: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  drawDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  analytics: {
    totalViews: number;
    totalTickets: number;
    totalRevenue: number;
    conversionRate: number;
  };
}

// Vendor API Response Types
export interface VendorsResponse {
  data: Vendor[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Vendor Applications Response - Imported from vendor-application feature
export type { VendorApplicationsResponse } from '../../vendor-application/api/types';

// Vendor API Request Types
export interface VendorsQueryParams {
  search?: string;
  category?: string;
  status?: string;
  limit?: number;
  page?: number;
  sortBy?: 'rating' | 'totalGames' | 'totalRevenue' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Vendor Applications Query Params - Imported from vendor-application feature
export type { VendorApplicationsQueryParams } from '../../vendor-application/api/types';

// Vendor Settings Types
export interface VendorSettings {
  id: ID;
  vendorId: ID;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    gameUpdates: boolean;
    paymentNotifications: boolean;
    followerNotifications: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
    allowContact: boolean;
  };
  business: {
    autoApproveGames: boolean;
    requireManualReview: boolean;
    maxGamesPerMonth: number;
    allowCustomPrizes: boolean;
  };
  updatedAt: Timestamp;
}
