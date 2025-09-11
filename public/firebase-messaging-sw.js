// Firebase Cloud Messaging Service Worker
// This file must be in the public directory to be accessible

importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

// Firebase configuration - this should match your app config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

console.log('firebaseConfig from firebase-messaging-sw.js', firebaseConfig);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages when the app is closed or in background
messaging.onBackgroundMessage(payload => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/en/icons/lottery_logo-192.png',
    badge: '/en/icons/lottery_logo-96.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open') {
    // Open the app when notification is clicked
    event.waitUntil(clients.openWindow('/en/dashboard'));
  }
});

// Handle notification close events
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event);
});

// Handle push events (fallback for older browsers)
self.addEventListener('push', event => {
  console.log('Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      const notificationTitle =
        payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/en/icons/lottery_logo-192.png',
        badge: '/en/icons/lottery_logo-96.png',
        data: payload.data || {},
        tag: payload.data?.tag || 'default',
        requireInteraction: true,
      };

      event.waitUntil(
        self.registration.showNotification(
          notificationTitle,
          notificationOptions
        )
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
});
