import { ID, Timestamp } from '@/types';

// Dashboard Overview Types
export interface DashboardOverview {
  totalGames: number;
  activeGames: number;
  totalParticipants: number;
  totalRevenue: number;
  totalUsers: number;
  totalVendors: number;
  conversionRate: number;
  averageTicketPrice: number;
  monthlyGrowth: {
    games: number;
    users: number;
    revenue: number;
  };
}

export interface DashboardStats {
  overview: DashboardOverview;
  recentActivity: DashboardActivity[];
  topGames: TopGame[];
  userMetrics: UserMetrics;
  revenueMetrics: RevenueMetrics;
}

// Dashboard Activity Types
export interface DashboardActivity {
  id: ID;
  type: 'GAME_CREATED' | 'GAME_JOINED' | 'PAYMENT_RECEIVED' | 'USER_REGISTERED' | 'VENDOR_APPROVED';
  title: string;
  description: string;
  userId?: ID;
  gameId?: ID;
  amount?: number;
  currency?: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

// Top Games Types
export interface TopGame {
  id: ID;
  title: string;
  participants: number;
  revenue: number;
  conversionRate: number;
  category: string;
  status: string;
  endDate: Timestamp;
}

// User Metrics Types
export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  userRetention: number;
  demographics: UserDemographics;
  deviceStats: DeviceStats;
  userSegments: UserSegment[];
}

export interface UserDemographics {
  ageGroups: Array<{ age: string; count: number; percentage: number }>;
  genders: Array<{ gender: string; count: number; percentage: number }>;
  countries: Array<{ country: string; count: number; percentage: number }>;
  cities: Array<{ city: string; count: number; percentage: number }>;
}

export interface DeviceStats {
  devices: Array<{ device: string; count: number; percentage: number }>;
  browsers: Array<{ browser: string; count: number; percentage: number }>;
  operatingSystems: Array<{ os: string; count: number; percentage: number }>;
}

export interface UserSegment {
  id: ID;
  name: string;
  description: string;
  criteria: Record<string, any>;
  userCount: number;
  averageValue: number;
  conversionRate: number;
}

// Revenue Metrics Types
export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  revenueByCategory: RevenueByCategory[];
  revenueByDay: RevenueByDay[];
  topRevenueSources: TopRevenueSource[];
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
  percentage: number;
  gameCount: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  transactions: number;
  users: number;
}

export interface TopRevenueSource {
  id: ID;
  name: string;
  revenue: number;
  percentage: number;
  type: 'GAME' | 'SUBSCRIPTION' | 'FEATURE';
}

// Game Performance Types
export interface GamePerformance {
  totalGames: number;
  activeGames: number;
  completedGames: number;
  averageParticipants: number;
  averagePrizePool: number;
  topPerformingGames: TopPerformingGame[];
  categoryPerformance: CategoryPerformance[];
}

export interface TopPerformingGame {
  id: ID;
  title: string;
  participants: number;
  revenue: number;
  conversionRate: number;
  category: string;
  endDate: Timestamp;
}

export interface CategoryPerformance {
  category: string;
  gameCount: number;
  totalParticipants: number;
  totalRevenue: number;
  averageConversionRate: number;
}

// Notification Types
export interface DashboardNotification {
  id: ID;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
}

// Dashboard API Response Types
export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  error?: string;
}

export interface DashboardActivityResponse {
  data: DashboardActivity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Dashboard API Request Types
export interface DashboardQueryParams {
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: Timestamp;
  endDate?: Timestamp;
  category?: string;
  limit?: number;
  page?: number;
}

export interface DashboardActivityQueryParams {
  type?: string;
  userId?: ID;
  gameId?: ID;
  limit?: number;
  page?: number;
  sortBy?: 'timestamp' | 'type' | 'amount';
  sortOrder?: 'asc' | 'desc';
}
