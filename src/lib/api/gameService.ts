import { GameCategory, LotteryGame } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  getDefaultCategory,
  getMockCategories,
  getMockGames,
  getMockGamesWithCategories,
} from '../constants';
import { db } from '../firebase/config';
import i18n from '../i18n/config';

export class GameService {
  private static instance: GameService;

  private locale = i18n.language === 'en' ? 'en' : 'ar';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  // Cache management methods
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private isCacheExpired(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return true;
    return Date.now() - cached.timestamp >= this.CACHE_DURATION;
  }

  // Public method to clear cache (useful for testing or manual refresh)
  public clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  // Public method to refresh specific cache entry
  public refreshCache(key: string): void {
    this.cache.delete(key);
    console.log(`Cache entry '${key}' refreshed`);
  }

  async getCategories(): Promise<GameCategory[]> {
    // 1. Check cache first
    const cacheKey = 'categories';
    const cachedData = this.getFromCache(cacheKey);

    if (cachedData && !this.isCacheExpired(cacheKey)) {
      console.log('Using cached categories data');
      return cachedData as GameCategory[];
    }

    try {
      // 2. Fetch from API
      console.log('Fetching categories from API...');
      const categoriesRef = collection(db, 'categories');
      const q = query(
        categoriesRef,
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as GameCategory[];

        // Store in cache
        this.setCache(cacheKey, categories);

        return categories;
      }

      // 3. Fallback to mock data ONLY in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('No API data available, using mock data for development');
        return getMockCategories();
      }

      return [];
    } catch (error) {
      console.error('Error fetching categories from Firebase:', error);

      // 3. Fallback to mock data ONLY in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('API failed, using mock data for development');
        return getMockCategories();
      }

      return [];
    }
  }

  async getGames(categoryId?: string): Promise<LotteryGame[]> {
    // 1. Check cache first
    const cacheKey = `games_${categoryId || 'all'}`;
    const cachedData = this.getFromCache(cacheKey);

    if (cachedData && !this.isCacheExpired(cacheKey)) {
      console.log('Using cached games data');
      return cachedData as LotteryGame[];
    }

    try {
      // 2. Fetch from API
      console.log('Fetching games from API...');
      const gamesRef = collection(db, 'games');
      let q = query(gamesRef, where('isActive', '==', true));

      if (categoryId && categoryId !== 'all') {
        q = query(
          gamesRef,
          where('categoryId', '==', categoryId),
          where('isActive', '==', true)
        );
      }

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const games = snapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as LotteryGame[];

        // Enrich with category data and sponsor information
        const enrichedGames = await this.enrichGamesWithCategories(games);

        // Sort by creation date (newest first) on client side
        const sortedGames = enrichedGames.sort(
          (a, b) => b.createdAt - a.createdAt
        );

        // Store in cache
        this.setCache(cacheKey, sortedGames);

        return sortedGames;
      }

      // 3. Fallback to mock data ONLY in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('No API data available, using mock data for development');
        return getMockGamesWithCategories(categoryId);
      }

      return [];
    } catch (error) {
      console.error('Error fetching games from Firebase:', error);

      // 3. Fallback to mock data ONLY in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('API failed, using mock data for development');
        return getMockGames(categoryId);
      }

      return [];
    }
  }

  async getFeaturedGames(limitCount: number = 6): Promise<LotteryGame[]> {
    // 1. Check cache first
    const cacheKey = `featured_games_${limitCount}`;
    const cachedData = this.getFromCache(cacheKey);

    if (cachedData && !this.isCacheExpired(cacheKey)) {
      console.log('Using cached featured games data');
      return cachedData as LotteryGame[];
    }

    try {
      // 2. Fetch from API
      console.log('Fetching featured games from API...');
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('isActive', '==', true),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const games = snapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as LotteryGame[];

        const enrichedGames = await this.enrichGamesWithCategories(games);

        // Sort by creation date (newest first) on client side
        const sortedGames = enrichedGames.sort(
          (a, b) => b.createdAt - a.createdAt
        );

        // Store in cache
        this.setCache(cacheKey, sortedGames);

        return sortedGames;
      }

      // 3. Fallback to mock data ONLY in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('No API data available, using mock data for development');
        return getMockGamesWithCategories().slice(0, limitCount);
      }

      return [];
    } catch (error) {
      console.error('Error fetching featured games from Firebase:', error);

      // 3. Fallback to mock data ONLY in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('API failed, using mock data for development');
        return getMockGames().slice(0, limitCount);
      }

      return [];
    }
  }

  private async enrichGamesWithCategories(
    games: LotteryGame[]
  ): Promise<LotteryGame[]> {
    try {
      const categories = await this.getCategories();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

      // Enrich games with categories and sponsor information
      const enrichedGames = await Promise.all(
        games.map(async game => {
          // Get category data
          const category =
            categoryMap.get(game.categoryId) ||
            game.category ||
            getDefaultCategory();

          // Get sponsor/company data if createdBy is a VENDOR
          // Note: createdBy contains the user ID, sponsor contains the full sponsor object
          let sponsor = undefined;
          try {
            if (game.createdBy && game.createdBy !== 'admin') {
              const userDoc = await getDoc(doc(db, 'users', game.createdBy));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'VENDOR' && userData.businessProfile) {
                  sponsor = {
                    id: game.createdBy, // This is the same as createdBy
                    companyName: userData.businessProfile.companyName,
                    companyWebsite: userData.businessProfile.companyWebsite,
                    companyLogo: userData.businessProfile.companyLogoUrl,
                    description: userData.businessProfile.description,
                  };
                }
              }
            }
            // If createdBy is 'admin' or no vendor data found, sponsor remains undefined
          } catch (error) {
            console.error(
              'Error fetching sponsor data for game:',
              game.id,
              error
            );
            // Continue without sponsor data rather than failing
          }

          return {
            ...game,
            category,
            sponsor,
          };
        })
      );

      return enrichedGames;
    } catch (error) {
      console.error('Error enriching games with categories:', error);
      return games;
    }
  }
}

export const gameService = GameService.getInstance();
