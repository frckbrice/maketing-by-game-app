import { GameCategory, LotteryGame } from '@/types';
import { MOCK_CATEGORIES, MOCK_GAMES } from '@/lib/constants/mockData';

// Constants for game queries
export const GAMES_PER_PAGE = 12;
export const FEATURED_GAMES_LIMIT = 6;
export const CATEGORIES_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
export const GAMES_CACHE_TIME = 2 * 60 * 1000; // 2 minutes

// Default category for "All Games"
export const ALL_CATEGORIES_OPTION: GameCategory = {
  id: 'all',
  name: 'All Categories',
  description: 'Browse all available games',
  icon: '🎯',
  color: '#6366f1',
  isActive: true,
  sortOrder: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Mock data helpers for development
export const getMockCategories = (): GameCategory[] => {
  return [ALL_CATEGORIES_OPTION, ...MOCK_CATEGORIES];
};

export const getMockGames = (params?: {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
  featured?: boolean;
}): LotteryGame[] => {
  let games = [...MOCK_GAMES];
  
  // Apply search filter
  if (params?.search) {
    const searchTerm = params.search.toLowerCase();
    games = games.filter(game => 
      game.title.toLowerCase().includes(searchTerm) ||
      game.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply category filter
  if (params?.category && params.category !== 'all') {
    games = games.filter(game => game.categoryId === params.category);
  }
  
  // Apply featured filter
  if (params?.featured) {
    games = games.filter(game => 
      game.status === 'ACTIVE' && 
      (game.currentParticipants >= (game.maxParticipants * 0.7))
    );
  }
  
  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || GAMES_PER_PAGE;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return games.slice(startIndex, endIndex);
};

export const getMockFeaturedGames = (): LotteryGame[] => {
  return getMockGames({ 
    featured: true, 
    limit: FEATURED_GAMES_LIMIT 
  });
};

// Game categories with game counts
export const getCategoriesWithCounts = (games: LotteryGame[]): Array<GameCategory & { gameCount: number }> => {
  const categories = getMockCategories();
  
  return categories.map(category => {
    const gameCount = category.id === 'all' 
      ? games.length 
      : games.filter(game => game.categoryId === category.id).length;
    
    return {
      ...category,
      gameCount
    };
  });
};

// Performance optimization helpers
export const createGameCardData = (game: LotteryGame) => ({
  id: game.id,
  title: game.title,
  description: game.description,
  ticketPrice: game.ticketPrice,
  currency: game.currency,
  maxParticipants: game.maxParticipants,
  currentParticipants: game.currentParticipants,
  endDate: game.endDate,
  images: game.images,
  category: {
    name: game.category?.name || 'General',
    color: game.category?.color || '#6366f1',
    icon: game.category?.icon || '🎮'
  },
  featured: game.currentParticipants >= (game.maxParticipants * 0.7),
  status: game.status
});

// Query keys for React Query
export const QUERY_KEYS = {
  games: ['games'] as const,
  gamesWithParams: (params: any) => ['games', params] as const,
  categories: ['categories'] as const,
  featuredGames: ['featured-games'] as const,
  gameStats: ['game-stats'] as const,
} as const;