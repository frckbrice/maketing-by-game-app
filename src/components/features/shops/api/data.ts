import { MOCK_SHOPS, MOCK_PRODUCTS } from '@/lib/constants/mockData';
import { Product, Shop } from '../../../../types';

// Use centralized mock data for consistency across the app
export const mockShops: Shop[] = MOCK_SHOPS;

// Use centralized mock products data for consistency across the app
export const mockProducts: Product[] = MOCK_PRODUCTS;

// Mock vendor banners for development - consistent with central shop data
export const mockVendorBanners = [
  {
    id: 'banner-1',
    title: 'Electronics Sale',
    description: 'Up to 50% off on latest smartphones and gadgets',
    imageUrl:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/shops/tech-store',
    shopId: 'tech-store',
    isActive: true,
    priority: 1,
    startDate: Date.now(),
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    clickCount: 0,
    impressionCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'banner-2',
    title: 'Fashion Week Special',
    description: 'New arrivals from top fashion brands',
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/shops/fashion-hub',
    shopId: 'fashion-hub',
    isActive: true,
    priority: 2,
    startDate: Date.now(),
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    clickCount: 0,
    impressionCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'banner-3',
    title: 'Home Makeover Sale',
    description: 'Transform your space with 40% off home essentials',
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/shops/home-essentials',
    shopId: 'home-essentials',
    isActive: true,
    priority: 3,
    startDate: Date.now(),
    endDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
    clickCount: 0,
    impressionCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const SHOPS_PER_PAGE = 10;
export const PRODUCTS_PER_PAGE = 12;
