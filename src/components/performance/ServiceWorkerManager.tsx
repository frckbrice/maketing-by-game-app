'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

interface ServiceWorkerManagerProps {
  enableNotifications?: boolean;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

const ServiceWorkerManager = ({
  enableNotifications = true,
  onUpdate,
}: ServiceWorkerManagerProps) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              if (enableNotifications) {
                toast.info(
                  'App update available. Refresh to use the latest version.',
                  {
                    action: {
                      label: 'Refresh',
                      onClick: () => window.location.reload(),
                    },
                    duration: 10000,
                  }
                );
              }
              onUpdate?.(registration);
            }
          });
        });

        // Handle service worker activation
        registration.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Register service worker after page load to avoid blocking
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }

    return () => {
      window.removeEventListener('load', registerSW);
    };
  }, [enableNotifications, onUpdate]);

  useEffect(() => {
    // Handle app installation prompt
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      if (enableNotifications) {
        toast.success('App installed successfully!');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [enableNotifications]);

  return null;
};

export default ServiceWorkerManager;
