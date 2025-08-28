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
        className='bg-[#FF5722] text-white py-2 px-4 text-center'
        role='banner'
        aria-label='Language switcher'
      >
        <span className='text-sm'>
          🌍 {t('common.currentLanguage')}:{' '}
          <strong>{locale.toUpperCase()}</strong> |
          <span className='ml-2'>
            <Link
              href='/en'
              className='underline hover:text-[#FF9800] mr-2'
              aria-label={`Switch to ${t('common.english')}`}
            >
              🇺🇸 {t('common.english')}
            </Link>
            <Link
              href='/fr'
              className='underline hover:text-[#FF9800]'
              aria-label={`Switch to ${t('common.french')}`}
            >
              🇫🇷 {t('common.french')}
            </Link>
          </span>
        </span>
      </div>

      {/* Real Home Page Component */}
      <HomePageComponent />
    </div>
  );
}
