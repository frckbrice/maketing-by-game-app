import { adminAuth } from '@/lib/firebase/admin';
import { firestoreService } from '@/lib/firebase/client-services';
import { User } from '@/types';
import { NextRequest } from 'next/server';

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify the Firebase ID token using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return null;
    }

    // Fetch the user data from Firestore
    const user = await firestoreService.getUser(decodedToken.uid);

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await verifyAuth(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

export async function requireRole(
  request: NextRequest,
  role: string
): Promise<User> {
  const user = await requireAuth(request);

  if (user.role !== role) {
    throw new Error(`Role ${role} required`);
  }

  return user;
}
