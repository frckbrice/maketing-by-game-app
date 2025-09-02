import { useQuery } from '@tanstack/react-query';
import { Order, Address, DeliveryMethod } from '@/types';
import { mockOrders, mockAddresses, mockDeliveryMethods } from './data';

// Development environment check
const isDev = process.env.NODE_ENV === 'development';

// Simulate API delays for realistic UX
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Order queries
export const useOrders = (params?: {
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async (): Promise<{ orders: Order[]; total: number }> => {
      await simulateDelay();
      
      if (isDev) {
        let filteredOrders = [...mockOrders];
        
        if (params?.userId) {
          filteredOrders = filteredOrders.filter(order => order.userId === params.userId);
        }
        
        if (params?.status) {
          filteredOrders = filteredOrders.filter(order => order.status === params.status);
        }
        
        // Sort by creation date (newest first)
        filteredOrders.sort((a, b) => b.createdAt - a.createdAt);
        
        const total = filteredOrders.length;
        
        if (params?.limit) {
          const offset = params.offset || 0;
          filteredOrders = filteredOrders.slice(offset, offset + params.limit);
        }
        
        return { orders: filteredOrders, total };
      }
      
      // Production API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order | null> => {
      await simulateDelay();
      
      if (isDev) {
        return mockOrders.find(order => order.id === orderId) || null;
      }
      
      // Production API call
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch order');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!orderId,
  });
};

// Address queries
export const useAddresses = (userId: string) => {
  return useQuery({
    queryKey: ['addresses', userId],
    queryFn: async (): Promise<Address[]> => {
      await simulateDelay();
      
      if (isDev) {
        return mockAddresses.filter(address => address.userId === userId);
      }
      
      // Production API call
      const response = await fetch(`/api/addresses?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    enabled: !!userId,
  });
};

export const useAddress = (addressId: string) => {
  return useQuery({
    queryKey: ['address', addressId],
    queryFn: async (): Promise<Address | null> => {
      await simulateDelay();
      
      if (isDev) {
        return mockAddresses.find(address => address.id === addressId) || null;
      }
      
      // Production API call
      const response = await fetch(`/api/addresses/${addressId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch address');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!addressId,
  });
};

// Delivery methods query
export const useDeliveryMethods = (shopId?: string) => {
  return useQuery({
    queryKey: ['delivery-methods', shopId],
    queryFn: async (): Promise<DeliveryMethod[]> => {
      await simulateDelay(300);
      
      if (isDev) {
        // In dev, return all methods. In production, this might be shop-specific
        return mockDeliveryMethods.filter(method => method.isAvailable);
      }
      
      // Production API call
      const response = await fetch(`/api/delivery-methods${shopId ? `?shopId=${shopId}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery methods');
      }
      
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (delivery methods don't change often)
    gcTime: 30 * 60 * 1000,
  });
};

// Order tracking query
export const useOrderTracking = (orderId: string) => {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async (): Promise<{
      order: Order;
      trackingEvents: {
        id: string;
        status: string;
        description: string;
        timestamp: number;
        location?: string;
      }[];
    }> => {
      await simulateDelay();
      
      if (isDev) {
        const order = mockOrders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');
        
        // Mock tracking events based on order status
        const trackingEvents = [
          {
            id: 'event-1',
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            timestamp: order.createdAt,
            location: 'Online'
          },
          {
            id: 'event-2',
            status: 'PAYMENT_CONFIRMED',
            description: 'Payment confirmed',
            timestamp: order.createdAt + 10 * 60 * 1000,
            location: 'Payment Gateway'
          }
        ];
        
        if (order.status !== 'PENDING') {
          trackingEvents.push({
            id: 'event-3',
            status: 'PROCESSING',
            description: 'Order is being processed',
            timestamp: order.createdAt + 30 * 60 * 1000,
            location: order.shopName
          });
        }
        
        if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
          trackingEvents.push({
            id: 'event-4',
            status: 'SHIPPED',
            description: 'Order has been shipped',
            timestamp: order.createdAt + 2 * 24 * 60 * 60 * 1000,
            location: 'Distribution Center'
          });
        }
        
        if (order.status === 'DELIVERED') {
          trackingEvents.push({
            id: 'event-5',
            status: 'DELIVERED',
            description: 'Order delivered successfully',
            timestamp: order.actualDeliveryDate || Date.now(),
            location: order.deliveryAddress?.city || 'Destination'
          });
        }
        
        return { order, trackingEvents };
      }
      
      // Production API call
      const response = await fetch(`/api/orders/${orderId}/tracking`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order tracking');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (tracking updates frequently)
    gcTime: 5 * 60 * 1000,
    enabled: !!orderId,
    refetchInterval: (data) => {
      // Auto-refresh for active orders
      const order = data?.order;
      if (order && !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)) {
        return 30 * 1000; // Refresh every 30 seconds for active orders
      }
      return false; // Don't auto-refresh for completed orders
    },
  });
};