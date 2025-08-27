// HeroSection.jsx
import { Button } from '@/components/globals/Button';
import {
  ArrowRight,
  Gift,
  Play,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const HeroSection = ({ isDark }: { isDark: boolean }) => {
  const { t } = useTranslation();

  return (
    <section className='relative min-h-screen flex items-center overflow-hidden'>
      {/* Background Elements */}
      <div className='absolute inset-0 z-0'>
        <div
          className={`w-full h-full ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}
        ></div>

        {/* Floating geometric shapes */}
        <div
          className={`absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-pulse ${isDark ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-300 to-red-300'}`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-16 h-16 rounded-full opacity-30 animate-bounce ${isDark ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-red-300 to-orange-300'}`}
        ></div>
        <div
          className={`absolute bottom-40 left-20 w-24 h-24 rounded-full opacity-25 animate-pulse ${isDark ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-300 to-red-300'}`}
        ></div>

        {/* Grid pattern for dark theme */}
        {isDark && (
          <div className='absolute inset-0 opacity-5'>
            <div className='grid grid-cols-12 gap-4 h-full w-full'>
              {[...Array(144)].map((_, i) => (
                <div key={i} className='border border-orange-500/20'></div>
              ))}
            </div>
          </div>
        )}

        {/* Glow effects */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20' : 'bg-gradient-to-r from-orange-200/30 to-red-200/30'}`}
        ></div>
      </div>

      {/* Hero Content */}
      <div className='relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-20'>
          {/* Left Side - Content */}
          <div className='text-center lg:text-left space-y-8'>
            {/* Badge */}
            <div className='flex justify-center lg:justify-start mb-6'>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm ${isDark ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30' : 'bg-white/80 border-slate-200/50'}`}
              >
                <Star
                  className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
                />
                <span
                  className={`text-sm font-medium ${isDark ? 'text-orange-200' : 'text-slate-700'}`}
                >
                  {isDark
                    ? t('home.hero.badge.dark')
                    : t('home.hero.badge.light')}
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className='space-y-6'>
              <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight'>
                <span
                  className={`block mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {isDark
                    ? t('home.hero.heading.dark.line1')
                    : t('home.hero.heading.light.line1')}
                </span>
                {isDark && (
                  <span className='block text-white mb-2 italic'>
                    {t('home.hero.heading.dark.line2')}
                  </span>
                )}
                <span
                  className={`block animate-pulse ${isDark ? 'bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent'}`}
                >
                  {isDark
                    ? t('home.hero.heading.dark.line3')
                    : t('home.hero.heading.light.line2')}
                </span>
                {isDark && (
                  <>
                    <span className='block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent'>
                      {t('home.hero.heading.dark.line4')}
                    </span>
                    <span className='block text-white font-black'>
                      {t('home.hero.heading.dark.line5')}
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Description */}
            <div className='max-w-lg mx-auto lg:mx-0'>
              <p
                className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
              >
                {isDark
                  ? t('home.hero.description.dark')
                  : t('home.hero.description.light')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
              <Button
                className={`px-8 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'} text-white`}
              >
                <span className='flex items-center gap-2'>
                  {isDark
                    ? t('home.hero.buttons.primary.dark')
                    : t('home.hero.buttons.primary.light')}
                  <ArrowRight className='w-5 h-5' />
                </span>
              </Button>
              <Button
                variant='outline'
                className={`px-8 py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-300 ${isDark ? 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-orange-500'}`}
              >
                {isDark
                  ? t('home.hero.buttons.secondary.dark')
                  : t('home.hero.buttons.secondary.light')}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className='flex flex-wrap justify-center lg:justify-start gap-6 pt-20'>
              <div
                className={`flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              >
                <Shield className='w-5 h-5' />
                <span className='text-sm font-medium'>100% Safe & Secure</span>
              </div>
              <div
                className={`flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              >
                <Users className='w-5 h-5' />
                <span className='text-sm font-medium'>50K+ Players</span>
              </div>
              <div
                className={`flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
              >
                <Trophy className='w-5 h-5' />
                <span className='text-sm font-medium'>Licensed & Legal</span>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Elements */}
          <div className='relative hidden lg:block'>
            <div className='relative w-full h-[600px]'>
              {/* Main visual container matching reference image */}
              <div className='absolute inset-0 flex items-center justify-center'>
                {isDark ? (
                  /* Dark theme - Casino machine style */
                  <div
                    className={`w-96 h-96 rounded-full border-2 border-orange-500/30 flex items-center justify-center shadow-2xl relative overflow-hidden`}
                  >
                    <div className='w-80 h-80 rounded-full bg-gradient-to-br from-gray-800/50 to-black/50 backdrop-blur-xl flex items-center justify-center relative overflow-hidden'>
                      {/* Video Poker Badge */}
                      <div className='absolute top-12 left-12 bg-black/80 rounded-full px-4 py-2 border border-gray-600'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
                            <Play className='w-4 h-4 text-white' />
                          </div>
                          <div>
                            <div className='text-white text-sm font-bold'>
                              Video Poker
                            </div>
                            <div className='text-gray-400 text-xs'>
                              Any Game
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Central element */}
                      <div className='w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl'>
                        <Gift className='w-16 h-16 text-white' />
                      </div>

                      {/* Live Dealer Badge */}
                      <div className='absolute bottom-8 right-8 bg-orange-500 rounded-full px-4 py-2'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                          <span className='text-white text-sm font-bold'>
                            Live Dealer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Light theme - Match reference image style */
                  <div className='relative'>
                    {/* Main large circle - light gray/white */}
                    <div className='w-96 h-96 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl flex items-center justify-center relative overflow-hidden border border-gray-200/50'>
                      {/* Inner circle with glassmorphism effect */}
                      <div className='w-80 h-80 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center relative shadow-inner border border-white/30'>
                        {/* Video Poker Badge - top left */}
                        <div className='absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-gray-200/50'>
                          <div className='flex items-center gap-2'>
                            <div className='w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center'>
                              <Play className='w-3 h-3 text-white' />
                            </div>
                            <div>
                              <div className='text-gray-800 text-xs font-semibold'>
                                Video Poker
                              </div>
                              <div className='text-gray-500 text-xs'>
                                Any Game
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Casino Gambling badge - top right */}
                        <div className='absolute top-6 right-8 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200/50'>
                          <div className='text-center'>
                            <div className='text-gray-800 text-xs font-bold'>
                              CASINO
                            </div>
                            <div className='text-gray-800 text-xs font-bold'>
                              GAMBLING
                            </div>
                            <div className='text-gray-500 text-xs'>More →</div>
                          </div>
                        </div>

                        {/* Central 3D gambling elements */}
                        <div className='relative w-48 h-48 flex items-center justify-center'>
                          {/* Playing cards */}
                          <div className='absolute top-4 left-8 w-12 h-16 bg-white rounded-lg shadow-xl border border-gray-200 transform rotate-12'>
                            <div className='p-2 text-xs font-bold text-gray-800'>
                              ♠
                            </div>
                          </div>
                          <div className='absolute top-8 left-12 w-12 h-16 bg-white rounded-lg shadow-xl border border-gray-200 transform -rotate-6'>
                            <div className='p-2 text-xs font-bold text-red-500'>
                              ♥
                            </div>
                          </div>

                          {/* Dice */}
                          <div className='absolute bottom-8 right-8 w-10 h-10 bg-white rounded-md shadow-xl border border-gray-200 transform rotate-45'>
                            <div className='flex items-center justify-center h-full'>
                              <div className='w-2 h-2 bg-gray-800 rounded-full'></div>
                            </div>
                          </div>

                          {/* Central gift/jackpot element */}
                          <div className='w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl'>
                            <Gift className='w-10 h-10 text-white' />
                          </div>

                          {/* Phone/mobile element */}
                          <div className='absolute bottom-0 right-4 w-16 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-xl transform rotate-12 flex items-center justify-center'>
                            <div className='w-12 h-16 bg-white/20 rounded-lg'></div>
                          </div>
                        </div>

                        {/* Live Dealer Badge - bottom */}
                        <div className='absolute bottom-6 right-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full px-4 py-2 shadow-lg'>
                          <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                            <span className='text-white text-sm font-bold'>
                              Live Dealer
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating casino elements */}
                    <div className='absolute top-16 right-16 w-16 h-20 bg-white rounded-xl shadow-xl border border-gray-200/50 transform rotate-12'>
                      <div className='p-2'>
                        <div className='w-12 h-8 bg-gradient-to-br from-orange-300 to-red-400 rounded'></div>
                        <div className='mt-1 text-xs text-gray-600 font-semibold text-center'>
                          SLOT
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating lottery numbers */}
              <div className='absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg animate-bounce'>
                7
              </div>
              <div className='absolute top-20 right-16 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg animate-pulse'>
                23
              </div>
              <div className='absolute bottom-20 left-16 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg animate-bounce'>
                15
              </div>
              <div className='absolute bottom-10 right-20 w-18 h-18 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse'>
                42
              </div>

              {/* Sparkle effects */}
              <div className='absolute top-1/4 left-1/4'>
                <Sparkles className='w-6 h-6 text-yellow-400 animate-ping' />
              </div>
              <div className='absolute top-1/3 right-1/4'>
                <Sparkles className='w-5 h-5 text-blue-400 animate-pulse' />
              </div>
              <div className='absolute bottom-1/3 left-1/3'>
                <Sparkles className='w-4 h-4 text-green-400 animate-bounce' />
              </div>
              <div className='absolute bottom-1/4 right-1/3'>
                <Sparkles className='w-5 h-5 text-purple-400 animate-ping' />
              </div>

              {/* Additional casino elements for dark theme */}
              {isDark && (
                <>
                  <div className='absolute top-1/4 -left-8 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700'>
                    <div className='text-orange-400 text-2xl font-bold'>
                      97.5%
                    </div>
                    <div className='text-gray-400 text-xs'>Win Rate</div>
                  </div>
                  <div className='absolute bottom-20 left-0 w-20 h-12 bg-red-500 rounded-lg flex items-center justify-center'>
                    <span className='text-white font-bold text-sm'>CASINO</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
