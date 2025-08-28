'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { gameService } from '@/lib/api/gameService';
import { GameCategory, LotteryGame } from '@/types';
import { Filter, Gamepad2, Search, Star, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdBanner } from './AdBanner';
import { CategoryTabs } from './CategoryTabs';
import { GameCard } from './game-card';

export function GamesPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredGames, setFeaturedGames] = useState<LotteryGame[]>([]);

  // Fetch data from APIs with fallback to mock data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, gamesData, featuredData] = await Promise.all([
        gameService.getCategories(),
        gameService.getGames(selectedCategory),
        gameService.getFeaturedGames(6),
      ]);

      setCategories([
        {
          id: 'all',
          name: t('games.categories.all'),
          description: 'All categories',
          icon: '🎯',
          color: '#9E9E9E',
          isActive: true,
          sortOrder: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...categoriesData,
      ]);
      setGames(gamesData);
      setFeaturedGames(featuredData);
    } catch (error) {
      console.error('Error fetching games data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, t]);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data on mount and category change
  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const filteredGames = games.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
        {/* Header Section */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg'>
            <Gamepad2 className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
            Play & Win Amazing Prizes
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            Choose from exclusive daily products and join thousands of winners
          </p>
        </div>

        {/* Featured Games Section */}
        {featuredGames.length > 0 && (
          <div className='mb-12'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Star className='w-6 h-6 text-yellow-500 mr-2' />
                Featured Games
              </h2>
              <div className='flex items-center text-orange-500'>
                <TrendingUp className='w-4 h-4 mr-1' />
                <span className='text-sm font-medium'>Hot Picks</span>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredGames.slice(0, 3).map(game => (
                <div key={game.id} className='relative'>
                  <GameCard game={game} />
                  <div className='absolute -top-2 -right-2'>
                    <div className='bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg'>
                      HOT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Navigation */}
        <div className='mb-12'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white text-center mb-2'>
              Choose Your Category
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-center'>
              Find the perfect product to play for
            </p>
          </div>

          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            gamesCounts={categories.reduce(
              (acc, cat) => {
                acc[cat.id] =
                  cat.id === 'all'
                    ? games.length
                    : games.filter(g => g.categoryId === cat.id).length;
                return acc;
              },
              {} as Record<string, number>
            )}
          />
        </div>

        {/* Search Section */}
        <div className='mb-8'>
          <div className='max-w-2xl mx-auto relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search for products, brands, or categories...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm'
            />
          </div>
        </div>

        {/* Sponsored Ad Banner */}
        <div className='mb-8'>
          <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center'>
            <h3 className='text-lg font-semibold mb-2'>🎁 Special Promotion</h3>
            <p className='text-sm opacity-90'>
              Get 20% more chances with every ticket purchase this week!
            </p>
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className='text-center py-12'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4'></div>
            <p className='text-gray-600 dark:text-gray-300'>
              Loading amazing games...
            </p>
          </div>
        ) : filteredGames.length > 0 ? (
          <>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {selectedCategory === 'all'
                  ? 'All Games'
                  : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className='flex items-center space-x-2'>
                <Filter className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-500'>
                  {filteredGames.length} games found
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredGames.map((game, index) => {
                const isSponsored = Math.random() > 0.7; // 30% chance of being sponsored
                const companyInfo = isSponsored
                  ? {
                      name: ['Apple', 'Nike', 'Samsung', 'Amazon', 'Google'][
                        Math.floor(Math.random() * 5)
                      ],
                      logo: '',
                      website: 'https://example.com',
                    }
                  : undefined;

                return (
                  <div key={game.id}>
                    <GameCard
                      game={game}
                      isSponsored={isSponsored}
                      companyInfo={companyInfo}
                    />

                    {/* Insert ad every 6 games */}
                    {index > 0 && (index + 1) % 6 === 0 && (
                      <div className='md:col-span-2 lg:col-span-3 mt-6'>
                        <AdBanner
                          type='horizontal'
                          title='Get 50% Off Premium Sneakers'
                          description='Limited time offer on all premium sneakers. Free shipping worldwide!'
                          ctaText='Shop Now'
                          ctaUrl='https://example.com/sneakers'
                          company={{
                            name: 'SneakerWorld',
                            logo: '',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className='text-center py-16'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center'>
              <Gamepad2 className='w-12 h-12 text-gray-400 dark:text-gray-500' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              No games found
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              Try adjusting your search or browse different categories
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors'
            >
              Browse All Games
            </button>
          </div>
        )}

        {/* Bottom Ad Section */}
        <div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white'>
            <h4 className='font-semibold mb-2'>🏆 Weekly Winners</h4>
            <p className='text-sm opacity-90'>
              Join 50,000+ happy winners who found their dream products
            </p>
          </div>
          <div className='bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white'>
            <h4 className='font-semibold mb-2'>⚡ Quick Play</h4>
            <p className='text-sm opacity-90'>
              Instant tickets, instant chances - play and win in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
