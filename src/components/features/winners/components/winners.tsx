'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function WinnersPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const periods = [
    { id: 'all', name: 'All Time', icon: Trophy },
    { id: 'monthly', name: 'This Month', icon: Calendar },
    { id: 'weekly', name: 'This Week', icon: Star },
    { id: 'daily', name: 'Today', icon: Medal },
  ];

  // Mock winners data
  const winners = [
    {
      id: 1,
      name: 'NGUYEN SOPHIE',
      country: 'NGOA EKELE',
      prize: 'TECH BUNDLE',
      amount: 'iPhone 15 Pro Max + MacBook Pro',
      date: 'December 2024',
      image: '/en/images/winner1.png',
      game: 'Tech Lottery 2024',
      ticketNumber: 'TECH-2024-001',
      category: 'Technology',
    },
    {
      id: 2,
      name: 'RIM A RIBAM JENER',
      country: 'NKOABANG',
      prize: 'FASHION PACK',
      amount: 'Nike Air Jordan + Designer Clothes',
      date: 'December 2024',
      image: '/en/images/winner2.png',
      game: 'Fashion Frenzy',
      ticketNumber: 'FASH-2024-045',
      category: 'Fashion',
    },
    {
      id: 3,
      name: 'BELLO',
      country: 'ETOUDI',
      prize: 'HOME BUNDLE',
      amount: 'Smart Appliances Package',
      date: 'November 2024',
      image: '/en/images/winner3.png',
      game: 'Home Sweet Home',
      ticketNumber: 'HOME-2024-123',
      category: 'Home & Living',
    },
    {
      id: 4,
      name: 'HENRIETTE NDOU',
      country: 'ESSOS',
      prize: 'SNEAKER COLLECTION',
      amount: 'Nike + Adidas Premium Pack',
      date: 'November 2024',
      image: '/en/images/winner4.png',
      game: 'Sneaker Lottery',
      ticketNumber: 'SNEAK-2024-067',
      category: 'Sports',
    },
    {
      id: 5,
      name: 'ALEXANDRE KAMGA',
      country: 'BASTOS',
      prize: 'GAMING SETUP',
      amount: 'PS5 + Gaming Monitor + Headset',
      date: 'October 2024',
      image: '/en/images/winner1.png',
      game: 'Gaming Paradise',
      ticketNumber: 'GAME-2024-089',
      category: 'Gaming',
    },
    {
      id: 6,
      name: 'MARIE CLAIRE',
      country: 'AKWA',
      prize: 'LUXURY WATCH',
      amount: 'Rolex Submariner',
      date: 'October 2024',
      image: '/en/images/winner2.png',
      game: 'Luxury Timepieces',
      ticketNumber: 'LUX-2024-234',
      category: 'Luxury',
    },
  ];

  const filteredWinners =
    selectedPeriod === 'all'
      ? winners
      : winners.filter(winner => {
          if (selectedPeriod === 'monthly')
            return winner.date.includes('December');
          if (selectedPeriod === 'weekly')
            return winner.date.includes('December');
          if (selectedPeriod === 'daily')
            return winner.date.includes('December');
          return true;
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
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center'>
            <Crown className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            🏆 Our Winners
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Celebrating the lucky players who turned their tickets into amazing
            prizes
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white text-center'>
            <Trophy className='w-8 h-8 mx-auto mb-2' />
            <div className='text-2xl font-bold'>{winners.length}</div>
            <div className='text-sm opacity-90'>Total Winners</div>
          </div>
          <div className='bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center'>
            <Gift className='w-8 h-8 mx-auto mb-2' />
            <div className='text-2xl font-bold'>$50K+</div>
            <div className='text-sm opacity-90'>Total Prizes</div>
          </div>
          <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center'>
            <Star className='w-8 h-8 mx-auto mb-2' />
            <div className='text-2xl font-bold'>15+</div>
            <div className='text-sm opacity-90'>Games Won</div>
          </div>
          <div className='bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white text-center'>
            <MapPin className='w-8 h-8 mx-auto mb-2' />
            <div className='text-2xl font-bold'>8</div>
            <div className='text-sm opacity-90'>Cities</div>
          </div>
        </div>

        {/* Period Filters */}
        <div className='flex flex-wrap justify-center gap-3 mb-8'>
          {periods.map(period => {
            const IconComponent = period.icon;
            return (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
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

        {/* Winners Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredWinners.map(winner => (
            <div
              key={winner.id}
              className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700'
            >
              {/* Winner Image */}
              <div className='relative mb-4'>
                <div className='w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl flex items-center justify-center'>
                  <img
                    src={winner.image}
                    alt={winner.name}
                    className='w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg'
                  />
                </div>
                <div className='absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1'>
                  <Crown className='w-3 h-3' />
                  <span>WINNER</span>
                </div>
              </div>

              {/* Winner Info */}
              <div className='text-center mb-4'>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-1'>
                  {winner.name}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center space-x-1'>
                  <MapPin className='w-3 h-3' />
                  <span>{winner.country}</span>
                </p>
              </div>

              {/* Prize Details */}
              <div className='space-y-3 mb-4'>
                <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg text-center'>
                  <div className='text-sm font-medium'>{winner.prize}</div>
                  <div className='text-lg font-bold'>{winner.amount}</div>
                </div>

                <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Game:
                    </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {winner.game}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Category:
                    </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {winner.category}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Ticket:
                    </span>
                    <span className='font-mono text-xs font-medium text-gray-900 dark:text-white'>
                      {winner.ticketNumber}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Won:
                    </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {winner.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105'>
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* No Winners Message */}
        {filteredWinners.length === 0 && (
          <div className='text-center py-12'>
            <Trophy className='w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No winners found for this period
            </h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Check back later for new winners!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
