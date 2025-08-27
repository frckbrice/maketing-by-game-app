import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeader({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('text-center mb-16', className)}>
      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white',
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
