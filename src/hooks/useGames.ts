import { GameCategory, GameType, LotteryGame } from '@/types';
import { useEffect, useState } from 'react';

const games = [
  {
    id: '1',
    title: 'Mega Jackpot',
    description: 'The biggest lottery with life-changing prizes',
    type: 'LOTTERY' as GameType,
    categoryId: 'jackpot',
    category: {
      id: 'jackpot',
      name: 'Jackpot',
      description: 'High-value lottery games',
      icon: '🎰',
      color: '#FF5722',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as GameCategory,
    ticketPrice: 5,
    currency: 'USD',
    maxParticipants: 2000,
    currentParticipants: 1250,
    totalPrizePool: 1000000,
    prizes: [],
    rules: [],
    images: [],
    startDate: Date.now(),
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    drawDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Daily Draw',
    description: 'Daily lottery with instant wins',
    type: 'LOTTERY' as GameType,
    categoryId: 'daily',
    category: {
      id: 'daily',
      name: 'Daily',
      description: 'Daily lottery games',
      icon: '📅',
      color: '#4CAF50',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as GameCategory,
    ticketPrice: 2,
    currency: 'USD',
    maxParticipants: 1000,
    currentParticipants: 500,
    totalPrizePool: 10000,
    prizes: [],
    rules: [],
    images: [],
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    drawDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: 'Weekend Special',
    description: 'Weekend lottery with bonus prizes',
    type: 'LOTTERY' as GameType,
    categoryId: 'weekly',
    category: {
      id: 'weekly',
      name: 'Weekly',
      description: 'Weekly lottery games',
      icon: '📆',
      color: '#2196F3',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as GameCategory,
    ticketPrice: 3,
    currency: 'USD',
    maxParticipants: 1500,
    currentParticipants: 800,
    totalPrizePool: 50000,
    prizes: [],
    rules: [],
    images: [],
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
    drawDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
    isActive: true,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function useGames() {
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Replace with actual API call
    const fetchGames = async () => {
      try {
        // const response = await api.getGames();
        // setGames(response.data);
        setGames(games); // temporary
      } catch (err) {
        setError('Failed to fetch games');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return { games, loading, error };
}
