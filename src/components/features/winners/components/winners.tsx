'use client';

import { Footer } from '@/components/globals/footer';
import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { firestoreService } from '@/lib/firebase/services';
import type { Winner } from '@/types';
import {
  Calendar,
  Crown,
  Gift,
  MapPin,
  Medal,
  Star,
  Trophy,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Pagination constants
const WINNERS_PER_PAGE = 12;
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function WinnersPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Data fetching state
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWinners, setTotalWinners] = useState(0);

  // Cache for performance
  const [winnersCache, setWinnersCache] = useState<Map<string, Winner[]>>(
    new Map()
  );
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch winners with caching and pagination
  const fetchWinners = useCallback(
    async (page: number, period: string, forceRefresh = false) => {
      const cacheKey = `${period}_${page}`;
      const now = Date.now();

      // Check cache first (unless forcing refresh)
      if (!forceRefresh && winnersCache.has(cacheKey)) {
        const cachedData = winnersCache.get(cacheKey);
        if (cachedData && now - lastFetchTime < CACHE_TIME) {
          setWinners(cachedData);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch winners from API
        const allWinners = await firestoreService.getWinners();

        // Filter by period
        let filteredWinners = allWinners;
        if (period !== 'all') {
          const currentDate = new Date();
          filteredWinners = allWinners.filter(winner => {
            const winnerDate = new Date(winner.announcedAt);
            switch (period) {
              case 'monthly':
                return (
                  winnerDate.getMonth() === currentDate.getMonth() &&
                  winnerDate.getFullYear() === currentDate.getFullYear()
                );
              case 'weekly': {
                const weekAgo = new Date(
                  currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                return winnerDate >= weekAgo;
              }
              case 'daily':
                return winnerDate.toDateString() === currentDate.toDateString();
              default:
                return true;
            }
          });
        }

        // Calculate pagination
        const startIndex = (page - 1) * WINNERS_PER_PAGE;
        const endIndex = startIndex + WINNERS_PER_PAGE;
        const paginatedWinners = filteredWinners.slice(startIndex, endIndex);

        setTotalWinners(filteredWinners.length);
        setHasMore(endIndex < filteredWinners.length);
        setWinners(paginatedWinners);

        // Update cache
        setWinnersCache(prev => new Map(prev.set(cacheKey, paginatedWinners)));
        setLastFetchTime(now);
      } catch (err) {
        console.error('Error fetching winners:', err);
        setError('Failed to load winners. Please try again.');

        // Fallback to mock data if API fails
        if (page === 1) {
          setWinners(getMockWinners());
          setTotalWinners(6);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [winnersCache, lastFetchTime]
  );

  // Fetch winners when period or page changes
  useEffect(() => {
    if (mounted) {
      fetchWinners(currentPage, selectedPeriod);
    }
  }, [mounted, currentPage, selectedPeriod, fetchWinners]);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load more winners
  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const periods = [
    { id: 'all', name: t('winners.periods.allTime'), icon: Trophy },
    { id: 'monthly', name: t('winners.periods.thisMonth'), icon: Calendar },
    { id: 'weekly', name: t('winners.periods.thisWeek'), icon: Star },
    { id: 'daily', name: t('winners.periods.today'), icon: Medal },
  ];

  // Mock data fallback (enhanced with sponsor info)
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
      date: 'December 2024',
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

  return (
    <>
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
            <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center'>
              <Crown className='w-10 h-10 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              {t('winners.title')}
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              {t('winners.subtitle')}
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white text-center'>
              <Trophy className='w-10 h-6 mx-auto mb-2' />
              <div className='text-xl font-bold'>{totalWinners}</div>
              <div className='text-[14px] opacity-90'>
                {t('winners.totalWinners')}
              </div>
            </div>
            <div className='bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 text-white text-center'>
              <Gift className='w-6 h-6 mx-auto mb-2' />
              <div className='text-xl font-bold'>$50K+</div>
              <div className='text-[14px] opacity-90'>
                {t('winners.totalPrizes')}
              </div>
            </div>
            <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white text-center'>
              <Star className='w-6 h-6 mx-auto mb-2' />
              <div className='text-xl font-bold'>15+</div>
              <div className='text-[14px] opacity-90'>
                {t('winners.gamesWon')}
              </div>
            </div>
            <div className='bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-4 text-white text-center'>
              <MapPin className='w-6 h-6 mx-auto mb-2' />
              <div className='text-xl font-bold'>8</div>
              <div className='text-[14px] opacity-90'>
                {t('winners.cities')}
              </div>
            </div>
          </div>

          {/* Period Filters */}
          <div className='flex flex-wrap justify-center gap-3 mb-8'>
            {periods.map(period => {
              const IconComponent = period.icon;
              return (
                <button
                  key={period.id}
                  onClick={() => handlePeriodChange(period.id)}
                  className={`flex items-center space-x-2 p-4 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedPeriod === period.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <IconComponent className='w-4 h-4' />
                  <span>{period.name}</span>
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {loading && currentPage === 1 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              {Array.from({ length: WINNERS_PER_PAGE - 3 }).map((_, index) => (
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
          )}

          {/* Error State */}
          {error && (
            <div className='text-center py-12'>
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto'>
                <p className='text-red-600 dark:text-red-400 mb-4'>{error}</p>
                <button
                  onClick={() =>
                    fetchWinners(currentPage, selectedPeriod, true)
                  }
                  className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors'
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Winners Grid */}
          {!loading && !error && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                {winners.map((winner: any) => (
                  <div
                    key={winner.id}
                    className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700'
                  >
                    {/* Winner Image */}
                    <div className='relative mb-4'>
                      <div className='w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl flex items-center justify-center'>
                        <img
                          src={winner.image || '/en/images/winner1.png'}
                          alt={winner.name || 'Winner'}
                          className='w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg'
                        />
                      </div>
                      <div className='absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1'>
                        <Crown className='w-3 h-3' />
                        <span>{t('winners.winner')}</span>
                      </div>
                    </div>

                    {/* Winner Info */}
                    <div className='text-center mb-4'>
                      <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-1'>
                        {winner.name || 'Unknown Winner'}
                      </h3>
                      <p className='text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center space-x-1'>
                        <MapPin className='w-3 h-3' />
                        <span>{winner.country || 'Unknown Location'}</span>
                      </p>
                    </div>

                    {/* Prize Details */}
                    <div className='space-y-3 mb-4'>
                      <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg text-center'>
                        <div className='text-sm font-medium'>
                          {winner.prize || 'Prize'}
                        </div>
                        <div className='text-lg font-bold'>
                          {winner.amount || '$0'}
                        </div>
                      </div>

                      <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.game')}:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {winner.game || 'Unknown Game'}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.category')}:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {winner.category || 'General'}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.ticket')}:
                          </span>
                          <span className='font-mono text-xs font-medium text-gray-900 dark:text-white'>
                            {winner.ticketNumber || winner.ticketId || 'N/A'}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.won')}:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {winner.date ||
                              new Date(winner.announcedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setSelectedWinner(winner);
                        setShowDetailsModal(true);
                      }}
                      className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105'
                    >
                      {t('winners.viewDetails')}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalWinners > WINNERS_PER_PAGE && (
                <div className='flex items-center justify-center space-x-2 mb-8'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                  >
                    Previous
                  </button>

                  <span className='px-4 py-2 text-gray-600 dark:text-gray-400'>
                    Page {currentPage} of{' '}
                    {Math.ceil(totalWinners / WINNERS_PER_PAGE)}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasMore}
                    className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className='text-center mb-8'>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? 'Loading...' : 'Load More Winners'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Winners Message */}
          {!loading && !error && winners.length === 0 && (
            <div className='text-center py-12'>
              <Trophy className='w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                {t('winners.noWinnersFound')}
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                {t('winners.checkBackLater')}
              </p>
            </div>
          )}

          {/* Product Details Modal */}
          {showDetailsModal && selectedWinner && (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
              <div className='bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
                {/* Modal Header */}
                <div className='sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold'>
                      {t('winners.productDetails')}
                    </h2>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors'
                    >
                      <span className='text-white text-xl'>×</span>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className='p-6 space-y-6'>
                  {/* Winner Information */}
                  <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6'>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <Crown className='w-6 h-6 text-orange-500 mr-2' />
                      {t('winners.winnerInfo')}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full flex items-center justify-center'>
                          <img
                            src={
                              selectedWinner.image || '/en/images/winner1.png'
                            }
                            alt={selectedWinner.name || 'Winner'}
                            className='w-12 h-12 rounded-full object-cover'
                          />
                        </div>
                        <div>
                          <h4 className='font-bold text-gray-900 dark:text-white'>
                            {selectedWinner.name || 'Unknown Winner'}
                          </h4>
                          <p className='text-gray-600 dark:text-gray-400 flex items-center'>
                            <MapPin className='w-4 h-4 mr-1' />
                            {selectedWinner.country || 'Unknown Location'}
                          </p>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.game')}:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {selectedWinner.game || 'Unknown Game'}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.ticket')}:
                          </span>
                          <span className='font-mono text-sm font-medium text-gray-900 dark:text-white'>
                            {selectedWinner.ticketNumber ||
                              selectedWinner.ticketId ||
                              'N/A'}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            {t('winners.won')}:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {selectedWinner.date ||
                              new Date(
                                selectedWinner.announcedAt
                              ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  {selectedWinner.productDetails && (
                    <div className='bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600'>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                        🎁 {selectedWinner.prize}
                      </h3>
                      <div className='space-y-4'>
                        <div>
                          <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                            Description
                          </h4>
                          <p className='text-gray-600 dark:text-gray-400'>
                            {selectedWinner.productDetails.description}
                          </p>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                            Key Features
                          </h4>
                          <ul className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            {selectedWinner.productDetails.features?.map(
                              (feature: string, index: number) => (
                                <li
                                  key={index}
                                  className='flex items-center text-gray-600 dark:text-gray-400'
                                >
                                  <span className='w-2 h-2 bg-orange-500 rounded-full mr-2'></span>
                                  {feature}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <div className='text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-xl'>
                            <div className='text-2xl font-bold text-orange-500'>
                              {selectedWinner.productDetails.value}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              Value
                            </div>
                          </div>
                          <div className='text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-xl'>
                            <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                              {selectedWinner.productDetails.warranty}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              Warranty
                            </div>
                          </div>
                          <div className='text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-xl'>
                            <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                              {selectedWinner.productDetails.delivery}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              Delivery
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sponsor Information */}
                  {selectedWinner.sponsor && (
                    <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800'>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center'>
                        <Star className='w-6 h-6 text-blue-500 mr-2' />
                        {t('winners.sponsorInfo')} {selectedWinner.sponsor.name}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                          <div>
                            <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                              About
                            </h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                              {selectedWinner.sponsor.description}
                            </p>
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                              Products
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {selectedWinner.sponsor.products.map(
                                (product: string, index: number) => (
                                  <span
                                    key={index}
                                    className='px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm'
                                  >
                                    {product}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <div>
                            <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                              Company Info
                            </h4>
                            <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                              <div className='flex justify-between'>
                                <span>Founded:</span>
                                <span className='font-medium'>
                                  {selectedWinner.sponsor.founded}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span>Headquarters:</span>
                                <span className='font-medium'>
                                  {selectedWinner.sponsor.headquarters}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='pt-4'>
                            <a
                              href={selectedWinner.sponsor.website}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors'
                            >
                              {t('winners.visitWebsite')}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Call to Action */}
                  <div className='text-center bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800'>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                      🎯 Want to Win Like {selectedWinner.name || 'This Winner'}
                      ?
                    </h3>
                    <p className='text-gray-600 dark:text-gray-400 mb-4'>
                      Join our lottery games and start your journey to winning
                      amazing prizes!
                    </p>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105'
                    >
                      {t('winners.close')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer - Full Width */}
      <Footer isDark={isDark} />
    </>
  );
}
