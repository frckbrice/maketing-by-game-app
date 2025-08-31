import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { AdminUser, VendorData, Notification, Role, AppSettings, AnalyticsData, RevenueData, RevenueMetrics } from './type';

// Admin Users Queries
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      try {
        // Implement real Firebase query for admin users
        const adminsSnapshot = await getDocs(collection(db, 'admins'));
        return adminsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminUser[];
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
        const vendorsQuery = query(collection(db, 'users'), where('role', '==', 'VENDOR'));
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
        const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
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
        return rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Role[];
      } catch (error) {
        console.error('Error fetching roles:', error);
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
          return { id: appSettingsDoc.id, ...appSettingsDoc.data() } as AppSettings;
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
export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        // In production, this would fetch real analytics from Firebase
        // For now, calculate from actual data where possible
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const gamesSnapshot = await getDocs(collection(db, 'games'));
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        
        const totalUsers = usersSnapshot.size;
        const totalGames = gamesSnapshot.size;
        const totalRevenue = paymentsSnapshot.docs.reduce((sum: number, doc: any) => {
          return sum + (doc.data().amount || 0);
        }, 0);
        
        return {
          overview: {
            totalRevenue,
            revenueGrowth: 12.5,
            totalUsers,
            userGrowth: 8.3,
            totalGames,
            gameGrowth: 15.2,
            conversionRate: 3.2,
            conversionGrowth: 2.1,
          },
          revenueByDay: [], // TODO: Implement real data aggregation
          usersByDay: [],
          categoryPerformance: [],
          gamePerformance: [],
          userDemographics: [],
          deviceStats: [],
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
        // In production, implement real Firebase aggregation queries
        if (process.env.NODE_ENV === 'development') {
          return [
            { date: '2025-01-01', revenue: 12500, transactions: 150, users: 120, games: 45 },
            { date: '2025-01-02', revenue: 13800, transactions: 165, users: 135, games: 52 },
            { date: '2025-01-03', revenue: 15200, transactions: 180, users: 150, games: 58 },
          ];
        }
        
        // TODO: Implement real Firebase queries for revenue data aggregation
        return [];
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
        if (process.env.NODE_ENV === 'development') {
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
        
        // TODO: Implement real metrics calculation from Firebase
        return {
          totalRevenue: 0,
          totalTransactions: 0,
          totalUsers: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          transactionGrowth: 0,
          userGrowth: 0,
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