'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import HomePageComponent from '../home/components/home';

interface HomePageClientProps {
  locale: string;
}

export function HomePageClient({ locale }: HomePageClientProps) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Language Switcher Banner */}
      <div
        className='bg-[#FF5722] text-white py-2 px-3 sm:px-4 text-center'
        role='banner'
        aria-label='Language switcher'
      >
        <div className='flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0'>
          <span className='text-xs sm:text-sm'>
            🌍 {t('common.currentLanguage')}:{' '}
            <strong>{locale.toUpperCase()}</strong>
          </span>
          <span className='flex items-center space-x-2 sm:ml-4'>
            <Link
              href='/en'
              className='underline hover:text-[#FF9800] text-xs sm:text-sm flex items-center space-x-1'
              aria-label={`Switch to ${t('common.english')}`}
            >
              <span>🇺🇸</span>
              <span className='hidden sm:inline'>{t('common.english')}</span>
              <span className='sm:hidden'>EN</span>
            </Link>
            <span className='text-white/80'>|</span>
            <Link
              href='/fr'
              className='underline hover:text-[#FF9800] text-xs sm:text-sm flex items-center space-x-1'
              aria-label={`Switch to ${t('common.french')}`}
            >
              <span>🇫🇷</span>
              <span className='hidden sm:inline'>{t('common.french')}</span>
              <span className='sm:hidden'>FR</span>
            </Link>
          </span>
        </div>
      </div>

      {/* Real Home Page Component */}
      <HomePageComponent />
    </div>
  );
}
