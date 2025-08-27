'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { GameCategory, GameType, LotteryGame } from '@/types';
import { Gamepad2, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameCard } from './game-card';

export function GamesPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - replace with actual API call
  const [games] = useState<LotteryGame[]>([
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
  ]);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const categories = [
    { id: 'all', name: t('games.categories.all') },
    { id: 'jackpot', name: t('games.categories.jackpot') },
    { id: 'daily', name: t('games.categories.daily') },
    { id: 'weekly', name: t('games.categories.weekly') },
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || game.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Desktop Header */}
      <DesktopHeader
        isDark={isDark}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />

      {/* Mobile Navigation */}
      <MobileNavigation
        isDark={isDark}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
            <Gamepad2 className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            {t('games.title')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('games.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className='mb-8 space-y-4'>
          {/* Search Bar */}
          <div className='relative max-w-md mx-auto'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
            <input
              type='text'
              placeholder={t('games.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
            />
          </div>

          {/* Category Filters */}
          <div className='flex flex-wrap justify-center gap-2'>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <Gamepad2 className='w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              {t('games.noGamesFound')}
            </h3>
            <p className='text-gray-600 dark:text-gray-300'>
              {t('games.tryDifferentSearch')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
