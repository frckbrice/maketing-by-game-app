'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SessionState {
  isActive: boolean;
  lastActivity: number;
  sessionId: string;
  userId?: string;
  role?: string;
  preferences?: Record<string, any>;
}

interface SessionManagerProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
  onSessionExpired?: () => void;
  onSessionWarning?: (minutesLeft: number) => void;
}

const SESSION_STORAGE_KEY = 'app_session_state';
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  timeoutMinutes = 60, // 1 hour default
  warningMinutes = 5, // 5 minutes warning
  onSessionExpired,
  onSessionWarning,
}) => {
  const { user, logout } = useAuth();
  const [sessionState, setSessionState] = useState<SessionState>(() => {
    if (typeof window === 'undefined') {
      return {
        isActive: false,
        lastActivity: Date.now(),
        sessionId: '',
      };
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          isActive:
            Date.now() - parsed.lastActivity < timeoutMinutes * 60 * 1000,
        };
      } catch {
        return {
          isActive: false,
          lastActivity: Date.now(),
          sessionId: generateSessionId(),
        };
      }
    }

    return {
      isActive: false,
      lastActivity: Date.now(),
      sessionId: generateSessionId(),
    };
  });

  const [warningShown, setWarningShown] = useState(false);

  // Generate unique session ID
  function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update session activity
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      isActive: true,
    }));
    setWarningShown(false);
  }, []);

  // Initialize session when user logs in
  useEffect(() => {
    if (user && !sessionState.isActive) {
      const newSessionState: SessionState = {
        isActive: true,
        lastActivity: Date.now(),
        sessionId: generateSessionId(),
        userId: user.id,
        role: user.role,
        preferences: user.preferences || {},
      };

      setSessionState(newSessionState);
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(newSessionState)
      );
    }
  }, [user, sessionState.isActive]);

  // Persist session state
  useEffect(() => {
    if (sessionState.isActive) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
    }
  }, [sessionState]);

  // Activity listeners
  useEffect(() => {
    if (!sessionState.isActive) return;

    const handleActivity = () => {
      updateActivity();
    };

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [sessionState.isActive, updateActivity]);

  // Session timeout checker
  useEffect(() => {
    if (!sessionState.isActive) return;

    const checkSession = () => {
      const now = Date.now();
      const inactiveTime = now - sessionState.lastActivity;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningMs = warningMinutes * 60 * 1000;

      // Session expired
      if (inactiveTime >= timeoutMs) {
        setSessionState(prev => ({ ...prev, isActive: false }));
        localStorage.removeItem(SESSION_STORAGE_KEY);
        onSessionExpired?.();
        logout?.();
        return;
      }

      // Show warning
      const timeLeft = timeoutMs - inactiveTime;
      if (timeLeft <= warningMs && !warningShown) {
        setWarningShown(true);
        onSessionWarning?.(Math.ceil(timeLeft / (60 * 1000)));
      }
    };

    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [
    sessionState.isActive,
    sessionState.lastActivity,
    timeoutMinutes,
    warningMinutes,
    warningShown,
    onSessionExpired,
    onSessionWarning,
    logout,
  ]);

  // Handle visibility change (tab focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sessionState.isActive) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionState.isActive, updateActivity]);

  // Update session preferences
  const updatePreferences = useCallback((preferences: Record<string, any>) => {
    setSessionState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }));
  }, []);

  // Session context value
  const sessionValue = useMemo(
    () => ({
      ...sessionState,
      updateActivity,
      updatePreferences,
      timeoutMinutes,
      minutesUntilExpiry: Math.ceil(
        (timeoutMinutes * 60 * 1000 -
          (Date.now() - sessionState.lastActivity)) /
          (60 * 1000)
      ),
    }),
    [sessionState, updateActivity, updatePreferences, timeoutMinutes]
  );

  return (
    <SessionContext.Provider value={sessionValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Session Context
export const SessionContext = React.createContext<{
  isActive: boolean;
  lastActivity: number;
  sessionId: string;
  userId?: string;
  role?: string;
  preferences?: Record<string, any>;
  updateActivity: () => void;
  updatePreferences: (preferences: Record<string, any>) => void;
  timeoutMinutes: number;
  minutesUntilExpiry: number;
} | null>(null);

// Hook to use session
export const useSession = () => {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionManager');
  }
  return context;
};

// Session warning component
export const SessionWarning: React.FC<{
  minutesLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}> = ({ minutesLeft, onExtend, onLogout }) => {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl'>
        <div className='text-center mb-4'>
          <div className='w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-yellow-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            Session Expiring Soon
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>
            Your session will expire in{' '}
            <strong>
              {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}
            </strong>
            . Would you like to continue?
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onLogout}
            className='flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
          >
            Logout
          </button>
          <button
            onClick={onExtend}
            className='flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors'
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};
