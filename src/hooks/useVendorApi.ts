import { vendorService } from '@/lib/api/vendorService';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Vendor Shop Stats Hook
export const useVendorShopStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', 'shop', 'stats'],
    queryFn: async () => {
      // Mock data for development - replace with real API when available
      return {
        totalRevenue: 15420.5,
        monthlyRevenue: 3250.75,
        totalProducts: 24,
        activeProducts: 18,
        totalOrders: 156,
        pendingOrders: 12,
        completedOrders: 144,
      };
    },
    enabled: !!user?.id && user?.role === 'VENDOR',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Vendor Products Hook
export const useVendorProducts = (limit = 50) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', 'shop', 'products', limit],
    queryFn: async () => {
      // Mock data for development - replace with real API when available
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    },
    enabled: !!user?.id && user?.role === 'VENDOR',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Vendor Orders Hook
export const useVendorOrders = (limit = 50, status?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', 'shop', 'orders', limit, status],
    queryFn: async () => {
      // Mock data for development - replace with real API when available
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    },
    enabled: !!user?.id && user?.role === 'VENDOR',
    staleTime: 1 * 60 * 1000, // 1 minute - orders change frequently
    gcTime: 5 * 60 * 1000,
  });
};

// Vendor Analytics Hook
export const useVendorAnalytics = (days = 30) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', 'analytics', user?.id, days],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required');

      // Combine existing vendor service methods to create analytics
      const [stats, revenueChart, participationChart] = await Promise.all([
        vendorService.getVendorStats(user.id),
        vendorService.getRevenueChart(user.id),
        vendorService.getParticipationChart(user.id),
      ]);

      return {
        period: `${days}d`,
        stats,
        revenueChart,
        participationChart,
        updatedAt: Date.now(),
      };
    },
    enabled: !!user?.id && user?.role === 'VENDOR',
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

// Create Product Mutation
export const useCreateProduct = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: any) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Mock implementation - replace with real API when available
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return { id: Date.now().toString(), ...productData };
    },
    onSuccess: () => {
      // Invalidate and refetch products and stats
      queryClient.invalidateQueries({
        queryKey: ['vendor', 'shop', 'products'],
      });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'stats'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor', 'shop', 'analytics'],
      });
    },
  });
};

// Update Order Status Mutation
export const useUpdateOrderStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Mock implementation - replace with real API when available
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return { orderId, status, updatedAt: Date.now() };
    },
    onSuccess: () => {
      // Invalidate and refetch orders and stats
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'stats'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor', 'shop', 'analytics'],
      });
    },
  });
};

// Vendor Revenue Chart Hook
export const useVendorRevenueChart = (vendorId?: string) => {
  const { user } = useAuth();
  const actualVendorId = vendorId || user?.id;

  return useQuery({
    queryKey: ['vendor', 'revenue', 'chart', actualVendorId],
    queryFn: async () => {
      if (!actualVendorId) throw new Error('Vendor ID is required');
      return await vendorService.getRevenueChart(actualVendorId);
    },
    enabled: !!actualVendorId && user?.role === 'VENDOR',
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

// Vendor Participation Chart Hook
export const useVendorParticipationChart = (vendorId?: string) => {
  const { user } = useAuth();
  const actualVendorId = vendorId || user?.id;

  return useQuery({
    queryKey: ['vendor', 'participation', 'chart', actualVendorId],
    queryFn: async () => {
      if (!actualVendorId) throw new Error('Vendor ID is required');
      return await vendorService.getParticipationChart(actualVendorId);
    },
    enabled: !!actualVendorId && user?.role === 'VENDOR',
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
