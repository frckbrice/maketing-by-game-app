'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { useAuth } from '@/lib/contexts/AuthContext';
// Removed - now imported from API queries above
import {
  Building2,
  Clock,
  Filter,
  Gamepad2,
  Gift,
  Loader2,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Import API hooks
import { GAMES_PER_PAGE } from '../api/data';
import { useJoinGame, useShareGame } from '../api/mutations';
import { useCategories, useFeaturedGames, useGames, useGameStats, useVendorApplication } from '../api/queries';

// Import components directly for now - can optimize later
import { AdBanner } from './AdBanner';
import { CategoryTabs } from './CategoryTabs';
import { GameCard } from './game-card';

// Performance optimized components
const SearchInput = ({ searchTerm, onSearch }: { searchTerm: string; onSearch: (term: string) => void }) => {
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleSearch = useCallback((term: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => onSearch(term), 300);
  }, [onSearch]);

  return (
    <div className='relative max-w-lg mx-auto'>
      <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10' />
      <input
        type='text'
        placeholder='Search amazing prizes...'
        defaultValue={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className='w-full pl-12 pr-4 py-4 border-2 border-transparent rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-lg'
      />
    </div>
  );
};

const StatsCard = ({ icon, number, label, trend }: {
  icon: React.ReactNode;
  number: string;
  label: string;
  trend?: string;
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{number}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
      </div>
      {trend && (
        <div className="text-right">
          <div className="text-sm font-medium text-green-500">{trend}</div>
          <div className="text-xs text-gray-500">vs last month</div>
        </div>
      )}
    </div>
  </div>
);

export function GamesPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // API hooks with caching strategy
  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  const {
    data: gamesResponse,
    isLoading: gamesLoading,
    error: gamesError,
    refetch: refetchGames
  } = useGames({
    search: searchTerm,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: GAMES_PER_PAGE,
    page: 1
  });

  const { data: featuredGames = [] } = useFeaturedGames();
  const { data: stats } = useGameStats();
  const { data: vendorApplication } = useVendorApplication(user?.id || '');

  // Mutations
  const joinGameMutation = useJoinGame();
  const shareGameMutation = useShareGame();

  // Derived data with memoization
  const games = useMemo(() => gamesResponse?.data || [], [gamesResponse]);
  const loading = categoriesLoading || gamesLoading;

  // Process categories to include 'all' option
  const allCategories = useMemo(() => {
    const allCategory = {
      id: 'all',
      name: t('games.categories.all', 'All Games'),
      description: 'Browse all available games',
      icon: '🎯',
      color: '#6366f1',
      isActive: true,
      sortOrder: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [allCategory, ...categoriesData.filter(category => category.id !== 'all')];
  }, [categoriesData, t]);

  // Filter games with performance optimization
  const filteredGames = useMemo(() => {
    let filtered = games;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower) ||
        game.category?.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.categoryId === selectedCategory);
    }

    return filtered;
  }, [games, searchTerm, selectedCategory]);

  // Event handlers
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm(''); // Clear search when changing category
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleBecomeVendor = useCallback(async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (vendorApplication?.status === 'pending') {
      toast.info(t('vendor.application.alreadyPending', 'Your vendor application is already pending review.'));
      return;
    } else if (vendorApplication?.status === 'approved') {
      router.push('/vendor-dashboard');
      return;
    }

    router.push('/vendor-application');
  }, [user, vendorApplication, router, t]);

  // Error handling
  if (categoriesError || gamesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <DesktopHeader
          isDark={theme === 'dark'}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <MobileNavigation
          isDark={theme === 'dark'}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />

        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('common.error', 'Something went wrong')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('games.errorLoading', 'Failed to load games. Please try again.')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {t('common.retry', 'Try Again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
      <DesktopHeader
        isDark={theme === 'dark'}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <MobileNavigation
        isDark={theme === 'dark'}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Hero Section */}
      <div className='relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden'>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className='relative max-w-7xl mx-auto'>
          {/* Hero Content */}
          <div className='text-center mb-12'>
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6'>
              <span className='bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent'>
                Win Amazing Prizes
              </span>
              <br />
              <span className='text-gray-700 dark:text-gray-300 text-3xl sm:text-4xl lg:text-5xl'>
                Every Single Day
              </span>
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed'>
              Join thousands of winners in our exciting lottery games. From the latest tech gadgets to designer fashion - your dream prize is just one ticket away!
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatsCard
                icon={<Trophy className="w-6 h-6" />}
                number={stats.totalGames.toString()}
                label="Active Games"
                trend="+12%"
              />
              <StatsCard
                icon={<Users className="w-6 h-6" />}
                number={stats.totalParticipants.toLocaleString()}
                label="Happy Players"
                trend="+28%"
              />
              <StatsCard
                icon={<Gift className="w-6 h-6" />}
                number={`$${(stats.totalPrizeValue / 1000).toFixed(0)}K`}
                label="Prize Value"
                trend="+45%"
              />
              <StatsCard
                icon={<Clock className="w-6 h-6" />}
                number="24/7"
                label="New Draws"
                trend="Live"
              />
            </div>
          )}

          {/* Search */}
          <div className='mb-12'>
            <SearchInput searchTerm={searchTerm} onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className='pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
        {/* Category Tabs */}
        <div className='mb-12'>
          <CategoryTabs
            categories={allCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategorySelect}
            gamesCounts={{}}
          />
        </div>

        {/* Vendor Application CTA */}
        {user && user.role === 'USER' && (
          <div className='mb-16'>
            <div className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center relative overflow-hidden'>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className='flex items-center justify-center mb-6'>
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Building2 className='w-8 h-8' />
                  </div>
                </div>
                <h2 className='text-3xl font-bold mb-4'>
                  Create Your Own Lottery Games
                </h2>
                <p className='text-purple-100 mb-8 max-w-2xl mx-auto text-lg'>
                  Join our platform as a vendor and start earning by creating exciting lottery games for thousands of players worldwide!
                </p>
                <button
                  onClick={handleBecomeVendor}
                  disabled={loading}
                  className='px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:transform-none'
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      Loading...
                    </div>
                  ) : (
                    'Become a Vendor Today'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Games Section */}
        {featuredGames.length > 0 && (
          <div className='mb-16'>
            <div className='flex items-center justify-between mb-8'>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white mr-4">
                  <Star className='w-6 h-6' />
                </div>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>
                    Featured Games
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hot picks with the highest participation
                  </p>
                </div>
              </div>
              <div className='flex items-center text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-full'>
                <TrendingUp className='w-4 h-4 mr-2' />
                <span className='text-sm font-medium'>Trending</span>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {featuredGames.slice(0, 3).map(game => (
                <div key={game.id} className="group">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Games Grid */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-8'>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white mr-4">
                <Gamepad2 className='w-6 h-6' />
              </div>
              <div>
                <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {selectedCategory === 'all'
                    ? 'All Games'
                    : allCategories.find(cat => cat.id === selectedCategory)?.name || 'Games'
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredGames.length} amazing prizes waiting for you
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-full'>
                <Filter className='w-4 h-4 mr-2' />
                <span>Filter</span>
              </div>
              <span className='px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full'>
                {filteredGames.length} Results
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='animate-pulse'>
                  <div className='bg-white/50 dark:bg-gray-800/50 rounded-2xl h-80 backdrop-blur-sm'></div>
                </div>
              ))}
            </div>
          )}

          {/* Games Grid */}
          {!loading && filteredGames.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
              {filteredGames.map(game => (
                <div key={game.id} className="group">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredGames.length === 0 && (
            <div className='text-center py-20'>
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Gamepad2 className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                {searchTerm ? 'No games match your search' : 'No games found'}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8'>
                {searchTerm
                  ? 'Try adjusting your search terms or browse different categories to find amazing prizes.'
                  : 'No games are available in this category at the moment. Check back soon for new exciting prizes!'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all'
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Ad Banner */}
        <div className='mt-20'>
          <AdBanner
            type="horizontal"
            title="Join Our VIP Club"
            description="Get exclusive access to premium games and special bonuses!"
            ctaText="Join VIP"
            ctaUrl="/vip"
            company={{ name: 'Lottery App' }}
            className='bg-gradient-to-r from-purple-600 via-pink-600 to-red-500'
          />
        </div>
      </div>
    </div>
  );
}