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
        // Check if we're in development mode and PWA is disabled
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Service Worker registration skipped in development mode'
          );

          // Unregister any existing service workers in development
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log(
              'Unregistered existing service worker in development mode'
            );
          }
          return;
        }

        // Check if the service worker file exists before registering
        // Handle potential redirects from i18n routing
        let swResponse;
        try {
          swResponse = await fetch('/sw.js', {
            method: 'HEAD',
            redirect: 'follow', // Follow redirects to check final location
          });
        } catch (error) {
          console.log(
            'Service Worker file not accessible, skipping registration'
          );
          return;
        }

        if (!swResponse.ok) {
          console.log('Service Worker file not found, skipping registration');
          return;
        }

        // Check if the response was redirected (indicates i18n routing issues)
        if (swResponse.redirected) {
          console.log(
            'Service Worker file is behind a redirect, skipping registration'
          );
          return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return console.log('❌ No new worker found');

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
          console.log('🔄 Controller changed, reloading page');
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
          console.log('🔄 Checking for updates');
        }, 60000); // Check every minute

        console.log('✅ Service Worker registered successfully');
      } catch (error) {
        // Only log as error if it's not a development environment issue
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Service Worker registration skipped in development mode'
          );
        } else {
          console.error('❌ Service Worker registration failed:', error);
        }
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
