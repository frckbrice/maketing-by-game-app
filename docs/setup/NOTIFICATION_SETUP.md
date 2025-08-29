# Notification System Setup Guide

This guide will help you set up the complete notification system for your BlackFriday App using Firebase Cloud Messaging (FCM) and Nodemailer for emails.

## Prerequisites

- Firebase project with Cloud Messaging enabled
- Gmail account for sending emails (or other SMTP provider)
- Service account key from Firebase

## Step-by-Step Setup

### 1. Firebase Console Configuration

#### Enable Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`BlackFriday-app-91c88`)
3. Go to **Project Settings** > **Cloud Messaging**
4. Copy the **Sender ID** (you already have this: `190184061635`)

#### Generate VAPID Key

1. In the **Cloud Messaging** tab, scroll to **Web configuration**
2. Click **Generate Key Pair** under **Web Push certificates**
3. Copy the generated **VAPID key**

#### Get Service Account Key

1. Go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file (you already have: `BlackFriday-app-91c88-firebase-adminsdk-fbsvc-*.json`)
4. Extract the following values:
   - `client_email`
   - `private_key`
   - `project_id`

### 2. Environment Variables Setup

Create or update your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=BlackFriday-app-91c88.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=BlackFriday-app-91c88
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=BlackFriday-app-91c88.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=190184061635
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Firebase Cloud Messaging (FCM)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_generated_vapid_key

# Firebase Admin SDK (Server-side only)
FIREBASE_PROJECT_ID=BlackFriday-app-*
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-*@BlackFriday-app-*.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----"

# Email Configuration (Nodemailer)
NEXT_PUBLIC_MAIL=your_email@gmail.com
NEXT_PUBLIC_PASSWORD=your_app_password

# App Configuration
NEXT_PUBLIC_APP_NAME=BlackFridayApp
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Gmail App Password Setup

For Gmail, you need to create an App Password:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** > **2-Step Verification**
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Use this password in `NEXT_PUBLIC_PASSWORD`

### 4. Update Firebase Service Worker

Update the Firebase configuration in `public/firebase-messaging-sw.js`:

```javascript
const firebaseConfig = {
  apiKey: 'your_actual_api_key',
  authDomain: 'BlackFriday-app-*.firebaseapp.com',
  projectId: 'BlackFriday-app-*',
  storageBucket: 'BlackFriday-app-*.appspot.com',
  messagingSenderId: '190184061635',
  appId: 'your_actual_app_id',
};
```

### 5. Test the Setup

#### Test Email Notifications

1. Start your development server
2. Go to a vendor application page
3. Approve or reject an application
4. Check if emails are sent

#### Test Push Notifications

1. Use the `NotificationPermission` component in your app
2. Grant notification permissions
3. Check browser console for FCM token
4. Test sending a notification via the API

## Troubleshooting

### Common Issues

#### 1. FCM Token Not Generated

- Check if `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set correctly
- Ensure Firebase project has Cloud Messaging enabled
- Check browser console for errors

#### 2. Emails Not Sending

- Verify Gmail credentials are correct
- Check if 2FA is enabled and app password is used
- Ensure `NEXT_PUBLIC_MAIL` and `NEXT_PUBLIC_PASSWORD` are set

#### 3. Service Worker Not Loading

- Ensure `firebase-messaging-sw.js` is in the `public` folder
- Check if the file path matches your Firebase config
- Verify browser supports service workers

#### 4. Firebase Admin SDK Errors

- Check if service account key is properly formatted
- Ensure `FIREBASE_PRIVATE_KEY` includes quotes and newlines
- Verify the service account has the necessary permissions

### Debug Steps

1. **Check Browser Console**
   - Look for FCM initialization errors
   - Check if VAPID key is loaded

2. **Check Network Tab**
   - Verify API calls to `/api/notifications/send-fcm`
   - Check for CORS or authentication errors

3. **Check Server Logs**
   - Look for Firebase Admin SDK errors
   - Verify environment variables are loaded

4. **Test Individual Components**
   - Test email service separately
   - Test FCM initialization separately
   - Test notification service separately

## Usage Examples

### In Your Components

```tsx
import { useFCM } from '@/hooks/useFCM';
import { NotificationPermission } from '@/components/ui/NotificationPermission';

export default function Dashboard() {
  const { fcmToken, isInitialized } = useFCM();

  return (
    <div>
      <h1>Dashboard</h1>
      <NotificationPermission />
      {fcmToken && <p>Notifications are enabled!</p>}
    </div>
  );
}
```

### Sending Notifications Programmatically

```tsx
import { notificationService } from '@/lib/services/notificationService';

// Send a notification
await notificationService.sendVendorApplicationNotification(
  userId,
  userEmail,
  'APPROVED',
  companyName
);
```

## Production Deployment

### Vercel Deployment

1. Add all environment variables to Vercel
2. Ensure `FIREBASE_PRIVATE_KEY` is properly escaped
3. Test notifications in production

### Security Considerations

- Never expose Firebase Admin SDK credentials in client-side code
- Use environment variables for all sensitive data
- Implement rate limiting for notification APIs
- Add authentication to notification endpoints

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Next Steps

After setup, consider implementing:

1. **Notification Preferences** - Let users choose notification types
2. **Notification History** - Store and display past notifications
3. **Batch Notifications** - Send multiple notifications efficiently
4. **Mobile App Support** - Extend to React Native or Flutter
5. **Analytics** - Track notification engagement and delivery rates

---

**Need Help?** Check the troubleshooting section or create an issue in your repository.

**Last Updated:** 2025-08-29
**Author:** Avom Brice
**Version:** 1.0.0
**Status:** ✅ Active
