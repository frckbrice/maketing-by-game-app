'use client';

import { GameCategory } from '@/types';
import { ChevronLeft, ChevronRight, Zap, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface CategoryTabsProps {
  categories: GameCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  gamesCounts: Record<string, number>;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
  gamesCounts,
}: CategoryTabsProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div className='relative mb-10'>
      {/* Lightning Background Effect */}
      <div className='absolute inset-0 -z-10 overflow-hidden rounded-3xl'>
        <div className='absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-bl from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-500' />
      </div>

      {/* Header with Lightning Effect */}
      <div className='text-center mb-6'>
        <div className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full border border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm'>
          <Sparkles className='w-5 h-5 text-orange-500 animate-pulse' />
          <span className='font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
            {t('categories.exploreCategories')}
          </span>
          <Zap className='w-5 h-5 text-red-500 animate-bounce' />
        </div>
      </div>

      {/* Enhanced Scroll Buttons */}
      <button
        onClick={() => scrollTabs('left')}
        className='absolute left-2 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl hover:shadow-orange-500/25 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-orange-200/30 dark:border-orange-700/30 group backdrop-blur-sm'
        aria-label={t('categories.scrollLeft')}
      >
        <ChevronLeft className='w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 transition-colors' />
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm' />
      </button>

      <button
        onClick={() => scrollTabs('right')}
        className='absolute right-2 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl hover:shadow-orange-500/25 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-orange-200/30 dark:border-orange-700/30 group backdrop-blur-sm'
        aria-label={t('categories.scrollRight')}
      >
        <ChevronRight className='w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 transition-colors' />
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm' />
      </button>

      {/* Categories Carousel */}
      <div
        ref={scrollRef}
        className='flex overflow-x-auto scrollbar-hide space-x-6 px-20 py-6'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(category => {
          const isSelected = selectedCategory === category.id;
          const count = gamesCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 group relative overflow-hidden rounded-3xl transition-all duration-500 ease-out min-w-[160px] max-w-[180px] h-[180px] ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white shadow-2xl shadow-orange-500/30 transform scale-110 ring-4 ring-orange-300/50 dark:ring-orange-600/50'
                  : 'bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800 dark:to-gray-900/80 text-gray-700 dark:text-gray-300 hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300/70 dark:hover:border-orange-600/70 backdrop-blur-sm'
              }`}
              role='tab'
              aria-selected={isSelected}
              aria-controls={`category-${category.id}-panel`}
            >
              {/* Lightning Background Pattern */}
              <div className={`absolute inset-0 ${isSelected ? 'opacity-20' : 'opacity-5'}`}>
                <div
                  className='absolute inset-0'
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23${isSelected ? 'ffffff' : '000000'}' stroke-width='2' opacity='${isSelected ? '0.3' : '0.1'}'%3E%3Cpath d='M20 10 L30 25 L25 25 L35 45 L25 30 L30 30 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '40px 40px',
                  }}
                />
              </div>

              {/* Animated lightning bolts for selected state */}
              {isSelected && (
                <>
                  <div className='absolute top-2 right-2 w-4 h-4'>
                    <Zap className='w-4 h-4 text-yellow-300 animate-pulse' />
                  </div>
                  <div className='absolute bottom-2 left-2 w-3 h-3'>
                    <Sparkles className='w-3 h-3 text-yellow-200 animate-bounce delay-300' />
                  </div>
                  <div className='absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping' />
                </>
              )}

              {/* Glowing orb background for selected */}
              {isSelected && (
                <div className='absolute inset-0'>
                  <div className='absolute top-1/4 left-1/3 w-20 h-20 bg-yellow-400/20 rounded-full blur-3xl animate-pulse' />
                  <div className='absolute bottom-1/3 right-1/4 w-16 h-16 bg-orange-400/20 rounded-full blur-2xl animate-pulse delay-1000' />
                </div>
              )}

              <div className='relative p-4 text-center h-full flex flex-col justify-between'>
                {/* Icon Container */}
                <div className='relative mb-4'>
                  <div
                    className={`mx-auto rounded-2xl flex items-center justify-center w-20 h-20 transition-all duration-500 ${
                      isSelected
                        ? 'bg-white/25 backdrop-blur-md shadow-lg shadow-white/25 border border-white/30'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 group-hover:shadow-lg group-hover:scale-105 border border-gray-200/50 dark:border-gray-600/50'
                    }`}
                  >
                    {/* Handle both emoji and image icons */}
                    {category.icon && typeof category.icon === 'string' && (category.icon.startsWith('http') ||
                      category.icon.startsWith('/')) ? (
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={40}
                        height={40}
                        className={`w-10 h-10 object-contain transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                      />
                    ) : (
                      <span
                        className={`text-3xl transition-all duration-300 ${
                          isSelected
                            ? 'text-white drop-shadow-lg scale-110'
                            : 'text-gray-600 dark:text-gray-400 group-hover:text-orange-500 group-hover:scale-105'
                        }`}
                      >
                          {category.icon || '🎯'}
                      </span>
                    )}
                  </div>
                  
                  {/* Icon glow effect for selected */}
                  {isSelected && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='w-24 h-24 rounded-full bg-white/20 blur-2xl animate-pulse' />
                      <div className='absolute w-16 h-16 rounded-full bg-yellow-300/30 blur-xl animate-pulse delay-500' />
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <div className='flex-1'>
                  <h3
                    className={`font-bold text-base mb-3 line-clamp-2 transition-colors duration-300 ${
                      isSelected 
                        ? 'text-white drop-shadow-md' 
                        : 'text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
                    }`}
                  >
                    {category.name}
                  </h3>

                  {/* Games Count */}
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-white/20 text-white/95 backdrop-blur-sm border border-white/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-orange-50 group-hover:text-orange-700 dark:group-hover:bg-orange-900/30 dark:group-hover:text-orange-300'
                    }`}
                  >
                    <span className='w-2 h-2 rounded-full bg-current opacity-60' />
                    {count} {count === 1 ? t('categories.game') : t('categories.games')}
                  </div>
                </div>

                {/* Active Indicator */}
                {isSelected && (
                  <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2'>
                    <div className='flex space-x-1'>
                      <div className='w-2 h-2 bg-white rounded-full shadow-lg animate-bounce' />
                      <div className='w-2 h-2 bg-yellow-300 rounded-full shadow-lg animate-bounce delay-150' />
                      <div className='w-2 h-2 bg-white rounded-full shadow-lg animate-bounce delay-300' />
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Hover Effect */}
              <div
                className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                  isSelected
                    ? 'bg-gradient-to-br from-white/10 via-transparent to-yellow-300/10'
                    : 'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10'
                }`}
              />

              {/* Lightning flash effect on hover */}
              {!isSelected && (
                <div className='absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300'>
                  <div className='absolute top-4 left-4 w-1 h-8 bg-gradient-to-b from-orange-400 to-transparent skew-x-12 animate-pulse' />
                  <div className='absolute bottom-6 right-6 w-1 h-6 bg-gradient-to-t from-red-400 to-transparent -skew-x-12 animate-pulse delay-200' />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Enhanced Category Description */}
      {selectedCategory !== 'all' && (
        <div className='mt-8 text-center relative'>
          <div className='relative inline-block'>
            {/* Lightning background effect */}
            <div className='absolute -inset-2 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-50' />
            
            <div className='relative bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-md rounded-2xl px-8 py-6 border border-orange-200/50 dark:border-orange-700/50 shadow-xl shadow-orange-500/10'>
              {/* Lightning decorations */}
              <div className='absolute top-2 left-4 w-6 h-6'>
                <Zap className='w-4 h-4 text-orange-400 opacity-60 animate-pulse' />
              </div>
              <div className='absolute bottom-2 right-4 w-6 h-6'>
                <Sparkles className='w-4 h-4 text-red-400 opacity-60 animate-pulse delay-1000' />
              </div>
              
              <p className='text-gray-800 dark:text-gray-200 max-w-2xl mx-auto text-base leading-relaxed font-medium'>
                {categories.find(c => c.id === selectedCategory)?.description}
              </p>
              
              {/* Subtle lightning pattern overlay */}
              <div className='absolute inset-0 opacity-5'>
                <div
                  className='absolute inset-0 rounded-2xl'
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f97316' stroke-width='1' opacity='0.2'%3E%3Cpath d='M15 8 L20 18 L18 18 L23 30 L18 20 L20 20 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '30px 30px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
