import { useQuery } from '@tanstack/react-query';

// Development environment check
const isDev = process.env.NODE_ENV === 'development';

// Simulate API delays for realistic UX
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Marketplace Analytics Types
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

// Mock data for development
const generateMockMarketplaceStats = (): MarketplaceStats => ({
  totalShops: 45,
  totalProducts: 326,
  totalOrders: 1247,
  totalMarketplaceRevenue: 89340,
  totalLikes: 8952,
  totalFollows: 3241,
  totalReviews: 892,
  averageShopRating: 4.2,
  activeShops: 38,
  pendingShopApplications: 7,
});

const generateMockShopPerformance = (): ShopPerformanceData[] => [
  {
    shopId: '1',
    shopName: 'TechZone Central Africa',
    revenue: 12450,
    orders: 89,
    products: 23,
    likes: 567,
    follows: 234,
    reviews: 45,
    rating: 4.8,
    conversionRate: 3.2,
  },
  {
    shopId: '2', 
    shopName: 'Fashion Hub Cameroon',
    revenue: 9870,
    orders: 76,
    products: 34,
    likes: 789,
    follows: 345,
    reviews: 67,
    rating: 4.5,
    conversionRate: 2.8,
  },
  {
    shopId: '3',
    shopName: 'Home Essentials Chad',
    revenue: 7650,
    orders: 54,
    products: 19,
    likes: 432,
    follows: 189,
    reviews: 32,
    rating: 4.3,
    conversionRate: 2.1,
  },
  {
    shopId: '4',
    shopName: 'Sports Corner CAR',
    revenue: 6340,
    orders: 43,
    products: 28,
    likes: 356,
    follows: 167,
    reviews: 28,
    rating: 4.1,
    conversionRate: 1.9,
  },
  {
    shopId: '5',
    shopName: 'Beauty Palace Gabon',
    revenue: 8920,
    orders: 67,
    products: 31,
    likes: 623,
    follows: 278,
    reviews: 51,
    rating: 4.6,
    conversionRate: 2.5,
  },
];

const generateMockProductPerformance = (): ProductPerformanceData[] => [
  {
    productId: '1',
    productName: 'iPhone 15 Pro Max',
    shopName: 'TechZone Central Africa',
    sales: 23,
    revenue: 34500,
    likes: 234,
    views: 1234,
    conversionRate: 1.86,
    rating: 4.9,
  },
  {
    productId: '2',
    productName: 'Samsung 4K Smart TV',
    shopName: 'TechZone Central Africa',
    sales: 17,
    revenue: 25500,
    likes: 189,
    views: 987,
    conversionRate: 1.72,
    rating: 4.7,
  },
  {
    productId: '3',
    productName: 'Nike Air Max Retro',
    shopName: 'Fashion Hub Cameroon',
    sales: 45,
    revenue: 6750,
    likes: 356,
    views: 2134,
    conversionRate: 2.11,
    rating: 4.4,
  },
  {
    productId: '4',
    productName: 'Kitchen Stand Mixer',
    shopName: 'Home Essentials Chad',
    sales: 12,
    revenue: 3600,
    likes: 123,
    views: 789,
    conversionRate: 1.52,
    rating: 4.2,
  },
  {
    productId: '5',
    productName: 'Premium Headphones',
    shopName: 'TechZone Central Africa',
    sales: 34,
    revenue: 6800,
    likes: 267,
    views: 1456,
    conversionRate: 2.34,
    rating: 4.6,
  },
];

const generateMockMarketplaceTrends = (): MarketplaceTrends[] => {
  const trends: MarketplaceTrends[] = [];
  const now = new Date();
  
  // Generate last 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      period: date.toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      newShops: Math.floor(Math.random() * 3),
      newProducts: Math.floor(Math.random() * 15) + 5,
      activeUsers: Math.floor(Math.random() * 200) + 100,
    });
  }
  
  return trends;
};

// Query hooks
export const useMarketplaceStats = () => {
  return useQuery({
    queryKey: ['admin', 'marketplace', 'stats'],
    queryFn: async (): Promise<MarketplaceStats> => {
      await simulateDelay();
      
      if (isDev) {
        return generateMockMarketplaceStats();
      }
      
      // Production API call
      const response = await fetch('/api/admin/marketplace/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace stats');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTopShopsPerformance = (limit: number = 10) => {
  return useQuery({
    queryKey: ['admin', 'marketplace', 'shops', 'performance', limit],
    queryFn: async (): Promise<ShopPerformanceData[]> => {
      await simulateDelay();
      
      if (isDev) {
        return generateMockShopPerformance().slice(0, limit);
      }
      
      // Production API call
      const response = await fetch(`/api/admin/marketplace/shops/performance?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shop performance data');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTopProductsPerformance = (limit: number = 10) => {
  return useQuery({
    queryKey: ['admin', 'marketplace', 'products', 'performance', limit],
    queryFn: async (): Promise<ProductPerformanceData[]> => {
      await simulateDelay();
      
      if (isDev) {
        return generateMockProductPerformance().slice(0, limit);
      }
      
      // Production API call
      const response = await fetch(`/api/admin/marketplace/products/performance?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product performance data');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMarketplaceTrends = (days: number = 30) => {
  return useQuery({
    queryKey: ['admin', 'marketplace', 'trends', days],
    queryFn: async (): Promise<MarketplaceTrends[]> => {
      await simulateDelay();
      
      if (isDev) {
        return generateMockMarketplaceTrends().slice(-days);
      }
      
      // Production API call
      const response = await fetch(`/api/admin/marketplace/trends?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace trends');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Products Query Hook
export const useProducts = () => {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async (): Promise<MarketplaceTrends[]> => {
      await simulateDelay();
      
      if (isDev) {
        return generateMockMarketplaceTrends().slice(-days); 
      }
      
      // Production API call
      const response = await fetch(`/api/admin/marketplace/trends?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace trends');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

