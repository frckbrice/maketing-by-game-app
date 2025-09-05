import { ID, Timestamp } from '@/types';

// Winner Types
export interface Winner {
  id: ID;
  userId: ID;
  gameId: ID;
  ticketId: ID;
  prizeId: ID;
  prizeType: 'CASH' | 'PRODUCT' | 'SERVICE' | 'EXPERIENCE';
  prizeValue: number;
  currency: string;
  prizeName: string;
  prizeDescription: string;
  prizeImage?: string;
  isClaimed: boolean;
  claimedAt?: Timestamp;
  claimMethod?: 'AUTOMATIC' | 'MANUAL';
  status: 'PENDING' | 'CLAIMED' | 'DELIVERED' | 'CANCELLED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WinnerWithDetails extends Winner {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  game: {
    title: string;
    category: string;
    endDate: Timestamp;
  };
  ticket: {
    ticketNumber: string;
    purchaseDate: Timestamp;
  };
}

// Winner Announcement Types
export interface WinnerAnnouncement {
  id: ID;
  winnerId: ID;
  gameId: ID;
  title: string;
  message: string;
  imageUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Winner Statistics Types
export interface WinnerStats {
  totalWinners: number;
  totalPrizeValue: number;
  averagePrizeValue: number;
  topPrizeValue: number;
  winnersThisMonth: number;
  winnersThisYear: number;
  prizeDistribution: PrizeDistribution[];
  categoryWinners: CategoryWinners[];
}

export interface PrizeDistribution {
  prizeType: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface CategoryWinners {
  category: string;
  winnerCount: number;
  totalPrizeValue: number;
  averagePrizeValue: number;
}

// Winner API Response Types
export interface WinnersResponse {
  data: WinnerWithDetails[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WinnerAnnouncementsResponse {
  data: WinnerAnnouncement[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WinnerStatsResponse {
  success: boolean;
  data: WinnerStats;
  error?: string;
}

// Winner API Request Types
export interface WinnersQueryParams {
  userId?: ID;
  gameId?: ID;
  prizeType?: string;
  status?: string;
  dateRange?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  limit?: number;
  page?: number;
  sortBy?: 'createdAt' | 'prizeValue' | 'claimedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface WinnerAnnouncementsQueryParams {
  gameId?: ID;
  isPublic?: boolean;
  isFeatured?: boolean;
  limit?: number;
  page?: number;
  sortBy?: 'publishedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Winner Claim Types
export interface WinnerClaim {
  id: ID;
  winnerId: ID;
  claimMethod: 'AUTOMATIC' | 'MANUAL';
  claimDetails: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: Timestamp;
  approvedBy?: ID;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WinnerClaimRequest {
  winnerId: ID;
  claimMethod: 'AUTOMATIC' | 'MANUAL';
  claimDetails: Record<string, any>;
}

// Winner Verification Types
export interface WinnerVerification {
  id: ID;
  winnerId: ID;
  verificationType: 'ID_DOCUMENT' | 'ADDRESS_PROOF' | 'BANK_DETAILS' | 'OTHER';
  documentUrl: string;
  documentType: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: Timestamp;
  verifiedBy?: ID;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Winner Leaderboard Types
export interface WinnerLeaderboard {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';
  winners: WinnerLeaderboardEntry[];
  lastUpdated: Timestamp;
}

export interface WinnerLeaderboardEntry {
  rank: number;
  userId: ID;
  firstName: string;
  lastName: string;
  avatar?: string;
  totalWinnings: number;
  currency: string;
  gamesWon: number;
  biggestWin: number;
  lastWinDate: Timestamp;
}

// Winner Notification Types
export interface WinnerNotification {
  id: ID;
  winnerId: ID;
  type:
    | 'WIN_ANNOUNCEMENT'
    | 'PRIZE_CLAIM'
    | 'PRIZE_DELIVERY'
    | 'VERIFICATION_REQUIRED';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
}

// Winner API Request Types
export interface WinnerLeaderboardQueryParams {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';
  limit?: number;
  category?: string;
}

export interface WinnerNotificationsQueryParams {
  winnerId?: ID;
  type?: string;
  isRead?: boolean;
  limit?: number;
  page?: number;
  sortBy?: 'createdAt' | 'type';
  sortOrder?: 'asc' | 'desc';
}
