'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { useIntersectionObserver } from './IntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  fallbackSrc?: string;
  lazy?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg',
  lazy = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
    initialIsIntersecting: priority, // Load immediately if priority
  }) as { ref: React.RefObject<HTMLDivElement>; isIntersecting: boolean };

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setHasError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false); // Reset error state for fallback
    }
    onError?.(error);
  }, [imageSrc, fallbackSrc, onError]);

  // Generate blur data URL if not provided
  const getBlurDataURL = (src: string) => {
    if (blurDataURL) return blurDataURL;
    
    // Create a simple base64 blur placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoC4HYuxlVmN5cWAjIWC+lsn1pQJgFhJ3r4IvG7YUE8vvn6WBJGCV9MCHdyDzgHnv1rUZQV+XhO4VbZsGXZJJIHGYvS8vGTnvPW9SPJyxNE8YzKjHmHf8AFOiDcH+KVt3oEPBfM9OQhFdAOqAqzOhJ7R+w+VZPyGsW9P6fKzA=';
  };

  // Don't render the image until it's in view (unless priority)
  const shouldRender = !lazy || priority || isIntersecting;

  if (!shouldRender) {
    return (
      <div
        ref={intersectionRef}
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        style={fill ? undefined : { width, height }}
      />
    );
  }

  return (
    <div
      ref={intersectionRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? undefined : { width, height }}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Error fallback */}
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-2xl opacity-50">🖼️</div>
        </div>
      )}

      {/* Optimized Next.js Image */}
      {!hasError && (
        <Image
          ref={imageRef}
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? getBlurDataURL(imageSrc) : undefined}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 2 }}
          onLoad={handleLoad}
          onError={handleError}
          // Performance optimizations
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};

export default OptimizedImage;