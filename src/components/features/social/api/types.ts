import { ID, Timestamp } from '@/types';

// Follow System Types
export interface Follow {
  id: ID;
  followerId: ID;
  followingId: ID;
  followingType: 'USER' | 'SHOP' | 'VENDOR';
  createdAt: Timestamp;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

// Like System Types
export interface Like {
  id: ID;
  userId: ID;
  targetId: ID;
  targetType: 'PRODUCT' | 'SHOP' | 'POST' | 'REVIEW';
  createdAt: Timestamp;
}

export interface LikeStats {
  likesCount: number;
  isLiked: boolean;
  recentLikers: Array<{
    userId: ID;
    userName: string;
    userAvatar?: string;
  }>;
}

// Chat System Types
export interface ChatRoom {
  id: ID;
  participants: ID[];
  participantDetails: Array<{
    userId: ID;
    userName: string;
    userAvatar?: string;
    role: 'USER' | 'VENDOR' | 'ADMIN';
  }>;
  type: 'DIRECT' | 'SHOP_SUPPORT' | 'GROUP';
  shopId?: ID;
  lastMessage?: ChatMessage;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id: ID;
  chatRoomId: ID;
  senderId: ID;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'PRODUCT_SHARE' | 'ORDER_UPDATE';
  metadata?: {
    productId?: ID;
    orderId?: ID;
    imageUrl?: string;
    fileName?: string;
    fileUrl?: string;
  };
  isRead: boolean;
  readBy: Array<{
    userId: ID;
    readAt: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
}

export interface ChatPreview {
  chatRoom: ChatRoom;
  unreadCount: number;
  lastActivity: Timestamp;
}

// Review System Types
export interface Review {
  id: ID;
  userId: ID;
  userName: string;
  userAvatar?: string;
  targetId: ID;
  targetType: 'PRODUCT' | 'SHOP' | 'VENDOR';
  rating: number; // 1-5 stars
  title: string;
  content: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  userVote?: 'HELPFUL' | 'NOT_HELPFUL';
  response?: {
    content: string;
    responderId: ID;
    responderName: string;
    respondedAt: Timestamp;
  };
  status: 'PENDING' | 'PUBLISHED' | 'HIDDEN' | 'REPORTED';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  hasUserReviewed: boolean;
  userReview?: Review;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  recommendationPercentage: number;
  mostMentioned: string[];
}

// Social Activity Types
export interface SocialActivity {
  id: ID;
  userId: ID;
  userName: string;
  userAvatar?: string;
  type: 'FOLLOW' | 'LIKE' | 'REVIEW' | 'PURCHASE' | 'WIN';
  targetId: ID;
  targetType: 'USER' | 'PRODUCT' | 'SHOP' | 'GAME';
  targetName: string;
  metadata?: {
    rating?: number;
    prizeAmount?: number;
    productImage?: string;
    shopName?: string;
  };
  isPublic: boolean;
  createdAt: Timestamp;
}

// Notification Types for Social Features
export interface SocialNotification {
  id: ID;
  userId: ID;
  type:
    | 'NEW_FOLLOWER'
    | 'NEW_LIKE'
    | 'NEW_REVIEW'
    | 'REVIEW_RESPONSE'
    | 'NEW_MESSAGE'
    | 'MENTION';
  title: string;
  message: string;
  actorId: ID;
  actorName: string;
  actorAvatar?: string;
  targetId?: ID;
  targetType?: 'PRODUCT' | 'SHOP' | 'REVIEW' | 'MESSAGE';
  isRead: boolean;
  createdAt: Timestamp;
}

// API Request/Response Types
export interface FollowRequest {
  targetId: ID;
  targetType: 'USER' | 'SHOP' | 'VENDOR';
}

export interface LikeRequest {
  targetId: ID;
  targetType: 'PRODUCT' | 'SHOP' | 'POST' | 'REVIEW';
}

export interface ChatMessageRequest {
  chatRoomId: ID;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'PRODUCT_SHARE';
  metadata?: {
    productId?: ID;
    imageUrl?: string;
    fileName?: string;
    fileUrl?: string;
  };
}

export interface CreateReviewRequest {
  targetId: ID;
  targetType: 'PRODUCT' | 'SHOP' | 'VENDOR';
  rating: number;
  title: string;
  content: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  reviewId: ID;
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
}

export interface ReviewResponseRequest {
  reviewId: ID;
  content: string;
}

export interface ReviewVoteRequest {
  reviewId: ID;
  vote: 'HELPFUL' | 'NOT_HELPFUL';
}

// Query Parameters
export interface SocialQueryParams {
  userId?: ID;
  targetId?: ID;
  targetType?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  includeStats?: boolean;
}

export interface ChatQueryParams {
  userId: ID;
  limit?: number;
  before?: Timestamp;
  includeRead?: boolean;
}

export interface ReviewQueryParams {
  targetId: ID;
  targetType: 'PRODUCT' | 'SHOP' | 'VENDOR';
  rating?: number;
  verified?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'helpful';
  limit?: number;
  offset?: number;
}

// Response Types
export interface SocialResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedSocialResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}
