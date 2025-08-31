import { useQuery } from '@tanstack/react-query';
import { GameCategory, LotteryGame } from '@/types';
import { 
  GamesQueryParams, 
  GamesResponse, 
  CategoriesResponse,
  GameStats,
  VendorApplication
} from './types';
import { 
  getMockCategories, 
  getMockGames, 
  getMockFeaturedGames,
  QUERY_KEYS,
  GAMES_CACHE_TIME,
  CATEGORIES_CACHE_TIME,
  getCategoriesWithCounts
} from './data';

// Games Query Hook
export const useGames = (params: GamesQueryParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.gamesWithParams(params),
    queryFn: async (): Promise<GamesResponse> => {
      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const games = getMockGames(params);
        const allGames = getMockGames(); // Get total count
        
        return {
          data: games,
          total: allGames.length,
          page: params.page || 1,
          limit: params.limit || 12,
          hasMore: games.length === (params.limit || 12)
        };
      }
      
      // Production: Real Firebase query
      // TODO: Implement real Firebase queries when ready
      const mockGames = getMockGames(params);
      return {
        data: mockGames,
        total: mockGames.length,
        page: params.page || 1,
        limit: params.limit || 12,
        hasMore: false
      };
    },
    staleTime: GAMES_CACHE_TIME,
    gcTime: GAMES_CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Categories Query Hook (alias for compatibility)
export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async (): Promise<GameCategory[]> => {
      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockCategories();
      }
      
      // Production: Real Firebase query
      // TODO: Implement real Firebase queries when ready
      return getMockCategories();
    },
    staleTime: CATEGORIES_CACHE_TIME,
    gcTime: CATEGORIES_CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Categories Query Hook
export const useGameCategories = () => {
  return useCategories();
};

// Featured Games Query Hook
export const useFeaturedGames = () => {
  return useQuery({
    queryKey: QUERY_KEYS.featuredGames,
    queryFn: async (): Promise<LotteryGame[]> => {
      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockFeaturedGames();
      }
      
      // Production: Real Firebase query
      // TODO: Implement real Firebase queries when ready
      return getMockFeaturedGames();
    },
    staleTime: GAMES_CACHE_TIME,
    gcTime: GAMES_CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Game Statistics Hook
export const useGameStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.gameStats,
    queryFn: async (): Promise<GameStats> => {
      const games = getMockGames();
      const activeGames = games.filter(g => g.status === 'ACTIVE');
      
      return {
        totalGames: games.length,
        activeGames: activeGames.length,
        totalParticipants: games.reduce((sum, game) => sum + game.currentParticipants, 0),
        totalPrizeValue: games.reduce((sum, game) => sum + game.totalPrizePool, 0)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Categories with Game Counts Hook
export const useCategoriesWithCounts = () => {
  const { data: gamesResponse } = useGames();
  const games = gamesResponse?.data || [];
  
  return useQuery({
    queryKey: ['categories-with-counts', games.length],
    queryFn: async () => {
      return getCategoriesWithCounts(games);
    },
    enabled: !!games.length,
    staleTime: CATEGORIES_CACHE_TIME,
    gcTime: CATEGORIES_CACHE_TIME * 2,
  });
};

// Search Games Hook with Debouncing
export const useSearchGames = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search-games', searchTerm],
    queryFn: async (): Promise<LotteryGame[]> => {
      if (!searchTerm.trim()) return [];
      
      return getMockGames({ search: searchTerm, limit: 20 });
    },
    enabled: enabled && searchTerm.length > 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

// Vendor Application Query Hook
export const useVendorApplication = (userId: string) => {
  return useQuery({
    queryKey: ['vendor-application', userId],
    queryFn: async (): Promise<VendorApplication | null> => {
      if (!userId) return null;
      
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        // Mock data - no pending application for demo
        return null;
      }
      
      // Production: Real Firebase query
      // TODO: Implement real Firebase query to get vendor application
      return null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};