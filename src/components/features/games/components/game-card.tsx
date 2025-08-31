'use client';

import { currencyService } from '@/lib/api/currencyService';
import { LotteryGame } from '@/types';
import {
  ArrowRight,
  Award,
  Clock,
  ExternalLink,
  Eye,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameDetailModal } from './GameDetailModal';
import { PaymentModal } from './PaymentModal';

interface GameCardProps {
  game: LotteryGame;
  isSponsored?: boolean;
  companyInfo?: {
    name: string;
    logo: string;
    website?: string;
  };
}

export const GameCard = React.memo<GameCardProps>(function GameCard({
  game,
  isSponsored = false,
  companyInfo,
}) {
  const { t } = useTranslation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const handleOpenPaymentModal = useCallback(() => setShowPaymentModal(true), []);
  const handleClosePaymentModal = useCallback(() => setShowPaymentModal(false), []);
  const handleOpenDetailModal = useCallback(() => setShowDetailModal(true), []);
  const handleCloseDetailModal = useCallback(() => setShowDetailModal(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateTimer = () => {
      const now = Date.now();
      const endTime = game.endDate;
      const diff = endTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      } else {
        setTimeRemaining(t('games.gameCard.expired'));
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [game.endDate, mounted, t]);

  const gameStats = useMemo(() => {
    const progress = game.maxParticipants > 0
      ? Math.min(100, Math.max(0, (game.currentParticipants / game.maxParticipants) * 100))
      : 0;

    return {
      progress,
      isHotGame: progress > 75,
      isAlmostFull: progress > 90,
      isNew: Date.now() - game.createdAt < 24 * 60 * 60 * 1000,
    };
  }, [game.currentParticipants, game.maxParticipants, game.createdAt]);

  const { progress, isHotGame, isAlmostFull, isNew } = gameStats;

  // Memoize safe category to prevent recreation on every render
  const safeCategory = useMemo(() => game.category || {
    id: 'general',
    name: 'General',
    description: 'General category',
    icon: '🎁',
    color: '#9E9E9E',
    isActive: true,
    sortOrder: 999,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }, [game.category]);

  if (!mounted) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse h-[520px] sm:h-[540px] flex flex-col'>
        <div className='h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg sm:rounded-t-2xl flex-shrink-0' />
        <div className='p-4 sm:p-6 space-y-3 flex-1 flex flex-col justify-between'>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-full' />
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3' />
          </div>
          <div className='space-y-2'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-full' />
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-full' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <article
        className={`group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border h-[520px] sm:h-[540px] flex flex-col ${
          isSponsored
            ? 'border-yellow-300 dark:border-yellow-500 shadow-yellow-100 dark:shadow-yellow-900/20'
            : 'border-gray-200 dark:border-gray-700'
        } hover:transform hover:scale-[1.02]`}
        role='article'
        aria-label={`${t('games.gameCard.lotteryGame')}: ${game.title}`}
      >
        {/* Sponsored Badge */}
        {isSponsored && (
          <div className='absolute top-2 sm:top-3 left-2 sm:left-3 z-10'>
            <div className='bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg flex items-center'>
              <Star className='w-3 h-3 mr-1' />
              <span className='hidden sm:inline'>{t('games.gameCard.sponsored')}</span>
              <span className='sm:hidden'>★</span>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className='absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col space-y-1 sm:space-y-2'>
          {isNew && (
            <div className='bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center'>
              <Zap className='w-3 h-3 mr-1' />
              <span className='hidden sm:inline'>{t('games.gameCard.new')}</span>
              <span className='sm:hidden'>New</span>
            </div>
          )}
          {isHotGame && (
            <div className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse flex items-center'>
              {t('games.gameCard.hot')}
            </div>
          )}
          {isAlmostFull && (
            <div className='bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center'>
              <Award className='w-3 h-3 mr-1' />
              {t('games.gameCard.fillingFast')}
            </div>
          )}
        </div>

        {/* Product Image */}
        <div
          className='relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden cursor-pointer group'
          onClick={() => setShowDetailModal(true)}
        >
          {game.images && game.images.length > 0 ? (
            <Image
              src={game.images[0].url || ''}
              alt={safeCategory.name || 'Game Image'}
              fill
              className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-105'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              priority={false}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-6xl opacity-50'>
                {safeCategory.icon || '🎁'}
              </div>
            </div>
          )}

          {/* Hover overlay with tooltip */}
          <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
            <div className='relative bg-white/90 dark:bg-gray-800/90 rounded-full p-2 sm:p-3 group/tooltip'>
              <Eye className='w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300' />
              {/* Tooltip */}
              <div className='absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none'>
                <div className='bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded whitespace-nowrap'>
                  {t('games.gameCard.viewDetails')}
                  <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Logo Overlay */}
          {companyInfo && (
            <div className='absolute bottom-2 sm:bottom-3 right-2 sm:right-3'>
              <div className='bg-white dark:bg-gray-800 rounded-lg p-1.5 sm:p-2 shadow-lg opacity-90 hover:opacity-100 transition-opacity'>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-16 sm:max-w-20'>
                  {companyInfo.name}
                </div>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>

        {/* Card Content */}
        <div className='p-4 sm:p-6 flex flex-col h-[calc(100%-10rem)] sm:h-[calc(100%-12rem)]'>
          {/* Title - Fixed height to ensure uniformity */}
          <div className='mb-3 sm:mb-4 flex-shrink-0'>
            <h3 
              className='text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight h-12 sm:h-14 overflow-hidden'
              title={game.title}
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.5rem'
              }}
            >
              {game.title}
            </h3>
          </div>

          {/* Game Stats Grid */}
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl'>
              <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                {t('games.gameCard.ticketPrice')}
              </div>
              <div className='font-bold text-gray-900 dark:text-white'>
                {currencyService.formatCurrency(
                  game.ticketPrice,
                  game.currency
                )}
              </div>
            </div>

            <div className='text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl'>
              <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                {t('games.gameCard.timeLeft')}
              </div>
              <div className='font-bold text-gray-900 dark:text-white flex items-center justify-center'>
                <Clock className='w-3 h-3 mr-1' />
                {timeRemaining}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className='mb-4'>
            <div className='flex items-center justify-between text-sm mb-2'>
              <span className='text-gray-600 dark:text-gray-400 flex items-center'>
                <Users className='w-4 h-4 mr-1' />
                {t('games.gameCard.participants')}
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {game.currentParticipants}/{game.maxParticipants}
              </span>
            </div>

            <div className='relative'>
              <div
                className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'
                role='progressbar'
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={`${progress}% ${t('games.gameCard.ticketsSold')}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isAlmostFull
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : isHotGame
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className='absolute right-0 -top-6 text-xs text-gray-600 dark:text-gray-400'>
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Company Info */}
          {companyInfo && (
            <div className='flex items-center justify-between mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl'>
              <div>
                <div className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                  {t('games.gameCard.sponsoredBy')}
                </div>
                <div className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                  {companyInfo.name}
                </div>
              </div>
              {companyInfo.website && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    window.open(
                      companyInfo.website,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                  className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors'
                  aria-label={t('games.gameCard.visitWebsite', {
                    company: companyInfo.name,
                  })}
                >
                  <ExternalLink className='w-4 h-4' />
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-3 mt-auto flex-shrink-0'>
            {/* View Details Button */}
            {/* <button
              onClick={() => setShowDetailModal(true)}
              className='w-full py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
              aria-label={t('games.gameCard.viewDetails', {
                title: game.title,
              })}
            >
              <Eye className='w-4 h-4' />
              <span>{t('games.gameCard.viewDetails')}</span>
            </button> */}

            {/* Play Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={timeRemaining === 'Expired' || progress >= 100}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                timeRemaining === 'Expired' || progress >= 100
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
              aria-label={t('games.gameCard.playGame', { title: game.title })}
            >
              {timeRemaining === t('games.gameCard.expired') ? (
                t('games.gameCard.expired')
              ) : progress >= 100 ? (
                t('games.gameCard.full')
              ) : (
                <>
                  <span>{t('games.gameCard.playNow')}</span>
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
      </article>

      {/* Payment Modal */}
      <PaymentModal
        game={game}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      {/* Game Detail Modal */}
      <GameDetailModal
        game={game}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  );
});
