'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const PerformanceMonitor = () => {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || hasInitialized.current) return;

    const getRating = (value: number, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' => {
      return value <= thresholds[0] ? 'good' : value <= thresholds[1] ? 'needs-improvement' : 'poor';
    };

    const sendToAnalytics = (metric: PerformanceMetric) => {
      //Todo: Send to Google Analytics if available
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'web_vital', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: { metric_rating: metric.rating }
        });
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
        console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
      }
    };

    // Basic performance metrics without web-vitals dependency
    const measureBasicMetrics = () => {
      if (performance.timing) {
        const timing = performance.timing;

        // Load Time
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        if (loadTime > 0) {
          sendToAnalytics({
            name: 'Load Time',
            value: loadTime,
            rating: getRating(loadTime, [2500, 4000])
          });
        }

        // DOM Ready
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        if (domReady > 0) {
          sendToAnalytics({
            name: 'DOM Ready',
            value: domReady,
            rating: getRating(domReady, [1500, 2500])
          });
        }

        // Time to First Byte
        const ttfb = timing.responseStart - timing.navigationStart;
        if (ttfb > 0) {
          sendToAnalytics({
            name: 'TTFB',
            value: ttfb,
            rating: getRating(ttfb, [600, 1500])
          });
        }
      }

      // Mobile-specific metrics
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && process.env.NODE_ENV === 'development') {
          console.log('📱 Connection:', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink + 'Mbps',
            rtt: connection.rtt + 'ms',
            saveData: connection.saveData ? 'enabled' : 'disabled'
          });
        }
      }

      hasInitialized.current = true;
    };

    // Wait for page load to measure
    if (document.readyState === 'complete') {
      measureBasicMetrics();
    } else {
      window.addEventListener('load', measureBasicMetrics, { once: true });
    }

    return () => {
      window.removeEventListener('load', measureBasicMetrics);
    };
  }, []);

  // Monitor memory usage for mobile optimization
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          const used = (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2);
          const total = (memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2);

          console.log(`💾 Memory: ${used}MB / ${total}MB`);

          // Warn if memory usage is high for mobile
          if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
            console.warn('⚠️ High memory usage detected - optimize for mobile devices');
          }
        }
      };

      // Initial memory check
      setTimeout(logMemoryUsage, 3000);

      // Periodic checks
      const memoryInterval = setInterval(logMemoryUsage, 30000);

      return () => clearInterval(memoryInterval);
    }
  }, []);

  return null;
};

export default PerformanceMonitor;