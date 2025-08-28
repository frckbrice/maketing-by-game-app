'use client';

import { GameCategory } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
        className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-shadow'
        aria-label='Scroll categories left'
      >
        <ChevronLeft className='w-5 h-5 text-gray-600 dark:text-gray-300' />
      </button>

      <button
        onClick={() => scrollTabs('right')}
        className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-shadow'
        aria-label='Scroll categories right'
      >
        <ChevronRight className='w-5 h-5 text-gray-600 dark:text-gray-300' />
      </button>

      {/* Categories Carousel */}
      <div
        ref={scrollRef}
        className='flex overflow-x-auto scrollbar-hide space-x-4 px-12 py-2'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(category => {
          const isSelected = selectedCategory === category.id;
          const count = gamesCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 group relative overflow-hidden rounded-2xl transition-all duration-300 min-w-[160px] ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-102 border border-gray-200 dark:border-gray-700'
              }`}
              role='tab'
              aria-selected={isSelected}
              aria-controls={`category-${category.id}-panel`}
            >
              {/* Background Pattern */}
              <div
                className={`absolute inset-0 opacity-10 ${
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

              <div className='relative p-6 text-center'>
                {/* Icon */}
                <div
                  className={`text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 ${
                    isSelected ? 'animate-bounce' : ''
                  }`}
                >
                  {category.icon}
                </div>

                {/* Category Name */}
                <div
                  className={`font-bold text-sm mb-2 ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {category.name}
                </div>

                {/* Games Count */}
                <div
                  className={`text-xs ${
                    isSelected
                      ? 'text-white/80'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count} {count === 1 ? 'game' : 'games'}
                </div>

                {/* Active Indicator */}
                {isSelected && (
                  <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
                    <div className='w-3 h-3 bg-white rounded-full shadow-lg animate-pulse' />
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
          <p className='text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            {categories.find(c => c.id === selectedCategory)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
