import { cn } from '@/lib/utils';

export interface StatItem {
  number: string | number;
  label: string;
}

export interface StatsDisplayProps {
  stats: StatItem[];
  className?: string;
}

export function StatsDisplay({ stats, className }: StatsDisplayProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-6 pt-8', className)}>
      {stats.map((stat, index) => (
        <div key={index} className='text-center'>
          <div className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2'>
            {stat.number}
          </div>
          <div className='text-sm text-slate-600 dark:text-slate-400'>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
