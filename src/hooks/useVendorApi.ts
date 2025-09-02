import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';

// Vendor Shop Stats Hook
export const useVendorShopStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor', 'shop', 'stats'],
    queryFn: async () => {
      if (!user?.authToken) throw new Error('Not authenticated');
      
      const response = await fetch('/api/vendor/shop/stats', {
        headers: {
          'Authorization': `Bearer ${user.authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch shop stats');
      return response.json();
    },
    enabled: !!user?.authToken && user?.role === 'VENDOR',
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
      if (!user?.authToken) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/vendor/shop/products?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${user.authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: !!user?.authToken && user?.role === 'VENDOR',
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
      if (!user?.authToken) throw new Error('Not authenticated');
      
      const params = new URLSearchParams({ limit: limit.toString() });
      if (status && status !== 'all') params.append('status', status);
      
      const response = await fetch(`/api/vendor/shop/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${user.authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!user?.authToken && user?.role === 'VENDOR',
    staleTime: 1 * 60 * 1000, // 1 minute - orders change frequently
    gcTime: 5 * 60 * 1000,
  });
};

// Vendor Analytics Hook
export const useVendorAnalytics = (days = 30) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor', 'shop', 'analytics', days],
    queryFn: async () => {
      if (!user?.authToken) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/vendor/shop/analytics?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${user.authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!user?.authToken && user?.role === 'VENDOR',
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
      if (!user?.authToken) throw new Error('Not authenticated');
      
      const response = await fetch('/api/vendor/shop/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.authToken}`,
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch products and stats
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'analytics'] });
    },
  });
};

// Update Order Status Mutation
export const useUpdateOrderStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      if (!user?.authToken) throw new Error('Not authenticated');
      
      const response = await fetch('/api/vendor/shop/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.authToken}`,
        },
        body: JSON.stringify({ orderId, status }),
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch orders and stats
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'shop', 'analytics'] });
    },
  });
};