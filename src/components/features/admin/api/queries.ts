import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  AdminUser,
  AnalyticsData,
  AppSettings,
  Notification,
  RevenueData,
  RevenueMetrics,
  Role,
  VendorData,
} from './type';

// Admin Users Queries
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      try {
        // Query users with ADMIN role from the users collection
        const adminQuery = query(
          collection(db, 'users'),
          where('role', '==', 'ADMIN')
        );
        const adminsSnapshot = await getDocs(adminQuery);

        return adminsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            firstName: data.firstName || 'Admin',
            lastName: data.lastName || 'User',
            email: data.email,
            role: 'ADMIN',
            permissions: ['ALL'], // Admins have all permissions
            isActive: data.status === 'ACTIVE',
            lastLogin: data.lastLoginAt
              ? new Date(data.lastLoginAt)
              : undefined,
            createdAt: new Date(data.createdAt || Date.now()),
            createdBy: data.createdBy || 'system',
          };
        }) as AdminUser[];
      } catch (error) {
        console.error('Error fetching admin users:', error);
        // Development fallback data
        if (process.env.NODE_ENV === 'development') {
          return [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@lottery.com',
              role: 'SUPER_ADMIN',
              permissions: ['ALL'],
              isActive: true,
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              createdBy: 'system',
            },
            {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@lottery.com',
              role: 'ADMIN',
              permissions: ['USERS', 'GAMES', 'VENDORS'],
              isActive: true,
              lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              createdBy: 'john.doe@lottery.com',
            },
          ];
        }
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Vendors Queries
export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<VendorData[]> => {
      try {
        const vendorsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'VENDOR')
        );
        const vendorsSnapshot = await getDocs(vendorsQuery);

        return vendorsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            role: 'VENDOR',
            status: data.status || 'ACTIVE',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            companyName: data.companyName,
            productCategory: data.productCategory,
            totalGames: data.totalGames || 0,
            totalRevenue: data.totalRevenue || 0,
            averageRating: data.averageRating || 0,
            isVerified: data.isVerified || false,
          };
        }) as VendorData[];
      } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};

// Notifications Queries
export const useNotifications = () => {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async (): Promise<Notification[]> => {
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          orderBy('createdAt', 'desc')
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);

        return notificationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          sentAt: doc.data().sentAt?.toDate() || undefined,
          scheduledFor: doc.data().scheduledFor?.toDate() || undefined,
        })) as Notification[];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Development fallback
        if (process.env.NODE_ENV === 'development') {
          return [
            {
              id: '1',
              title: 'System Maintenance',
              message: 'Scheduled maintenance on Sunday at 2 AM UTC',
              type: 'INFO',
              priority: 'MEDIUM',
              status: 'SENT',
              targetAudience: 'ALL',
              recipients: ['all-users'],
              sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              createdBy: 'admin-1',
              readCount: 1250,
              totalRecipients: 1500,
            },
          ];
        }
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};

// Roles Queries
export const useRoles = () => {
  return useQuery({
    queryKey: ['admin-roles'],
    queryFn: async (): Promise<Role[]> => {
      try {
        const rolesSnapshot = await getDocs(collection(db, 'roles'));
        let roles = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Role[];

        // If no roles exist, create default ones
        if (roles.length === 0) {
          // Get user counts for each role
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const defaultRoles = [
            {
              name: 'USER',
              displayName: 'User',
              description: 'Regular user with basic permissions to play games',
              permissions: ['games.view', 'tickets.view', 'profile.edit'],
              isActive: true,
              isSystem: true,
              userCount: users.filter((u: any) => u.role === 'USER').length,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
            },
            {
              name: 'VENDOR',
              displayName: 'Vendor',
              description:
                'Vendor with permissions to create games and manage content',
              permissions: [
                'games.create',
                'games.edit',
                'games.view',
                'analytics.view',
              ],
              isActive: true,
              isSystem: true,
              userCount: users.filter((u: any) => u.role === 'VENDOR').length,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
            },
            {
              name: 'ADMIN',
              displayName: 'Administrator',
              description: 'Administrator with full system access',
              permissions: ['*'],
              isActive: true,
              isSystem: true,
              userCount: users.filter((u: any) => u.role === 'ADMIN').length,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
            },
          ];

          // Create default roles in Firebase
          const createdRoles = [];
          for (const role of defaultRoles) {
            const docRef = await addDoc(collection(db, 'roles'), role);
            createdRoles.push({ id: docRef.id, ...role });
          }

          return createdRoles;
        }

        return roles;
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Development fallback
        if (process.env.NODE_ENV === 'development') {
          return [
            {
              id: 'user',
              name: 'USER',
              displayName: 'User',
              description: 'Regular user with basic permissions',
              permissions: ['games.view', 'tickets.view'],
              isActive: true,
              isSystem: true,
              userCount: 150,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
            },
            {
              id: 'vendor',
              name: 'VENDOR',
              displayName: 'Vendor',
              description: 'Vendor with game creation permissions',
              permissions: ['games.create', 'games.edit'],
              isActive: true,
              isSystem: true,
              userCount: 25,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
            },
            {
              id: 'admin',
              name: 'ADMIN',
              displayName: 'Administrator',
              description: 'Full system access',
              permissions: ['*'],
              isActive: true,
              isSystem: true,
              userCount: 3,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
            },
          ];
        }
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};

// App Settings Queries
export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async (): Promise<AppSettings> => {
      try {
        const settingsDoc = await getDocs(collection(db, 'settings'));
        const appSettingsDoc = settingsDoc.docs.find(doc => doc.id === 'app');

        if (appSettingsDoc?.exists()) {
          return {
            id: appSettingsDoc.id,
            ...appSettingsDoc.data(),
          } as AppSettings;
        }

        // Return default settings if none exist
        return {
          appName: 'Lottery App',
          appDescription: 'Interactive lottery marketing platform',
          supportEmail: 'support@lottery.com',
          maintenanceMode: false,
          defaultTicketPrice: 5,
          defaultCurrency: 'USD',
          maxTicketsPerUser: 10,
          drawFrequency: 'daily',
          enableStripe: false,
          enablePayPal: false,
          enableMobileMoney: true,
          minWithdrawal: 10,
          enablePushNotifications: true,
          enableEmailNotifications: true,
          enableSMSNotifications: false,
          requireEmailVerification: true,
          requirePhoneVerification: false,
          sessionTimeout: 30,
          primaryColor: '#f97316',
          secondaryColor: '#ef4444',
          enableAnalytics: true,
          enableCrashReporting: true,
          updatedAt: Date.now(),
          updatedBy: 'system',
        };
      } catch (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }
    },
    gcTime: 10 * 60 * 1000, // 10 minutes for settings
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Analytics Queries
export const useAnalyticsData = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        // Fetch real analytics from Firebase
        const [
          usersSnapshot,
          gamesSnapshot,
          paymentsSnapshot,
          ticketsSnapshot,
          categoriesSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'games')),
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'tickets')),
          getDocs(collection(db, 'categories')),
        ]);

        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const games = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const payments = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const tickets = ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const categories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate time range based on timeRange parameter
        const now = Date.now();
        let startTime = now;
        let days = 30; // default
        switch (timeRange) {
          case '7d':
            startTime = now - 7 * 24 * 60 * 60 * 1000;
            days = 7;
            break;
          case '30d':
            startTime = now - 30 * 24 * 60 * 60 * 1000;
            days = 30;
            break;
          case '90d':
            startTime = now - 90 * 24 * 60 * 60 * 1000;
            days = 90;
            break;
          case '1y':
            startTime = now - 365 * 24 * 60 * 60 * 1000;
            days = 365;
            break;
          default:
            startTime = now - 30 * 24 * 60 * 60 * 1000;
        }

        // Filter data by time range for current period
        const completedPayments = payments.filter(
          (p: any) => p.status === 'COMPLETED'
        );
        const recentUsers = users.filter((u: any) => u.createdAt >= startTime);
        const recentGames = games.filter((g: any) => g.createdAt >= startTime);
        const recentTickets = tickets.filter(
          (t: any) => t.createdAt >= startTime
        );
        const recentPayments = completedPayments.filter(
          (p: any) => p.createdAt >= startTime
        );

        // Calculate previous period for growth comparison
        const previousPeriodStart = startTime - (now - startTime);
        const previousUsers = users.filter(
          (u: any) =>
            u.createdAt >= previousPeriodStart && u.createdAt < startTime
        );
        const previousGames = games.filter(
          (g: any) =>
            g.createdAt >= previousPeriodStart && g.createdAt < startTime
        );
        const previousPayments = completedPayments.filter(
          (p: any) =>
            p.createdAt >= previousPeriodStart && p.createdAt < startTime
        );

        // Calculate totals and growth rates
        const totalRevenue = completedPayments.reduce(
          (sum: number, p: any) => sum + (p.amount || 0),
          0
        );
        const recentRevenue = recentPayments.reduce(
          (sum: number, p: any) => sum + (p.amount || 0),
          0
        );
        const previousRevenue = previousPayments.reduce(
          (sum: number, p: any) => sum + (p.amount || 0),
          0
        );

        const revenueGrowth =
          previousRevenue > 0
            ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;
        const userGrowth =
          previousUsers.length > 0
            ? ((recentUsers.length - previousUsers.length) /
                previousUsers.length) *
              100
            : 0;
        const gameGrowth =
          previousGames.length > 0
            ? ((recentGames.length - previousGames.length) /
                previousGames.length) *
              100
            : 0;

        // Calculate conversion rate
        const uniqueParticipants = Array.from(
          new Set(recentTickets.map((t: any) => t.userId))
        ).length;
        const conversionRate =
          users.length > 0 ? (uniqueParticipants / users.length) * 100 : 0;

        // Generate detailed revenue by day data
        const revenueByDay = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();
          const dayEnd = dayStart + 24 * 60 * 60 * 1000;

          const dayPayments = completedPayments.filter(
            (p: any) => p.createdAt >= dayStart && p.createdAt < dayEnd
          );
          const dayTickets = tickets.filter(
            (t: any) => t.createdAt >= dayStart && t.createdAt < dayEnd
          );

          revenueByDay.push({
            date: date.toISOString().split('T')[0],
            revenue: dayPayments.reduce(
              (sum: number, p: any) => sum + p.amount,
              0
            ),
            tickets: dayTickets.length,
          });
        }

        // Generate users by day data
        const usersByDay = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();
          const dayEnd = dayStart + 24 * 60 * 60 * 1000;

          const dayUsers = users.filter(
            (u: any) => u.createdAt >= dayStart && u.createdAt < dayEnd
          );

          usersByDay.push({
            date: date.toISOString().split('T')[0],
            users: dayUsers.length,
            retention: 75 + Math.random() * 20, // Mock retention - would need analytics integration
          });
        }

        // Calculate detailed category performance
        const categoryPerformance = categories
          .map((category: any) => {
            const categoryGames = games.filter(
              (g: any) => g.categoryId === category.id
            );
            const categoryGameIds = categoryGames.map((g: any) => g.id);
            const categoryTickets = tickets.filter((t: any) =>
              categoryGameIds.includes(t.gameId)
            );
            const categoryPayments = completedPayments.filter((p: any) =>
              categoryTickets.some((t: any) => t.id === p.ticketId)
            );
            const categoryUsers = Array.from(
              new Set(categoryTickets.map((t: any) => t.userId))
            );

            return {
              name: category.name,
              revenue: categoryPayments.reduce(
                (sum: number, p: any) => sum + p.amount,
                0
              ),
              games: categoryGames.length,
              users: categoryUsers.length,
            };
          })
          .sort((a, b) => b.revenue - a.revenue);

        // Calculate detailed game performance
        const gamePerformance = games
          .map((game: any) => {
            const gameTickets = tickets.filter(
              (t: any) => t.gameId === game.id
            );
            const gamePayments = completedPayments.filter((p: any) =>
              gameTickets.some((t: any) => t.id === p.ticketId)
            );
            const participants = Array.from(
              new Set(gameTickets.map((t: any) => t.userId))
            ).length;
            const revenue = gamePayments.reduce(
              (sum: number, p: any) => sum + p.amount,
              0
            );

            return {
              id: game.id,
              title: game.title,
              participants,
              revenue,
              conversionRate:
                game.maxParticipants > 0
                  ? (participants / game.maxParticipants) * 100
                  : 0,
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        // Mock demographic and device data (would need real analytics integration)
        const userDemographics = [
          { name: '18-25', value: 35, color: '#f97316' },
          { name: '26-35', value: 30, color: '#ef4444' },
          { name: '36-45', value: 20, color: '#10b981' },
          { name: '46-55', value: 10, color: '#3b82f6' },
          { name: '55+', value: 5, color: '#8b5cf6' },
        ];

        const deviceStats = [
          {
            device: 'Mobile',
            percentage: 65,
            users: Math.floor(users.length * 0.65),
          },
          {
            device: 'Desktop',
            percentage: 25,
            users: Math.floor(users.length * 0.25),
          },
          {
            device: 'Tablet',
            percentage: 10,
            users: Math.floor(users.length * 0.1),
          },
        ];

        return {
          overview: {
            totalRevenue,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
            totalUsers: users.length,
            userGrowth: Math.round(userGrowth * 100) / 100,
            totalGames: games.length,
            gameGrowth: Math.round(gameGrowth * 100) / 100,
            conversionRate: Math.round(conversionRate * 100) / 100,
            conversionGrowth: 5.7, // Mock - would need historical data
          },
          revenueByDay,
          usersByDay,
          categoryPerformance,
          gamePerformance,
          userDemographics,
          deviceStats,
        };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};

// Revenue Analytics Queries
export const useRevenueData = (timeRange: string) => {
  return useQuery({
    queryKey: ['revenue-analytics', timeRange],
    queryFn: async (): Promise<RevenueData[]> => {
      try {
        // Implement real Firebase aggregation queries
        const [paymentsSnapshot, usersSnapshot, gamesSnapshot] =
          await Promise.all([
            getDocs(collection(db, 'payments')),
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'games')),
          ]);

        const payments = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const games = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate date range based on timeRange parameter
        const now = Date.now();
        let days = 30; // default
        switch (timeRange) {
          case '7d':
            days = 7;
            break;
          case '30d':
            days = 30;
            break;
          case '90d':
            days = 90;
            break;
          case '1y':
            days = 365;
            break;
        }

        const startDate = now - days * 24 * 60 * 60 * 1000;
        const completedPayments = payments.filter(
          (p: any) => p.status === 'COMPLETED' && p.createdAt >= startDate
        );

        // Group by date
        const revenueByDate: { [key: string]: RevenueData } = {};

        for (let i = 0; i < days; i++) {
          const date = new Date(now - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];

          const dayStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();
          const dayEnd = dayStart + 24 * 60 * 60 * 1000;

          const dayPayments = completedPayments.filter(
            (p: any) => p.createdAt >= dayStart && p.createdAt < dayEnd
          );
          const dayUsers = users.filter(
            (u: any) => u.createdAt >= dayStart && u.createdAt < dayEnd
          );
          const dayGames = games.filter(
            (g: any) => g.createdAt >= dayStart && g.createdAt < dayEnd
          );

          revenueByDate[dateStr] = {
            date: dateStr,
            revenue: dayPayments.reduce(
              (sum: number, p: any) => sum + p.amount,
              0
            ),
            transactions: dayPayments.length,
            users: dayUsers.length,
            games: dayGames.length,
          };
        }

        // Development fallback if no real data
        if (
          process.env.NODE_ENV === 'development' &&
          Object.keys(revenueByDate).length === 0
        ) {
          return [
            {
              date: '2025-01-01',
              revenue: 12500,
              transactions: 150,
              users: 120,
              games: 45,
            },
            {
              date: '2025-01-02',
              revenue: 13800,
              transactions: 165,
              users: 135,
              games: 52,
            },
            {
              date: '2025-01-03',
              revenue: 15200,
              transactions: 180,
              users: 150,
              games: 58,
            },
          ];
        }

        return Object.values(revenueByDate).reverse(); // Oldest first
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRevenueMetrics = (timeRange: string) => {
  return useQuery({
    queryKey: ['revenue-metrics', timeRange],
    queryFn: async (): Promise<RevenueMetrics> => {
      try {
        // Calculate real metrics from Firebase data
        const [paymentsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'payments')),
          getDocs(collection(db, 'users')),
        ]);

        const payments = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const now = Date.now();
        let days = 30; // default
        switch (timeRange) {
          case '7d':
            days = 7;
            break;
          case '30d':
            days = 30;
            break;
          case '90d':
            days = 90;
            break;
          case '1y':
            days = 365;
            break;
        }

        const startDate = now - days * 24 * 60 * 60 * 1000;
        const previousPeriodStart = startDate - days * 24 * 60 * 60 * 1000;

        const currentPeriodPayments = payments.filter(
          (p: any) => p.status === 'COMPLETED' && p.createdAt >= startDate
        );
        const previousPeriodPayments = payments.filter(
          (p: any) =>
            p.status === 'COMPLETED' &&
            p.createdAt >= previousPeriodStart &&
            p.createdAt < startDate
        );

        const totalRevenue = currentPeriodPayments.reduce(
          (sum: number, p: any) => sum + p.amount,
          0
        );
        const previousRevenue = previousPeriodPayments.reduce(
          (sum: number, p: any) => sum + p.amount,
          0
        );
        const revenueGrowth =
          previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        const totalTransactions = currentPeriodPayments.length;
        const previousTransactions = previousPeriodPayments.length;
        const transactionGrowth =
          previousTransactions > 0
            ? ((totalTransactions - previousTransactions) /
                previousTransactions) *
              100
            : 0;

        const currentPeriodUsers = users.filter(
          (u: any) => u.createdAt >= startDate
        ).length;
        const previousPeriodUsers = users.filter(
          (u: any) =>
            u.createdAt >= previousPeriodStart && u.createdAt < startDate
        ).length;
        const userGrowth =
          previousPeriodUsers > 0
            ? ((currentPeriodUsers - previousPeriodUsers) /
                previousPeriodUsers) *
              100
            : 0;

        const averageOrderValue =
          totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        // Development fallback if no real data
        if (process.env.NODE_ENV === 'development' && totalRevenue === 0) {
          return {
            totalRevenue: 111400,
            totalTransactions: 1290,
            totalUsers: 1065,
            averageOrderValue: 86.36,
            revenueGrowth: 12.5,
            transactionGrowth: 8.3,
            userGrowth: 15.2,
          };
        }

        return {
          totalRevenue,
          totalTransactions,
          totalUsers: users.length,
          averageOrderValue,
          revenueGrowth,
          transactionGrowth,
          userGrowth,
        };
      } catch (error) {
        console.error('Error calculating revenue metrics:', error);
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};
