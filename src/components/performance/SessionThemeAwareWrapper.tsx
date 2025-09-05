'use client';

import React, { useState, useEffect } from 'react';
import { SessionManager, SessionWarning, useSession } from './SessionManager';
import { ThemeManager, ThemeToggle, useTheme } from './ThemeManager';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface SessionThemeAwareWrapperProps {
  children: React.ReactNode;
  sessionTimeoutMinutes?: number;
  showThemeToggle?: boolean;
  enablePersistentState?: boolean;
}

const SessionThemeAwareWrapper: React.FC<SessionThemeAwareWrapperProps> = ({
  children,
  sessionTimeoutMinutes = 60,
  showThemeToggle = true,
  enablePersistentState = true,
}) => {
  return (
    <SessionManager
      timeoutMinutes={sessionTimeoutMinutes}
      onSessionExpired={() => {
        toast.error('Session expired. Please login again.');
      }}
      onSessionWarning={minutesLeft => {
        toast.warning(`Session expires in ${minutesLeft} minutes`);
      }}
    >
      <ThemeManager>
        <SessionThemeProvider
          showThemeToggle={showThemeToggle}
          enablePersistentState={enablePersistentState}
        >
          {children}
        </SessionThemeProvider>
      </ThemeManager>
    </SessionManager>
  );
};

// Inner component that can access both session and theme contexts
const SessionThemeProvider: React.FC<{
  children: React.ReactNode;
  showThemeToggle: boolean;
  enablePersistentState: boolean;
}> = ({ children, showThemeToggle, enablePersistentState }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const session = useSession();
  const theme = useTheme();
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [warningMinutesLeft, setWarningMinutesLeft] = useState(0);

  // Handle session warning display
  useEffect(() => {
    if (
      session.isActive &&
      session.minutesUntilExpiry <= 5 &&
      session.minutesUntilExpiry > 0
    ) {
      setShowSessionWarning(true);
      setWarningMinutesLeft(session.minutesUntilExpiry);
    } else {
      setShowSessionWarning(false);
    }
  }, [session.isActive, session.minutesUntilExpiry]);

  // Persist user preferences
  useEffect(() => {
    if (enablePersistentState && user && session.isActive) {
      const userPreferences = {
        theme: theme.theme,
        colorScheme: theme.colorScheme,
        reducedMotion: theme.reducedMotion,
        fontSize: theme.fontSize,
        compactMode: theme.compactMode,
        lastActiveAt: Date.now(),
      };

      // Update session preferences
      session.updatePreferences({
        ui: userPreferences,
        locale: localStorage.getItem('i18nextLng') || 'en',
      });
    }
  }, [
    enablePersistentState,
    user,
    session.isActive,
    theme.theme,
    theme.colorScheme,
    theme.reducedMotion,
    theme.fontSize,
    theme.compactMode,
    session,
  ]);

  // Auto-apply theme based on time of day if system theme is selected
  useEffect(() => {
    if (theme.theme === 'system' && enablePersistentState) {
      const hour = new Date().getHours();
      const shouldBeDark = hour < 7 || hour > 19; // Dark theme from 7 PM to 7 AM

      // Store the system-based preference
      if (session.isActive) {
        session.updatePreferences({
          autoTheme: {
            lastCheck: Date.now(),
            prefersDark: shouldBeDark,
          },
        });
      }
    }
  }, [theme.theme, enablePersistentState, session]);

  // Restore user preferences on login
  useEffect(() => {
    if (user && session.isActive && session.preferences?.ui) {
      const uiPrefs = session.preferences.ui;

      // Apply saved theme preferences
      if (uiPrefs.theme && uiPrefs.theme !== theme.theme) {
        theme.setTheme(uiPrefs.theme);
      }

      if (uiPrefs.colorScheme && uiPrefs.colorScheme !== theme.colorScheme) {
        theme.setColorScheme(uiPrefs.colorScheme);
      }

      // Apply other UI preferences
      theme.updateConfig({
        reducedMotion: uiPrefs.reducedMotion ?? theme.reducedMotion,
        fontSize: uiPrefs.fontSize ?? theme.fontSize,
        compactMode: uiPrefs.compactMode ?? theme.compactMode,
      });
    }
  }, [user, session.isActive, session.preferences, theme]);

  // Handle user activity tracking with theme awareness
  useEffect(() => {
    const handleUserInteraction = () => {
      session.updateActivity();

      // Track theme usage analytics (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('User activity:', {
          sessionId: session.sessionId,
          theme: theme.resolvedTheme,
          colorScheme: theme.colorScheme,
          timestamp: Date.now(),
        });
      }
    };

    // Enhanced activity tracking
    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, {
        passive: true,
      });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [session, theme]);

  // Handle session extension
  const handleExtendSession = () => {
    session.updateActivity();
    setShowSessionWarning(false);
    toast.success(t('session.extended'));
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowSessionWarning(false);
    toast.info(t('session.loggedOut'));
  };

  return (
    <>
      {children}

      {/* Theme Toggle - conditionally rendered */}
      {showThemeToggle && session.isActive && (
        <div className='fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6'>
          <ThemeToggle className='shadow-lg hover:shadow-xl transition-shadow' />
        </div>
      )}

      {/* Session Warning Modal */}
      {showSessionWarning && (
        <SessionWarning
          minutesLeft={warningMinutesLeft}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}

      {/* Theme-aware performance monitoring */}
      {process.env.NODE_ENV === 'development' && <ThemePerformanceMonitor />}
    </>
  );
};

// Development-only theme performance monitor
const ThemePerformanceMonitor: React.FC = () => {
  const theme = useTheme();
  const session = useSession();

  useEffect(() => {
    // Monitor theme switch performance
    const startTime = performance.now();

    const timeoutId = setTimeout(() => {
      const endTime = performance.now();
      console.log(
        `Theme switch to ${theme.resolvedTheme} took ${endTime - startTime}ms`
      );
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [theme.resolvedTheme]);

  useEffect(() => {
    // Log session and theme state for debugging
    const interval = setInterval(() => {
      if (session.isActive) {
        console.group('🎨 Theme & Session Status');
        console.log('Session ID:', session.sessionId);
        console.log('User ID:', session.userId);
        console.log('Theme:', theme.theme, '→', theme.resolvedTheme);
        console.log('Color Scheme:', theme.colorScheme);
        console.log('Minutes until expiry:', session.minutesUntilExpiry);
        console.log(
          'Last activity:',
          new Date(session.lastActivity).toLocaleTimeString()
        );
        console.groupEnd();
      }
    }, 60000); // Log every minute

    return () => clearInterval(interval);
  }, [session, theme]);

  return null;
};

// Hook for components to use session and theme together
export const useSessionTheme = () => {
  const session = useSession();
  const theme = useTheme();

  return {
    session,
    theme,
    isAuthenticated: session.isActive && !!session.userId,
    isDarkMode: theme.isDark,
    colorScheme: theme.colorScheme,
    preferences: session.preferences,
    updatePreferences: session.updatePreferences,
    toggleTheme: theme.toggleTheme,
  };
};

export default SessionThemeAwareWrapper;
