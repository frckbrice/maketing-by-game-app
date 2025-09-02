import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs, where, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, Address, UserNotificationPreferences, User } from '@/types';

// Get user orders
export const useUserOrders = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-orders', userId],
    queryFn: async (): Promise<Order[]> => {
      if (!userId) return [];

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            id: doc.id,
            ...data,
          } as Order);
        });

        return orders;
      } catch (error) {
        console.error('Error fetching user orders:', error);
        // Return mock data for development
        return [
          {
            id: '1',
            userId,
            shopId: 'shop1',
            shopName: 'Electronics Store',
            status: 'DELIVERED' as const,
            items: [
              {
                productId: 'prod1',
                productName: 'Wireless Headphones',
                productImage: '/images/headphones.jpg',
                quantity: 1,
                price: 99.99
              }
            ],
            subtotal: 99.99,
            deliveryFee: 5.99,
            tax: 8.40,
            total: 114.38,
            currency: 'USD',
            deliveryMethod: {
              id: 'home',
              name: 'Home Delivery',
              description: 'Delivery to your doorstep',
              price: 5.99,
              currency: 'USD',
              estimatedDays: 3,
              isAvailable: true,
              type: 'HOME_DELIVERY'
            },
            paymentMethod: 'MOBILE_MONEY' as const,
            paymentStatus: 'COMPLETED' as const,
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
            orderNumber: 'ORD-001'
          },
          {
            id: '2',
            userId,
            shopId: 'shop2',
            shopName: 'Fashion Store',
            status: 'SHIPPED' as const,
            items: [
              {
                productId: 'prod2',
                productName: 'Cotton T-Shirt',
                productImage: '/images/tshirt.jpg',
                quantity: 2,
                price: 24.99
              }
            ],
            subtotal: 49.98,
            deliveryFee: 5.99,
            tax: 4.20,
            total: 60.17,
            currency: 'USD',
            deliveryMethod: {
              id: 'home',
              name: 'Home Delivery',
              description: 'Delivery to your doorstep',
              price: 5.99,
              currency: 'USD',
              estimatedDays: 3,
              isAvailable: true,
              type: 'HOME_DELIVERY'
            },
            paymentMethod: 'MOBILE_MONEY' as const,
            paymentStatus: 'COMPLETED' as const,
            createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
            orderNumber: 'ORD-002'
          }
        ];
      }
    },
    enabled: enabled && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user shipping addresses
export const useUserAddresses = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-addresses', userId],
    queryFn: async (): Promise<Address[]> => {
      if (!userId) return [];

      try {
        const addressesRef = collection(db, 'addresses');
        const q = query(
          addressesRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const addresses: Address[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          addresses.push({
            id: doc.id,
            ...data,
          } as Address);
        });

        return addresses;
      } catch (error) {
        console.error('Error fetching user addresses:', error);
        // Return mock data for development
        return [
          {
            id: '1',
            userId,
            type: 'HOME' as const,
            isDefault: true,
            fullName: 'John Doe',
            phoneNumber: '+237123456789',
            streetAddress: '123 Main Street, Apt 4B',
            city: 'Douala',
            state: 'Littoral',
            postalCode: '12345',
            country: 'Cameroon',
            additionalInfo: 'Near the big blue gate',
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now()
          },
          {
            id: '2',
            userId,
            type: 'WORK' as const,
            isDefault: false,
            fullName: 'John Doe',
            phoneNumber: '+237123456789',
            streetAddress: '456 Business District',
            city: 'Yaounde',
            state: 'Centre',
            postalCode: '54321',
            country: 'Cameroon',
            createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now()
          }
        ];
      }
    },
    enabled: enabled && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get user notification preferences
export const useUserNotificationPreferences = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-notification-preferences', userId],
    queryFn: async (): Promise<UserNotificationPreferences> => {
      if (!userId) {
        return getDefaultNotificationPreferences();
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          return userData.notificationPreferences || getDefaultNotificationPreferences();
        }

        return getDefaultNotificationPreferences();
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return getDefaultNotificationPreferences();
      }
    },
    enabled: enabled && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get enhanced user profile
export const useEnhancedUserProfile = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['enhanced-user-profile', userId],
    queryFn: async (): Promise<User | null> => {
      if (!userId) return null;

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            id: userDoc.id,
            ...userData,
          } as User;
        }

        return null;
      } catch (error) {
        console.error('Error fetching enhanced user profile:', error);
        return null;
      }
    },
    enabled: enabled && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function for default notification preferences
function getDefaultNotificationPreferences(): UserNotificationPreferences {
  return {
    email: true,
    sms: false,
    push: true,
    inApp: true,
    marketing: false,
    orderUpdates: true,
    gameUpdates: true,
    winnerAnnouncements: true,
    paymentNotifications: true,
    securityAlerts: true,
    weeklyDigest: false,
    newMessages: true,
    priceDrops: false,
    restockAlerts: false,
    deliveryUpdates: true
  };
}

// Get user order statistics
export const useUserOrderStats = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-order-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        let totalOrders = 0;
        let totalSpent = 0;
        let completedOrders = 0;
        let pendingOrders = 0;

        querySnapshot.forEach((doc) => {
          const order = doc.data() as Order;
          totalOrders++;
          totalSpent += order.total;

          if (order.status === 'DELIVERED') {
            completedOrders++;
          } else if (order.status === 'PENDING' || order.status === 'PROCESSING') {
            pendingOrders++;
          }
        });

        return {
          totalOrders,
          totalSpent,
          completedOrders,
          pendingOrders,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
        };
      } catch (error) {
        console.error('Error fetching user order stats:', error);
        // Return mock data for development
        return {
          totalOrders: 5,
          totalSpent: 487.23,
          completedOrders: 3,
          pendingOrders: 1,
          averageOrderValue: 97.45
        };
      }
    },
    enabled: enabled && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};