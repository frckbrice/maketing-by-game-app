import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default:
        'bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30',
      elevated:
        'bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl',
      outlined:
        'bg-transparent border-2 border-slate-200 dark:border-slate-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card };
