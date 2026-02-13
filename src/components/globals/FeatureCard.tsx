import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('text-center group', className)}>
      <div className='w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 group-hover:bg-orange-500 transition-colors duration-300'>
        <Icon className='w-10 h-10 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors duration-300' />
      </div>
      <h3 className='text-xl font-semibold mb-3 text-slate-900 dark:text-white'>
        {title}
      </h3>
      <p className='text-slate-300'>{description}</p>
    </div>
  );
}
