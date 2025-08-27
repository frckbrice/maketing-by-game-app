'use client';

import { Button } from '@/components/ui/Button';
import { STATS_CONFIG, THEME_CONFIG, WINNERS } from '@/lib/constants';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  ArrowRight,
  Award,
  Gift,
  Menu,
  Play,
  Star,
  Target,
  Truck,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function HomePageComponent() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const STATS = [
    {
      number: STATS_CONFIG.defaultStats[0].number,
      label: t('home.stats.activeGames'),
      icon: Play,
    },
    {
      number: STATS_CONFIG.defaultStats[1].number,
      label: t('home.stats.participants'),
      icon: Users,
    },
    {
      number: STATS_CONFIG.defaultStats[2].number,
      label: t('home.stats.uptime'),
      icon: Star,
    },
  ];

  const HOW_IT_WORKS = [
    {
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
      icon: Target,
    },
    {
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
      icon: Play,
    },
    {
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
      icon: Award,
    },
    {
      title: t('home.howItWorks.step4.title'),
      description: t('home.howItWorks.step4.description'),
      icon: Truck,
    },
  ];


  if (loading) {
    return (
      <div
        className={`min-h-screen ${THEME_CONFIG.colors.background.dark} flex items-center justify-center`}
      >
        <div
          className={`animate-spin rounded-full h-16 w-16 border-b-2 ${THEME_CONFIG.colors.border.primary}`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${THEME_CONFIG.colors.background.dark} text-white`}
    >
      {/* Mobile Navigation */}
      <nav
        className={`lg:hidden ${THEME_CONFIG.colors.background.dark}/95 backdrop-blur-md border-b ${THEME_CONFIG.colors.border.primary}/20 sticky top-0 z-50`}
      >
        <div className='px-3 sm:px-4 py-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2'>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} rounded-lg flex items-center justify-center`}
              >
                <Gift className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </div>
              <span
                className={`text-lg sm:text-xl font-bold bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} bg-clip-text text-transparent`}
              >
                Lottery
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='p-2 sm:p-3 text-white hover:text-[#FF5722] transition-colors touch-manipulation'
              aria-label='Toggle mobile menu'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6 sm:w-7 sm:h-7' />
              ) : (
                <Menu className='w-6 h-6 sm:w-7 sm:h-7' />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className='mt-3 sm:mt-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3'>
              {user ? (
                <>
                  <Link
                    href='/dashboard'
                    className='block text-white hover:text-[#FF5722] transition-colors py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-white/10'
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    href='/games'
                    className='block text-white hover:text-[#FF5722] transition-colors py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-white/10'
                  >
                    {t('navigation.games')}
                  </Link>
                  <button
                    onClick={() => {
                      /* TODO: Implement logout */
                    }}
                    className='block w-full text-left text-white hover:text-[#FF5722] transition-colors py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-white/10'
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href='/auth/login'
                    className='block text-white hover:text-[#FF5722] transition-colors py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-white/10'
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href='/auth/register'
                    className='block text-white hover:text-[#FF5722] transition-colors py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-white/10'
                  >
                    {t('common.register')}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Inspired by lotto_1.jpeg */}
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
        {/* Background with lotto_1.jpeg inspiration */}
        <div className='absolute inset-0 z-0'>
          {/* Main background gradient */}
          <div className='w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2d1b1b] to-[#1a1a1a]'></div>

          {/* Animated floating elements inspired by lottery balls/numbers */}
          <div className='absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full opacity-20 animate-pulse'></div>
          <div className='absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-[#FF9800] to-[#FF5722] rounded-full opacity-30 animate-bounce'></div>
          <div className='absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full opacity-25 animate-pulse'></div>
          <div className='absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-r from-[#FF9800] to-[#FF5722] rounded-full opacity-35 animate-bounce'></div>

          {/* Grid pattern overlay */}
          <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23FF5722%27%20fill-opacity%3D%270.05%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>

          {/* Glow effects */}
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#FF5722]/20 to-[#FF9800]/20 rounded-full blur-3xl'></div>
        </div>

        {/* Hero Content */}
        <div className='relative z-10 text-center px-4 max-w-6xl mx-auto'>
          {/* Main heading with lottery ball effect */}
          <div className='mb-8'>
            <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight'>
              <span className='block text-white mb-2'>
                {t('home.hero.title')}
              </span>
              <span
                className={`block bg-gradient-to-r from-${THEME_CONFIG.colors.primary} via-${THEME_CONFIG.colors.secondary} to-${THEME_CONFIG.colors.primary} bg-clip-text text-transparent animate-pulse`}
              >
                {t('home.hero.titleHighlight')}
              </span>
            </h1>
          </div>

          {/* Subtitle with enhanced styling */}
          <p className='text-xl sm:text-2xl md:text-3xl text-gray-200 mb-10 max-w-4xl mx-auto px-4 leading-relaxed'>
            <span className='text-white font-medium'>
              {t('home.hero.subtitle')}
            </span>
            <span
              className={`block mt-2 text-${THEME_CONFIG.colors.secondary} font-semibold`}
            >
              {t('home.hero.subtitleHighlight')}
            </span>
          </p>

          {/* Enhanced CTA buttons */}
          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center px-4 mb-12'>
            <Button
              size='lg'
              className={`bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} hover:from-${THEME_CONFIG.colors.primary}/90 hover:to-${THEME_CONFIG.colors.secondary}/90 text-xl sm:text-2xl px-10 sm:px-12 py-5 sm:py-6 rounded-full shadow-2xl hover:shadow-${THEME_CONFIG.colors.primary}/25 transition-all duration-300 transform hover:scale-105`}
            >
              <span className='flex items-center'>
                {t('home.hero.cta')}
                <ArrowRight className='ml-3 w-6 h-6 sm:w-7 sm:h-7 animate-pulse' />
              </span>
            </Button>
            <Button
              size='lg'
              variant='outline'
              className={`border-2 border-${THEME_CONFIG.colors.primary} text-${THEME_CONFIG.colors.primary} hover:bg-${THEME_CONFIG.colors.primary} hover:text-white text-xl sm:text-2xl px-10 sm:px-12 py-5 sm:py-6 rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/5`}
            >
              {t('home.hero.secondaryCta')}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className='flex flex-wrap justify-center items-center gap-8 text-sm sm:text-base text-gray-400'>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 bg-${THEME_CONFIG.colors.primary} rounded-full`}
              ></div>
              <span>{t('home.hero.trust.secure')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 bg-${THEME_CONFIG.colors.secondary} rounded-full`}
              ></div>
              <span>{t('home.hero.trust.licensed')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 bg-${THEME_CONFIG.colors.primary} rounded-full`}
              ></div>
              <span>{t('home.hero.trust.instant')}</span>
            </div>
          </div>
        </div>

        {/* Floating lottery numbers */}
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 text-6xl font-black text-white/10 animate-float'>
            7
          </div>
          <div className='absolute top-1/3 right-1/4 text-5xl font-black text-white/10 animate-float-delayed'>
            23
          </div>
          <div className='absolute bottom-1/4 left-1/3 text-7xl font-black text-white/10 animate-float'>
            15
          </div>
          <div className='absolute bottom-1/3 right-1/3 text-4xl font-black text-white/10 animate-float-delayed'>
            42
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`py-16 sm:py-20 px-4 bg-gradient-to-r from-${THEME_CONFIG.colors.background.dark} to-${THEME_CONFIG.colors.background.light}`}
      >
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10'>
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className='text-center p-6 sm:p-8 group'>
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                  </div>
                  <div className='text-3xl sm:text-4xl font-bold text-white mb-3 group-hover:text-[#FF5722] transition-colors duration-300'>
                    {stat.number}
                  </div>
                  <div className='text-base sm:text-lg text-gray-400'>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section - Inspired by lottery_2 */}
      <section
        className={`py-20 sm:py-24 px-4 ${THEME_CONFIG.colors.background.dark}`}
      >
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16 sm:mb-20'>
            <div className='text-sm sm:text-base text-gray-400 mb-3 uppercase tracking-wider font-medium'>
              [WORKING PROCESS]
            </div>
            <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8'>
              {t('home.howItWorks.title')}
            </h2>
            <p className='text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto'>
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10'>
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className='text-center group relative'>
                  {/* Step number */}
                  <div
                    className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {index + 1}
                  </div>

                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className='w-10 h-10 sm:w-12 sm:h-12 text-white' />
                  </div>
                  <h3 className='text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-[#FF5722] transition-colors duration-300'>
                    {step.title}
                  </h3>
                  <p className='text-base sm:text-lg text-gray-400 max-w-xs mx-auto leading-relaxed'>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Winners Section - Inspired by lottery_3 */}
      <section
        className={`py-20 sm:py-24 px-4 ${THEME_CONFIG.colors.background.dark}`}
      >
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16 sm:mb-20'>
            <div className='text-sm sm:text-base text-gray-400 mb-3 uppercase tracking-wider font-medium'>
              [OUR LATEST WINNERS]
            </div>
            <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8'>
              {t('home.winners.title')}
            </h2>
            <p className='text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto'>
              {t('home.winners.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10'>
            {WINNERS.map((winner, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-${THEME_CONFIG.colors.background.light} to-${THEME_CONFIG.colors.background.dark} p-6 sm:p-8 rounded-2xl border ${THEME_CONFIG.colors.border.primary}/20 hover:${THEME_CONFIG.colors.border.primary}/40 transition-all duration-300 hover:transform hover:scale-105 shadow-xl hover:shadow-2xl`}
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <span className='text-white font-bold text-2xl sm:text-3xl'>
                    {winner.name.charAt(0)}
                  </span>
                </div>
                <h3 className='text-xl sm:text-2xl font-bold text-white mb-4 text-center'>
                  {winner.name}
                </h3>
                <div className='space-y-3 text-sm sm:text-base text-gray-400'>
                  <p className='flex justify-between'>
                    <span>Draw:</span>
                    <span className='text-white'>{winner.date}</span>
                  </p>
                  <p className='flex justify-between'>
                    <span>Contest:</span>
                    <span className='text-white'>{winner.contest}</span>
                  </p>
                  <p className='flex justify-between'>
                    <span>Numbers:</span>
                    <span className='text-white'>{winner.numbers}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-20 sm:py-24 px-4 bg-gradient-to-r from-${THEME_CONFIG.colors.primary} to-${THEME_CONFIG.colors.secondary} relative overflow-hidden`}
      >
        {/* Background elements */}
        <div className='absolute inset-0'>
          <div className='absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
          <div className='absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl'></div>
        </div>

        <div className='max-w-5xl mx-auto text-center relative z-10'>
          <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 sm:mb-10'>
            {t('home.cta.title')}
          </h2>
          <p className='text-xl sm:text-2xl md:text-3xl text-white/90 mb-10 sm:mb-12 px-4 leading-relaxed'>
            {t('home.cta.subtitle')}
          </p>
          <Button
            size='lg'
            className='bg-white text-[#FF5722] hover:bg-gray-100 text-xl sm:text-2xl px-12 sm:px-16 py-6 sm:py-7 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105'
          >
            {t('home.cta.button')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 sm:py-16 px-4 ${THEME_CONFIG.colors.background.darker} border-t ${THEME_CONFIG.colors.border.primary}/20`}
      >
        <div className='max-w-6xl mx-auto text-center'>
          <div className='text-sm sm:text-base text-gray-400 mb-6'>
            [NO TICKET GOES UNREWARDED]
          </div>
          <p className='text-base sm:text-lg text-gray-400'>
            {t('home.footer.copyright')} © 2024 Lottery App.{' '}
            {t('home.footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}
