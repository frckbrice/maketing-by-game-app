import type { GameCategory, LotteryGame, Product, Review, Shop } from '@/types';

// =============================================================================
// MOCK CATEGORIES
// =============================================================================

export const MOCK_CATEGORIES: GameCategory[] = [
  {
    id: 'tech',
    name: 'Tech & Phones',
    description: 'Latest smartphones, tablets, and tech gadgets',
    icon: '/en/images/iphone15promax.webp',
    color: '#FF5722',
    isActive: true,
    sortOrder: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fashion',
    name: 'Fashion & Sneakers',
    description: 'Designer clothing, shoes, and accessories',
    icon: '/en/images/nikeairretro.webp',
    color: '#E91E63',
    isActive: true,
    sortOrder: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'home',
    name: 'Home Appliances',
    description: 'Kitchen appliances, home decor, and furniture',
    icon: '/en/images/kitchenretromixer.webp',
    color: '#4CAF50',
    isActive: true,
    sortOrder: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'computers',
    name: 'Computers',
    description: 'Laptops, PCs, gaming equipment, and accessories',
    icon: '/en/images/macbookpro.jpg',
    color: '#2196F3',
    isActive: true,
    sortOrder: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// =============================================================================
// MOCK GAMES
// =============================================================================
// Note: In real data:
// - createdBy: 'admin' means no sponsor object (admin-created games)
// - createdBy: 'vendor-id' means sponsor object will be populated by enrichGamesWithCategories
// - The sponsor.id will always equal createdBy when sponsor exists

export const MOCK_GAMES: LotteryGame[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB',
    description:
      'Latest iPhone 15 Pro Max in Natural Titanium - Brand new, unlocked',
    type: 'daily',
    categoryId: 'tech',
    category: MOCK_CATEGORIES[0],
    ticketPrice: 25,
    currency: 'USD',
    maxParticipants: 400,
    currentParticipants: 287,
    totalTickets: 400,
    totalTicketsSold: 287,
    totalPrizePool: 10000,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/iphone15promax.webp',
        alt: 'iPhone 15 Pro Max 256GB',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'admin',
      name: 'Tech Hub',
      website: '',
      logo: '/fr/icons/lottery_logo.jpeg',
    },
    startDate: Date.now(),
    endDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Nike Air Jordan 1 Retro High',
    description: 'Authentic Nike Air Jordan 1 Retro High - Size 9-12 available',
    type: 'weekly',
    categoryId: 'fashion',
    category: MOCK_CATEGORIES[1],
    ticketPrice: 50,
    currency: 'USD',
    maxParticipants: 300,
    currentParticipants: 189,
    totalTickets: 300,
    totalTicketsSold: 189,
    totalPrizePool: 4500,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/nikeairretro.webp',
        alt: 'Nike Air Jordan 1 Retro High',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'admin',
      name: 'Tech Hub',
      website: '',
      logo: '/fr/icons/lottery_logo.jpeg',
    },
    startDate: Date.now(),
    endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: 'KitchenAid Stand Mixer',
    description: 'Professional 6-Qt KitchenAid Stand Mixer with attachments',
    type: 'weekly',
    categoryId: 'home',
    category: MOCK_CATEGORIES[2],
    ticketPrice: 50,
    currency: 'USD',
    maxParticipants: 250,
    totalTickets: 300,
    totalTicketsSold: 189,
    currentParticipants: 164,
    totalPrizePool: 5000,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/kitchenretromixer.webp',
        alt: 'KitchenAid Stand Mixer',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'admin',
      name: 'Tech Hub',
      website: '',
      logo: '/fr/icons/lottery_logo.jpeg',
    },
    startDate: Date.now(),
    endDate: Date.now() + 12 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 12 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '4',
    title: 'MacBook Pro M3 14"',
    description: 'Latest MacBook Pro 14" with M3 chip, 16GB RAM, 512GB SSD',
    type: 'monthly',
    categoryId: 'computers',
    category: MOCK_CATEGORIES[3],
    ticketPrice: 45,
    currency: 'USD',
    totalTickets: 300,
    totalTicketsSold: 189,
    maxParticipants: 200,
    currentParticipants: 127,
    totalPrizePool: 9000,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/macbookpro.jpg',
        alt: 'MacBook Pro M3 14"',
        type: 'thumbnail',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'admin',
      name: 'Tech Hub',
      website: '',
      logo: '/fr/icons/lottery_logo.jpeg',
    },
    startDate: Date.now(),
    endDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '5',
    title: 'Samsung 65" QLED 4K TV',
    description: 'Samsung 65" Neo QLED 4K Smart TV with Quantum HDR',
    type: 'monthly',
    categoryId: 'tech',
    category: MOCK_CATEGORIES[0],
    ticketPrice: 35,
    currency: 'USD',
    maxParticipants: 180,
    currentParticipants: 98,
    totalPrizePool: 6300,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/samsungTV4K.avif',
        alt: 'Samsung 65" QLED 4K TV',
        type: 'thumbnail',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'admin',
      name: 'Tech Hub',
      website: '',
      logo: '/fr/icons/lottery_logo.jpeg',
    },
    startDate: Date.now(),
    totalTickets: 300,
    totalTicketsSold: 189,
    endDate: Date.now() + 18 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 18 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '6',
    title: 'Dyson V15 Detect Vacuum',
    description:
      'Dyson V15 Detect Absolute Cordless Vacuum with laser detection',
    type: 'weekly',
    categoryId: 'home',
    category: MOCK_CATEGORIES[4],
    ticketPrice: 30,
    currency: 'USD',
    totalTickets: 300,
    totalTicketsSold: 189,
    maxParticipants: 150,
    currentParticipants: 89,
    totalPrizePool: 4500,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/vacum.jpeg',
        alt: 'Dyson V15 Detect Absolute Cordless Vacuum',
        type: 'thumbnail',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'admin',
      name: 'Tech Hub',
      website: '',
      logo: '/fr/icons/lottery_logo.jpeg',
    },
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  // Example of a vendor-created game (would have sponsor object in real data)
  {
    id: '7',
    title: 'Premium Gaming Headset',
    description:
      'Professional gaming headset with noise cancellation and surround sound',
    type: 'weekly',
    categoryId: 'computers',
    category: MOCK_CATEGORIES[3],
    ticketPrice: 35,
    currency: 'USD',
    maxParticipants: 200,
    currentParticipants: 45,
    totalTickets: 200,
    totalTicketsSold: 45,
    totalPrizePool: 7000,
    prizes: [],
    rules: [],
    images: [
      {
        id: '1',
        url: '/en/images/headset.jpg', // Using existing image as placeholder
        alt: 'Premium Gaming Headset',
        type: 'thumbnail',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    shop: {
      id: 'vendor-123',
      name: 'Tech Hub',
      website: 'https://www.logitech.com',
      logo: '/en/images/headset.jpg',
    },
    startDate: Date.now(),
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'vendor-123', // This would be a real vendor ID
    // Note: sponsor object would be populated by enrichGamesWithCategories
    // when fetching from API, but not in mock data
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// =============================================================================
// MOCK GAMES FOR ADMIN (GENERATED)
// =============================================================================

export const generateMockGamesForAdmin = (
  count: number = 30
): LotteryGame[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `game-${i}`,
    title: `Amazing Product ${i}`,
    description: `Win this incredible product worth $${(Math.random() * 1000 + 100).toFixed(2)}`,
    type: 'daily',
    categoryId: `cat-${i % 4}`,
    category: {
      id: `cat-${i % 4}`,
      name: [
        'Tech & Phones',
        'Fashion & Sneakers',
        'Home Appliances',
        'Computers',
      ][i % 4],
      description: 'Category description',
      color: '#FF5722',
      icon: '📱',
      isActive: true,
      sortOrder: i % 4,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    ticketPrice: Math.floor(Math.random() * 50) + 5,
    currency: 'USD',
    maxParticipants: Math.floor(Math.random() * 500) + 100,
    currentParticipants: Math.floor(Math.random() * 300),
    totalTickets: 0,
    totalTicketsSold: 0,
    totalPrizePool: 0,
    prizes: [],
    rules: [],
    images: [],
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    drawDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    status: ['DRAFT', 'ACTIVE', 'DRAWING', 'CLOSED'][
      Math.floor(Math.random() * 4)
    ] as any,
    isActive: Math.random() > 0.2,
    createdBy: 'admin-1',
    createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  }));
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getMockCategories = (): GameCategory[] => MOCK_CATEGORIES;

export const getMockGames = (categoryId?: string): LotteryGame[] => {
  if (categoryId && categoryId !== 'all') {
    return MOCK_GAMES.filter(game => game.categoryId === categoryId);
  }
  return MOCK_GAMES;
};

// Helper to get mock games with proper category objects
export const getMockGamesWithCategories = (
  categoryId?: string
): LotteryGame[] => {
  const games = getMockGames(categoryId);
  return games.map(game => ({
    ...game,
    category:
      MOCK_CATEGORIES.find(cat => cat.id === game.categoryId) ||
      getDefaultCategory(),
  }));
};

export const getDefaultCategory = (): GameCategory => ({
  id: 'general',
  name: 'General',
  description: 'General category',
  icon: '🎁',
  color: '#9E9E9E',
  isActive: true,
  sortOrder: 999,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// =============================================================================
// HOME PAGE MOCK DATA
// =============================================================================

export interface HomeWinner {
  name: string;
  country: string;
  prize: string;
  amount: string;
  date: string;
  image: string;
}

export const HOME_WINNERS: HomeWinner[] = [
  {
    name: 'NGUYEN SOPHIE',
    country: 'NGOA EKELE',
    prize: 'TECH BUNDLE',
    amount: 'iPhone 15 Pro Max + MacBook Pro',
    date: 'JUIN 2025',
    image: 'winner1.png',
  },
  {
    name: 'RIM A RIBAM JENER',
    country: 'NKOABANG',
    prize: 'FASHION PACK',
    amount: 'Nike Air Jordan + Designer Clothes',
    date: 'JULY 2025',
    image: 'winner2.png',
  },
  {
    name: 'BELLO',
    country: 'ETOUDI',
    prize: 'HOME BUNDLE',
    amount: 'Smart Appliances Package',
    date: 'AUGUST 2025',
    image: 'winner3.png',
  },
  {
    name: 'HENRIETTE NDOU',
    country: 'ESSOS',
    prize: 'SNEAKER COLLECTION',
    amount: 'Nike + Adidas Premium Pack',
    date: 'AUGUST 2025',
    image: 'winner4.png',
  },
];

export const HOME_STATS = [
  { number: '25K+', labelKey: 'home.hero.stats.productsWon' },
  { number: '$10M+', labelKey: 'home.hero.stats.prizeValue' },
  { number: '99.8%', labelKey: 'home.hero.stats.deliveryRate' },
];


// reviews 

export const mocksReviews = (productId: string): Review[] => ([
  {
    id: 'review-1',
    userId: 'user-1',
    userName: 'John Doe',
    userAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=40&q=80',
    rating: 5,
    comment: 'Excellent product! Exactly as described and fast delivery.',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    isVerified: true,
    likes: 15,
    productId: productId,
  },
  {
    id: 'review-2',
    userId: 'user-2',
    userName: 'Marie Dubois',
    userAvatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=40&q=80',
    rating: 4,
    comment: 'Good quality product. Would recommend to others.',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    isVerified: true,
    likes: 8,
    productId: productId,
  },
]);

// =============================================================================
// MOCK SHOPS
// =============================================================================

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'tech-store',
    name: 'Tech Store',
    description: 'Your one-stop shop for the latest technology and gadgets',
    logoUrl: '/en/images/tech-store-logo.png',
    bannerUrl: '/en/images/tech-store-banner.jpg',
    status: 'active',
    isVerified: true,
    rating: 4.7,
    reviewsCount: 156,
    followersCount: 1250,
    categories: ['electronics', 'computers', 'phones'],
    tags: ['technology', 'electronics', 'gadgets'],
    ownerId: 'owner-tech-store',
    contactInfo: {
      email: 'contact@techstore.example.com',
      phone: '+1-555-0123',
      website: 'https://techstore.example.com',
    },
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'fashion-hub',
    name: 'Fashion Hub',
    description: 'Trendy fashion and lifestyle products for the modern consumer',
    logoUrl: '/en/images/fashion-hub-logo.png',
    bannerUrl: '/en/images/fashion-hub-banner.jpg',
    status: 'active',
    isVerified: true,
    rating: 4.5,
    reviewsCount: 89,
    followersCount: 890,
    categories: ['fashion', 'clothing', 'accessories'],
    tags: ['fashion', 'clothing', 'style'],
    ownerId: 'owner-fashion-hub',
    contactInfo: {
      email: 'contact@fashionhub.example.com',
      phone: '+1-555-0124',
      website: 'https://fashionhub.example.com',
    },
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'home-essentials',
    name: 'Home Essentials',
    description: 'Quality home appliances and decor for every household',
    logoUrl: '/en/images/home-essentials-logo.png',
    bannerUrl: '/en/images/home-essentials-banner.jpg',
    status: 'active',
    isVerified: false,
    rating: 4.2,
    reviewsCount: 67,
    followersCount: 450,
    categories: ['home', 'appliances', 'furniture'],
    tags: ['home', 'appliances', 'furniture'],
    ownerId: 'owner-home-essentials',
    contactInfo: {
      email: 'contact@homeessentials.example.com',
      phone: '+1-555-0125',
      website: 'https://homeessentials.example.com',
    },
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

// =============================================================================
// MOCK PRODUCTS
// =============================================================================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'product-1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    price: 299.99,
    currency: 'USD',
    originalPrice: 399.99,
    discountPercentage: 25,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbZin3lyFOHfxka8D7wsbypiu2Ke32MEw7CQ&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsCpUaRDFn9e90cY7d9PCPX6AE0-Pgb9ZTFw&s',
    ],
    category: 'Electronics',
    tags: ['headphones', 'wireless', 'noise-cancellation', 'audio'],
    rating: 4.7,
    likeCount: 45,
    shareCount: 12,
    reviewsCount: 12,
    isAvailable: true,
    isFeatured: true,
    isNew: false,
    stockQuantity: 25,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 5.99,
    playedCount: 23,
    shop: {
      id: 'tech-store',
      name: 'Tech Store',
      logoUrl: '/en/images/tech-store-logo.png',
    },
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'product-2',
    name: 'Designer T-Shirt',
    description: 'Comfortable and stylish designer t-shirt made from 100% organic cotton. Available in multiple colors and sizes.',
    price: 49.99,
    currency: 'USD',
    originalPrice: 69.99,
    discountPercentage: 29,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfLxNof9t4Pg1qknTnz09Y7vtg7EP8Wqn93w&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA24LHIi_SjuzLfsTN22stiVOWiAfrVHkHAg&s',
    ],
    category: 'Fashion',
    tags: ['clothing', 't-shirt', 'designer', 'cotton'],
    rating: 4.5,
    reviewsCount: 89,
    likeCount: 32,
    shareCount: 8,
    isAvailable: true,
    isFeatured: false,
    isNew: true,
    stockQuantity: 50,
    status: 'ACTIVE',
    isLotteryEnabled: false,
    playedCount: 0,
    shop: {
      id: 'fashion-hub',
      name: 'Fashion Hub',
      logoUrl: '/en/images/fashion-hub-logo.png',
    },
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'product-3',
    name: 'Sony WH-1000XM4',
    description: 'Industry-leading noise cancellation, 30-hour battery life, and touch controls. A favorite among audiophiles.',
    price: 49.99,
    currency: 'USD',
    originalPrice: 69.99,
    discountPercentage: 29,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbZin3lyFOHfxka8D7wsbypiu2Ke32MEw7CQ&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsCpUaRDFn9e90cY7d9PCPX6AE0-Pgb9ZTFw&s',
    ],
    category: 'Electronics',
    tags: ['headphones', 'wireless', 'noise-cancellation', 'audio'],
    rating: 4.3,
    reviewsCount: 89,
    likeCount: 67,
    shareCount: 15,
    isAvailable: true,
    isFeatured: true,
    isNew: false,
    stockQuantity: 50,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 3.99,
    playedCount: 45,
    shop: {
      id: 'tech-store',
      name: 'Tech Store',
      logoUrl: '/en/images/tech-store-logo.png',
    },
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'product-4',
    name: 'MacBook Air M4 15-inch',
    description: 'Ultra-thin laptop with M3 chip for incredible performance and battery life',
    price: 49.99,
    currency: 'USD',
    originalPrice: 69.99,
    discountPercentage: 29,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmV5HPIFJ0YVWKho76OkUYo7A-ABeI0UkfVw&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuj0Nb0CesenmpQdwu1QtwYZz4nkhstbW1uQ&s',
    ],
    category: 'Computers',
    tags: ['laptop', 'computer', 'macbook', 'air'],
    rating: 4.3,
    reviewsCount: 89,
    likeCount: 89,
    shareCount: 22,
    isAvailable: true,
    isFeatured: true,
    isNew: true,
    stockQuantity: 50,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 7.99,
    playedCount: 67,
    shop: {
      id: 'tech-store',
      name: 'Tech Store',
      logoUrl: '/en/images/tech-store-logo.png',
    },
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getMockShops = (): Shop[] => MOCK_SHOPS;

export const getMockProducts = (): Product[] => MOCK_PRODUCTS;

export const getMockShopById = (shopId: string): Shop | null => {
  return MOCK_SHOPS.find(shop => shop.id === shopId) || null;
};

export const getMockProductById = (productId: string): Product | null => {
  return MOCK_PRODUCTS.find(product => product.id === productId) || null;
};

export const getMockProductsByShop = (shopId: string): Product[] => {
  return MOCK_PRODUCTS.filter(product => product.shop?.id === shopId);
};
