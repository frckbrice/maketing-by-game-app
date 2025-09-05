'use client';

import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import type { LotteryGame } from '@/types';
import { Clock, ExternalLink, Users, X, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GameDetailModalProps {
  game: LotteryGame | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ZoomState {
  isZoomed: boolean;
  scale: number;
  position: { x: number; y: number };
}

export function GameDetailModal({
  game,
  isOpen,
  onClose,
}: GameDetailModalProps) {
  const { t } = useTranslation();
  const [zoomState, setZoomState] = useState<ZoomState>({
    isZoomed: false,
    scale: 1,
    position: { x: 0, y: 0 },
  });

  // Memoize expensive calculations
  const gameStats = useMemo(() => {
    if (!game) return null;

    const progress =
      game.maxParticipants > 0
        ? Math.max(0, (game.currentParticipants / game.maxParticipants) * 100)
        : 0;

    const timeRemaining =
      game.endDate > Date.now() ? Math.max(0, game.endDate - Date.now()) : 0;

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return {
      progress,
      timeRemaining: days > 0 ? `${days}d ${hours}h` : `${hours}h`,
      isHot: progress > 75,
      isAlmostFull: progress > 90,
      isNew: Date.now() - game.createdAt < 24 * 60 * 60 * 1000,
    };
  }, [game]);

  // Optimized zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      isZoomed: true,
      scale: Math.min(prev.scale * 1.5, 3),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      isZoomed: false,
      scale: 1,
      position: { x: 0, y: 0 },
    }));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomState.isZoomed) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setZoomState(prev => ({
        ...prev,
        position: { x, y },
      }));
    },
    [zoomState.isZoomed]
  );

  const handleMouseLeave = useCallback(() => {
    if (zoomState.isZoomed) {
      setZoomState(prev => ({
        ...prev,
        isZoomed: false,
        scale: 1,
        position: { x: 0, y: 0 },
      }));
    }
  }, [zoomState.isZoomed]);

  // Early return if no game
  if (!game || !isOpen) return null;

  const mainImage = game.images?.[0]?.url;
  const isSponsored = false; // Sponsor functionality not implemented yet

  // Ensure game has required properties with fallbacks
  const safeCategory = game.category || {
    id: 'general',
    name: 'General',
    description: 'General category',
    icon: '🎁',
    color: '#9E9E9E',
    isActive: true,
    sortOrder: 999,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative w-full max-w-6xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              {game.title}
            </h2>
            {gameStats?.isNew && (
              <span className='bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                {t('games.gameCard.new')}
              </span>
            )}
            {gameStats?.isHot && (
              <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse'>
                {t('games.gameCard.hot')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors'
          >
            <X className='w-6 h-6 text-gray-500 dark:text-gray-400' />
          </button>
        </div>

        {/* Content */}
        <div className='flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-hidden'>
          {/* Left Side - Image Section */}
          <div className='lg:w-1/2 p-6 bg-gray-50 dark:bg-gray-800'>
            <div className='relative'>
              {/* Zoom Controls */}
              <div className='absolute top-4 right-4 z-10 flex space-x-2'>
                <button
                  onClick={handleZoomIn}
                  className='p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
                  title='Zoom In'
                >
                  <ZoomIn className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                </button>
                <button
                  onClick={handleZoomOut}
                  className='p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
                  title='Zoom Out'
                >
                  <ZoomOut className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                </button>
              </div>

              {/* Image Container */}
              <div
                className='relative w-full aspect-square bg-white dark:bg-gray-700 rounded-xl overflow-hidden cursor-zoom-in'
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={game.title}
                    fill
                    className={`object-contain transition-transform duration-200 ${
                      zoomState.isZoomed ? 'cursor-move' : 'cursor-zoom-in'
                    }`}
                    style={{
                      transform: zoomState.isZoomed
                        ? `scale(${zoomState.scale}) translate(${zoomState.position.x - 50}%, ${zoomState.position.y - 50}%)`
                        : 'scale(1) translate(0, 0)',
                    }}
                    sizes='(max-width: 768px) 100vw, 50vw'
                    priority
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <div className='text-8xl opacity-30'>
                      {safeCategory.icon || '🎁'}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Gallery (if multiple images) */}
              {game.images && game.images.length > 1 && (
                <div className='mt-4 flex space-x-2 overflow-x-auto'>
                  {game.images.map((image, index) => (
                    <div
                      key={image.id}
                      className='flex-shrink-0 w-16 h-16 bg-white dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-colors'
                    >
                      <Image
                        src={image.url}
                        alt={`${game.title} - Image ${index + 1}`}
                        width={64}
                        height={64}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Details Section */}
          <div className='lg:w-1/2 p-6 overflow-y-auto'>
            {/* Description */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                {t('games.gameCard.description')}
              </h3>
              <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                {game.description}
              </p>
            </div>

            {/* Game Stats */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-xl'>
                <div className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                  {t('games.gameCard.ticketPrice')}
                </div>
                <div className='text-xl font-bold text-gray-900 dark:text-white'>
                  {formatCurrency(game.ticketPrice, game.currency)}
                </div>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-xl'>
                <div className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                  {t('games.gameCard.timeLeft')}
                </div>
                <div className='text-xl font-bold text-gray-900 dark:text-white flex items-center'>
                  <Clock className='w-5 h-5 mr-2 text-orange-500' />
                  {gameStats?.timeRemaining}
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className='mb-6'>
              <div className='flex items-center justify-between text-sm mb-3'>
                <span className='text-gray-600 dark:text-gray-400 flex items-center'>
                  <Users className='w-4 h-4 mr-2' />
                  {t('games.gameCard.participants')}
                </span>
                <span className='font-semibold text-gray-900 dark:text-white'>
                  {game.currentParticipants}/{game.maxParticipants}
                </span>
              </div>

              <div className='relative'>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      gameStats?.isAlmostFull
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : gameStats?.isHot
                          ? 'bg-gradient-to-r from-orange-500 to-red-500'
                          : 'bg-gradient-to-r from-orange-400 to-orange-500'
                    }`}
                    style={{ width: `${gameStats?.progress || 0}%` }}
                  />
                </div>
                <div className='absolute right-0 -top-6 text-xs text-gray-600 dark:text-gray-400'>
                  {Math.round(gameStats?.progress || 0)}%
                </div>
              </div>
            </div>

            {/* Sponsor Information */}
            {isSponsored && (
              <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-blue-600 dark:text-blue-400 font-medium mb-1'>
                      {t('games.gameCard.sponsoredBy')}
                    </div>
                    <div className='text-lg font-semibold text-blue-900 dark:text-blue-100'>
                      {'Sponsor Company'}
                    </div>
                    <p className='text-sm text-blue-700 dark:text-blue-300 mt-2'>
                      {'Sponsor description placeholder'}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      window.open('https://example.com', '_blank')
                    }
                    variant='outline'
                    size='sm'
                    className='border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30'
                  >
                    <ExternalLink className='w-4 h-4 mr-2' />
                    {t('games.gameCard.visitWebsite')}
                  </Button>
                </div>
              </div>
            )}

            {/* Game Type & Category */}
            <div className='mb-6'>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {t('games.gameCard.type')}:
                  </span>
                  <span className='px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium'>
                    {game.type.toUpperCase()}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {t('games.gameCard.category')}:
                  </span>
                  <span
                    className='px-3 py-1 rounded-full text-sm font-medium text-white'
                    style={{ backgroundColor: safeCategory.color || '#9E9E9E' }}
                  >
                    {safeCategory.name || 'General'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex space-x-3'>
              <Button
                onClick={() => {
                  // TODO: Implement play game functionality
                  console.log('Play game:', game.id);
                }}
                className='flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105'
              >
                {t('games.gameCard.playNow')}
              </Button>

              <Button
                onClick={onClose}
                variant='outline'
                className='px-6 py-3 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
