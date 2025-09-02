import { useQuery } from '@tanstack/react-query';
import { Product } from '../../../../types';
import { mockProducts, mockShops, mockVendorBanners } from './data';
import { Shop, VendorBanner } from './types';

// Development environment check
const isDev = process.env.NODE_ENV === 'development';

// Simulate API delays for realistic UX
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Shop queries
export const useShops = (params?: { 
  limit?: number; 
  category?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: async (): Promise<Shop[]> => {
      await simulateDelay();
      
      if (isDev) {
        let filteredShops = [...mockShops];
        
        if (params?.category) {
          filteredShops = filteredShops.filter(shop => 
            shop.categories.includes(params.category!)
          );
        }
        
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredShops = filteredShops.filter(shop =>
            shop.name.toLowerCase().includes(searchTerm) ||
            shop.description.toLowerCase().includes(searchTerm) ||
            shop.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
          );
        }
        
        if (params?.limit) {
          filteredShops = filteredShops.slice(0, params.limit);
        }
        
        return filteredShops;
      }
      
      // Production API call would go here
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useShop = (shopId: string) => {
  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: async (): Promise<Shop | null> => {
      await simulateDelay();
      
      if (isDev) {
        return mockShops.find(shop => shop.id === shopId) || null;
      }
      
      // Production API call
      const response = await fetch(`/api/shops/${shopId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch shop');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!shopId,
  });
};

export const useTopShops = (limit: number = 6) => {
  return useQuery({
    queryKey: ['shops', 'top', limit],
    queryFn: async (): Promise<Shop[]> => {
      await simulateDelay();
      
      if (isDev) {
        // Sort by followers count and rating for "top" shops
        return [...mockShops]
          .sort((a, b) => (b.followersCount * b.rating) - (a.followersCount * a.rating))
          .slice(0, limit);
      }
      
      // Production API call
      const response = await fetch(`/api/shops/top?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch top shops');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for top shops
    gcTime: 15 * 60 * 1000,
  });
};

// Product queries
export const useProducts = (params?: {
  shopId?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<Product[]> => {
      await simulateDelay();
      
      if (isDev) {
        let filteredProducts = [...mockProducts];
        
        if (params?.shopId) {
          filteredProducts = filteredProducts.filter(product => 
            product.shop.shopId === params.shopId
          );
        }
        
        if (params?.category) {
          filteredProducts = filteredProducts.filter(product => 
            product.category === params.category
          );
        }
        
        if (params?.featured) {
          filteredProducts = filteredProducts.filter(product => product.isFeatured);
        }
        
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }
        
        // Sort products
        if (params?.sortBy) {
          switch (params.sortBy) {
            case 'newest':
              filteredProducts.sort((a, b) => b.createdAt - a.createdAt);
              break;
            case 'price-low':
              filteredProducts.sort((a, b) => a.price - b.price);
              break;
            case 'price-high':
              filteredProducts.sort((a, b) => b.price - a.price);
              break;
            case 'popular':
              filteredProducts.sort((a, b) => b.playedCount - a.playedCount);
              break;
            case 'rating':
              filteredProducts.sort((a, b) => b.rating - a.rating);
              break;
          }
        }
        
        if (params?.limit) {
          filteredProducts = filteredProducts.slice(0, params.limit);
        }
        
        return filteredProducts;
      }
      
      // Production API call
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product | null> => {
      await simulateDelay();
      
      if (isDev) {
        return mockProducts.find(product => product.id === productId) || null;
      }
      
      // Production API call
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch product');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!productId,
  });
};

export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async (): Promise<Product[]> => {
      await simulateDelay();
      
      if (isDev) {
        return mockProducts
          .filter(product => product.isFeatured)
          .slice(0, limit);
      }
      
      // Production API call
      const response = await fetch(`/api/products/featured?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const usePersonalizedProducts = (userId: string, limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'personalized', userId, limit],
    queryFn: async (): Promise<Product[]> => {
      await simulateDelay();
      
      if (isDev) {
        // Mock personalized algorithm - mix of new, popular, and liked categories
        const newProducts = mockProducts.filter(p => p.isNew);
        const popularProducts = mockProducts
          .sort((a, b) => b.playedCount - a.playedCount)
          .slice(0, 4);
        
        const combined = [...newProducts, ...popularProducts];
        const unique = combined.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        return unique.slice(0, limit);
      }
      
      // Production API call with user preferences
      const response = await fetch(`/api/products/personalized/${userId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch personalized products');
      }
      
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for personalized content
    gcTime: 20 * 60 * 1000,
    enabled: !!userId,
  });
};

// Vendor banner queries
export const useVendorBanners = (limit?: number) => {
  return useQuery({
    queryKey: ['vendor-banners', limit],
    queryFn: async (): Promise<VendorBanner[]> => {
      await simulateDelay(300);
      
      if (isDev) {
        const activeBanners = mockVendorBanners
          .filter(banner => banner.isActive)
          .sort((a, b) => a.priority - b.priority);
        
        return limit ? activeBanners.slice(0, limit) : activeBanners;
      }
      
      // Production API call
      const response = await fetch(`/api/vendor-banners${limit ? `?limit=${limit}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor banners');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};