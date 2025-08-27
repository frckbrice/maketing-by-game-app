// FinalCTASection.jsx
import { Button } from '@/components/globals/Button';
import { ArrowRight, Shield, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FinalCTASection = ({ isDark }: { isDark: boolean }) => {
  const { t } = useTranslation();

  return (
    <section
      className={`py-20 ${
        isDark
          ? 'bg-gradient-to-r from-black via-gray-900 to-black'
          : 'bg-gradient-to-r from-gray-100 via-white to-gray-100'
      }`}
    >
      <div className='max-w-4xl mx-auto text-center px-4 lg:px-8'>
        <div
          className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold mb-6 ${
            isDark
              ? 'border-orange-500/30 text-orange-400 bg-orange-500/5'
              : 'border-orange-300/50 text-orange-600 bg-orange-100/30'
          }`}
        >
          {t('home.cta.badge')}
        </div>

        <h2
          className={`text-4xl lg:text-5xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {t('home.cta.title')}
        </h2>

        <p
          className={`text-xl mb-8 max-w-2xl mx-auto ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {t('home.cta.subtitle')}
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
          <Button
            className={`px-12 py-4 text-xl font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
            } text-white`}
          >
            <span className='flex items-center gap-2'>
              {t('home.cta.primaryButton')}
              <ArrowRight className='w-6 h-6' />
            </span>
          </Button>

          <Button
            variant='outline'
            className={`px-8 py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-300 ${
              isDark
                ? 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
                : 'border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white'
            }`}
          >
            {t('home.cta.secondaryButton')}
          </Button>
        </div>

        {/* Trust indicators */}
        <div className='flex justify-center items-center gap-8 flex-wrap'>
          <div
            className={`flex items-center gap-2 transition-colors duration-300 hover:text-orange-400 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <Users className='w-5 h-5' />
            <span className='text-sm'>{t('home.cta.trust.productsWon')}</span>
          </div>
          <div
            className={`flex items-center gap-2 transition-colors duration-300 hover:text-orange-400 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <TrendingUp className='w-5 h-5' />
            <span className='text-sm'>{t('home.cta.trust.prizeValue')}</span>
          </div>
          <div
            className={`flex items-center gap-2 transition-colors duration-300 hover:text-orange-400 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <Shield className='w-5 h-5' />
            <span className='text-sm'>
              {t('home.cta.trust.authenticProducts')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
