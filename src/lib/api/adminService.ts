'use client';

import { generateMockGamesForAdmin } from '@/lib/constants';
import { db } from '@/lib/firebase/config';
import type {
  GameCategory,
  LotteryGame,
  LotteryTicket,
  PaginatedResponse,
  Payment,
  User,
} from '@/types';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

interface AdminStats {
  activeUsers: number;
  totalUsers: number;
  activeGames: number;
  totalGames: number;
  totalRevenue: number;
  todayRevenue: number;
  totalTicketsSold: number;
  todayTicketsSold: number;
  totalWinners: number;
  monthlyRevenue: number;
  userGrowth: Array<{ date: string; users: number }>;
  revenueChart: Array<{ date: string; revenue: number }>;
  popularCategories: Array<{ name: string; games: number; revenue: number }>;
  topGames: Array<{ title: string; participants: number; revenue: number }>;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async getAdminStats(): Promise<AdminStats> {
    try {
      const now = Date.now();
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).getTime();

      const [usersSnapshot, gamesSnapshot, paymentsSnapshot, ticketsSnapshot] =
        await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'games')),
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'tickets')),
        ]);

      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      
      const games = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LotteryGame[];
      const payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
      const tickets = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LotteryTicket[];

      const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
      const activeGames = games.filter(g => g.status === 'ACTIVE').length;

      const completedPayments = payments.filter(p => p.status === 'COMPLETED');
      const totalRevenue = completedPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      const todayRevenue = completedPayments
        .filter(p => p.createdAt >= todayStart)
        .reduce((sum, p) => sum + p.amount, 0);

      const monthlyRevenue = completedPayments
        .filter(p => p.createdAt >= monthStart)
        .reduce((sum, p) => sum + p.amount, 0);

      const todayTickets = tickets.filter(
        t => t.createdAt >= todayStart
      ).length;
      const winners = tickets.filter(t => t.isWinner);

      // Generate charts data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const userGrowth = last7Days.map(date => {
        const dayStart = new Date(date).setHours(0, 0, 0, 0);
        const dayEnd = new Date(date).setHours(23, 59, 59, 999);
        const dayUsers = users.filter(
          u => u.createdAt >= dayStart && u.createdAt <= dayEnd
        ).length;
        return { date, users: dayUsers };
      });

      const revenueChart = last7Days.map(date => {
        const dayStart = new Date(date).setHours(0, 0, 0, 0);
        const dayEnd = new Date(date).setHours(23, 59, 59, 999);
        const dayRevenue = completedPayments
          .filter(p => p.createdAt >= dayStart && p.createdAt <= dayEnd)
          .reduce((sum, p) => sum + p.amount, 0);
        return { date, revenue: dayRevenue };
      });

      // Get categories for popular categories chart
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GameCategory[];

      const popularCategories = categories
        .map(cat => {
          const categoryGames = games.filter(g => g.categoryId === cat.id);
          const categoryRevenue = categoryGames.reduce((sum, game) => {
            return (
              sum +
              completedPayments
                .filter(
                  p =>
                    tickets.find(t => t.id === p.ticketId)?.gameId === game.id
                )
                .reduce((gameSum, p) => gameSum + p.amount, 0)
            );
          }, 0);

          return {
            name: cat.name,
            games: categoryGames.length,
            revenue: categoryRevenue,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      const topGames = games
        .map(game => ({
          title: game.title,
          participants: game.currentParticipants,
          revenue: completedPayments
            .filter(
              p => tickets.find(t => t.id === p.ticketId)?.gameId === game.id
            )
            .reduce((sum, p) => sum + p.amount, 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        activeUsers,
        totalUsers: users.length,
        activeGames,
        totalGames: games.length,
        totalRevenue,
        todayRevenue,
        totalTicketsSold: tickets.length,
        todayTicketsSold: todayTickets,
        totalWinners: winners.length,
        monthlyRevenue,
        userGrowth,
        revenueChart,
        popularCategories,
        topGames,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return this.getMockStats();
    }
  }

  private getMockStats(): AdminStats {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return {
      activeUsers: 1245,
      totalUsers: 2890,
      activeGames: 45,
      totalGames: 156,
      totalRevenue: 45670.5,
      todayRevenue: 2340.0,
      totalTicketsSold: 8940,
      todayTicketsSold: 156,
      totalWinners: 234,
      monthlyRevenue: 12450.75,
      userGrowth: last7Days.map(date => ({
        date,
        users: Math.floor(Math.random() * 50) + 10,
      })),
      revenueChart: last7Days.map(date => ({
        date,
        revenue: Math.floor(Math.random() * 2000) + 500,
      })),
      popularCategories: [
        { name: 'Tech & Phones', games: 23, revenue: 15600 },
        { name: 'Fashion & Sneakers', games: 18, revenue: 12300 },
        { name: 'Home Appliances', games: 15, revenue: 9800 },
        { name: 'Computers', games: 12, revenue: 7900 },
      ],
      topGames: [
        { title: 'iPhone 15 Pro Max', participants: 567, revenue: 8500 },
        { title: 'Nike Air Jordan', participants: 423, revenue: 6340 },
        { title: 'MacBook Pro M3', participants: 389, revenue: 5850 },
        { title: 'Samsung Galaxy S24', participants: 345, revenue: 5180 },
        { title: 'iPad Air', participants: 234, revenue: 3510 },
      ],
    };
  }

  async getUsers(options: PaginationOptions): Promise<PaginatedResponse<User>> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

      if (options.search) {
        // Simple search implementation - in production, use Algolia or similar
        q = query(
          q,
          where('firstName', '>=', options.search),
          where('firstName', '<=', options.search + '\uf8ff')
        );
      }

      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      return {
        data: paginatedUsers,
        total: allUsers.length,
        page: options.page,
        pageSize: options.limit,
        totalPages: Math.ceil(allUsers.length / options.limit),
        hasNext: endIndex < allUsers.length,
        hasPrevious: options.page > 1,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.getMockUsers(options);
    }
  }

  async getGames(
    options: PaginationOptions
  ): Promise<PaginatedResponse<LotteryGame>> {
    try {
      let q = query(collection(db, 'games'), orderBy('createdAt', 'desc'));

      if (options.filters?.status) {
        q = query(q, where('status', '==', options.filters.status));
      }

      const snapshot = await getDocs(q);
      const allGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LotteryGame[];

      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedGames = allGames.slice(startIndex, endIndex);

      return {
        data: paginatedGames,
        total: allGames.length,
        page: options.page,
        pageSize: options.limit,
        totalPages: Math.ceil(allGames.length / options.limit),
        hasNext: endIndex < allGames.length,
        hasPrevious: options.page > 1,
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      return this.getMockGames(options);
    }
  }

  async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async updateGameStatus(
    gameId: string,
    status: 'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSED'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
  }

  async deleteGame(gameId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'games', gameId));
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }

  async getCategories(): Promise<GameCategory[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'categories'), orderBy('sortOrder', 'asc'))
      );
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GameCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  private getMockUsers(options: PaginationOptions): PaginatedResponse<User> {
    const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      firstName: `User${i}`,
      lastName: `Test${i}`,
      role: i % 10 === 0 ? 'ADMIN' : i % 5 === 0 ? 'VENDOR' : 'USER',
      status: Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE',
      emailVerified: true,
      phoneVerified: Math.random() > 0.3,
      twoFactorEnabled: false,
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        timezone: 'UTC',
        currency: 'USD',
      },
      notificationSettings: {
        email: true,
        sms: false,
        push: true,
        inApp: true,
        marketing: true,
        gameUpdates: true,
        winnerAnnouncements: true,
      },
      privacySettings: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowContact: true,
        dataSharing: false,
      },
      socialMedia: {
        facebook: undefined,
        twitter: undefined,
        instagram: undefined,
        linkedin: undefined,
        youtube: undefined,
      },
      createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now(),
      lastLoginAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    }));

    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedUsers = mockUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      total: mockUsers.length,
      page: options.page,
      pageSize: options.limit,
      totalPages: Math.ceil(mockUsers.length / options.limit),
      hasNext: endIndex < mockUsers.length,
      hasPrevious: options.page > 1,
    };
  }

  private getMockGames(
    options: PaginationOptions
  ): PaginatedResponse<LotteryGame> {
    const mockGames: LotteryGame[] = generateMockGamesForAdmin(30);

    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedGames = mockGames.slice(startIndex, endIndex);

    return {
      data: paginatedGames,
      total: mockGames.length,
      page: options.page,
      pageSize: options.limit,
      totalPages: Math.ceil(mockGames.length / options.limit),
      hasNext: endIndex < mockGames.length,
      hasPrevious: options.page > 1,
    };
  }
}

export const adminService = AdminService.getInstance();
