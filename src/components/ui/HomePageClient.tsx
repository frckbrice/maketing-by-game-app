'use client';

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
      <div className='bg-[#FF5722] text-white py-2 px-4 text-center'>
        <span className='text-sm'>
          🌍 {t('common.currentLanguage')}:{' '}
          <strong>{locale.toUpperCase()}</strong> |
          <span className='ml-2'>
            <a href='/en' className='underline hover:text-[#FF9800] mr-2'>
              🇺🇸 {t('common.english')}
            </a>
            <a href='/fr' className='underline hover:text-[#FF9800]'>
              🇫🇷 {t('common.french')}
            </a>
          </span>
        </span>
      </div>

      {/* Real Home Page Component */}
      <HomePageComponent />
    </div>
  );
}
