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

export const mocksReviews = (productId: string): Review[] => [
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
];

// =============================================================================
// MOCK SHOPS
// =============================================================================

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'tech-store',
    name: 'Tech Store',
    description:
      'Your one-stop shop for the latest technology and gadgets. From smartphones to laptops, we bring you cutting-edge technology at unbeatable prices.',
    logoUrl:
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=200&q=80',
    bannerUrl:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1920&q=80',
    status: 'active',
    isVerified: true,
    rating: 4.7,
    reviewsCount: 156,
    followersCount: 1250,
    productsCount: 47,
    categories: ['electronics', 'computers', 'phones'],
    tags: ['technology', 'electronics', 'gadgets'],
    ownerId: 'owner-tech-store',
    contactInfo: {
      email: 'contact@techstore.example.com',
      phone: '+1-555-0123',
      website: 'https://techstore.example.com',
    },
    banners: [
      {
        id: 'banner-tech-1',
        imageUrl:
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1920&q=80',
        title: 'Latest Tech Arrivals',
        subtitle: 'Up to 50% off on premium gadgets',
        ctaText: 'Shop Now',
        ctaLink: '/shops/tech-store?category=electronics',
        isActive: true,
        order: 1,
      },
      {
        id: 'banner-tech-2',
        imageUrl:
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1920&q=80',
        title: 'Gaming Setup Sale',
        subtitle: 'Build your dream gaming rig',
        ctaText: 'Explore',
        ctaLink: '/shops/tech-store?category=gaming',
        isActive: true,
        order: 2,
      },
    ],
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'fashion-hub',
    name: 'Fashion Hub',
    description:
      'Trendy fashion and lifestyle products for the modern consumer. Discover the latest trends in clothing, accessories, and streetwear.',
    logoUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSA3BXVbfzBNSk3Wewsk3G4whFvkoShTnJutQ&s',
    bannerUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
    status: 'active',
    isVerified: true,
    rating: 4.5,
    reviewsCount: 89,
    followersCount: 890,
    productsCount: 32,
    categories: ['fashion', 'clothing', 'accessories'],
    tags: ['fashion', 'clothing', 'style'],
    ownerId: 'owner-fashion-hub',
    contactInfo: {
      email: 'contact@fashionhub.example.com',
      phone: '+1-555-0124',
      website: 'https://fashionhub.example.com',
    },
    banners: [
      {
        id: 'banner-fashion-1',
        imageUrl:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
        title: 'Spring Collection 2024',
        subtitle: 'Fresh styles for the new season',
        ctaText: 'Shop Collection',
        ctaLink: '/shops/fashion-hub?collection=spring',
        isActive: true,
        order: 1,
      },
      {
        id: 'banner-fashion-2',
        imageUrl:
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80',
        title: 'Sneaker Drop',
        subtitle: 'Limited edition releases',
        ctaText: 'Get Yours',
        ctaLink: '/shops/fashion-hub?category=sneakers',
        isActive: true,
        order: 2,
      },
    ],
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'home-essentials',
    name: 'Home Essentials',
    description:
      'Quality home appliances and decor for every household. Transform your living space with our curated selection of modern essentials.',
    logoUrl:
      'data:image/jpeg;base64,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',
    bannerUrl:
      'data:image/jpeg;base64,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',
    status: 'active',
    isVerified: false,
    rating: 4.2,
    reviewsCount: 67,
    followersCount: 543,
    productsCount: 28,
    categories: ['home', 'appliances', 'decor'],
    tags: ['home', 'essentials', 'decor'],
    ownerId: 'owner-home-essentials',
    contactInfo: {
      email: 'contact@homeessentials.example.com',
      phone: '+1-555-0125',
      website: 'https://homeessentials.example.com',
    },
    banners: [
      {
        id: 'banner-home-1',
        imageUrl:
          'data:image/jpeg;base64,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',
        title: 'Home Makeover Sale',
        subtitle: 'Transform your space with 40% off',
        ctaText: 'Shop Home',
        ctaLink: '/shops/home-essentials?category=decor',
        isActive: true,
        order: 1,
      },
      {
        id: 'banner-home-2',
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkbtc28pt0lj3li81D96vIBGlQofNpA_p9Lg&s',
        title: 'Kitchen Essentials',
        subtitle: 'Upgrade your cooking experience',
        ctaText: 'Discover',
        ctaLink: '/shops/home-essentials?category=kitchen',
        isActive: true,
        order: 2,
      },
    ],
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
];

// =============================================================================
// MOCK PRODUCTS
// =============================================================================

export const MOCK_PRODUCTS: Product[] = [
  // Electronics from Tech Store
  {
    id: 'product-1',
    name: 'iPhone 15 Pro Max 256GB',
    description:
      'Latest Apple iPhone with advanced camera system and titanium design. Featuring A17 Pro chip, 48MP camera, and Action Button.',
    price: 599000,
    currency: 'XAF',
    originalPrice: 699000,
    discountPercentage: 14,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Electronics',
    tags: ['smartphone', 'apple', 'premium', 'iphone'],
    rating: 4.8,
    likeCount: 234,
    shareCount: 89,
    reviewsCount: 127,
    isAvailable: true,
    isFeatured: true,
    isNew: true,
    stockQuantity: 15,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 5000,
    playedCount: 45,
    shop: {
      id: 'tech-store',
      name: 'Tech Store',
      logoUrl:
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'product-2',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description:
      'Flagship Android phone with S Pen and advanced AI features. Premium titanium design with 200MP camera and Galaxy AI.',
    price: 549000,
    currency: 'XAF',
    originalPrice: 649000,
    discountPercentage: 15,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Electronics',
    tags: ['smartphone', 'samsung', 'android', 'galaxy'],
    rating: 4.7,
    isAvailable: true,
    isFeatured: false,
    likeCount: 123,
    shareCount: 56,
    reviewsCount: 78,
    isNew: false,
    stockQuantity: 22,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 4500,
    playedCount: 32,
    shop: {
      id: 'tech-store',
      name: 'Tech Store',
      logoUrl:
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'product-3',
    name: 'MacBook Air M3 15-inch',
    description:
      'Ultra-thin laptop with M3 chip for incredible performance and battery life. Perfect for creative professionals and students.',
    price: 899000,
    currency: 'XAF',
    originalPrice: 999000,
    discountPercentage: 10,
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Electronics',
    tags: ['laptop', 'apple', 'macbook', 'computer'],
    rating: 4.9,
    likeCount: 178,
    shareCount: 67,
    reviewsCount: 89,
    isAvailable: true,
    isFeatured: true,
    isNew: false,
    stockQuantity: 8,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 8000,
    playedCount: 23,
    shop: {
      id: 'tech-store',
      name: 'Tech Store',
      logoUrl:
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },

  // Fashion from Fashion Hub
  {
    id: 'product-4',
    name: 'Nike Air Jordan 1 Retro High',
    description:
      'Classic basketball sneakers with premium leather construction. Iconic design that never goes out of style.',
    price: 89000,
    currency: 'XAF',
    originalPrice: 105000,
    discountPercentage: 15,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Fashion',
    tags: ['sneakers', 'nike', 'basketball', 'shoes'],
    rating: 4.9,
    likeCount: 445,
    shareCount: 123,
    reviewsCount: 203,
    isAvailable: true,
    isFeatured: false,
    isNew: true,
    stockQuantity: 35,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 2500,
    playedCount: 67,
    shop: {
      id: 'fashion-hub',
      name: 'Fashion Hub',
      logoUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'product-5',
    name: 'Designer Summer Dress',
    description:
      'Elegant floral print summer dress made from premium cotton. Perfect for special occasions and casual outings.',
    price: 45000,
    currency: 'XAF',
    originalPrice: 55000,
    discountPercentage: 18,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Fashion',
    tags: ['dress', 'summer', 'floral', 'cotton'],
    rating: 4.6,
    likeCount: 89,
    shareCount: 34,
    reviewsCount: 67,
    isAvailable: true,
    isFeatured: true,
    isNew: false,
    stockQuantity: 18,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 1200,
    playedCount: 28,
    shop: {
      id: 'fashion-hub',
      name: 'Fashion Hub',
      logoUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },

  // Home Essentials
  {
    id: 'product-6',
    name: 'Modern Coffee Maker',
    description:
      'Premium stainless steel coffee maker with programmable timer and auto-shutoff. Brews perfect coffee every time.',
    price: 75000,
    currency: 'XAF',
    originalPrice: 95000,
    discountPercentage: 21,
    images: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Home & Kitchen',
    tags: ['coffee', 'kitchen', 'appliance', 'stainless-steel'],
    rating: 4.5,
    likeCount: 67,
    shareCount: 23,
    reviewsCount: 45,
    isAvailable: true,
    isFeatured: false,
    isNew: true,
    stockQuantity: 12,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 2000,
    playedCount: 15,
    shop: {
      id: 'home-essentials',
      name: 'Home Essentials',
      logoUrl:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'product-7',
    name: 'Luxury Throw Pillow Set',
    description:
      'Set of 4 premium velvet throw pillows with gold accents. Perfect for adding elegance to any living space.',
    price: 35000,
    currency: 'XAF',
    originalPrice: 42000,
    discountPercentage: 17,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    ],
    category: 'Home & Decor',
    tags: ['pillows', 'velvet', 'luxury', 'home-decor'],
    rating: 4.7,
    likeCount: 123,
    shareCount: 56,
    reviewsCount: 78,
    isAvailable: true,
    isFeatured: true,
    isNew: false,
    stockQuantity: 25,
    status: 'ACTIVE',
    isLotteryEnabled: true,
    lotteryPrice: 950,
    playedCount: 42,
    shop: {
      id: 'home-essentials',
      name: 'Home Essentials',
      logoUrl:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80',
    },
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'product-3',
    name: 'Sony WH-1000XM4',
    description:
      'Industry-leading noise cancellation, 30-hour battery life, and touch controls. A favorite among audiophiles.',
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
    description:
      'Ultra-thin laptop with M3 chip for incredible performance and battery life',
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
