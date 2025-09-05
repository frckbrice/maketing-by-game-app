import { useQuery } from '@tanstack/react-query';
import { vendorService } from '@/lib/api/vendorService';
import { LotteryGame, PaginatedResponse } from '@/types';
import {
  VendorStats,
  VendorGamesParams,
  VendorAnalyticsResponse,
  VendorGameLimits,
  VendorDashboardData,
} from './types';

// Query Keys
export const VENDOR_QUERY_KEYS = {
  all: ['vendor'] as const,
  stats: (vendorId: string) =>
    [...VENDOR_QUERY_KEYS.all, 'stats', vendorId] as const,
  games: (vendorId: string) =>
    [...VENDOR_QUERY_KEYS.all, 'games', vendorId] as const,
  gamesWithParams: (vendorId: string, params: VendorGamesParams) =>
    [...VENDOR_QUERY_KEYS.games(vendorId), params] as const,
  game: (gameId: string) => [...VENDOR_QUERY_KEYS.all, 'game', gameId] as const,
  analytics: (vendorId: string, period?: string) =>
    [...VENDOR_QUERY_KEYS.all, 'analytics', vendorId, period] as const,
};

// Cache times
const VENDOR_STATS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const VENDOR_GAMES_CACHE_TIME = 2 * 60 * 1000; // 2 minutes
const VENDOR_ANALYTICS_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook to fetch vendor statistics
 */
export const useVendorStats = (vendorId: string) => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.stats(vendorId),
    queryFn: () => vendorService.getVendorStats(vendorId),
    staleTime: VENDOR_STATS_CACHE_TIME,
    gcTime: VENDOR_STATS_CACHE_TIME * 2,
    enabled: !!vendorId,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch vendor games with pagination and filtering
 */
export const useVendorGames = (
  vendorId: string,
  params: VendorGamesParams = {}
) => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.gamesWithParams(vendorId, params),
    queryFn: () => vendorService.getVendorGames(vendorId, params),
    staleTime: VENDOR_GAMES_CACHE_TIME,
    gcTime: VENDOR_GAMES_CACHE_TIME * 2,
    enabled: !!vendorId,
    refetchOnWindowFocus: false,
    select: (data: PaginatedResponse<LotteryGame>) => {
      // Transform data if needed
      return {
        ...data,
        data: data.data.map(game => ({
          ...game,
          // Add computed fields
          isPending: game.status === 'DRAFT',
          isActive: game.status === 'ACTIVE',
          canEdit: game.status === 'DRAFT',
          revenue: game.ticketPrice * game.currentParticipants,
        })),
      };
    },
  });
};

/**
 * Hook to fetch a single game by ID
 */
export const useVendorGame = (gameId: string) => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.game(gameId),
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }
      return response.json();
    },
    staleTime: VENDOR_GAMES_CACHE_TIME,
    gcTime: VENDOR_GAMES_CACHE_TIME * 2,
    enabled: !!gameId,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch vendor analytics data
 */
export const useVendorAnalytics = (
  vendorId: string,
  period: string = '30d'
) => {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.analytics(vendorId, period),
    queryFn: async () => {
      const response = await fetch(
        `/api/vendor/analytics?vendorId=${vendorId}&period=${period}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch vendor analytics');
      }
      return response.json();
    },
    staleTime: VENDOR_ANALYTICS_CACHE_TIME,
    gcTime: VENDOR_ANALYTICS_CACHE_TIME * 2,
    enabled: !!vendorId,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get real-time vendor dashboard data
 */
export const useVendorDashboard = (vendorId: string) => {
  const statsQuery = useVendorStats(vendorId);
  const gamesQuery = useVendorGames(vendorId, { limit: 5 });
  const analyticsQuery = useVendorAnalytics(vendorId);

  return {
    stats: statsQuery.data,
    recentGames: gamesQuery.data?.data || [],
    analytics: analyticsQuery.data,
    isLoading:
      statsQuery.isLoading || gamesQuery.isLoading || analyticsQuery.isLoading,
    error: statsQuery.error || gamesQuery.error || analyticsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      gamesQuery.refetch();
      analyticsQuery.refetch();
    },
  };
};

/**
 * Hook to check if vendor can create more games
 */
export const useVendorGameLimits = (vendorId: string) => {
  return useQuery({
    queryKey: [...VENDOR_QUERY_KEYS.all, 'limits', vendorId],
    queryFn: async () => {
      const stats = await vendorService.getVendorStats(vendorId);
      // This would come from user role/subscription in real implementation
      const maxGames = 10; // Default limit for vendors

      return {
        currentGames: stats.totalGames,
        maxGames,
        canCreateMore: stats.totalGames < maxGames,
        remaining: Math.max(0, maxGames - stats.totalGames),
      };
    },
    staleTime: VENDOR_STATS_CACHE_TIME,
    enabled: !!vendorId,
  });
};
