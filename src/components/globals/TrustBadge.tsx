import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrustBadgeProps {
  icon: LucideIcon;
  text: string;
  iconColor?: string;
  className?: string;
}

export function TrustBadge({
  icon: Icon,
  text,
  iconColor = 'text-green-500',
  className,
}: TrustBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30',
        className
      )}
    >
      <Icon className={cn('w-4 h-4', iconColor)} />
      <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
        {text}
      </span>
    </div>
  );
}
