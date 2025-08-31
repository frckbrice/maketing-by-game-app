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
  apiKey: 'your-google-api-key',
  authDomain: 'lottery-app-91c88.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: '1:33333333333:web:your-app-id',
};

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
