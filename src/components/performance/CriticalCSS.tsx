'use client';

import { useEffect } from 'react';

interface CriticalCSSProps {
  styles: string;
  id?: string;
}

const CriticalCSS = ({ styles, id = 'critical-css' }: CriticalCSSProps) => {
  useEffect(() => {
    if (typeof window === 'undefined') return; // no need on server

    // Check if critical CSS is already loaded
    if (document.getElementById(id)) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = id;
    styleSheet.textContent = styles;

    // Insert critical CSS at the beginning of head
    document.head.insertBefore(styleSheet, document.head.firstChild);

    return () => {
      const existingSheet = document.getElementById(id);
      if (existingSheet) {
        existingSheet.remove();
      }
    };
  }, [styles, id]);

  return null;
};

// Common critical styles for above-the-fold content
export const criticalStyles = `
  /* Critical styles for above-the-fold content */
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  .dark .loading-skeleton {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Critical layout styles */
  .container-critical {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  @media (min-width: 768px) {
    .container-critical {
      padding: 0 2rem;
    }
  }
  
  /* Critical button styles */
  .btn-critical {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    text-decoration: none;
  }
  
  .btn-critical:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-primary-critical {
    background-color: #7c3aed;
    color: white;
  }
  
  .btn-primary-critical:hover:not(:disabled) {
    background-color: #6d28d9;
    transform: translateY(-1px);
  }
  
  /* Critical text styles */
  .text-critical {
    color: #1f2937;
  }
  
  .dark .text-critical {
    color: #f9fafb;
  }
  
  /* Critical grid styles */
  .grid-critical {
    display: grid;
    gap: 1rem;
  }
  
  .grid-cols-1-critical {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  @media (min-width: 640px) {
    .grid-cols-2-critical {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 768px) {
    .grid-cols-3-critical {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .grid-cols-4-critical {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  
  /* Critical card styles */
  .card-critical {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }
  
  .dark .card-critical {
    background: #1f2937;
    border-color: #374151;
  }
  
  .card-critical:hover {
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  /* Critical loading states */
  .loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #7c3aed;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Reduce layout shift */
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  /* Critical responsive utilities */
  .hidden-mobile {
    display: none;
  }
  
  @media (min-width: 640px) {
    .hidden-mobile {
      display: block;
    }
  }
  
  .mobile-only {
    display: block;
  }
  
  @media (min-width: 640px) {
    .mobile-only {
      display: none;
    }
  }
`;

export default CriticalCSS;
