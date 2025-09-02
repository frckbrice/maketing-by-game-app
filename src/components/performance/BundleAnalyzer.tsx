'use client';

import { useEffect } from 'react';

interface BundleMetrics {
  componentName: string;
  loadTime: number;
  bundleSize?: number;
  renderTime: number;
  memoryUsage?: number;
}

const BundleAnalyzer = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    const analyzeBundle = () => {
      // Analyze loaded scripts
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

      let totalScriptSize = 0;
      let totalStyleSize = 0;

      // Estimate bundle sizes based on script tags (approximate)
      scripts.forEach((script: Element) => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('/_next/static/')) {
          // Rough estimation for Next.js chunks
          totalScriptSize += src.includes('main') ? 200 : 50; // KB estimates
        }
      });

      styles.forEach(() => {
        totalStyleSize += 30; // Rough CSS size estimate
      });

      // Log bundle analysis
      console.group('📦 Bundle Analysis');
      console.log(`Total estimated JS: ${totalScriptSize}KB`);
      console.log(`Total estimated CSS: ${totalStyleSize}KB`);
      console.log(`Scripts loaded: ${scripts.length}`);
      console.log(`Stylesheets loaded: ${styles.length}`);

      // Performance timing
      if (performance.timing) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        const ttfb = timing.responseStart - timing.navigationStart;

        console.log(`Load time: ${loadTime}ms`);
        console.log(`DOM ready: ${domReady}ms`);
        console.log(`TTFB: ${ttfb}ms`);
      }

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log(`Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Memory limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
      }

      console.groupEnd();

      //TODO: Send to analytics in production
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'bundle_metrics', {
          event_category: 'Performance',
          estimated_js_size: totalScriptSize,
          estimated_css_size: totalStyleSize,
          script_count: scripts.length,
          style_count: styles.length,
        });
      }
    };

    // Analyze after page load
    if (document.readyState === 'complete') {
      setTimeout(analyzeBundle, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(analyzeBundle, 1000);
      });
    }

    // Monitor route changes for SPA behavior
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(analyzeBundle, 500); // Re-analyze after route change
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setTimeout(analyzeBundle, 500);
    };

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
};

export default BundleAnalyzer;