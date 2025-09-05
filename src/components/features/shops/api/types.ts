import { ID, Timestamp } from '../../../../types';

// Shop Types
export interface Shop {
  id: ID;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  productCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: ID;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// Product type is now unified in the main types file
export type { Product } from '../../../../types';

// Shop API Response Types
export interface ShopsResponse {
  data: Shop[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductsResponse {
  data: import('../../../../types').Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Shop API Request Types
export interface ShopsQueryParams {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
  featured?: boolean;
  sortBy?: 'rating' | 'followerCount' | 'productCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsQueryParams {
  search?: string;
  shopId?: string;
  category?: string;
  priceRange?: { min: number; max: number };
  limit?: number;
  page?: number;
  featured?: boolean;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
}

// Shop Interaction Types
export interface ShopFollow {
  shopId: ID;
  userId: ID;
  followedAt: Timestamp;
}

export interface ProductLike {
  productId: ID;
  userId: ID;
  likedAt: Timestamp;
}

export interface ProductShare {
  productId: ID;
  userId: ID;
  method: 'native' | 'facebook' | 'twitter' | 'whatsapp' | 'email';
  sharedAt: Timestamp;
}

// Shop Performance Types
export interface ShopsPerformanceData {
  shopId: string;
  shopName: string;
  revenue: number;
  orders: number;
  products: number;
  likes: number;
  follows: number;
  reviews: number;
  rating: number;
  conversionRate: number;
}

// Vendor Banner Types
export interface VendorBanner {
  id: ID;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  shopId: ID;
  isActive: boolean;
  priority: number;
  startDate: Timestamp;
  endDate: Timestamp;
  clickCount: number;
  impressionCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Shop Analytics
export interface ShopAnalytics {
  shopId: ID;
  totalViews: number;
  totalFollowers: number;
  totalProducts: number;
  totalRevenue: number;
  averageRating: number;
  topProducts: Array<{
    id: ID;
    name: string;
    views: number;
    sales: number;
  }>;
  monthlyStats: Array<{
    month: string;
    views: number;
    followers: number;
    revenue: number;
  }>;
}

// Review Types
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
