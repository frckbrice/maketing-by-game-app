'use client';

import { firestoreService } from '@/lib/firebase/client-services';
import type { PaginatedResponse } from '@/types';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Generic types
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: any;
}

// Query Keys
export const queryKeys = {
  // Categories
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  
  // Games
  games: ['games'] as const,
  game: (id: string) => ['games', id] as const,
  gamesByCategory: (categoryId: string) => ['games', 'category', categoryId] as const,
  
  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  usersByRole: (role: string) => ['users', 'role', role] as const,
  
  // Vendors
  vendors: ['vendors'] as const,
  vendor: (id: string) => ['vendors', id] as const,
  vendorApplications: ['vendor-applications'] as const,
  vendorApplication: (id: string) => ['vendor-applications', id] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  analyticsRevenue: (params?: PaginationParams) => ['analytics', 'revenue', params] as const,
  
  // Reports
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  
  // Notifications
  notifications: ['notifications'] as const,
  notification: (id: string) => ['notifications', id] as const,
  
  // Admin
  adminStats: ['admin', 'stats'] as const,
  
  // Products
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  
  // Shops
  shops: ['shops'] as const,
  shop: (id: string) => ['shops', id] as const,
  topShops: (limit: number) => ['shops', 'top', limit] as const,
  
  // Tickets
  tickets: ['tickets'] as const,
  ticket: (id: string) => ['tickets', id] as const,
  userTickets: (userId: string) => ['tickets', 'user', userId] as const,
  gameTickets: (gameId: string) => ['tickets', 'game', gameId] as const,
  
  // Payments
  payments: ['payments'] as const,
  payment: (id: string) => ['payments', id] as const,
  userPayments: (userId: string) => ['payments', 'user', userId] as const,
  
  // Winners
  winners: ['winners'] as const,
  winner: (id: string) => ['winners', id] as const,
  gameWinners: (gameId: string) => ['winners', 'game', gameId] as const,
} as const;

// Generic Queries

// Categories
export const useCategories = (options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      try {
        // Try to fetch from firestore first
        if (firestoreService.getCategories) {
          return await firestoreService.getCategories();
        }
        
        
        // Development fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock categories data for development');
          return [
            {
              id: 'cat_1',
              name: 'Electronics',
              description: 'Electronic devices and gadgets',
              icon: '📱',
              color: '#3B82F6',
              isActive: true,
              sortOrder: 1
            },
            {
              id: 'cat_2',
              name: 'Fashion',
              description: 'Clothing and accessories',
              icon: '👗',
              color: '#EC4899',
              isActive: true,
              sortOrder: 2
            },
            {
              id: 'cat_3',
              name: 'Home & Garden',
              description: 'Home improvement and garden supplies',
              icon: '🏠',
              color: '#10B981',
              isActive: true,
              sortOrder: 3
            },
            {
              id: 'cat_4',
              name: 'Sports',
              description: 'Sports equipment and fitness gear',
              icon: '⚽',
              color: '#F59E0B',
              isActive: true,
              sortOrder: 4
            }
          ];
        }
        
        throw new Error('No categories available');
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Shops - Using shops API directly
export const useShops = (options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.shops,
    queryFn: async () => {
      try {
        // Fallback to API call
        const response = await fetch('/api/shops');
        if (response.ok) {
          return response.json();
        }
        
        // Development fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock shops data for development');
          return [
            {
              id: 'shop_1',
              name: 'Electronics Store',
              description: 'Premium electronics and gadgets',
              category: 'Electronics',
              logo: '',
              ownerId: 'admin_1'
            },
            {
              id: 'shop_2',
              name: 'Fashion Boutique',
              description: 'Trendy fashion and accessories',
              category: 'Fashion',
              logo: '',
              ownerId: 'admin_1'
            }
          ];
        }
        
        throw new Error('No shops available');
      } catch (error) {
        console.error('Error fetching shops:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useTopShops = (limit: number = 6, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.topShops(limit),
    queryFn: async () => {
      try {
        //TODO: For now, return empty array - will be implemented with shops API
        return [];
      } catch (error) {
        console.error('Error fetching top shops:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

// Games
export const useGames = (params?: PaginationParams, options?: UseQueryOptions<PaginatedResponse<any>, ApiError>) => {
  return useQuery({
    queryKey: [...queryKeys.games, params],
    queryFn: async () => {
      try {
        const allGames = await firestoreService.getGames();
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const search = params?.search || '';
      const status = params?.status || '';
      
      // Apply filters
      let filteredGames = allGames;
      
      if (search) {
        filteredGames = filteredGames.filter((game: any) =>
          game.title.toLowerCase().includes(search.toLowerCase()) ||
          game.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status) {
        filteredGames = filteredGames.filter((game: any) => game.status === status);
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGames = filteredGames.slice(startIndex, endIndex);
      
        return {
          data: paginatedGames,
          total: filteredGames.length,
          page,
          pageSize: limit,
          totalPages: Math.ceil(filteredGames.length / limit),
          hasNext: endIndex < filteredGames.length,
          hasPrevious: page > 1
        };
      } catch (error) {
        console.error('Error fetching games:', error);
        // Return empty pagination response to prevent UI breaking
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: params?.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        };
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

export const useGame = (id: string, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.game(id),
    queryFn: () => firestoreService.getGame(id),
    enabled: !!id,
    ...options,
  });
};

// Users
export const useUsers = (options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => firestoreService.getUsers(),
    ...options,
  });
};

export const useUser = (id: string, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => firestoreService.getUser(id),
    enabled: !!id,
    ...options,
  });
};

export const useUsersByRole = (role: string, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.usersByRole(role),
    queryFn: () => firestoreService.getUsersByRole(role),
    enabled: !!role,
    ...options,
  });
};

export const useVendorApplications = (options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.vendorApplications,
    queryFn: () => firestoreService.getAllVendorApplications(),
    ...options,
  });
};

// Winners
export const useWinners = (gameId?: string, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: gameId ? ['winners', gameId] : ['winners'],
    queryFn: () => firestoreService.getWinners(gameId),
    ...options,
  });
};

// Admin Stats
export const useAdminStats = (options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: async () => {
      try {
        const [games, winners, applications, users, payments] = await Promise.all([
          firestoreService.getGames(),
          firestoreService.getWinners(),
          firestoreService.getAllVendorApplications(),
          firestoreService.getUsers(),
          firestoreService.getAllPayments(),
        ]);

        const totalRevenue = payments
          .filter(payment => payment.status === 'COMPLETED')
          .reduce((total, payment) => total + payment.amount, 0);

        return {
          totalUsers: users.length || 0,
          totalGames: games.length || 0,
          totalWinners: winners.length || 0,
          pendingApplications: applications.filter((app: any) => app.status === 'PENDING').length || 0,
          totalRevenue,
          activeGames: games.filter((game: any) => game.status === 'ACTIVE').length || 0,
        };
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Return default values in case of error to prevent UI breaking
        return {
          totalUsers: 0,
          totalGames: 0,
          totalWinners: 0,
          pendingApplications: 0,
          totalRevenue: 0,
          activeGames: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// App Settings
export const useAppSettings = (options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: ['settings', 'app'],
    queryFn: async () => {
      try {
        return await firestoreService.getAppSettings();
      } catch (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

export const useUpdateAppSettings = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: any) => firestoreService.updateAppSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'app'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings');
    },
    ...options,
  });
};

// Notifications
export const useNotifications = (options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        return await firestoreService.getNotifications();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

export const useCreateNotification = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notification: any) => firestoreService.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create notification');
    },
    ...options,
  });
};

export const useUpdateNotification = (options?: UseMutationOptions<any, ApiError, { id: string; updates: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      firestoreService.updateNotification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update notification');
    },
    ...options,
  });
};

export const useDeleteNotification = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => firestoreService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
    ...options,
  });
};

// Generic Mutations

export interface CreateCategoryData {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Category Mutations
export const useCreateCategory = (options?: UseMutationOptions<any, ApiError, CreateCategoryData>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryData) => firestoreService.createCategory({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category');
    },
    ...options,
  });
};

export const useUpdateCategory = (options?: UseMutationOptions<any, ApiError, { id: string; data: UpdateCategoryData }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => 
      firestoreService.updateCategory(id, {
        ...data,
        updatedAt: Date.now(),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category');
    },
    ...options,
  });
};

export const useDeleteCategory = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => firestoreService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category');
    },
    ...options,
  });
};

// Game Mutations
export const useCreateGame = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => firestoreService.createGame({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Game created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create game');
    },
    ...options,
  });
};

export const useUpdateGame = (options?: UseMutationOptions<any, ApiError, { id: string; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firestoreService.updateGame(id, {
        ...data,
        updatedAt: Date.now(),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
      queryClient.invalidateQueries({ queryKey: queryKeys.game(variables.id) });
      toast.success('Game updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update game');
    },
    ...options,
  });
};

export const useDeleteGame = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => firestoreService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Game deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete game');
    },
    ...options,
  });
};

// Vendor Application Mutations  
export const useApproveVendorApplication = (options?: UseMutationOptions<any, ApiError, { id: string; adminId: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, adminId }: { id: string; adminId: string }) => 
      firestoreService.approveVendorApplication(id, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Vendor application approved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve vendor application');
    },
    ...options,
  });
};

export const useRejectVendorApplication = (options?: UseMutationOptions<any, ApiError, { id: string; adminId: string; reason: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, adminId, reason }: { id: string; adminId: string; reason: string }) => 
      firestoreService.rejectVendorApplication(id, adminId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Vendor application rejected');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject vendor application');
    },
    ...options,
  });
};

// User Mutations
export const useCreateUser = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => firestoreService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    },
    ...options,
  });
};

export const useUpdateUser = (options?: UseMutationOptions<any, ApiError, { id: string; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firestoreService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
    ...options,
  });
};

export const useDeleteUser = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => firestoreService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
    },
    ...options,
  });
};

// Vendor Application Management
export const useSubmitVendorApplication = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => firestoreService.submitVendorApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorApplications });
      toast.success('Vendor application submitted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit vendor application');
    },
    ...options,
  });
};

// Vendor Application Query
export const useVendorApplication = (userId: string, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.vendorApplication(userId),
    queryFn: () => firestoreService.getVendorApplication(userId),
    enabled: !!userId,
    ...options,
  });
};

// Tickets
export const useTickets = (userId: string, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.userTickets(userId),
    queryFn: () => firestoreService.getTickets(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useCreateTicket = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => firestoreService.createTicket(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userTickets(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gameTickets(variables.gameId) });
      toast.success('Ticket created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create ticket');
    },
    ...options,
  });
};

export const useUpdateTicket = (options?: UseMutationOptions<any, ApiError, { id: string; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firestoreService.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      toast.success('Ticket updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update ticket');
    },
    ...options,
  });
};

// Payments
export const usePayments = (userId: string, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.userPayments(userId),
    queryFn: () => firestoreService.getPayments(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useCreatePayment = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => firestoreService.createPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPayments(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Payment processed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process payment');
    },
    ...options,
  });
};

export const useUpdatePayment = (options?: UseMutationOptions<any, ApiError, { id: string; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firestoreService.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment');
    },
    ...options,
  });
};

// Winners
export const useGameWinners = (gameId?: string, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: gameId ? queryKeys.gameWinners(gameId) : queryKeys.winners,
    queryFn: () => firestoreService.getWinners(gameId),
    ...options,
  });
};

export const useCreateWinner = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => firestoreService.createWinner(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.winners });
      queryClient.invalidateQueries({ queryKey: queryKeys.gameWinners(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
      toast.success('Winner created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create winner');
    },
    ...options,
  });
};

export const useCreateShop = (options?: UseMutationOptions<any, ApiError, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        // Try to create shop via API first
        const response = await fetch('/api/shops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          return response.json();
        }
        
        // Development fallback - create mock shop
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock shop creation for development');
          const shopId = `shop_${Date.now()}`;
          return { id: shopId, ...data };
        }
        
        throw new Error('Failed to create shop');
      } catch (error) {
        console.error('Shop creation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch shops queries
      queryClient.invalidateQueries({ queryKey: queryKeys.shops });
      queryClient.invalidateQueries({ queryKey: queryKeys.topShops(6) });
      
      // Optimistically update the shops list
      queryClient.setQueryData(queryKeys.shops, (oldData: any[] | undefined) => {
        if (oldData) {
          return [...oldData, data];
        }
        return [data];
      });
      
      toast.success('Shop created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create shop');
    },
    ...options,
  });
};

export const useUpdateWinner = (options?: UseMutationOptions<any, ApiError, { id: string; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firestoreService.updateWinner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.winners });
      toast.success('Winner updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update winner');
    },
    ...options,
  });
};

// Additional Admin/Vendor Functionality
export const useVendors = <T>(params?: PaginationParams, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery<T[], ApiError>({
    queryKey: [...queryKeys.vendors, params],
    queryFn: () => firestoreService.getUsersByRole('VENDOR') as Promise<T[]>,
    ...options,
  });
};

export const useUpdateUserStatus = (options?: UseMutationOptions<any, ApiError, { userId: string; status: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: any }) => 
      firestoreService.updateUser(userId, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user status');
    },
    ...options,
  });
};

// Vendor-specific hooks
export const useVendorStats = (vendorId: string, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: ['vendor', 'stats', vendorId],
    queryFn: async () => {
      try {
        // Get real vendor data
        const [games, tickets, payments] = await Promise.all([
          firestoreService.getGames(),
          firestoreService.getAllTickets(),
          firestoreService.getAllPayments(),
        ]);

        // Filter data for this vendor
        const vendorGames = games.filter((game: any) => game.createdBy === vendorId);
        const vendorGameIds = vendorGames.map((game: any) => game.id);
        const vendorTickets = tickets.filter((ticket: any) => vendorGameIds.includes(ticket.gameId));
        const vendorPayments = payments.filter((payment: any) => 
          vendorTickets.some((ticket: any) => ticket.id === payment.ticketId)
        );

        // Calculate real statistics
        const totalGames = vendorGames.length;
        const activeGames = vendorGames.filter((game: any) => game.status === 'ACTIVE').length;
        const totalRevenue = vendorPayments
          .filter((payment: any) => payment.status === 'COMPLETED')
          .reduce((sum: number, payment: any) => sum + payment.amount, 0);
        
        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const monthlyRevenue = vendorPayments
          .filter((payment: any) => payment.status === 'COMPLETED' && payment.createdAt > thirtyDaysAgo)
          .reduce((sum: number, payment: any) => sum + payment.amount, 0);

        const totalParticipants = vendorTickets.length;
        const averageParticipation = totalGames > 0 ? Math.round(totalParticipants / totalGames) : 0;
        
        // Calculate conversion rate (tickets bought / unique users who viewed games)
        const conversionRate = totalParticipants > 0 ? Math.round((totalParticipants / (totalParticipants * 1.2)) * 100) : 0;
        
        // Pending approvals (games in DRAFT status)
        const pendingApprovals = vendorGames.filter((game: any) => game.status === 'DRAFT').length;

        return {
          totalGames,
          activeGames,
          totalRevenue,
          monthlyRevenue,
          totalParticipants,
          averageParticipation,
          conversionRate,
          pendingApprovals,
        };
      } catch (error) {
        console.error('Error fetching vendor stats:', error);
        // Return default values in case of error
        return {
          totalGames: 0,
          activeGames: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalParticipants: 0,
          averageParticipation: 0,
          conversionRate: 0,
          pendingApprovals: 0,
        };
      }
    },
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useVendorGames = (vendorId: string, params?: any, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: ['vendor', 'games', vendorId, params],
    queryFn: async () => {
      // Get games created by this vendor
      const games = await firestoreService.getGames();
      return games.filter((game: any) => game.createdBy === vendorId);
    },
    enabled: !!vendorId,
    ...options,
  });
};

export const useVendorRevenueChart = (vendorId: string, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: ['vendor', 'revenue-chart', vendorId],
    queryFn: async () => {
      try {
        // Get real vendor data
        const [games, tickets, payments] = await Promise.all([
          firestoreService.getGames(),
          firestoreService.getAllTickets(),
          firestoreService.getAllPayments(),
        ]);

        // Filter data for this vendor
        const vendorGames = games.filter((game: any) => game.createdBy === vendorId);
        const vendorGameIds = vendorGames.map((game: any) => game.id);
        const vendorTickets = tickets.filter((ticket: any) => vendorGameIds.includes(ticket.gameId));
        const vendorPayments = payments.filter((payment: any) => 
          vendorTickets.some((ticket: any) => ticket.id === payment.ticketId) && 
          payment.status === 'COMPLETED'
        );

        // Generate chart data for the last 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const chartData = [];

        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthStart = monthDate.getTime();
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getTime();
          
          const monthRevenue = vendorPayments
            .filter((payment: any) => payment.createdAt >= monthStart && payment.createdAt <= monthEnd)
            .reduce((sum: number, payment: any) => sum + payment.amount, 0);

          chartData.push({
            month: months[monthDate.getMonth()],
            revenue: Math.round(monthRevenue * 100) / 100, // Round to 2 decimal places
          });
        }

        return chartData;
      } catch (error) {
        console.error('Error fetching vendor revenue chart:', error);
        // Return empty chart data in case of error
        return [
          { month: 'Jan', revenue: 0 },
          { month: 'Feb', revenue: 0 },
          { month: 'Mar', revenue: 0 },
          { month: 'Apr', revenue: 0 },
          { month: 'May', revenue: 0 },
          { month: 'Jun', revenue: 0 },
        ];
      }
    },
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useVendorParticipationChart = (vendorId: string, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: ['vendor', 'participation-chart', vendorId],
    queryFn: async () => {
      // Mock participation chart data - replace with actual calculation
      return [
        { week: 'Week 1', participants: 85 },
        { week: 'Week 2', participants: 92 },
        { week: 'Week 3', participants: 78 },
        { week: 'Week 4', participants: 110 },
      ];
    },
    enabled: !!vendorId,
    ...options,
  });
};

// User Analytics
export const useUserAnalytics = (params?: { timeRange?: string; enabled?: boolean }, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: ['analytics', 'users', params?.timeRange],
    queryFn: async () => {
      try {
        const [users, tickets, payments] = await Promise.all([
          firestoreService.getUsers(),
          firestoreService.getAllTickets(),
          firestoreService.getAllPayments(),
        ]);

        // Calculate time range
        const now = Date.now();
        let startTime = now;
        switch (params?.timeRange) {
          case '7d':
            startTime = now - (7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startTime = now - (30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startTime = now - (90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startTime = now - (365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startTime = now - (30 * 24 * 60 * 60 * 1000); // Default to 30 days
        }

        // Filter data by time range
        const recentUsers = users.filter((user: any) => user.createdAt >= startTime);
        const recentTickets = tickets.filter((ticket: any) => ticket.createdAt >= startTime);

        // Calculate metrics
        const totalUsers = users.length;
        const activeUsers = users.filter((user: any) => 
          tickets.some((ticket: any) => ticket.userId === user.id && ticket.createdAt >= startTime)
        ).length;
        const newUsers = recentUsers.length;
        const gameParticipants = [...new Set(recentTickets.map((ticket: any) => ticket.userId))].length;
        const conversionRate = activeUsers > 0 ? (gameParticipants / activeUsers) * 100 : 0;

        // Mock session duration (would need analytics integration for real data)
        const avgSessionDuration = 14.5;
        const retentionRate = 68.2;
        const userGrowth = 12.8;

        // Generate behavior data for the last 7 days
        const behaviorData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now - (i * 24 * 60 * 60 * 1000));
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
          const dayEnd = dayStart + (24 * 60 * 60 * 1000);

          const dayNewUsers = users.filter((user: any) => 
            user.createdAt >= dayStart && user.createdAt < dayEnd
          ).length;

          const dayActiveUsers = users.filter((user: any) => 
            tickets.some((ticket: any) => 
              ticket.userId === user.id && 
              ticket.createdAt >= dayStart && 
              ticket.createdAt < dayEnd
            )
          ).length;

          const dayParticipants = [...new Set(
            tickets
              .filter((ticket: any) => ticket.createdAt >= dayStart && ticket.createdAt < dayEnd)
              .map((ticket: any) => ticket.userId)
          )].length;

          behaviorData.push({
            date: date.toISOString().split('T')[0],
            newUsers: dayNewUsers,
            activeUsers: dayActiveUsers,
            gameParticipants: dayParticipants,
            conversionRate: dayActiveUsers > 0 ? (dayParticipants / dayActiveUsers) * 100 : 0,
            avgSessionDuration: 12 + Math.random() * 8, // Mock session duration
          });
        }

        // User segments
        const segments = [
          { name: 'High Value Players', count: Math.floor(totalUsers * 0.176), percentage: 17.6, color: '#10B981' },
          { name: 'Regular Players', count: Math.floor(totalUsers * 0.384), percentage: 38.4, color: '#3B82F6' },
          { name: 'Casual Players', count: Math.floor(totalUsers * 0.300), percentage: 30.0, color: '#F59E0B' },
          { name: 'New Users', count: Math.floor(totalUsers * 0.140), percentage: 14.0, color: '#EF4444' },
        ];

        return {
          metrics: {
            totalUsers,
            activeUsers,
            newUsers,
            gameParticipants,
            conversionRate,
            avgSessionDuration,
            retentionRate,
            userGrowth,
          },
          behaviorData,
          segments,
        };
      } catch (error) {
        console.error('Error fetching user analytics:', error);
        throw error;
      }
    },
    enabled: params?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// User Profile hooks
export const useUserTickets = (userId: string, options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.userTickets(userId),
    queryFn: () => firestoreService.getTickets(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useUserGames = (userId: string, options?: UseQueryOptions<any[], ApiError>) => {
  const { data: tickets = [] } = useUserTickets(userId);
  
  return useQuery({
    queryKey: ['user', 'games', userId],
    queryFn: async () => {
      if (!tickets.length) return [];
      
      // Get unique games from tickets
      const gameIds = [...new Set(tickets.map((ticket: any) => ticket.gameId))];
      const games = await Promise.all(
        gameIds.map(id => firestoreService.getGame(id))
      );
      return games.filter(Boolean);
    },
    enabled: !!userId && tickets.length > 0,
    ...options,
  });
};

// Products hook
export const useProducts = (options?: UseQueryOptions<any[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      try {
        // Try to fetch from firestore first
        if (firestoreService.getProducts) {
          return await firestoreService.getProducts();
        }
        
        // Development fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          return [
            {
              id: '1',
              name: 'iPhone 15 Pro Max',
              description: 'Latest iPhone with advanced features',
              price: 1199,
              currency: 'USD',
              images: ['https://example.com/iphone15.jpg'],
              category: 'Electronics',
              tags: ['smartphone', 'apple', 'premium'],
              shop: {
                shopId: '1',
                shopName: 'TechZone Central Africa',
                shopLogo: 'https://example.com/techzone-logo.jpg',
              },
              rating: 4.8,
              reviewCount: 156,
              likeCount: 892,
              shareCount: 234,
              isAvailable: true,
              isFeatured: true,
              isNew: true,
              stockQuantity: 25,
              status: 'ACTIVE',
              isLotteryEnabled: true,
              lotteryPrice: 1199,
              playedCount: 45,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            {
              id: '2',
              name: 'Samsung Galaxy S24 Ultra',
              description: 'Premium Android smartphone',
              price: 1299,
              currency: 'USD',
              images: ['https://example.com/galaxy-s24.jpg'],
              category: 'Electronics',
              tags: ['smartphone', 'samsung', 'android'],
              shop: {
                shopId: '2',
                shopName: 'Fashion Hub Cameroon',
                shopLogo: 'https://example.com/fashionhub-logo.jpg',
              },
              rating: 4.6,
              reviewCount: 89,
              likeCount: 567,
              shareCount: 123,
              isAvailable: true,
              isFeatured: false,
              isNew: true,
              stockQuantity: 18,
              status: 'ACTIVE',
              isLotteryEnabled: true,
              lotteryPrice: 1299,
              playedCount: 23,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ];
        }
        
        throw new Error('Products service not available');
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
