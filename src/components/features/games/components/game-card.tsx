'use client';

import { ArrowRight, Gamepad2, Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LotteryGame } from '../../../../types';
import { Button } from '../../../ui/Button';

export function GameCard({ game }: { game: LotteryGame }) {
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
        <Button
          type='button'
          asChild
          className='w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] hover:from-[#FF9800] hover:to-[#FF5722] transition-all duration-200'
        >
          <Link href={`/games/${game.id}`}>
            {t('games.joinGame')}
            <ArrowRight className='w-4 h-4 ml-2' />
          </Link>
        </Button>
      </div>
    </div>
  );
}
