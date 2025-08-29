'use client';

import { GameCategory } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='relative mb-8'>
      {/* Scroll Buttons */}
      <button
        onClick={() => scrollTabs('left')}
        className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700'
        aria-label='Scroll categories left'
      >
        <ChevronLeft className='w-6 h-6 text-gray-600 dark:text-gray-300' />
      </button>

      <button
        onClick={() => scrollTabs('right')}
        className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700'
        aria-label='Scroll categories right'
      >
        <ChevronRight className='w-6 h-6 text-gray-600 dark:text-gray-300' />
      </button>

      {/* Categories Carousel */}
      <div
        ref={scrollRef}
        className='flex overflow-x-auto scrollbar-hide space-x-4 px-12 py-4'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(category => {
          const isSelected = selectedCategory === category.id;
          const count = gamesCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 group relative overflow-hidden rounded-2xl transition-all duration-300 min-w-[120px] max-w-[140px] ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl transform scale-105 ring-4 ring-orange-200 dark:ring-orange-800'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-102 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
              }`}
              role='tab'
              aria-selected={isSelected}
              aria-controls={`category-${category.id}-panel`}
            >
              {/* Background Pattern */}
              <div
                className={`absolute inset-0 opacity-5 ${
                  isSelected ? 'bg-white' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div
                  className='absolute inset-0'
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              <div className='relative p-3 text-center w-24 h-12'>
                {/* Icon Container */}
                <div className='relative mb-3'>
                  <div
                    className={` mx-auto rounded-full flex items-center animate-bounce-gentle justify-center w-16 h-16 transition-all duration-300 ${
                      isSelected
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {/* Handle both emoji and image icons */}
                    {category.icon.startsWith('http') ||
                    category.icon.startsWith('/') ? (
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={32}
                        height={32}
                        className='w-16 h-16 object-contain'
                      />
                    ) : (
                      <span
                        className={`text-2xl ${
                          isSelected
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {category.icon}
                      </span>
                    )}
                  </div>
                  {category.name}
                  {/* Icon glow effect for selected */}
                  {isSelected && (
                    <div className='absolute inset-0 w-16 h-16 mx-auto rounded-full bg-white/30 blur-xl animate-pulse' />
                  )}
                </div>

                {/* Category Name */}
                <div
                  className={`font-bold text-sm mb-2 line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {category.name}
                </div>

                {/* Games Count */}
                <div
                  className={`text-xs font-medium ${
                    isSelected
                      ? 'text-white/90'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count} {count === 1 ? 'game' : 'games'}
                </div>

                {/* Active Indicator */}
                {isSelected && (
                  <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2'>
                    <div className='w-2 h-2 bg-white rounded-full shadow-lg animate-pulse' />
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                  isSelected
                    ? 'from-white to-white'
                    : 'from-orange-500 to-red-500'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Category Description */}
      {selectedCategory !== 'all' && (
        <div className='mt-6 text-center'>
          <div className='inline-block bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl px-6 py-4 border border-orange-200 dark:border-orange-800'>
            <p className='text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-sm leading-relaxed'>
              {categories.find(c => c.id === selectedCategory)?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
