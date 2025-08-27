import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
// import { getAnalytics, isSupported } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'demo-app-id',
  databaseURL: 'https://demo-project-default-rtdb.firebaseio.com',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Temporarily disable Analytics to prevent API key errors
// export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
export const analytics = null;

// Validate configuration
if (firebaseConfig.apiKey !== 'demo-api-key' && typeof window !== 'undefined') {
  console.warn('Firebase is configured with real credentials');
}

export default app;
