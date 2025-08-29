# BlackFriday Marketing App Setup Guide

This guide will help you set up the Lottery Marketing Application on your local machine.

## Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Firebase account
- Git

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lottery-app
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Firebase Configuration

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `lottery-marketing-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Enable Firebase Services

1. **Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Click "Save"

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode"
   - Select location closest to your users

3. **Realtime Database**
   - Go to Realtime Database
   - Click "Create database"
   - Choose "Start in test mode"
   - Select location closest to your users

4. **Storage**
   - Go to Storage
   - Click "Get started"
   - Choose "Start in test mode"
   - Select location closest to your users

#### Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web
4. Register app with name: `Lottery Marketing App`
5. Copy the config object

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
```

### 5. Firebase Security Rules

#### Firestore Rules

Go to Firestore Database > Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'ENTERPRISE'];
    }
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### Realtime Database Rules

Go to Realtime Database > Rules and replace with:

```json
{
  "rules": {
    "gameCounters": {
      "$gameId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "liveStats": {
      "$gameId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

### 6. Run the Application

#### Development Mode

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build

```bash
yarn build
yarn start
```

#### PWA Mode

```bash
yarn pwa
```

## Testing the Setup

### 1. Check Homepage

- Visit the homepage
- Verify the lottery theme is displayed
- Check mobile responsiveness

### 2. Test Authentication

- Click "Get Started" to register
- Try logging in with created account
- Verify dashboard access

### 3. Test PWA Features

- Open Chrome DevTools
- Go to Application tab
- Check if service worker is registered
- Verify manifest is loaded

### 4. Test Firebase Connection

- Check browser console for Firebase errors
- Verify authentication works
- Check if data can be read/written

## Troubleshooting

### Common Issues

#### Firebase Connection Errors

- Verify all environment variables are set correctly
- Check Firebase project settings
- Ensure services are enabled

#### PWA Not Working

- Check if running on HTTPS (required for PWA)
- Verify manifest.json is accessible
- Check service worker registration

#### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && yarn install`
- Check Node.js version compatibility
- Verify all dependencies are installed

#### Styling Issues

- Check Tailwind CSS compilation
- Verify PostCSS configuration
- Clear browser cache

### Getting Help

1. Check the browser console for error messages
2. Review Firebase console for service status
3. Check the README.md for additional information
4. Open an issue on GitHub with detailed error description

## Next Steps

After successful setup:

1. **Create Sample Data**: Add categories and products
2. **Test Game Creation**: Create a sample lottery game
3. **Test Real-time Features**: Verify participant counters work
4. **Customize Design**: Modify colors and branding
5. **Deploy**: Deploy to Vercel or your preferred platform

## PWA Testing

### Desktop Testing

- Use Chrome DevTools > Application tab
- Test service worker functionality
- Verify manifest properties

### Mobile Testing

- Use Chrome on mobile device
- Test "Add to Home Screen" functionality
- Verify offline capabilities

### PWA Audit

- Use Lighthouse in Chrome DevTools
- Run PWA audit for best practices
- Check performance scores

---

**Happy Coding! 🎉**

If you encounter any issues, please refer to the troubleshooting section or open an issue on GitHub.

**Last Updated:** 2025-08-27
**Author:** Avom Brice
**Version:** 1.0.0
**Status:** ✅ Active
