import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { GameCategory, LotteryGame } from '@/types';

export class GameService {
  private static instance: GameService;

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  async getCategories(): Promise<GameCategory[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(
        categoriesRef,
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as GameCategory[];
      }

      // Fallback to mock categories
      return this.getMockCategories();
    } catch (error) {
      console.error('Error fetching categories from Firebase:', error);
      return this.getMockCategories();
    }
  }

  async getGames(categoryId?: string): Promise<LotteryGame[]> {
    try {
      const gamesRef = collection(db, 'games');
      let q = query(
        gamesRef,
        where('status', '==', 'ACTIVE'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      if (categoryId && categoryId !== 'all') {
        q = query(
          gamesRef,
          where('categoryId', '==', categoryId),
          where('status', '==', 'ACTIVE'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const games = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as LotteryGame[];

        // Enrich with category data if needed
        return await this.enrichGamesWithCategories(games);
      }

      // Fallback to mock games
      return this.getMockGames(categoryId);
    } catch (error) {
      console.error('Error fetching games from Firebase:', error);
      return this.getMockGames(categoryId);
    }
  }

  async getFeaturedGames(limit: number = 6): Promise<LotteryGame[]> {
    try {
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('status', '==', 'ACTIVE'),
        where('isActive', '==', true),
        orderBy('currentParticipants', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const games = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as LotteryGame[];

        return await this.enrichGamesWithCategories(games);
      }

      return this.getMockGames().slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured games:', error);
      return this.getMockGames().slice(0, limit);
    }
  }

  private async enrichGamesWithCategories(
    games: LotteryGame[]
  ): Promise<LotteryGame[]> {
    try {
      const categories = await this.getCategories();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

      return games.map(game => ({
        ...game,
        category:
          categoryMap.get(game.categoryId) ||
          game.category ||
          this.getDefaultCategory(),
      }));
    } catch (error) {
      console.error('Error enriching games with categories:', error);
      return games;
    }
  }

  private getMockCategories(): GameCategory[] {
    return [
      {
        id: 'tech',
        name: 'Tech & Phones',
        description: 'Latest smartphones, tablets, and tech gadgets',
        icon: '📱',
        color: '#FF5722',
        isActive: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'fashion',
        name: 'Fashion & Sneakers',
        description: 'Designer clothing, shoes, and accessories',
        icon: '👟',
        color: '#E91E63',
        isActive: true,
        sortOrder: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'home',
        name: 'Home Appliances',
        description: 'Kitchen appliances, home decor, and furniture',
        icon: '🏠',
        color: '#4CAF50',
        isActive: true,
        sortOrder: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'computers',
        name: 'Computers',
        description: 'Laptops, PCs, gaming equipment, and accessories',
        icon: '💻',
        color: '#2196F3',
        isActive: true,
        sortOrder: 4,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  }

  private getMockGames(categoryId?: string): LotteryGame[] {
    const mockGames: LotteryGame[] = [
      {
        id: '1',
        title: 'iPhone 15 Pro Max 256GB',
        description:
          'Latest iPhone 15 Pro Max in Natural Titanium - Brand new, unlocked',
        type: 'daily',
        categoryId: 'tech',
        category: this.getMockCategories()[0],
        ticketPrice: 25,
        currency: 'USD',
        maxParticipants: 400,
        currentParticipants: 287,
        totalPrizePool: 10000,
        prizes: [],
        rules: [],
        images: [],
        startDate: Date.now(),
        endDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        title: 'Nike Air Jordan 1 Retro High',
        description:
          'Authentic Nike Air Jordan 1 Retro High - Size 9-12 available',
        type: 'weekly',
        categoryId: 'fashion',
        category: this.getMockCategories()[1],
        ticketPrice: 15,
        currency: 'USD',
        maxParticipants: 300,
        currentParticipants: 189,
        totalPrizePool: 4500,
        prizes: [],
        rules: [],
        images: [],
        startDate: Date.now(),
        endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        title: 'KitchenAid Stand Mixer',
        description:
          'Professional 6-Qt KitchenAid Stand Mixer with attachments',
        type: 'weekly',
        categoryId: 'home',
        category: this.getMockCategories()[2],
        ticketPrice: 20,
        currency: 'USD',
        maxParticipants: 250,
        currentParticipants: 164,
        totalPrizePool: 5000,
        prizes: [],
        rules: [],
        images: [],
        startDate: Date.now(),
        endDate: Date.now() + 12 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 12 * 24 * 60 * 60 * 1000,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '4',
        title: 'MacBook Pro M3 14"',
        description: 'Latest MacBook Pro 14" with M3 chip, 16GB RAM, 512GB SSD',
        type: 'monthly',
        categoryId: 'computers',
        category: this.getMockCategories()[3],
        ticketPrice: 45,
        currency: 'USD',
        maxParticipants: 200,
        currentParticipants: 127,
        totalPrizePool: 9000,
        prizes: [],
        rules: [],
        images: [],
        startDate: Date.now(),
        endDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '5',
        title: 'Samsung 65" QLED 4K TV',
        description: 'Samsung 65" Neo QLED 4K Smart TV with Quantum HDR',
        type: 'monthly',
        categoryId: 'tech',
        category: this.getMockCategories()[0],
        ticketPrice: 35,
        currency: 'USD',
        maxParticipants: 180,
        currentParticipants: 98,
        totalPrizePool: 6300,
        prizes: [],
        rules: [],
        images: [],
        startDate: Date.now(),
        endDate: Date.now() + 18 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 18 * 24 * 60 * 60 * 1000,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '6',
        title: 'Dyson V15 Detect Vacuum',
        description:
          'Dyson V15 Detect Absolute Cordless Vacuum with laser detection',
        type: 'weekly',
        categoryId: 'home',
        category: this.getMockCategories()[2],
        ticketPrice: 30,
        currency: 'USD',
        maxParticipants: 150,
        currentParticipants: 89,
        totalPrizePool: 4500,
        prizes: [],
        rules: [],
        images: [],
        startDate: Date.now(),
        endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
        status: 'ACTIVE',
        isActive: true,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    if (categoryId && categoryId !== 'all') {
      return mockGames.filter(game => game.categoryId === categoryId);
    }

    return mockGames;
  }

  private getDefaultCategory(): GameCategory {
    return {
      id: 'general',
      name: 'General',
      description: 'General category',
      icon: '🎁',
      color: '#9E9E9E',
      isActive: true,
      sortOrder: 999,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}

export const gameService = GameService.getInstance();
