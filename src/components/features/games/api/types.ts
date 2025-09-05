import { ID, Timestamp } from '@/types';

// Re-export types from main types file
export type { LotteryGame } from '@/types';

// Games API Response Types
export interface GamesResponse {
  data: import('@/types').LotteryGame[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CategoriesResponse {
  data: GameCategory[];
  total: number;
}

// Game Category Types
export interface GameCategory {
  id: ID;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Games API Request Types
export interface GamesQueryParams {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
  featured?: boolean;
  status?: 'active' | 'draft' | 'closed';
  sortBy?: 'createdAt' | 'participants' | 'endDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoriesQueryParams {
  isActive?: boolean;
  sortBy?: 'sortOrder' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Featured Games Types
export interface FeaturedGamesParams {
  limit?: number;
  minParticipationRate?: number;
}

// Game Statistics
export interface GameStats {
  totalGames: number;
  activeGames: number;
  totalParticipants: number;
  totalPrizeValue: number;
}

// Category with Game Count
export interface CategoryWithCount extends GameCategory {
  gameCount: number;
  activeGameCount: number;
}

// Performance Types
export interface GameCardData {
  id: string;
  title: string;
  description: string;
  ticketPrice: number;
  currency: string;
  maxParticipants: number;
  currentParticipants: number;
  endDate: number;
  images: Array<{ url: string; alt: string }>;
  category: Pick<GameCategory, 'name' | 'color' | 'icon'>;
  featured?: boolean;
  status: string;
}

// Vendor Application interface is imported from vendor-application feature
