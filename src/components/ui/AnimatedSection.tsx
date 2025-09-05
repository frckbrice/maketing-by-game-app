'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn';
}

const animationClasses = {
  fadeInUp: 'translate-y-12 opacity-0',
  fadeInLeft: '-translate-x-12 opacity-0',
  fadeInRight: 'translate-x-12 opacity-0',
  fadeIn: 'opacity-0',
};

const visibleClasses = {
  fadeInUp: 'translate-y-0 opacity-100',
  fadeInLeft: 'translate-x-0 opacity-100',
  fadeInRight: 'translate-x-0 opacity-100',
  fadeIn: 'opacity-100',
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  delay = 0,
  animation = 'fadeInUp',
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-800 ease-out',
        animationClasses[animation],
        isVisible && visibleClasses[animation],
        className
      )}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
};
