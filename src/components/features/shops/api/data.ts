import { Product, Shop } from '../../../../types';

// Mock shops data for development
export const mockShops: Shop[] = [
  {
    id: 'electronics-world',
    name: 'Electronics World',
    description: 'Your one-stop shop for the latest technology and gadgets',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=100&q=80',
    banner: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80',
    vendorId: 'vendor-1',
    status: 'ACTIVE',
    isVerified: true,
    rating: 4.8,
    totalReviews: 1250,
    followersCount: 8500,
    productsCount: 245,
    ordersCount: 5670,
    totalRevenue: 125000,
    contactInfo: {
      email: 'contact@electronicsworld.com',
      phone: '+237123456789',
      website: 'https://electronicsworld.com'
    },
    categories: ['electronics', 'gadgets'],
    tags: ['technology', 'smartphones', 'laptops'],
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'fashion-hub',
    name: 'Fashion Hub',
    description: 'Trendy clothes and accessories for modern style',
    logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=100&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
    vendorId: 'vendor-2',
    status: 'ACTIVE',
    isVerified: true,
    rating: 4.6,
    totalReviews: 890,
    followersCount: 6200,
    productsCount: 180,
    ordersCount: 3400,
    totalRevenue: 95000,
    contactInfo: {
      email: 'hello@fashionhub.cm',
      phone: '+237987654321'
    },
    categories: ['fashion', 'accessories'],
    tags: ['clothing', 'shoes', 'jewelry'],
    createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'home-essentials',
    name: 'Home Essentials',
    description: 'Everything you need to make your house a home',
    logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=100&q=80',
    banner: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
    vendorId: 'vendor-3',
    status: 'ACTIVE',
    isVerified: true,
    rating: 4.7,
    totalReviews: 567,
    followersCount: 3400,
    productsCount: 320,
    ordersCount: 2100,
    totalRevenue: 78000,
    contactInfo: {
      email: 'info@homeessentials.cm',
      phone: '+237555666777'
    },
    categories: ['home', 'furniture', 'decor'],
    tags: ['furniture', 'appliances', 'decor'],
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  }
];

// Mock products data for development
export const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'iPhone 15 Pro Max 256GB',
    description: 'Latest Apple iPhone with advanced camera system and titanium design',
    price: 599000,
    currency: 'XAF',
    originalPrice: 699000,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'
    ],
    category: 'electronics',
    tags: ['smartphone', 'apple', 'premium'],
    shopId: 'electronics-world',
    shopName: 'Electronics World',
    shopLogo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=100&q=80',
    status: 'ACTIVE',
    isAvailable: true,
    isNew: true,
    isFeatured: true,
    isLotteryEnabled: true,
    lotteryPrice: 5000,
    rating: 4.8,
    reviewCount: 127,
    likeCount: 234,
    shareCount: 89,
    playedCount: 45,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'product-2',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Flagship Android phone with S Pen and advanced AI features',
    price: 549000,
    currency: 'XAF',
    originalPrice: 649000,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80'
    ],
    category: 'electronics',
    tags: ['smartphone', 'samsung', 'android'],
    shopId: 'electronics-world',
    shopName: 'Electronics World',
    shopLogo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=100&q=80',
    status: 'ACTIVE',
    isAvailable: true,
    isNew: false,
    isFeatured: false,
    isLotteryEnabled: true,
    lotteryPrice: 4500,
    rating: 4.7,
    reviewCount: 89,
    likeCount: 156,
    shareCount: 45,
    playedCount: 32,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'product-3',
    name: 'Nike Air Jordan 1 Retro High',
    description: 'Classic basketball sneakers with premium leather construction',
    price: 89000,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80'
    ],
    category: 'fashion',
    tags: ['sneakers', 'nike', 'basketball'],
    shopId: 'fashion-hub',
    shopName: 'Fashion Hub',
    shopLogo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=100&q=80',
    status: 'ACTIVE',
    isAvailable: true,
    isNew: true,
    isFeatured: false,
    isLotteryEnabled: true,
    lotteryPrice: 2500,
    rating: 4.9,
    reviewCount: 203,
    likeCount: 445,
    shareCount: 123,
    playedCount: 67,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'product-4',
    name: 'MacBook Air M3 15-inch',
    description: 'Ultra-thin laptop with M3 chip for incredible performance and battery life',
    price: 899000,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80'
    ],
    category: 'electronics',
    tags: ['laptop', 'apple', 'macbook'],
    shopId: 'electronics-world',
    shopName: 'Electronics World',
    shopLogo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=100&q=80',
    status: 'ACTIVE',
    isAvailable: true,
    isNew: false,
    isFeatured: true,
    isLotteryEnabled: true,
    lotteryPrice: 8000,
    rating: 4.9,
    reviewCount: 89,
    likeCount: 178,
    shareCount: 67,
    playedCount: 23,
    createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  }
];

// Mock vendor banners for development
export const mockVendorBanners = [
  {
    id: 'banner-1',
    title: 'Electronics Sale',
    description: 'Up to 50% off on latest smartphones and gadgets',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/shops/electronics-world',
    shopId: 'electronics-world',
    isActive: true,
    priority: 1,
    startDate: Date.now(),
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    clickCount: 0,
    impressionCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'banner-2',
    title: 'Fashion Week Special',
    description: 'New arrivals from top fashion brands',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/shops/fashion-hub',
    shopId: 'fashion-hub',
    isActive: true,
    priority: 2,
    startDate: Date.now(),
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    clickCount: 0,
    impressionCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const SHOPS_PER_PAGE = 10;
export const PRODUCTS_PER_PAGE = 12;