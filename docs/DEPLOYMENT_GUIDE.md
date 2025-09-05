# Deployment Guide

## Overview

This guide covers the complete deployment process for the Lottery Marketing Application, including environment setup, Firebase configuration, and production deployment on Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Domain Configuration](#domain-configuration)
6. [SSL and Security](#ssl-and-security)
7. [Monitoring and Analytics](#monitoring-and-analytics)
8. [Backup and Recovery](#backup-and-recovery)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- Yarn package manager
- Firebase CLI installed (`npm install -g firebase-tools`)
- Vercel CLI installed (`npm install -g vercel`)
- Firebase project created
- Vercel account set up

## Environment Setup

### 1. Local Development Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd lottery-app
yarn install
```

### 2. Environment Variables

Create environment files for different environments:

#### `.env.local` (Development)

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-dev-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-dev-project-default-rtdb.firebaseio.com/

# Firebase Admin (Server-side)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_PROJECT_ID=your-dev-project

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Payment Configuration (Development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NOKASH_API_URL=https://api-dev.nokash.com
NOKASH_API_KEY=your-dev-api-key
NOKASH_MERCHANT_ID=your-dev-merchant-id

# Security
JWT_SECRET=your-development-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External APIs
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
```

#### `.env.production` (Production)

```env
# Firebase Configuration (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your-prod-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321:web:fedcba654321
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-prod-project-default-rtdb.firebaseio.com/

# Firebase Admin (Production)
FIREBASE_ADMIN_CLIENT_EMAIL=your-prod-service-account@your-prod-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Production-Private-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_PROJECT_ID=your-prod-project

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Payment Configuration (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NOKASH_API_URL=https://api.nokash.com
NOKASH_API_KEY=your-prod-api-key
NOKASH_MERCHANT_ID=your-prod-merchant-id

# Security
JWT_SECRET=your-strong-production-jwt-secret
ENCRYPTION_KEY=your-strong-32-character-encryption-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

# External APIs
EXCHANGE_RATE_API_KEY=your-production-exchange-rate-api-key
```

## Firebase Configuration

### 1. Create Firebase Projects

Create separate Firebase projects for development and production:

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

Select the following features:

- Firestore
- Realtime Database
- Authentication
- Storage
- Hosting (optional)
- Cloud Messaging

### 2. Firestore Security Rules

Update Firestore security rules (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function hasRole(role) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    function isAdmin() {
      return hasRole('ADMIN');
    }

    function isVendor() {
      return hasRole('VENDOR') || isAdmin();
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
    }

    // Categories collection
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Games collection
    match /games/{gameId} {
      allow read: if true;
      allow write: if isVendor();
    }

    // Tickets collection
    match /tickets/{ticketId} {
      allow read: if isOwner(resource.data.userId) || isVendor();
      allow write: if isVendor(); // Only vendors can mark tickets as used
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.userId) || isVendor();
      allow write: if isOwner(resource.data.userId) || isVendor();
    }

    // Shops collection
    match /shops/{shopId} {
      allow read: if true;
      allow write: if isOwner(resource.data.ownerId) || isAdmin();
    }

    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if isOwner(resource.data.vendorId) || isAdmin();
    }

    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    // Scan events (admin only)
    match /scanEvents/{eventId} {
      allow read, write: if isAdmin();
    }
  }
}
```

### 3. Realtime Database Rules

Update Realtime Database security rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "gameCounters": {
      "$gameId": {
        ".read": true,
        ".write": "auth != null && (auth.token.role == 'ADMIN' || auth.token.role == 'VENDOR')"
      }
    },
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "chats": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "liveNotifications": {
      "$notificationId": {
        ".read": "auth != null && data.child('userId').val() == auth.uid",
        ".write": "auth != null && (auth.token.role == 'ADMIN' || auth.token.role == 'VENDOR')"
      }
    },
    "winnerAnnouncements": {
      ".read": true,
      ".write": "auth != null && (auth.token.role == 'ADMIN' || auth.token.role == 'VENDOR')"
    },
    "systemStatus": {
      ".read": true,
      ".write": "auth != null && auth.token.role == 'ADMIN'"
    }
  }
}
```

### 4. Firebase Storage Rules

Configure Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Shop images
    match /shops/{shopId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                   (get(/databases/$(database)/documents/shops/$(shopId)).data.ownerId == request.auth.uid ||
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
    }

    // Product images
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Game images
    match /games/{gameId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Cloud Functions Deployment

If using Firebase Cloud Functions, deploy them:

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendNotification
```

## Vercel Deployment

### 1. Project Setup

Connect your Git repository to Vercel:

```bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Set production environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# ... add all environment variables
```

### 2. Build Configuration

Ensure your `vercel.json` is properly configured:

```json
{
  "buildCommand": "yarn build",
  "outputDirectory": ".next",
  "installCommand": "yarn install --frozen-lockfile",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.stripe.com https://api.nokash.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": true
    },
    {
      "source": "/vendor",
      "destination": "/vendor/dashboard",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/app/api/$1"
    }
  ]
}
```

### 3. Environment Variables Setup

Set up environment variables in Vercel dashboard or CLI:

```bash
# Production environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY "your-api-key" production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY "your-private-key" production
vercel env add JWT_SECRET "your-jwt-secret" production
# ... continue for all variables

# Preview environment variables (for staging)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY "your-staging-api-key" preview
# ... continue for all variables
```

## Domain Configuration

### 1. Custom Domain Setup

Configure your custom domain in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Configure DNS records as instructed by Vercel

### 2. DNS Configuration

Set up DNS records with your domain provider:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Subdomain Setup

For different environments:

```
staging.yourdomain.com → Vercel preview deployment
api.yourdomain.com → API-specific domain (optional)
admin.yourdomain.com → Admin panel (optional)
```

## SSL and Security

### 1. SSL Certificate

Vercel automatically provides SSL certificates for custom domains. Ensure HTTPS is enforced:

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### 2. Security Headers

Implement comprehensive security headers:

```javascript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}
```

### 3. API Security

Secure API endpoints:

```typescript
// app/api/middleware.ts
import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function authenticateUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Monitoring and Analytics

### 1. Vercel Analytics

Enable Vercel Analytics:

```bash
yarn add @vercel/analytics

# In your app
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Monitoring

Set up error monitoring with Sentry:

```bash
yarn add @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

### 3. Performance Monitoring

Implement performance monitoring:

```typescript
// lib/monitoring.ts
export function trackPerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn.apply(this, args);
      const end = performance.now();

      // Track performance metric
      console.log(`${name}: ${end - start}ms`);

      return result;
    } catch (error) {
      // Track error
      console.error(`${name} failed:`, error);
      throw error;
    }
  };
}
```

### 4. Health Checks

Implement health check endpoints:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { testFirebaseConnection } from '@/lib/firebase/config';

export async function GET() {
  try {
    // Test database connectivity
    await testFirebaseConnection();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firebase: 'connected',
        database: 'connected',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

## Backup and Recovery

### 1. Firebase Backup

Set up automated Firestore backups:

```bash
# Enable Firestore backup
gcloud firestore backups schedules create \
  --database=your-database \
  --recurrence=daily \
  --retention=7d
```

### 2. Code Repository Backup

Ensure code is backed up:

- Primary repository on GitHub/GitLab
- Mirror repository for redundancy
- Regular repository exports

### 3. Environment Variables Backup

Securely backup environment variables:

```bash
# Export Vercel environment variables
vercel env pull .env.backup

# Encrypt and store securely
gpg --symmetric --cipher-algo AES256 .env.backup
```

## Performance Optimization

### 1. Build Optimization

Optimize build process:

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  output: 'standalone',
  poweredByHeader: false,
};
```

### 2. Database Optimization

Optimize database queries:

```typescript
// Create composite indexes for complex queries
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shopId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### 3. CDN Configuration

Configure CDN for static assets:

```javascript
// next.config.js
const nextConfig = {
  assetPrefix:
    process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : '',
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
};
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear build cache
rm -rf .next
yarn build

# Check for TypeScript errors
yarn type-check

# Check for linting errors
yarn lint
```

#### 2. Environment Variable Issues

```bash
# Verify environment variables
vercel env ls

# Test locally with production env
vercel env pull .env.production.local
yarn build
```

#### 3. Firebase Connection Issues

```typescript
// Test Firebase connection
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const testConnection = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Test connection with a simple query
    const testDoc = await getDoc(doc(db, 'test', 'connection'));
    console.log('Firebase connected successfully');
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }
};
```

#### 4. Performance Issues

```bash
# Analyze bundle size
yarn build
yarn analyze

# Run Lighthouse audit
npx lighthouse https://yourdomain.com --output json --output-path ./lighthouse-report.json

# Check Core Web Vitals
npx web-vitals-cli https://yourdomain.com
```

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Issues](https://github.com/your-repo/issues)

## Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Firebase security rules updated
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics and monitoring setup
- [ ] Backup systems in place
- [ ] Performance optimizations applied
- [ ] Security headers configured
- [ ] Error handling implemented
- [ ] Health checks working
- [ ] Load testing completed
- [ ] Documentation updated

## Post-Deployment Steps

After successful deployment:

1. **Smoke Testing**: Verify all critical features work
2. **Monitor Logs**: Check for any errors or warnings
3. **Performance Check**: Run Lighthouse audit
4. **Security Scan**: Run security vulnerability scan
5. **Backup Verification**: Ensure backups are working
6. **User Testing**: Have team members test the application
7. **Documentation Update**: Update any deployment-specific documentation

---

_This deployment guide is maintained and updated with each release. For specific deployment assistance, contact the development team._
