import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = React.memo<LazyImageProps>(
  ({
    src,
    alt,
    width,
    height,
    fill,
    className = '',
    sizes,
    priority = false,
    placeholder = 'empty',
    blurDataURL,
    onLoad,
    onError,
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px', // Start loading 50px before the image comes into view
          threshold: 0.1,
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={fill ? undefined : { width, height }}
      >
        {/* Loading skeleton */}
        {!isLoaded && !hasError && (
          <div className='absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse' />
        )}

        {/* Error fallback */}
        {hasError && (
          <div className='absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
            <div className='text-4xl opacity-50'>📷</div>
          </div>
        )}

        {/* Actual image - only render when in view or priority */}
        {(isInView || priority) && !hasError && (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            sizes={sizes}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    );
  }
);

LazyImage.displayName = 'LazyImage';

export default LazyImage;
