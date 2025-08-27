'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import type { GameCategory, LotteryGame } from '@/types';
import { ArrowRight, Gamepad2, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GamesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, categoriesData] = await Promise.all([
          firestoreService.getGames(),
          firestoreService.getCategories(),
        ]);

        setGames(gamesData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || game.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className='min-h-screen bg-[#1a1a1a] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5722]'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#1a1a1a] text-white'>
      {/* Mobile Header */}
      <header className='lg:hidden bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#FF5722]/20 sticky top-0 z-50'>
        <div className='px-4 py-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-lg flex items-center justify-center'>
                <Gamepad2 className='w-5 h-5 text-white' />
              </div>
              <span className='text-lg font-bold bg-gradient-to-r from-[#FF5722] to-[#FF9800] bg-clip-text text-transparent'>
                {t('navigation.games')}
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='p-2 text-white hover:text-[#FF5722] transition-colors'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className='mt-4 pb-4 space-y-3'>
              {user ? (
                <>
                  <Link
                    href='/dashboard'
                    className='block text-white hover:text-[#FF5722] transition-colors'
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    href='/profile'
                    className='block text-white hover:text-[#FF5722] transition-colors'
                  >
                    {t('navigation.profile')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href='/auth/login'
                    className='block text-white hover:text-[#FF5722] transition-colors'
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href='/auth/register'
                    className='block text-white hover:text-[#FF5722] transition-colors'
                  >
                    {t('common.register')}
                  </Link>
                </>
              )}
              <Link
                href='/'
                className='block text-white hover:text-[#FF5722] transition-colors'
              >
                {t('navigation.home')}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Header */}
      <header className='hidden lg:block bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#FF5722]/20'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='w-10 h-10 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-xl flex items-center justify-center'>
                <Gamepad2 className='w-6 h-6 text-white' />
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-[#FF5722] to-[#FF9800] bg-clip-text text-transparent'>
                {t('games.title')}
              </span>
            </div>

            <div className='flex items-center space-x-4'>
              {user ? (
                <>
                  <Link href='/dashboard'>
                    <Button variant='outline'>
                      {t('navigation.dashboard')}
                    </Button>
                  </Link>
                  <Link href='/profile'>
                    <Button variant='outline'>{t('navigation.profile')}</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href='/auth/login'>
                    <Button variant='outline'>{t('common.login')}</Button>
                  </Link>
                  <Link href='/auth/register'>
                    <Button>{t('common.register')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <p className='text-[#FF9800] text-lg mt-4'>{t('games.subtitle')}</p>
        </div>
      </header>

      <main className='max-w-7xl mx-auto py-8 px-4 lg:px-6'>
        {/* Search and Filter Section */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder={t('games.search')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#FF5722]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent'
              />
            </div>

            {/* Category Filter */}
            <div className='lg:w-64'>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-4 py-3 bg-[#0f0f0f] border border-[#FF5722]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent'
              >
                <option value='all'>{t('games.allCategories')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className='text-center py-12'>
            <Gamepad2 className='w-16 h-16 mx-auto text-gray-600 mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>
              {t('games.noGames')}
            </h3>
            <p className='text-gray-500'>{t('games.noGamesDescription')}</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Game Card Component
function GameCard({ game }: { game: LotteryGame }) {
  const { t } = useTranslation();
  const progress = (game.currentParticipants / game.maxParticipants) * 100;

  return (
    <div className='bg-[#0f0f0f] rounded-xl shadow-sm border border-[#FF5722]/20 hover:border-[#FF5722]/40 transition-all duration-200 hover:shadow-lg'>
      {/* Game Image Placeholder */}
      <div className='h-48 bg-gradient-to-br from-[#FF5722]/10 to-[#FF9800]/10 flex items-center justify-center'>
        <Gamepad2 className='w-16 h-16 text-[#FF5722]' />
      </div>

      {/* Game Info */}
      <div className='p-6'>
        <h3 className='text-xl font-bold text-white mb-2'>{game.title}</h3>
        <p className='text-gray-400 mb-4 line-clamp-2'>{game.description}</p>

        {/* Game Stats */}
        <div className='space-y-3 mb-6'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-400'>{t('games.ticketPrice')}:</span>
            <span className='text-white font-semibold'>
              ${game.ticketPrice}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-400'>{t('games.participants')}:</span>
            <span className='text-white font-semibold'>
              {game.currentParticipants}/{game.maxParticipants}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-400'>{t('games.endDate')}:</span>
            <span className='text-white font-semibold'>
              {new Date(game.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='mb-6'>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-gray-400'>{t('games.progress')}</span>
            <span className='text-white'>{Math.round(progress)}%</span>
          </div>
          <div className='w-full bg-gray-700 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-[#FF5722] to-[#FF9800] h-2 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/games/${game.id}`}>
          <Button className='w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] hover:from-[#FF9800] hover:to-[#FF5722] transition-all duration-200'>
            {t('games.joinGame')}
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        </Link>
      </div>
    </div>
  );
}
