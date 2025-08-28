'use client';

import { currencyService } from '@/lib/api/currencyService';
import { LotteryGame } from '@/types';
import {
  ArrowRight,
  Clock,
  Users,
  Star,
  Zap,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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

export function GameCard({
  game,
  isSponsored = false,
  companyInfo,
}: GameCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [mounted, setMounted] = useState(false);

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
        setTimeRemaining('Expired');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [game.endDate, mounted]);

  const progress =
    game.maxParticipants > 0
      ? Math.min(
          100,
          Math.max(0, (game.currentParticipants / game.maxParticipants) * 100)
        )
      : 0;

  const isHotGame = progress > 75;
  const isAlmostFull = progress > 90;
  const isNew = Date.now() - game.createdAt < 24 * 60 * 60 * 1000; // Less than 24 hours old

  if (!mounted) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse'>
        <div className='h-48 bg-gray-200 dark:bg-gray-700 rounded-t-2xl' />
        <div className='p-6 space-y-3'>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
          <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-full' />
          <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3' />
        </div>
      </div>
    );
  }

  return (
    <>
      <article
        className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border ${
          isSponsored
            ? 'border-yellow-300 dark:border-yellow-500 shadow-yellow-100 dark:shadow-yellow-900/20'
            : 'border-gray-200 dark:border-gray-700'
        } hover:transform hover:scale-[1.02]`}
        role='article'
        aria-label={`Lottery game: ${game.title}`}
      >
        {/* Sponsored Badge */}
        {isSponsored && (
          <div className='absolute top-3 left-3 z-10'>
            <div className='bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center'>
              <Star className='w-3 h-3 mr-1' />
              SPONSORED
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className='absolute top-3 right-3 z-10 flex flex-col space-y-2'>
          {isNew && (
            <div className='bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center'>
              <Zap className='w-3 h-3 mr-1' />
              NEW
            </div>
          )}
          {isHotGame && (
            <div className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse flex items-center'>
              🔥 HOT
            </div>
          )}
          {isAlmostFull && (
            <div className='bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center'>
              <Award className='w-3 h-3 mr-1' />
              FILLING FAST
            </div>
          )}
        </div>

        {/* Product Image */}
        <div className='relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden'>
          {/* Placeholder for product image - in production, use actual product images */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-6xl opacity-50'>
              {game.category?.icon || '🎁'}
            </div>
          </div>

          {/* Company Logo Overlay */}
          {companyInfo && (
            <div className='absolute bottom-3 right-3'>
              <div className='bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg opacity-90 hover:opacity-100 transition-opacity'>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-20'>
                  {companyInfo.name}
                </div>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>

        {/* Card Content */}
        <div className='p-6'>
          {/* Title and Description */}
          <div className='mb-4'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors'>
              {game.title}
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
              {game.description}
            </p>
          </div>

          {/* Game Stats Grid */}
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl'>
              <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                Ticket Price
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
                Time Left
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
                Participants
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
                aria-label={`${progress}% of tickets sold`}
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
                  Sponsored by
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
                  aria-label={`Visit ${companyInfo.name} website`}
                >
                  <ExternalLink className='w-4 h-4' />
                </button>
              )}
            </div>
          )}

          {/* Play Button */}
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={timeRemaining === 'Expired' || progress >= 100}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              timeRemaining === 'Expired' || progress >= 100
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
            aria-label={`Play ${game.title} lottery game`}
          >
            {timeRemaining === 'Expired' ? (
              'Expired'
            ) : progress >= 100 ? (
              'Full'
            ) : (
              <>
                <span>Play Now</span>
                <ArrowRight className='w-4 h-4' />
              </>
            )}
          </button>
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
    </>
  );
}
