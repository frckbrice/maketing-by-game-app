'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'scaleIn';
}

const animationClasses = {
  fadeInUp: 'translate-y-8 opacity-0',
  fadeInLeft: '-translate-x-8 opacity-0',
  fadeInRight: 'translate-x-8 opacity-0',
  fadeIn: 'opacity-0',
  scaleIn: 'scale-95 opacity-0',
};

const visibleClasses = {
  fadeInUp: 'translate-y-0 opacity-100',
  fadeInLeft: 'translate-x-0 opacity-100',
  fadeInRight: 'translate-x-0 opacity-100',
  fadeIn: 'opacity-100',
  scaleIn: 'scale-100 opacity-100',
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  animation = 'fadeInUp',
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        animationClasses[animation],
        isVisible && visibleClasses[animation],
        className
      )}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
      }}
    >
      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};