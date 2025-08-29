'use client';

import { db } from '@/lib/firebase/config';
import type { LotteryGame, PaginatedResponse } from '@/types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

interface VendorStats {
  totalGames: number;
  activeGames: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalParticipants: number;
  averageParticipation: number;
  conversionRate: number;
  pendingApprovals: number;
}

interface GameFormData {
  title: string;
  description: string;
  categoryId: string;
  ticketPrice: number;
  currency: string;
  maxParticipants: number;
  images: string[];
  prizes: Array<{
    name: string;
    description: string;
    value: number;
    imageUrl?: string;
  }>;
  rules: string[];
  startDate: number;
  endDate: number;
  drawDate: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

class VendorService {
  private static instance: VendorService;

  static getInstance(): VendorService {
    if (!VendorService.instance) {
      VendorService.instance = new VendorService();
    }
    return VendorService.instance;
  }

  async getVendorStats(vendorId: string): Promise<VendorStats> {
    try {
      // Get vendor's games
      const gamesQuery = query(
        collection(db, 'games'),
        where('createdBy', '==', vendorId)
      );
      const gamesSnapshot = await getDocs(gamesQuery);
      const games = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LotteryGame[];

      // Get vendor's tickets (for revenue calculation)
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where(
          'gameId',
          'in',
          games.map(g => g.id)
        )
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const tickets = ticketsSnapshot.docs.map(doc => doc.data());

      // Calculate stats
      const activeGames = games.filter(g => g.status === 'ACTIVE').length;
      const totalRevenue = tickets.reduce(
        (sum, ticket) => sum + (ticket.amount || 0),
        0
      );
      const totalParticipants = tickets.length;
      const pendingGames = games.filter(g => g.status === 'ACTIVE').length;

      // Calculate monthly revenue
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const monthlyTickets = tickets.filter(
        ticket =>
          ticket.createdAt &&
          new Date(ticket.createdAt).getTime() >= thisMonthStart.getTime()
      );
      const monthlyRevenue = monthlyTickets.reduce(
        (sum, ticket) => sum + (ticket.amount || 0),
        0
      );

      return {
        totalGames: games.length,
        activeGames,
        totalRevenue,
        monthlyRevenue,
        totalParticipants,
        averageParticipation:
          games.length > 0 ? Math.round(totalParticipants / games.length) : 0,
        conversionRate:
          totalParticipants > 0
            ? Math.round((totalParticipants / (totalParticipants * 1.5)) * 100)
            : 0,
        pendingApprovals: pendingGames,
      };
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }
  }

  async getVendorGames(
    vendorId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResponse<LotteryGame>> {
    try {
      const {
        page = 1,
        limit: pageLimit = 10,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      let q = query(
        collection(db, 'games'),
        where('createdBy', '==', vendorId),
        orderBy(sortBy, sortOrder)
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const allGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LotteryGame[];

      const startIndex = (page - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      const paginatedGames = allGames.slice(startIndex, endIndex);

      return {
        data: paginatedGames,
        total: allGames.length,
        page,
        pageSize: pageLimit,
        totalPages: Math.ceil(allGames.length / pageLimit),
        hasNext: endIndex < allGames.length,
        hasPrevious: page > 1,
      };
    } catch (error) {
      console.error('Error fetching vendor games:', error);
      throw error;
    }
  }

  async createGame(vendorId: string, gameData: GameFormData): Promise<string> {
    try {
      const newGame = {
        ...gameData,
        createdBy: vendorId,
        status: 'PENDING', // All vendor games need admin approval
        isActive: false,
        currentParticipants: 0,
        totalPrizePool: gameData.prizes.reduce(
          (sum, prize) => sum + prize.value,
          0
        ),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'games'), newGame);
      return docRef.id;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  async updateGame(
    gameId: string,
    vendorId: string,
    gameData: Partial<GameFormData>
  ): Promise<void> {
    try {
      // First verify the game belongs to this vendor
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const game = gameDoc.data();
      if (game.createdBy !== vendorId) {
        throw new Error('Unauthorized: You can only update your own games');
      }

      // Update the game
      await updateDoc(gameRef, {
        ...gameData,
        updatedAt: serverTimestamp(),
        status: 'PENDING', // Changes require admin approval
      });
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  }

  async getRevenueChart(
    vendorId: string
  ): Promise<Array<{ date: string; revenue: number }>> {
    try {
      // Get last 7 days of data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      // Get vendor's games
      const gamesQuery = query(
        collection(db, 'games'),
        where('createdBy', '==', vendorId)
      );
      const gamesSnapshot = await getDocs(gamesQuery);
      const gameIds = gamesSnapshot.docs.map(doc => doc.id);

      if (gameIds.length === 0) {
        return last7Days.map(date => ({
          date: date.toISOString().split('T')[0],
          revenue: 0,
        }));
      }

      // Get tickets for vendor's games
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('gameId', 'in', gameIds)
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const tickets = ticketsSnapshot.docs.map(doc => doc.data());

      // Calculate daily revenue
      const revenueData = last7Days.map(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayTickets = tickets.filter(ticket => {
          const ticketDate = ticket.createdAt
            ? new Date(ticket.createdAt)
            : null;
          return ticketDate && ticketDate >= dayStart && ticketDate <= dayEnd;
        });

        const dayRevenue = dayTickets.reduce(
          (sum, ticket) => sum + (ticket.amount || 0),
          0
        );

        return {
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
        };
      });

      return revenueData;
    } catch (error) {
      console.error('Error fetching revenue chart:', error);
      // Return mock data for development
      return [
        { date: '2024-01-01', revenue: 1200 },
        { date: '2024-01-02', revenue: 1800 },
        { date: '2024-01-03', revenue: 1500 },
        { date: '2024-01-04', revenue: 2200 },
        { date: '2024-01-05', revenue: 1900 },
        { date: '2024-01-06', revenue: 2400 },
        { date: '2024-01-07', revenue: 2100 },
      ];
    }
  }

  async getParticipationChart(
    vendorId: string
  ): Promise<Array<{ name: string; value: number }>> {
    try {
      // Get vendor's games with categories
      const gamesQuery = query(
        collection(db, 'games'),
        where('createdBy', '==', vendorId)
      );
      const gamesSnapshot = await getDocs(gamesQuery);
      const games = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LotteryGame[];

      // Get categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group games by category and calculate participation
      const categoryParticipation = categories
        .map(category => {
          const categoryGames = games.filter(
            game => game.categoryId === category.id
          );
          const totalParticipants = categoryGames.reduce(
            (sum, game) => sum + (game.currentParticipants || 0),
            0
          );

          return {
            name: category.id || 'Unknown',
            value: totalParticipants,
          };
        })
        .filter(item => item.value > 0);

      return categoryParticipation;
    } catch (error) {
      console.error('Error fetching participation chart:', error);
      // Return mock data for development
      return [
        { name: 'Tech & Phones', value: 35 },
        { name: 'Fashion', value: 25 },
        { name: 'Home Appliances', value: 20 },
        { name: 'Computers', value: 20 },
      ];
    }
  }

  async getVendorEarnings(vendorId: string): Promise<{
    totalEarnings: number;
    monthlyEarnings: number;
    pendingPayouts: number;
    paidOut: number;
    earningsHistory: Array<{ date: string; amount: number; status: string }>;
  }> {
    // TODO: Implementation would depend on your payout system
    // This is a basic structure
    return {
      totalEarnings: 15680.5,
      monthlyEarnings: 3240.75,
      pendingPayouts: 1250.25,
      paidOut: 14430.25,
      earningsHistory: [],
    };
  }
}

export const vendorService = VendorService.getInstance();
