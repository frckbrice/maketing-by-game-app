import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName?: string;
}

export const usePerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  
  // Mark render start
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // Mark render end and log metrics
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    renderCount.current += 1;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    // Track performance metrics for monitoring
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_render', {
        event_category: 'performance',
        event_label: componentName,
        value: Math.round(renderTime),
      });
    }
  });

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} - ${operationName}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, [componentName]);

  const measureSync = useCallback(<T>(
    operation: () => T,
    operationName: string
  ): T => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} - ${operationName}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, [componentName]);

  return {
    measureAsync,
    measureSync,
    renderCount: renderCount.current,
  };
};

// Hook for measuring Web Vitals
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Measure FCP, LCP, CLS, FID, TTFB
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);
};

// Hook for measuring component bundle size impact
export const useBundleSize = (componentName: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Estimate component impact on bundle
      const start = (performance as any).memory?.usedJSHeapSize;
      
      return () => {
        const end = (performance as any).memory?.usedJSHeapSize;
        if (start && end) {
          const delta = end - start;
          console.log(`📦 ${componentName} memory impact: ${(delta / 1024).toFixed(2)}KB`);
        }
      };
    }
  }, [componentName]);
};