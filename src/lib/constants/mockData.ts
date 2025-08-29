import type { GameCategory, LotteryGame } from '@/types';

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
        type: 'thumbnail',
        order: 1,
      },
    ],
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
    ticketPrice: 15,
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
        type: 'thumbnail',
        order: 1,
      },
    ],
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
    ticketPrice: 20,
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
        type: 'thumbnail',
        order: 1,
      },
    ],
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
      },
    ],
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
      },
    ],
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
      },
    ],
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
        url: '/en/images/macbookpro.jpg', // Using existing image as placeholder
        alt: 'Premium Gaming Headset',
        type: 'thumbnail',
        order: 1,
      },
    ],
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
