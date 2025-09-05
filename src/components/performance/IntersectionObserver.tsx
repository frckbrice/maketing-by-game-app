'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  freezeOnceVisible = false,
  initialIsIntersecting = false,
}: UseIntersectionObserverOptions = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const targetRef = useRef<HTMLDivElement>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = targetRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, rootMargin };
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);
    }, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, rootMargin, frozen]);

  return {
    ref: targetRef,
    entry,
    isIntersecting,
  };
};

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = (
    <div className='w-full h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded' />
  ),
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  );
};
