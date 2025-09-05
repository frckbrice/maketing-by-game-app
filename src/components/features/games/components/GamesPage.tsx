'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Building2,
  Clock,
  Gamepad2,
  Gift,
  Loader2,
  Search,
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
import { useJoinGame, useShareGame } from '../api/mutations';
import { useCategories, useGames, useGameStats } from '../api/queries';
import { AdBanner } from './AdBanner';
import { CategoryTabs } from './CategoryTabs';
import { FeaturedProducts } from './FeaturedProducts';
import { GameCard } from './game-card';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import { TopShops } from './TopShops';
import { VendorBanner } from './VendorBanner';

// Import shop API hooks
import {
  useBuyNow,
  useFollowShop,
  useLikeProduct,
  usePlayGame,
  useShareProduct,
  useTrackBannerClick,
} from '@/components/features/shops/api/mutations';
import {
  useFeaturedProducts,
  usePersonalizedProducts,
  useTopShops,
  useVendorBanners,
} from '@/components/features/shops/api/queries';
import { GameCategory, LotteryGame } from '../api/types';

// Performance optimized components
const SearchInput = ({
  searchTerm,
  onSearch,
}: {
  searchTerm: string;
  onSearch: (term: string) => void;
}) => {
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const { t } = useTranslation();

  const handleInputChange = useCallback(
    (value: string) => {
      onSearch(value);

      // Debounced search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        // Additional search logic could go here
      }, 300);
    },
    [onSearch]
  );

  return (
    <div className='relative max-w-md mx-auto'>
      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
        <Search className='h-5 w-5 text-gray-400' />
      </div>
      <input
        type='text'
        value={searchTerm}
        onChange={e => handleInputChange(e.target.value)}
        placeholder={t('games.searchPlaceholder')}
        className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm'
      />
    </div>
  );
};

const StatsCard = ({
  icon,
  number,
  label,
  trend,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
  trend: string;
}) => (
  <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-lg transition-all duration-300'>
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center space-x-3'>
        <div className='p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white group-hover:scale-110 transition-transform duration-300'>
          {icon}
        </div>
        <div>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>
            {number}
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{label}</p>
        </div>
      </div>
      <div className='flex items-center text-green-500 text-sm font-medium'>
        <TrendingUp className='w-4 h-4 mr-1' />
        {trend}
      </div>
    </div>
  </div>
);

export function GamesPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Shop and product queries
  const { data: topShops = [], isLoading: shopsLoading } = useTopShops(6);
  const { data: featuredProducts = [], isLoading: featuredLoading } =
    useFeaturedProducts(8);
  const { data: personalizedProducts = [], isLoading: personalizedLoading } =
    usePersonalizedProducts(user?.id || '', 8);
  const { data: vendorBanners = [], isLoading: bannersLoading } =
    useVendorBanners(5);

  // Mutations
  const followShopMutation = useFollowShop();
  const likeProductMutation = useLikeProduct();
  const shareProductMutation = useShareProduct();
  const playGameMutation = usePlayGame();
  const buyNowMutation = useBuyNow();
  const trackBannerClickMutation = useTrackBannerClick();

  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // API hooks with caching strategy
  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
  } = useGames({
    category: selectedCategory,
    search: searchTerm,
    limit: 12,
  });

  const { data: stats, isLoading: statsLoading } = useGameStats();

  const { mutate: joinGame } = useJoinGame();
  const { mutate: shareGame } = useShareGame();

  // Event handlers
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleBecomeVendor = useCallback(() => {
    if (!user) {
      toast.error(t('auth.loginRequired'));
      router.push('/auth/login');
      return;
    }
    router.push('/vendor-application');
  }, [user, router, t]);

  // Computed values
  const allCategories = useMemo(() => {
    // Ensure we don't have duplicate 'all' categories
    const existingCategories = categoriesData.filter(cat => cat.id !== 'all');
    return [
      { id: 'all', name: t('games.categories.all'), icon: '🎮' },
      ...existingCategories,
    ];
  }, [categoriesData, t]);

  const filteredGames = useMemo(() => {
    if (!gamesData?.data) return [];

    let filtered = gamesData.data;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (game: LotteryGame) => game.categoryId === selectedCategory
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (game: LotteryGame) =>
          game.title.toLowerCase().includes(search) ||
          game.description.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [gamesData?.data, selectedCategory, searchTerm]);

  const loading = gamesLoading || categoriesLoading;

  if (categoriesError || gamesError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Error Loading Games
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            {categoriesError?.message ||
              gamesError?.message ||
              'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
      {/* Header */}
      <DesktopHeader
        isDark={theme === 'dark'}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Mobile Navigation */}
      <MobileNavigation
        isDark={theme === 'dark'}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Content */}
      <div className='pt-20 pb-24 md:pb-8'>
        {/* Stats Cards Section - Moved to top space */}
        {stats && (
          <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <StatsCard
                icon={<Trophy className='w-6 h-6' />}
                number={stats.totalGames.toString()}
                label={t('games.stats.activeGames')}
                trend='+12%'
              />
              <StatsCard
                icon={<Users className='w-6 h-6' />}
                number={stats.totalParticipants.toLocaleString()}
                label={t('games.stats.happyPlayers')}
                trend='+28%'
              />
              <StatsCard
                icon={<Gift className='w-6 h-6' />}
                number={`$${(stats.totalPrizeValue / 1000).toFixed(0)}K`}
                label={t('games.stats.prizeValue')}
                trend='+45%'
              />
              <StatsCard
                icon={<Clock className='w-6 h-6' />}
                number={stats.activeGames.toString()}
                label={t('games.stats.liveNow')}
                trend='+8%'
              />
            </div>
          </div>
        )}

        {/* Vendor Banner */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-12'>
          <VendorBanner
            banners={vendorBanners}
            onBannerClick={bannerId => {
              trackBannerClickMutation.mutate({ bannerId });
            }}
          />
        </div>

        {/* Search Bar - Moved up */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-8'>
          <SearchInput searchTerm={searchTerm} onSearch={handleSearchChange} />
        </div>

        {/* Category Tabs - Moved to hero section position */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-12'>
          <CategoryTabs
            categories={allCategories as GameCategory[]}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategorySelect}
            gamesCounts={{}}
          />
        </div>

        {/* Vendor Application CTA */}
        {user && user.role === 'USER' && (
          <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-16'>
            <div className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center relative overflow-hidden'>
              <div className='absolute inset-0 bg-black/20' />
              <div className='relative z-10'>
                <div className='flex items-center justify-center mb-6'>
                  <div className='p-4 bg-white/20 backdrop-blur-sm rounded-2xl'>
                    <Building2 className='w-8 h-8' />
                  </div>
                </div>
                <h2 className='text-3xl font-bold mb-4'>
                  {t('games.vendor.createYourOwn')}
                </h2>
                <p className='text-purple-100 mb-8 max-w-2xl mx-auto text-lg'>
                  {t('games.vendor.joinPlatform')}
                </p>
                <button
                  onClick={handleBecomeVendor}
                  disabled={false} // Removed applicationLoading
                  className='px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-70'
                >
                  {false ? ( // Removed applicationLoading
                    <div className='flex items-center'>
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      {t('common.loading')}
                    </div>
                  ) : (
                    t('games.vendor.becomeVendorToday')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Games Grid Section */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-12'>
          {/* Loading State */}
          {loading && (
            <div className='flex justify-center items-center py-20'>
              <div className='flex flex-col items-center'>
                <Loader2 className='w-12 h-12 text-orange-500 animate-spin mb-4' />
                <p className='text-gray-600 dark:text-gray-400'>
                  {t('common.loading')}
                </p>
              </div>
            </div>
          )}

          {/* Games Grid */}
          {!loading && filteredGames.length > 0 && (
            <div className='mb-8'>
              <div className='flex items-center mb-8'>
                <div className='p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white mr-4'>
                  <Users className='w-6 h-6' />
                </div>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>
                    {t('games.yourGames')}
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400'>
                    {t('games.yourGamesDescription')}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12'>
                {filteredGames.map((game: LotteryGame) => (
                  <div key={game.id} className='group'>
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredGames.length === 0 && (
            <div className='text-center py-20 mb-12'>
              <div className='w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center'>
                <Gamepad2 className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                {searchTerm
                  ? t('games.empty.noGamesMatch')
                  : t('games.empty.noGamesFound')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8'>
                {searchTerm
                  ? t('games.empty.tryAdjusting')
                  : t('games.empty.noGamesAvailable')}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all'
                >
                  {t('games.empty.clearSearch')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Top Shops */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-12'>
          <TopShops shops={topShops} loading={shopsLoading} />
        </div>

        {/* Featured Products */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-12'>
          <FeaturedProducts
            products={featuredProducts}
            onLikeProduct={async productId => {
              likeProductMutation.mutate({ productId, action: 'like' });
            }}
            onFollowShop={async shopId => {
              followShopMutation.mutate({ shopId, action: 'follow' });
            }}
            onPlayGame={productId => {
              playGameMutation.mutate({ productId });
            }}
            onBuyNow={productId => {
              buyNowMutation.mutate({ productId });
            }}
            onShare={async productId => {
              shareProductMutation.mutate({ productId, method: 'native' });
            }}
            likedProducts={new Set()}
            followedShops={new Set()}
            loading={featuredLoading}
          />
        </div>

        {/* Personalized Recommendations */}
        {user && personalizedProducts.length > 0 && (
          <div className='max-w-7xl mx-auto px-6 lg:px-8 mb-12'>
            <PersonalizedRecommendations
              products={personalizedProducts}
              onLikeProduct={async productId => {
                likeProductMutation.mutate({ productId, action: 'like' });
              }}
              onFollowShop={async shopId => {
                followShopMutation.mutate({ shopId, action: 'follow' });
              }}
              onPlayGame={productId => {
                playGameMutation.mutate({ productId });
              }}
              onBuyNow={productId => {
                buyNowMutation.mutate({ productId });
              }}
              onShare={async productId => {
                shareProductMutation.mutate({ productId, method: 'native' });
              }}
              likedProducts={new Set()}
              followedShops={new Set()}
              loading={personalizedLoading}
            />
          </div>
        )}

        {/* Bottom Ad Banner */}
        <div className='max-w-7xl mx-auto px-6 lg:px-8 mt-20'>
          <AdBanner
            type='horizontal'
            title={t('games.vip.joinVipClub')}
            description={t('games.vip.exclusiveAccess')}
            ctaText={t('games.vip.joinVip')}
            ctaUrl='/vip'
            company={{ name: 'Lottery App' }}
            className='bg-gradient-to-r from-purple-600 via-pink-600 to-red-500'
          />
        </div>
      </div>
    </div>
  );
}
