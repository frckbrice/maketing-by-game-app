'use client';

import { Button } from '@/components/ui/Button';
import { DollarSign, Target, Trophy, Zap } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

type Prize = {
  name: string;
  value: number;
  currency: string;
  image: string;
  products: string[];
};

export const HowItWorksSection = ({ isDark }: { isDark: boolean }) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage ?? i18n.language ?? 'en').split('-')[0];

  // …rest of component
  const steps = [
    {
      icon: Target,
      title: t('home.howItWorks.steps.step1.title'),
      description: t('home.howItWorks.steps.step1.description'),
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Zap,
      title: t('home.howItWorks.steps.step2.title'),
      description: t('home.howItWorks.steps.step2.description'),
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: DollarSign,
      title: t('home.howItWorks.steps.step3.title'),
      description: t('home.howItWorks.steps.step3.description'),
      color: 'from-green-500 to-blue-500',
    },
    {
      icon: Trophy,
      title: t('home.howItWorks.steps.step4.title'),
      description: t('home.howItWorks.steps.step4.description'),
      color: 'from-purple-500 to-pink-500',
    },
  ];
  const prizes: Prize[] = [
    {
      name: t('home.howItWorks.products.prizes.techBundle.name'),
      value: 1500,
      currency: 'USD',
      image: 'iphone15promax.webp',
      products: t('home.howItWorks.products.prizes.techBundle.products', {
        returnObjects: true,
      }) as string[],
    },
    {
      name: t('home.howItWorks.products.prizes.fashionPack.name'),
      value: 800,
      currency: 'USD',
      image: 'nikeAirMax.webp',
      products: t('home.howItWorks.products.prizes.fashionPack.products', {
        returnObjects: true,
      }) as string[],
    },
    {
      name: t('home.howItWorks.products.prizes.homeSetup.name'),
      value: 1200,
      currency: 'USD',
      image: 'refrigerator.jpeg',
      products: t('home.howItWorks.products.prizes.homeSetup.products', {
        returnObjects: true,
      }) as string[],
    },
  ];

  return (
    <section
      id='how-it-works'
      className={`py-20 ${
        isDark
          ? 'bg-gradient-to-b from-black to-gray-900'
          : 'bg-gradient-to-b from-gray-100 via-white to-gray-50'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div
            className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold mb-4 ${
              isDark
                ? 'border-orange-500/30 text-orange-400 bg-orange-500/5'
                : 'border-orange-300/50 text-orange-600 bg-orange-100/30'
            }`}
          >
            {isDark ? 'WINNING PROCESS' : 'HOW IT WORKS'}
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('home.howItWorks.title')}
          </h2>
          <p
            className={`text-lg max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-700'} leading-relaxed`}
          >
            {t('home.howItWorks.description.light')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20'>
          {steps.map((step, index) => (
            <div key={index} className='text-center group relative'>
              {/* Step Number */}
              <div className='absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10'>
                {index + 1}
              </div>

              {/* Icon Container */}
              <div
                className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 relative ${isDark ? `rounded-2xl bg-gradient-to-r ${step.color}` : `rounded-full bg-slate-700 group-hover:bg-orange-500`}`}
              >
                <step.icon
                  className={`w-10 h-10 ${isDark ? 'text-white' : 'text-orange-400 group-hover:text-white'} transition-colors duration-300`}
                />

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl ${isDark ? `bg-gradient-to-r ${step.color}` : 'bg-orange-500'} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                ></div>
              </div>

              {/* Content */}
              <div className='space-y-3'>
                <h3
                  className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white group-hover:text-orange-300' : 'text-gray-900 group-hover:text-orange-600'}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed px-2 ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-700 group-hover:text-gray-800'} transition-colors duration-300`}
                >
                  {step.description}
                </p>
              </div>

              {/* Connection Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className='hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-transparent'></div>
              )}
            </div>
          ))}
        </div>

        {/* Prize Showcase - For both themes */}
        <div className='text-center mb-12'>
          <div
            className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold mb-4 ${
              isDark
                ? 'border-orange-500/30 text-orange-400 bg-orange-500/5'
                : 'border-orange-300/50 text-orange-600 bg-orange-100/30'
            }`}
          >
            {isDark ? '[ WIN AMAZING PRODUCTS! ]' : '🏆 WIN AMAZING PRODUCTS!'}
          </div>
          <h3
            className={`text-3xl lg:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {t('home.howItWorks.products.title')}
          </h3>
          <p
            className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-700'}`}
          >
            {t('home.howItWorks.products.subtitle')}
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {prizes.map((prize, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 border transition-all duration-300 group hover:shadow-2xl hover:shadow-orange-500/10 relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/50'
                  : 'bg-white border-gray-200 hover:border-orange-300/50'
              }`}
            >
              {/* Background Pattern */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100'
                    : 'bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100'
                }`}
              ></div>

              <div className='text-center relative z-10'>
                {/* Prize Icon */}
                <div className='text-6xl mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <Image
                    src={`/${locale}/images/${prize.image}`}
                    alt={prize.name}
                    width={100}
                    height={100}
                    className='rounded-2xl w-full h-full object-cover'
                    sizes='(min-width: 1024px) 200px, 33vw'
                  />
                </div>

                {/* Prize Details */}
                <h4
                  className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    isDark
                      ? 'text-white group-hover:text-orange-300'
                      : 'text-gray-900 group-hover:text-orange-600'
                  }`}
                >
                  {prize.name}
                </h4>
                <div className='text-lg font-bold text-orange-500 mb-4 group-hover:text-orange-400 transition-colors duration-300'>
                  ${prize.value.toLocaleString()}
                </div>

                {/* Product List */}
                <div
                  className={`space-y-1 mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {prize.products.map((product, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-center gap-1'
                    >
                      <span className='w-1 h-1 bg-green-400 rounded-full'></span>
                      <span
                        className={isDark ? 'text-gray-400' : 'text-gray-600'}
                      >
                        {product}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                  {t('home.howItWorks.products.cta')}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center mt-12'>
          <p
            className={`mb-6 text-lg ${isDark ? 'text-gray-400' : 'text-gray-700'}`}
          >
            {t('home.howItWorks.products.bottomCta')}
          </p>
          <Button className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300'>
            {t('home.howItWorks.products.startPlaying')}
          </Button>
        </div>
      </div>
    </section>
  );
};
