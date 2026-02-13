import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'lottery-app-91c88',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, notification } = await request.json();

    if (!token || !notification) {
      return NextResponse.json(
        { error: 'Token and notification are required' },
        { status: 400 }
      );
    }

    // Prepare the message
    const message = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        ...notification.data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // For mobile apps
        icon: '/en/icons/lottery_logo-192.png',
        badge: '/en/icons/lottery_logo-96.png',
      },
      token: token,
      webpush: {
        notification: {
          icon: '/en/icons/lottery_logo-192.png',
          badge: '/en/icons/lottery_logo-96.png',
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
        },
        fcm_options: {
          link: '/en/dashboard',
        },
      },
    };

    // Send the message
    const response = await admin.messaging().send(message);

    console.log('Successfully sent FCM message:', response);

    return NextResponse.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error('Error sending FCM notification:', error);

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'FCM notification endpoint is working' },
    { status: 200 }
  );
}
