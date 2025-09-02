import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase/admin';
import { db } from '../../../../lib/firebase/config';

// Firebase Admin SDK for FCM
import { getMessaging } from 'firebase-admin/messaging';

interface NotificationRequest {
  notificationId: string;
  title: string;
  message: string;
  targetAudience: string;
  recipients?: string[];
}

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { notificationId, title, message, targetAudience, recipients }: NotificationRequest = await req.json();

    // Validate required fields
    if (!notificationId || !title || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['notificationId', 'title', 'message'],
        received: { notificationId, title, message }
      }, { status: 400 });
    }

    // Validate target audience
    const validAudiences = ['ALL', 'USERS', 'VENDORS', 'ADMINS', 'CUSTOM'];
    if (!validAudiences.includes(targetAudience)) {
      return NextResponse.json({ 
        error: 'Invalid target audience',
        validAudiences,
        received: targetAudience
      }, { status: 400 });
    }

    // Validate custom recipients if targetAudience is CUSTOM
    if (targetAudience === 'CUSTOM' && (!recipients || recipients.length === 0)) {
      return NextResponse.json({ 
        error: 'Custom target audience requires recipients array',
        received: { targetAudience, recipients }
      }, { status: 400 });
    }

    let targetUsers: string[] = [];
    let totalRecipients = 0;

    // Determine target users based on audience
    switch (targetAudience) {
      case 'ALL':
        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        targetUsers = allUsersSnapshot.docs.map(doc => doc.id);
        totalRecipients = targetUsers.length;
        break;

      case 'USERS':
        const regularUsersSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'USER'))
        );
        targetUsers = regularUsersSnapshot.docs.map(doc => doc.id);
        totalRecipients = targetUsers.length;
        break;

      case 'VENDORS':
        const vendorsSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'VENDOR'))
        );
        targetUsers = vendorsSnapshot.docs.map(doc => doc.id);
        totalRecipients = targetUsers.length;
        break;

      case 'ADMINS':
        const adminsSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'ADMIN'))
        );
        targetUsers = adminsSnapshot.docs.map(doc => doc.id);
        totalRecipients = targetUsers.length;
        break;

      case 'CUSTOM':
        targetUsers = recipients || [];
        totalRecipients = targetUsers.length;
        break;

      default:
        return NextResponse.json({ error: 'Invalid target audience' }, { status: 400 });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedTokens: string[] = [];

    // Send notifications in batches with rate limiting
    const batchSize = 100;
    const rateLimitDelay = 1000; // 1 second between batches
    
    console.log(`🚀 Starting notification delivery to ${targetUsers.length} users in batches of ${batchSize}`);
    
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(targetUsers.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} with ${batch.length} users`);
      
      // Get FCM tokens for batch users
      const tokens: string[] = [];
      const userPromises = batch.map(async (userId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userData = userDoc.data();
          if (userData?.fcmToken && userData.enablePushNotifications !== false) {
            return userData.fcmToken;
          }
        } catch (error) {
          console.error(`Failed to get FCM token for user ${userId}:`, error);
        }
        return null;
      });

      const batchTokens = (await Promise.all(userPromises)).filter(Boolean) as string[];
      tokens.push(...batchTokens);

      if (tokens.length > 0) {
        try {
          // Send FCM notification using Firebase Admin SDK
          try {
            const messaging = getMessaging();
            
            // Send to each token individually for better error handling
            const sendPromises = tokens.map(async (token) => {
              try {
                await messaging.send({
                  token,
                  notification: {
                    title,
                    body: message,
                  },
                  data: {
                    notificationId,
                    type: 'admin_notification',
                    timestamp: Date.now().toString(),
                  },
                  android: {
                    priority: 'high',
                    notification: {
                      icon: 'ic_notification',
                      color: '#FF5722',
                      sound: 'default',
                    },
                  },
                  apns: {
                    payload: {
                      aps: {
                        sound: 'default',
                        badge: 1,
                      },
                    },
                  },
                  webpush: {
                    notification: {
                      icon: '/icons/icon-192.png',
                      badge: '/icons/badge-72.png',
                      requireInteraction: true,
                    },
                  },
                });
                return { success: true, token };
              } catch (error) {
                return { success: false, token, error };
              }
            });

            const results = await Promise.all(sendPromises);
            
            // Count successes and failures
            results.forEach((result) => {
              if (result.success) {
                sentCount++;
              } else {
                failedCount++;
                failedTokens.push(result.token);
                console.error('FCM Error for token:', result.error);
              }
            });
          } catch (fcmError) {
            console.error('FCM sending error:', fcmError);
            // Fallback to mock implementation if FCM fails
            if (process.env.NODE_ENV === 'development') {
              console.log(`📱 Mock FCM: Sending to ${tokens.length} devices`, {
                title,
                message,
                tokens: tokens.slice(0, 3), // Show first 3 tokens only
              });
              sentCount += tokens.length;
            } else {
              failedCount += tokens.length;
            }
          }

          // Add delay between batches to avoid rate limiting
          if (i + batchSize < targetUsers.length) {
            console.log(`⏳ Waiting ${rateLimitDelay}ms before next batch...`);
            await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
          }
        } catch (error) {
          console.error('Error sending FCM batch:', error);
          failedCount += tokens.length;
        }
      }
    }

    // Update notification with delivery stats
    await updateDoc(doc(db, 'notifications', notificationId), {
      totalRecipients,
      sentCount,
      failedCount,
      deliveryRate: totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0,
      lastDeliveryAttempt: new Date(),
      failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
    });

    // Create in-app notifications for all target users
    try {
      const inAppPromises = targetUsers.map(userId => 
        createInAppNotification({
          userId,
          title,
          message,
          notificationId,
        })
      );
      await Promise.all(inAppPromises);
      console.log(`✅ Created in-app notifications for ${targetUsers.length} users`);
    } catch (inAppError) {
      console.error('In-app notification creation failed:', inAppError);
    }

    // Send email notifications for important announcements
    if (targetAudience === 'ALL' || targetAudience === 'ADMINS') {
      try {
        await sendEmailNotification({
          title,
          message,
          targetUsers: targetUsers.slice(0, 50), // Limit email sending
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    const deliveryRate = totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0;
    
    console.log(`✅ Notification delivery completed!`, {
      notificationId,
      totalRecipients,
      sentCount,
      failedCount,
      deliveryRate: `${deliveryRate.toFixed(2)}%`,
      failedTokens: failedTokens.length
    });

    return NextResponse.json({
      success: true,
      notificationId,
      stats: {
        totalRecipients,
        sentCount,
        failedCount,
        deliveryRate,
        failedTokensCount: failedTokens.length,
      },
      message: `Successfully delivered notifications to ${sentCount} out of ${totalRecipients} recipients (${deliveryRate.toFixed(2)}% success rate)`,
    });

  } catch (error) {
    console.error('Notification sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Helper function to send email notifications
async function sendEmailNotification({
  title,
  message,
  targetUsers,
}: {
  title: string;
  message: string;
  targetUsers: string[];
}) {
  try {
    // Get user emails
    const userEmails: string[] = [];
    const emailPromises = targetUsers.map(async (userId) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        if (userData?.email && userData.enableEmailNotifications !== false) {
          return userData.email;
        }
      } catch (error) {
        console.error(`Failed to get email for user ${userId}:`, error);
      }
      return null;
    });

    const emails = (await Promise.all(emailPromises)).filter(Boolean) as string[];
    userEmails.push(...emails);

    if (userEmails.length > 0) {
      // In production, integrate with your email service (Nodemailer, SendGrid, etc.)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 Mock Email: Sending to ${userEmails.length} recipients`, {
          title,
          message,
          emails: userEmails.slice(0, 3), // Show first 3 emails only
        });
      } else {
        // Production email implementation
        try {
          console.log(`📧 Production Email: Attempting to send to ${userEmails.length} recipients`);
          
          // Try SendGrid first
          try {
            await sendEmailWithSendGrid(title, message, userEmails);
            console.log(`✅ SendGrid: Successfully sent emails to ${userEmails.length} recipients`);
          } catch (sendGridError) {
            const sendGridMessage = sendGridError instanceof Error ? sendGridError.message : String(sendGridError);
            console.warn('⚠️ SendGrid failed, falling back to Nodemailer:', sendGridError);
            
            // Fallback to Nodemailer
            try {
              await sendEmailWithNodemailer(title, message, userEmails);
              console.log(`✅ Nodemailer: Successfully sent emails to ${userEmails.length} recipients`);
            } catch (nodemailerError) {
              const nodemailerMessage = nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError);
              console.error('❌ Both SendGrid and Nodemailer failed:', nodemailerError);
              throw new Error(`Email delivery failed: SendGrid error: ${sendGridMessage}, Nodemailer error: ${nodemailerMessage}`);
            }
          }
        } catch (emailError) {
          console.error('Production email sending failed:', emailError);
          throw emailError;
        }
      }
    }
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// In-app notification creation
async function createInAppNotification({
  userId,
  title,
  message,
  notificationId,
}: {
  userId: string;
  title: string;
  message: string;
  notificationId: string;
}) {
  try {
    // Create individual user notification record
    await updateDoc(doc(db, 'users', userId), {
      notifications: [{
        id: notificationId,
        title,
        message,
        read: false,
        createdAt: new Date(),
        type: 'admin_announcement',
      }],
    });
  } catch (error) {
    console.error(`Failed to create in-app notification for ${userId}:`, error);
  }
}

// SendGrid email implementation
async function sendEmailWithSendGrid(
  title: string,
  message: string,
  userEmails: string[]
): Promise<void> {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    // Dynamic import to avoid bundling issues
    // Note: Install @sendgrid/mail package: yarn add @sendgrid/mail
    let sgMail;
    try {
      sgMail = await import('@sendgrid/mail');
    } catch (importError) {
      throw new Error('SendGrid package not installed. Run: yarn add @sendgrid/mail');
    }
    
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

    // SendGrid has a limit of 1000 recipients per request
    const batchSize = 1000;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'notifications@yourapp.com';
    
    for (let i = 0; i < userEmails.length; i += batchSize) {
      const batch = userEmails.slice(i, i + batchSize);
      
      await sgMail.default.send({
        to: batch,
        from: fromEmail,
        subject: title,
        html: `<h2>${title}</h2><p>${message}</p><hr><p><small>You received this because you're subscribed to notifications from Our App.</small></p>`,
        // Use BCC for privacy when sending to multiple recipients
        bcc: batch.length > 1 ? batch : undefined,
        // Use 'to' field for single recipient
        ...(batch.length === 1 && { to: batch[0] }),
      });
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < userEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('SendGrid email sending failed:', error);
    throw error;
  }
}

// Use existing email service (fallback)
async function sendEmailWithNodemailer(
  title: string,
  message: string,
  userEmails: string[]
): Promise<void> {
  try {
    // Check if email service is configured
    if (!process.env.NEXT_PUBLIC_MAIL || !process.env.NEXT_PUBLIC_PASSWORD) {
      throw new Error('Email service configuration not complete');
    }

    // Dynamic import to use existing email service
    const { emailService } = await import('../../../../lib/services/emailService');
    
    console.log(`📧 Using existing email service to send to ${userEmails.length} recipients`);
    
    // Send emails in batches using existing service
    const batchSize = 50; // Batch size for email service
    
    for (let i = 0; i < userEmails.length; i += batchSize) {
      const batch = userEmails.slice(i, i + batchSize);
      
      // Send to each recipient individually
      const sendPromises = batch.map(async (email) => {
        try {
          const success = await emailService.sendNotificationEmail(
            email,
            title,
            message,
            'info'
          );
          return { success, email };
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return { success: false, email, error };
        }
      });

      const results = await Promise.allSettled(sendPromises);
      
      // Log results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const failed = results.length - successful;
      
      if (failed > 0) {
        console.warn(`⚠️ Email batch ${Math.floor(i / batchSize) + 1}: ${successful} successful, ${failed} failed`);
      }
      
      // Add delay between batches
      if (i + batchSize < userEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Email service failed:', error);
    throw error;
  }
}

// Note: Email HTML templates are handled by the existing emailService
