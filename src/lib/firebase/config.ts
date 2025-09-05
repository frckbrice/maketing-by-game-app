import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
// import { getAnalytics, isSupported } from 'firebase/analytics';
// import { getMessaging, isSupported } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'demo-project.appspot.com',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://demo-project-default-rtdb.firebaseio.com',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase services with better error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Configure Firestore settings for better performance and reliability
if (typeof window !== 'undefined') {
  // Client-side only configurations
  try {
    // Enable offline persistence and network resilience
    import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
      // Handle network connectivity gracefully
      window.addEventListener('online', () => {
        enableNetwork(db).catch(console.warn);
      });

      window.addEventListener('offline', () => {
        disableNetwork(db).catch(console.warn);
      });
    });
  } catch (error) {
    console.warn('Firestore network handling setup failed:', error);
  }
}

// Firebase Cloud Messaging - Disabled for now to avoid runtime errors
// Will be re-enabled when proper service worker setup is complete
export const getMessagingInstance = async () => {
  console.warn('Firebase Messaging is temporarily disabled');
  return null;
};

// Configure auth persistence to LOCAL (persists across browser sessions)
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error('Error setting auth persistence:', error);
});

// Temporarily disable Analytics to prevent API key errors
// export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
export const analytics = null;

// Validate configuration
if (firebaseConfig.apiKey !== 'demo-api-key' && typeof window !== 'undefined') {
  console.log('Firebase is configured with real credentials');
} else if (typeof window !== 'undefined') {
  console.warn(
    'Firebase is using demo credentials. Please set up environment variables for production.'
  );
}

export default app;
