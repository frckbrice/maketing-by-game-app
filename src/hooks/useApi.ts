'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { firestoreService } from '@/lib/firebase/services';
import { toast } from 'sonner';
import type { PaginatedResponse } from '@/types';

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
    queryFn: () => firestoreService.getCategories(),
    ...options,
  });
};

// Games
export const useGames = (params?: PaginationParams, options?: UseQueryOptions<PaginatedResponse<any>, ApiError>) => {
  return useQuery({
    queryKey: [...queryKeys.games, params],
    queryFn: async () => {
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
    },
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
      const [games, winners, applications] = await Promise.all([
        firestoreService.getGames(),
        firestoreService.getWinners(),
        firestoreService.getAllVendorApplications(),
      ]);

      return {
        totalUsers: 0, // TODO: Implement when user service is available
        totalGames: games.length || 0,
        totalWinners: winners.length || 0,
        pendingApplications: applications.filter((app: any) => app.status === 'PENDING').length || 0,
        totalRevenue: 0, // TODO: Calculate from transactions
        activeGames: games.filter((game: any) => game.status === 'ACTIVE').length || 0,
      };
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
export const useVendors = (params?: PaginationParams, options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: [...queryKeys.vendors, params],
    queryFn: () => firestoreService.getUsersByRole('VENDOR'),
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
      // Mock vendor stats - replace with actual service when available
      return {
        totalGames: 12,
        activeGames: 8,
        totalRevenue: 15420.50,
        monthlyRevenue: 3200.75,
        totalParticipants: 1250,
        averageParticipation: 104.2,
        conversionRate: 15.8,
        pendingApprovals: 2,
      };
    },
    enabled: !!vendorId,
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
      // Mock revenue chart data - replace with actual calculation
      return [
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1800 },
        { month: 'Mar', revenue: 2200 },
        { month: 'Apr', revenue: 1900 },
        { month: 'May', revenue: 2500 },
        { month: 'Jun', revenue: 3200 },
      ];
    },
    enabled: !!vendorId,
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