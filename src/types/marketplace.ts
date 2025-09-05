// Marketplace Types
export interface Shop {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  rating: number;
  reviewsCount: number;
  followersCount: number;
  categories: string[];
  tags: string[];
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

// Product type is now unified in the main types file
// Note: Product interface is defined in index.ts to avoid circular imports

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}

// Analytics Types
export interface MarketplaceStats {
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalMarketplaceRevenue: number;
  totalLikes: number;
  totalFollows: number;
  totalReviews: number;
  averageShopRating: number;
  activeShops: number;
  pendingShopApplications: number;
}

export interface ShopPerformanceData {
  shopId: string;
  shopName: string;
  revenue: number;
  orders: number;
  products: number;
  likes: number;
  follows: number;
  reviews: number;
  rating: number;
  conversionRate: number;
}

export interface ProductPerformanceData {
  productId: string;
  productName: string;
  shopName: string;
  sales: number;
  revenue: number;
  likes: number;
  views: number;
  conversionRate: number;
  rating: number;
}

export interface MarketplaceTrends {
  period: string;
  orders: number;
  revenue: number;
  newShops: number;
  newProducts: number;
  activeUsers: number;
}
