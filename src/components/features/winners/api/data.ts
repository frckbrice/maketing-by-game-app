export // Mock data fallback (enhanced with sponsor info)
const getMockWinners = () => [
  {
    id: '1',
    gameId: 'tech-lottery-2024',
    userId: 'user1',
    ticketId: 'TECH-2024-001',
    prizeId: 'tech-bundle',
    prizeAmount: 3999,
    currency: 'USD',
    announcedAt: new Date('2024-12-01').getTime(),
    claimedAt: undefined,
    isClaimed: false,
    createdAt: new Date('2024-12-01').getTime(),
    updatedAt: new Date('2024-12-01').getTime(),
    // Enhanced data for display
    name: 'NGUYEN SOPHIE',
    country: 'NGOA EKELE',
    prize: 'TECH BUNDLE',
    amount: 'iPhone 15 Pro Max + MacBook Pro',
    date: 'Juin 2025',
    image: '/en/images/winner1.png',
    game: 'Tech Lottery 2024',
    ticketNumber: 'TECH-2024-001',
    category: 'Technology',
    sponsor: {
      name: 'Apple Inc.',
      logo: '/en/images/apple-logo.png',
      website: 'https://apple.com',
      description:
        'Leading technology company known for innovative products and premium quality.',
      products: ['iPhone', 'MacBook', 'iPad', 'Apple Watch'],
      founded: 1976,
      headquarters: 'Cupertino, California',
    },
    productDetails: {
      description:
        'Premium tech bundle featuring the latest iPhone 15 Pro Max and MacBook Pro with M3 chip.',
      features: [
        'A17 Pro chip',
        'Titanium design',
        '48MP camera',
        'M3 Pro chip',
        '14-inch Liquid Retina XDR display',
      ],
      value: '$3,999',
      warranty: '1 year AppleCare+',
      delivery: 'Free worldwide shipping',
    },
  },
  // Add more mock winners as needed...
];