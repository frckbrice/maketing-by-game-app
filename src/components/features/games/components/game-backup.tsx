'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCategories, useGames, useVendorApplication } from '@/hooks/useApi';
import { GameCategory, LotteryGame } from '@/types';
import {
  Building2,
  Filter,
  Gamepad2,
  Loader2,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AdBanner } from './AdBanner';
import { CategoryTabs } from './CategoryTabs';
import { GameCard } from './game-card';

export function GamesPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Performance constants
  const GAMES_PER_PAGE = 12;

  // TanStack Query hooks for real data
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: gamesResponse, isLoading: gamesLoading } = useGames({
    search: searchTerm,
    limit: GAMES_PER_PAGE,
    page: 1
  });
  const { data: vendorApplication } = useVendorApplication(user?.id || '');

  // Extract games data from response
  const games = gamesResponse?.data || [];
  const loading = categoriesLoading || gamesLoading;
  
  // Derive featured games from the games data
  const featuredGames = useMemo(() => {
    return games.filter(game => 
      game.status === 'active' && 
      (game.featured === true || game.participants >= (game.maxParticipants * 0.7))
    ).slice(0, 6); // Limit to 6 featured games
  }, [games]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs for performance
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastGameRef = useRef<HTMLDivElement | null>(null);

  // Optimized data fetching with caching and pagination
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();

      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        // Check categories cache
        if (categoriesCache && now - categoriesCache.timestamp < CACHE_TIME) {
          setCategories(categoriesCache.data);
        }

        // Check featured games cache
        if (featuredCache && now - featuredCache.timestamp < CACHE_TIME) {
          setFeaturedGames(featuredCache.data);
        }

        // Check games cache for current category
        const gamesCacheKey = `${selectedCategory}_${currentPage}`;
        const cachedGames = gamesCache.get(gamesCacheKey);
        if (cachedGames && now - cachedGames.timestamp < CACHE_TIME) {
          setGames(cachedGames.data);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch data in parallel with background refresh for stale data
        const fetchPromises: Promise<{ type: string; data: any }>[] = [];

        // Always fetch fresh data for current request
        if (selectedCategory === 'all') {
          fetchPromises.push(
            gameService
              .getGames()
              .then((data: LotteryGame[]) => ({ type: 'games', data }))
          );
        } else {
          fetchPromises.push(
            gameService
              .getGames(selectedCategory)
              .then((data: LotteryGame[]) => ({ type: 'games', data }))
          );
        }

        // Fetch categories if not cached or stale
        if (!categoriesCache || now - categoriesCache.timestamp > STALE_TIME) {
          fetchPromises.push(
            gameService
              .getCategories()
              .then((data: GameCategory[]) => ({ type: 'categories', data }))
          );
        }

        // Fetch featured games if not cached or stale
        if (!featuredCache || now - featuredCache.timestamp > STALE_TIME) {
          fetchPromises.push(
            gameService
              .getFeaturedGames(6)
              .then((data: LotteryGame[]) => ({ type: 'featured', data }))
          );
        }

        const results = await Promise.all(fetchPromises);

        // Process results
        results.forEach(result => {
          switch (result.type) {
            case 'games': {
              let gamesData = result.data as LotteryGame[];

              // Ensure all games have categories and required properties
              gamesData = gamesData.map(game => {
                // Ensure game has all required properties
                const safeGame = {
                  ...game,
                  currentParticipants: game.currentParticipants || 0,
                  maxParticipants: game.maxParticipants || 100,
                  createdAt: game.createdAt || Date.now(),
                  endDate: game.endDate || Date.now() + 24 * 60 * 60 * 1000,
                };

                if (!safeGame.category) {
                  // Find category by categoryId
                  const category = categories.find(
                    cat => cat.id === safeGame.categoryId
                  );
                  if (category) {
                    return { ...safeGame, category };
                  } else {
                    // Fallback to default category
                    return {
                      ...safeGame,
                      category: {
                        id: 'general',
                        name: 'General',
                        description: 'General category',
                        icon: '🎁',
                        color: '#9E9E9E',
                        isActive: true,
                        sortOrder: 999,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      },
                    };
                  }
                }
                return safeGame;
              });

              const paginatedGames = gamesData.slice(
                0,
                currentPage * GAMES_PER_PAGE
              );
              setGames(paginatedGames);
              setHasMore(gamesData.length > paginatedGames.length);

              // Update cache
              const cacheKey = `${selectedCategory}_${currentPage}`;
              setGamesCache(
                prev =>
                  new Map(
                    prev.set(cacheKey, { data: paginatedGames, timestamp: now })
                  )
              );
              break;
            }

            case 'categories': {
              const allCategories = [
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
                ...(result.data as GameCategory[]),
              ];
              setCategories(allCategories);
              setCategoriesCache({ data: allCategories, timestamp: now });
              break;
            }

            case 'featured': {
              setFeaturedGames(result.data as LotteryGame[]);
              setFeaturedCache({
                data: result.data as LotteryGame[],
                timestamp: now,
              });
              break;
            }
          }
        });
      } catch (error) {
        console.error('Error fetching games data:', error);
        setError('Failed to load games. Please try again.');

        // Fallback to cached data if available
        const gamesCacheKey = `${selectedCategory}_${currentPage}`;
        const cachedGames = gamesCache.get(gamesCacheKey);
        if (cachedGames) {
          setGames(cachedGames.data);
        } else {
          // Last resort: use mock data for development
          if (process.env.NODE_ENV === 'development') {
            console.warn('Using mock data as fallback');
            const { getMockGamesWithCategories } = await import(
              '@/lib/constants'
            );
            const mockGames = getMockGamesWithCategories(
              selectedCategory === 'all' ? undefined : selectedCategory
            );
            setGames(mockGames.slice(0, currentPage * GAMES_PER_PAGE));
            setHasMore(mockGames.length > currentPage * GAMES_PER_PAGE);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [
      selectedCategory,
      currentPage,
      categoriesCache,
      featuredCache,
      gamesCache,
      t,
    ]
  );

  // Optimized search with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search to avoid excessive API calls
      searchTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1); // Reset to first page on search
        fetchData(true); // Force refresh for search
      }, 300);
    },
    [fetchData]
  );

  // Load more games (pagination)
  const loadMoreGames = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (lastGameRef.current && hasMore && !loadingMore) {
      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            loadMoreGames();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(lastGameRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMoreGames]);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data on mount and category change
  useEffect(() => {
    if (mounted) {
      setCurrentPage(1); // Reset page when category changes
      fetchData();
    }
  }, [mounted, selectedCategory, fetchData]);

  // Check vendor application status when user is logged in
  useEffect(() => {
    if (mounted && user && user.role === 'USER') {
      const checkVendorApplication = async () => {
        try {
          const app = await (firestoreService as any).getVendorApplication(
            user.id
          );
          setVendorApplication(app);
        } catch (error) {
          console.error('Error checking vendor application:', error);
        }
      };

      checkVendorApplication();
    }
  }, [mounted, user]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const isDark = theme === 'dark';

  // Optimized filtered games with memoization
  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return games;

    const searchLower = searchTerm.toLowerCase();
    return games.filter(game => {
      const matchesSearch =
        game.title.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower) ||
        (game.category &&
          typeof game.category === 'object' &&
          game.category.name &&
          game.category.name.toLowerCase().includes(searchLower));
      return matchesSearch;
    });
  }, [games, searchTerm]);

  if (!mounted) {
    return null;
  }

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
            {t('games.title')}
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            {t('games.subtitle')}
          </p>

          {/* Become a Vendor Button - Only show for logged-in USER role */}
          {user && user.role === 'USER' && (
            <div className='mt-6'>
              <button
                onClick={async () => {
                  if (!vendorApplication) {
                    setCheckingApplication(true);
                    try {
                      const app = await (
                        firestoreService as any
                      ).getVendorApplication(user.id);
                      setVendorApplication(app);

                      if (app) {
                        // User already has an application, redirect to profile to see status
                        router.push('/profile');
                      } else {
                        // No application yet, redirect to vendor application page
                        router.push('/vendor-application');
                      }
                    } catch (error) {
                      console.error(
                        'Error checking vendor application:',
                        error
                      );
                      toast.error('Error checking application status');
                    } finally {
                      setCheckingApplication(false);
                    }
                  } else if (vendorApplication.status === 'PENDING') {
                    // Application pending, redirect to profile to see status
                    router.push('/profile');
                  } else if (vendorApplication.status === 'APPROVED') {
                    // Application approved, user is now vendor - should redirect to vendor dashboard
                    toast.success('Congratulations! You are now a vendor!');
                    router.push('/vendor-dashboard');
                  } else {
                    // Application rejected, redirect to vendor application to reapply
                    router.push('/vendor-application');
                  }
                }}
                disabled={checkingApplication}
                className={`inline-flex items-center px-6 py-3 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  vendorApplication?.status === 'PENDING'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                    : vendorApplication?.status === 'APPROVED'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }`}
              >
                {checkingApplication ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin mr-2' />
                    {t('common.checking')}
                  </>
                ) : (
                  <>
                    <Building2 className='w-5 h-5 mr-2' />
                    {vendorApplication ? (
                      vendorApplication.status === 'PENDING' ? (
                        <div className='text-center'>
                          <div className='font-medium'>
                            {t('vendor.applicationPending')}
                          </div>
                          <div className='text-xs opacity-90'>
                            {t('vendor.applicationUnderReview')}
                          </div>
                        </div>
                      ) : vendorApplication.status === 'APPROVED' ? (
                        t('vendor.accessVendorDashboard')
                      ) : (
                        t('vendor.reapplyAsVendor')
                      )
                    ) : (
                      t('vendor.becomeAVendor')
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Featured Games Section */}
        {featuredGames.length > 0 && (
          <div className='mb-12'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Star className='w-6 h-6 text-yellow-500 mr-2' />
                {t('games.featuredGames')}
              </h2>
              <div className='flex items-center text-orange-500'>
                <TrendingUp className='w-4 h-4 mr-1' />
                <span className='text-sm font-medium'>
                  {t('games.hotPicks')}
                </span>
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
              {t('games.chooseCategory')}
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-center'>
              {t('games.categoryDescription')}
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
              placeholder={t('games.searchPlaceholder')}
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className='w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm'
            />
          </div>
        </div>

        {/* Sponsored Ad Banner - Only show if no games have sponsors */}
        {!filteredGames.some(
          game => game.sponsor && game.sponsor.companyWebsite
        ) && (
          <div className='mb-8'>
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center'>
              <h3 className='text-lg font-semibold mb-2'>
                {t('games.specialPromotion')}
              </h3>
              <p className='text-sm opacity-90'>
                {t('games.promotionDescription')}
              </p>
            </div>
          </div>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: GAMES_PER_PAGE }).map((_, index) => (
              <div
                key={index}
                className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl animate-pulse'
              >
                <div className='w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4'></div>
                <div className='space-y-3'>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3'></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto'>
              <p className='text-red-600 dark:text-red-400 mb-4'>{error}</p>
              <button
                onClick={() => fetchData(true)}
                className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors'
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredGames.length > 0 ? (
          <>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {selectedCategory === 'all'
                  ? t('games.allGames')
                  : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className='flex items-center space-x-2'>
                <Filter className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-500'>
                  {filteredGames.length} {t('games.gamesFound')}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredGames.map((game: LotteryGame, index: number) => {
                // Use real sponsor data from the game if available
                const isSponsored = Boolean(
                  game.sponsor && game.sponsor.companyWebsite
                );
                const companyInfo =
                  isSponsored && game.sponsor
                    ? {
                        name: game.sponsor.companyName,
                        website: game.sponsor.companyWebsite || '',
                        logo: game.sponsor.companyLogo || '',
                      }
                    : undefined;

                // Add ref to last game for infinite scroll
                const isLastGame = index === filteredGames.length - 1;
                const gameRef = isLastGame ? lastGameRef : null;

                return (
                  <div key={game.id} ref={gameRef}>
                    <GameCard
                      game={game}
                      isSponsored={isSponsored}
                      companyInfo={companyInfo}
                    />

                    {/* Insert ad every 6 games - only show if there's a real sponsor */}
                    {index > 0 &&
                      (index + 1) % 6 === 0 &&
                      game.sponsor &&
                      game.sponsor.companyWebsite && (
                        <div className='md:col-span-2 lg:col-span-3 mt-6'>
                          <AdBanner
                            type='horizontal'
                            title={`${game.sponsor.companyName} - Special Offer`}
                            description={`Exclusive promotion from ${game.sponsor.companyName}. Don't miss out on this amazing opportunity!`}
                            ctaText='Visit Website'
                            ctaUrl={game.sponsor.companyWebsite}
                            company={{
                              name: game.sponsor.companyName,
                              logo: game.sponsor.companyLogo || '',
                            }}
                          />
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Load More Indicator */}
            {hasMore && (
              <div className='text-center mt-8'>
                {loadingMore ? (
                  <div className='flex items-center justify-center space-x-2'>
                    <Loader2 className='w-5 h-5 animate-spin text-orange-500' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      Loading more games...
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={loadMoreGames}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105'
                  >
                    Load More Games
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className='text-center py-16'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center'>
              <Gamepad2 className='w-12 h-12 text-gray-400 dark:text-gray-500' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              {t('games.noGamesFound')}
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              {t('games.tryDifferentSearch')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors'
            >
              {t('games.browseAllGames')}
            </button>
          </div>
        )}

        {/* Bottom Ad Section */}
        <div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white'>
            <h4 className='font-semibold mb-2'>{t('games.weeklyWinners')}</h4>
            <p className='text-sm opacity-90'>
              {t('games.weeklyWinnersDescription')}
            </p>
          </div>
          <div className='bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white'>
            <h4 className='font-semibold mb-2'>{t('games.quickPlay')}</h4>
            <p className='text-sm opacity-90'>
              {t('games.quickPlayDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
