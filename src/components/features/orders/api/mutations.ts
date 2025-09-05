import { Address, Order } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mockAddresses, mockDeliveryMethods, mockOrders } from './data';
import { CreateOrderData, UpdateOrderData } from './types';

const isDev = process.env.NODE_ENV === 'development';

const simulateDelay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData): Promise<Order> => {
      await simulateDelay();

      if (isDev) {
        const deliveryMethod = mockDeliveryMethods.find(
          dm => dm.id === data.deliveryMethodId
        );
        const deliveryAddress = data.deliveryAddressId
          ? mockAddresses.find(addr => addr.id === data.deliveryAddressId)
          : undefined;

        if (!deliveryMethod) {
          throw new Error('Delivery method not found');
        }

        if (data.deliveryAddressId && !deliveryAddress) {
          throw new Error('Delivery address not found');
        }

        const subtotal = data.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const deliveryFee = deliveryMethod.price;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + deliveryFee + tax;

        const newOrder: Order = {
          id: `order-${Date.now()}`,
          userId: data.userId,
          shopId: data.shopId,
          shopName: data.shopName,
          status: 'PENDING',
          items: data.items.map((item, index) => ({
            id: `item-${Date.now()}-${index}`,
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity,
            size: item.size,
          })),
          subtotal,
          deliveryFee,
          tax,
          total,
          totalAmount: total,
          currency: 'XAF',
          deliveryMethod,
          deliveryAddress,
          shippingAddress: deliveryAddress
            ? {
                id: deliveryAddress.id,
                userId: deliveryAddress.userId,
                type: deliveryAddress.type,
                isDefault: deliveryAddress.isDefault,
                fullName: deliveryAddress.fullName,
                phoneNumber: deliveryAddress.phoneNumber,
                streetAddress: deliveryAddress.streetAddress,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                postalCode: deliveryAddress.postalCode,
                country: deliveryAddress.country,
                additionalInfo: deliveryAddress.additionalInfo,
                createdAt: deliveryAddress.createdAt,
                updatedAt: deliveryAddress.updatedAt,
              }
            : undefined,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          estimatedDeliveryDate:
            Date.now() + deliveryMethod.estimatedDays * 24 * 60 * 60 * 1000,
          orderNumber: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        };

        // Add to mock orders for dev
        mockOrders.unshift(newOrder);
        return newOrder;
      }

      // Production API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return response.json();
    },
    onSuccess: newOrder => {
      queryClient.setQueryData(
        ['orders', { userId: newOrder.userId }],
        (old: any) => {
          if (!old) return { orders: [newOrder], total: 1 };
          return {
            orders: [newOrder, ...old.orders],
            total: old.total + 1,
          };
        }
      );
      toast.success('Order created successfully');
    },
    onError: error => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrderData): Promise<Order> => {
      await simulateDelay();

      if (isDev) {
        const orderIndex = mockOrders.findIndex(
          order => order.id === data.orderId
        );
        if (orderIndex === -1) {
          throw new Error('Order not found');
        }

        const updatedOrder = {
          ...mockOrders[orderIndex],
          ...data,
          updatedAt: Date.now(),
        };

        mockOrders[orderIndex] = updatedOrder;
        return updatedOrder;
      }

      // Production API call
      const response = await fetch(`/api/orders/${data.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      return response.json();
    },
    onSuccess: updatedOrder => {
      // Update order in cache
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);

      // Update orders list cache
      queryClient.setQueryData(
        ['orders', { userId: updatedOrder.userId }],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders.map((order: Order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            ),
          };
        }
      );

      toast.success('Order updated successfully');
    },
    onError: error => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string): Promise<Order> => {
      await simulateDelay();

      if (isDev) {
        const orderIndex = mockOrders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
          throw new Error('Order not found');
        }

        const order = mockOrders[orderIndex];
        if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
          throw new Error('Cannot cancel shipped or delivered orders');
        }

        const updatedOrder = {
          ...order,
          status: 'CANCELLED' as const,
          updatedAt: Date.now(),
        };

        mockOrders[orderIndex] = updatedOrder;
        return updatedOrder;
      }

      // Production API call
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      return response.json();
    },
    onSuccess: cancelledOrder => {
      // Update order in cache
      queryClient.setQueryData(['order', cancelledOrder.id], cancelledOrder);

      // Update orders list cache
      queryClient.setQueryData(
        ['orders', { userId: cancelledOrder.userId }],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders.map((order: Order) =>
              order.id === cancelledOrder.id ? cancelledOrder : order
            ),
          };
        }
      );

      toast.success('Order cancelled successfully');
    },
    onError: error => {
      toast.error(`Failed to cancel order: ${error.message}`);
    },
  });
};

// Address mutations
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Address> => {
      await simulateDelay();

      if (isDev) {
        const newAddress: Address = {
          ...addressData,
          id: `addr-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // If this is the first address or marked as default, make it default
        const userAddresses = mockAddresses.filter(
          addr => addr.userId === addressData.userId
        );
        if (userAddresses.length === 0 || addressData.isDefault) {
          // Unset other default addresses
          mockAddresses.forEach(addr => {
            if (addr.userId === addressData.userId) {
              addr.isDefault = false;
            }
          });
          newAddress.isDefault = true;
        }

        mockAddresses.push(newAddress);
        return newAddress;
      }

      // Production API call
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error('Failed to create address');
      }

      return response.json();
    },
    onSuccess: newAddress => {
      queryClient.setQueryData(
        ['addresses', newAddress.userId],
        (old: Address[] = []) => {
          return [...old, newAddress];
        }
      );
      toast.success('Address saved successfully');
    },
    onError: error => {
      toast.error(`Failed to save address: ${error.message}`);
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      addressId,
      updates,
    }: {
      addressId: string;
      updates: Partial<Address>;
    }): Promise<Address> => {
      await simulateDelay();

      if (isDev) {
        const addressIndex = mockAddresses.findIndex(
          addr => addr.id === addressId
        );
        if (addressIndex === -1) {
          throw new Error('Address not found');
        }

        const updatedAddress = {
          ...mockAddresses[addressIndex],
          ...updates,
          updatedAt: Date.now(),
        };

        // Handle default address logic
        if (updates.isDefault) {
          mockAddresses.forEach(addr => {
            if (
              addr.userId === updatedAddress.userId &&
              addr.id !== addressId
            ) {
              addr.isDefault = false;
            }
          });
        }

        mockAddresses[addressIndex] = updatedAddress;
        return updatedAddress;
      }

      // Production API call
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      return response.json();
    },
    onSuccess: updatedAddress => {
      queryClient.setQueryData(['address', updatedAddress.id], updatedAddress);
      queryClient.setQueryData(
        ['addresses', updatedAddress.userId],
        (old: Address[] = []) => {
          return old.map(addr =>
            addr.id === updatedAddress.id ? updatedAddress : addr
          );
        }
      );
      toast.success('Address updated successfully');
    },
    onError: error => {
      toast.error(`Failed to update address: ${error.message}`);
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string): Promise<string> => {
      await simulateDelay();

      if (isDev) {
        const addressIndex = mockAddresses.findIndex(
          addr => addr.id === addressId
        );
        if (addressIndex === -1) {
          throw new Error('Address not found');
        }

        const address = mockAddresses[addressIndex];
        mockAddresses.splice(addressIndex, 1);

        // If deleted address was default, make another one default
        if (address.isDefault) {
          const userAddresses = mockAddresses.filter(
            addr => addr.userId === address.userId
          );
          if (userAddresses.length > 0) {
            userAddresses[0].isDefault = true;
          }
        }

        return addressId;
      }

      // Production API call
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      return addressId;
    },
    onSuccess: deletedAddressId => {
      // Find which user this address belonged to by checking cache
      const queries = queryClient.getQueriesData({ queryKey: ['addresses'] });
      queries.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          const addresses = data as Address[];
          const deletedAddress = addresses.find(
            addr => addr.id === deletedAddressId
          );
          if (deletedAddress) {
            queryClient.setQueryData(
              ['addresses', deletedAddress.userId],
              addresses.filter(addr => addr.id !== deletedAddressId)
            );
          }
        }
      });

      queryClient.removeQueries({ queryKey: ['address', deletedAddressId] });
      toast.success('Address deleted successfully');
    },
    onError: error => {
      toast.error(`Failed to delete address: ${error.message}`);
    },
  });
};
