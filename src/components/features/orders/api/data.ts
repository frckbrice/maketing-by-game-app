import { Order, Address, DeliveryMethod } from '@/types';

// Mock delivery methods for development
export const mockDeliveryMethods: DeliveryMethod[] = [
  {
    id: 'pickup',
    name: 'Store Pickup',
    description: 'Pick up your order from the shop location',
    price: 0,
    currency: 'XAF',
    estimatedDays: 0,
    isAvailable: true,
    type: 'PICKUP'
  },
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery within 3-5 business days',
    price: 2500,
    currency: 'XAF',
    estimatedDays: 4,
    isAvailable: true,
    type: 'HOME_DELIVERY'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Next day delivery for urgent orders',
    price: 5000,
    currency: 'XAF',
    estimatedDays: 1,
    isAvailable: true,
    type: 'HOME_DELIVERY'
  },
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    description: 'Order before 12 PM for same day delivery',
    price: 8000,
    currency: 'XAF',
    estimatedDays: 0,
    isAvailable: true,
    type: 'HOME_DELIVERY'
  }
];

// Mock addresses for development
export const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    userId: 'user-1',
    type: 'HOME',
    isDefault: true,
    fullName: 'John Doe',
    phoneNumber: '+237123456789',
    streetAddress: '123 Main Street',
    city: 'Yaoundé',
    state: 'Centre',
    postalCode: '1000',
    country: 'Cameroon',
    additionalInfo: 'Near the central market',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'addr-2',
    userId: 'user-1',
    type: 'WORK',
    isDefault: false,
    fullName: 'John Doe',
    phoneNumber: '+237123456789',
    streetAddress: '456 Business Avenue',
    city: 'Douala',
    state: 'Littoral',
    postalCode: '2000',
    country: 'Cameroon',
    additionalInfo: 'Office building, 3rd floor',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  }
];

// Mock orders for development
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    shopId: 'electronics-world',
    shopName: 'Electronics World',
    status: 'DELIVERED',
    items: [
      {
        productId: 'product-1',
        productName: 'iPhone 15 Pro Max 256GB',
        productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        price: 599000,
        size: 'M'
      }
    ],
    subtotal: 599000,
    deliveryFee: 2500,
    tax: 59900,
    total: 661400,
    currency: 'XAF',
    deliveryMethod: mockDeliveryMethods[1],
    deliveryAddress: mockAddresses[0],
    paymentMethod: 'MOBILE_MONEY',
    paymentStatus: 'COMPLETED',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    estimatedDeliveryDate: Date.now() - 6 * 24 * 60 * 60 * 1000,
    actualDeliveryDate: Date.now() - 6 * 24 * 60 * 60 * 1000,
    orderNumber: 'ORD-2024-001'
  },
  {
    id: 'order-2',
    userId: 'user-1',
    shopId: 'fashion-hub',
    shopName: 'Fashion Hub',
    status: 'SHIPPED',
    items: [
      {
        productId: 'product-3',
        productName: 'Nike Air Jordan 1 Retro High',
        productImage: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80',
        quantity: 2,
        price: 89000,
        size: 'L'
      }
    ],
    subtotal: 178000,
    deliveryFee: 5000,
    tax: 17800,
    total: 200800,
    currency: 'XAF',
    deliveryMethod: mockDeliveryMethods[2],
    deliveryAddress: mockAddresses[1],
    paymentMethod: 'MOBILE_MONEY',
    paymentStatus: 'COMPLETED',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    estimatedDeliveryDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
    orderNumber: 'ORD-2024-002'
  },
  {
    id: 'order-3',
    userId: 'user-1',
    shopId: 'electronics-world',
    shopName: 'Electronics World',
    status: 'PROCESSING',
    items: [
      {
        productId: 'product-4',
        productName: 'MacBook Air M3 15-inch',
        productImage: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        price: 899000
      }
    ],
    subtotal: 899000,
    deliveryFee: 0,
    tax: 89900,
    total: 988900,
    currency: 'XAF',
    deliveryMethod: mockDeliveryMethods[0],
    deliveryAddress: null, // Pickup order
    paymentMethod: 'MOBILE_MONEY',
    paymentStatus: 'COMPLETED',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 12 * 60 * 60 * 1000,
    estimatedDeliveryDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    orderNumber: 'ORD-2024-003'
  }
];

export const ORDERS_PER_PAGE = 10;
export const ADDRESSES_PER_PAGE = 20;