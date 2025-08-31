import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface Winner {
  name: string;
  date: string;
  contest: string;
  numbers: string;
}

export interface WinnerCardProps {
  winner: Winner;
  className?: string;
}

export function WinnerCard({ winner, className }: WinnerCardProps) {
  return (
    <Card
      variant='elevated'
      className={cn('p-6 hover:-translate-y-2', className)}
    >
      <div className='flex items-center space-x-4 mb-4'>
        <div className='w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center'>
          <Award className='w-6 h-6 text-white' />
        </div>
        <div>
          <h3 className='font-semibold text-slate-900 dark:text-white'>
            {winner.name}
          </h3>
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            {winner.date}
          </p>
        </div>
      </div>
      <div className='space-y-2'>
        <p className='text-sm text-slate-700 dark:text-slate-300'>
          <span className='font-medium'>Contest:</span> {winner.contest}
        </p>
        <p className='text-sm text-slate-700 dark:text-slate-300'>
          <span className='font-medium'>Numbers:</span> {winner.numbers}
        </p>
      </div>
    </Card>
  );
}
