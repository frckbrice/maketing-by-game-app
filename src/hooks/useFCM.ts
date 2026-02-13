import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import { notificationService } from '@/lib/services/notificationService';
import { useCallback, useEffect, useState } from 'react';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize FCM
  const initializeFCM = useCallback(async () => {
    try {
      setError(null);
      const token = await notificationService.initializeFCM();

      if (token) {
        setFcmToken(token);

        // Store token in user profile if user is logged in
        if (user?.id) {
          await firestoreService.updateUserFCMToken(user.id, token);
        }

        setIsInitialized(true);
        console.log('FCM initialized successfully');
      } else {
        setError('Failed to get FCM token');
        setIsInitialized(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize FCM');
      setIsInitialized(true);
      console.error('FCM initialization error:', err);
    }
  }, [user?.id]);

  // Update FCM token
  const updateFCMToken = useCallback(async () => {
    try {
      setError(null);
      const token = await notificationService.updateFCMToken();

      if (token) {
        setFcmToken(token);

        // Store token in user profile if user is logged in
        if (user?.id) {
          await firestoreService.updateUserFCMToken(user.id, token);
        }

        console.log('FCM token updated successfully');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update FCM token'
      );
      console.error('FCM token update error:', err);
    }
  }, [user?.id]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        await initializeFCM();
      } else {
        setError('Notification permission denied');
      }
      return granted;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to request permission'
      );
      return false;
    }
  }, [initializeFCM]);

  // Initialize FCM when component mounts
  useEffect(() => {
    if (user && !isInitialized) {
      initializeFCM();
    }
  }, [user, isInitialized, initializeFCM]);

  // Update FCM token when user changes
  useEffect(() => {
    if (user && fcmToken) {
      firestoreService
        .updateUserFCMToken(user.id, fcmToken)
        .catch(console.error);
    }
  }, [user, fcmToken]);

  // Listen for FCM notifications
  useEffect(() => {
    const handleFCMNotification = (event: CustomEvent) => {
      console.log('FCM notification received:', event.detail);
      // TODO: You can handle the notification here (e.g., show toast, update state)
    };

    window.addEventListener(
      'fcm-notification',
      handleFCMNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        'fcm-notification',
        handleFCMNotification as EventListener
      );
    };
  }, []);

  return {
    fcmToken,
    isInitialized,
    error,
    initializeFCM,
    updateFCMToken,
    requestPermission,
  };
};
