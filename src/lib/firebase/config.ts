// import { getApp, getApps, initializeApp } from 'firebase/app';
// import {
//   browserLocalPersistence,
//   getAuth,
//   setPersistence,
// } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';
// import {
//   disableNetwork,
//   enableNetwork,
//   initializeFirestore,
//   persistentLocalCache
// } from 'firebase/firestore';
// // import { getAnalytics, isSupported } from 'firebase/analytics';
// // import { getMessaging, isSupported } from 'firebase/messaging';
// import { getStorage } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
//   authDomain:
//     process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
//     'demo-project.firebaseapp.com',
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
//   storageBucket:
//     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
//     'demo-project.appspot.com',
//   messagingSenderId:
//     process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
//   databaseURL:
//     process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
//     'https://demo-project-default-rtdb.firebaseio.com',
// };

// // Initialize Firebase
// let app;
// if (getApps().length === 0) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApp();
// }

// // Initialize Firebase services with better error handling
// export const auth = getAuth(app);

// // Initialize Firestore with enhanced settings for better performance
// export const db = initializeFirestore(app, {
//   experimentalForceLongPolling: true, // Better for mobile connections
//   cacheSizeBytes: 40000000, // 40MB cache
//   localCache: persistentLocalCache()
// }, 'default');

// export const database = getDatabase(app);
// export const storage = getStorage(app);

// // Enhanced network connectivity handling
// if (typeof window !== 'undefined') {
//   // Client-side only configurations
//   let isOnline = navigator.onLine;

//   try {
//     // Handle network connectivity gracefully with better logging
//     window.addEventListener('online', async () => {
//       if (!isOnline) {
//         console.log('Network connection restored, enabling Firestore...');
//         isOnline = true;
//         try {
//           await enableNetwork(db);
//           console.log('Firestore network enabled successfully');
//         } catch (error) {
//           console.warn('Failed to enable Firestore network:', error);
//         }
//       }
//     });

//     window.addEventListener('offline', async () => {
//       if (isOnline) {
//         console.log('Network connection lost, disabling Firestore...');
//         isOnline = false;
//         try {
//           await disableNetwork(db);
//           console.log('Firestore network disabled successfully');
//         } catch (error) {
//           console.warn('Failed to disable Firestore network:', error);
//         }
//       }
//     });

//     // Set up periodic connectivity check
//     setInterval(() => {
//       const currentOnlineStatus = navigator.onLine;
//       if (currentOnlineStatus !== isOnline) {
//         console.log(`Network status changed: ${currentOnlineStatus ? 'online' : 'offline'}`);
//         if (currentOnlineStatus) {
//           enableNetwork(db).catch(console.warn);
//         } else {
//           disableNetwork(db).catch(console.warn);
//         }
//         isOnline = currentOnlineStatus;
//       }
//     }, 30000); // Check every 30 seconds

//   } catch (error) {
//     console.warn('Firestore network handling setup failed:', error);
//   }
// }

// // Firebase Cloud Messaging - Disabled for now to avoid runtime errors
// // Will be re-enabled when proper service worker setup is complete
// export const getMessagingInstance = async () => {
//   console.warn('Firebase Messaging is temporarily disabled');
//   return null;
// };

// // Configure auth persistence to LOCAL (persists across browser sessions)
// setPersistence(auth, browserLocalPersistence).catch(error => {
//   console.error('Error setting auth persistence:', error);
// });

// // Temporarily disable Analytics to prevent API key errors
// // export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
// export const analytics = null;

// // Validate configuration
// if (firebaseConfig.apiKey !== 'demo-api-key' && typeof window !== 'undefined') {
//   console.log('Firebase is configured with real credentials');
// } else if (typeof window !== 'undefined') {
//   console.warn(
//     'Firebase is using demo credentials. Please set up environment variables for production.'
//   );
// }

// export default app;

// // firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import {
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
} from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// ---- Firebase Config ----
export const firebaseConfig = {
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

// ---- un-register service worker ----
// navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))
console.log(firebaseConfig);

// ---- Initialize Firebase ----
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ---- Services ----
export const auth = getAuth(app);

// Firestore with local cache for PWA offline support
export const db = initializeFirestore(app, {
  // cacheSizeBytes: 40 * 1024 * 1024, // 40MB
  localCache: persistentLocalCache(),
});

export const database = getDatabase(app);
export const storage = getStorage(app);

// ---- Auth Persistence ----
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error('Error setting auth persistence:', error);
});

// ---- Analytics Disabled (optional for PWA) ----
export const analytics = null;

// ---- Check if running locally ----
const isLocalEnv =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

// ---- un-register service worker ----
if (typeof window !== 'undefined') {
  navigator.serviceWorker
    ?.getRegistrations()
    .then(regs => regs.forEach(r => r.unregister()));
}

console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey === 'demo-api-key' ? 'demo-api-key' : '***',
  isLocal: isLocalEnv,
});

// ---- Configure Emulators if running locally ----
if (isLocalEnv && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Firebase emulators connected');
  } catch (error) {
    console.warn('⚠️ Could not connect to emulators:', error);
  }
}

// ---- Enhanced Offline Persistence Setup ----
export const setupOfflinePersistence = async () => {
  try {
    // Enable Firestore offline persistence
    await enableIndexedDbPersistence(db, {
      forceOwnership: false, // Allow multiple tabs to share persistence
    });
    console.log('✅ Firestore offline persistence enabled');
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.warn(
        '⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.'
      );
    } else if (error.code === 'unimplemented') {
      console.warn("⚠️ Current browser doesn't support persistence");
    } else {
      console.error('❌ Error enabling persistence:', error);
    }
  }

  // Set auth persistence
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Auth persistence enabled');
  } catch (error) {
    console.error('❌ Error setting auth persistence:', error);
  }
};

// Initialize offline persistence on client side
if (typeof window !== 'undefined') {
  setupOfflinePersistence().catch(console.error);
}

// ---- Network Status Monitoring ----
export const initNetworkStatusMonitor = () => {
  if (typeof window !== 'undefined') {
    const handleOnline = () => {
      console.log('✅ Online - syncing data...');
      //TODO: You can add automatic sync logic here
    };

    const handleOffline = () => {
      console.warn('⚠️ Offline - using cached data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

// ---- Enhanced Error Handling Utilities ----
export const isOfflineError = (error: any): boolean => {
  return (
    error?.code === 'unavailable' ||
    error?.code === 'failed-precondition' ||
    error?.message?.includes('offline') ||
    error?.message?.includes('network')
  );
};

export const safeWindowClosedCheck = (windowRef: Window | null): boolean => {
  try {
    // Try to check if window is closed, but handle COOP restrictions
    return windowRef?.closed || false;
  } catch (error) {
    // If COOP policy blocks access, assume the window is closed
    console.warn(
      'COOP policy blocked window.closed access, assuming window is closed'
    );
    return true;
  }
};

// ---- Analytics Disabled (optional for PWA) ----
// export const analytics = null;

// ---- Messaging Disabled (optional for PWA) ----
export const getMessagingInstance = async () => {
  console.warn('Firebase Messaging is temporarily disabled');
  return null;
};

// ---- Debugging ----
if (typeof window !== 'undefined') {
  if (firebaseConfig.apiKey !== 'demo-api-key') {
    console.log('✅ Firebase configured with real credentials');

    // Monitor Firestore connection state
    const { onSnapshotsInSync } = await import('firebase/firestore');
    onSnapshotsInSync(db, () => {
      console.log('🔄 All listeners are in-sync');
    });
  } else {
    console.warn(
      '⚠️ Firebase is using demo credentials. Please set up env vars for production.'
    );
  }

  // Initialize network monitoring
  initNetworkStatusMonitor();
}

export default app;
