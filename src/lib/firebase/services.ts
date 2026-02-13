import type {
  GameCategory,
  LotteryGame,
  LotteryTicket,
  Payment,
  User,
  UserRole,
  UserStatus,
  VendorApplication,
  Winner,
} from '@/types';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { get, off, onValue, ref, set } from 'firebase/database';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ROLE_CONFIG } from '../constants';
import { auth, database, db } from './config';

// Default user preferences and settings
const DEFAULT_USER_PREFERENCES = {
  language: 'en',
  theme: 'system',
  notifications: true,
  emailUpdates: true,
  smsUpdates: false,
  timezone: 'UTC',
  currency: 'USD',
} as const;

const DEFAULT_NOTIFICATION_SETTINGS = {
  email: true,
  sms: false,
  push: true,
  inApp: true,
  marketing: false,
  gameUpdates: true,
  winnerAnnouncements: true,
} as const;

const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowContact: true,
  dataSharing: true,
} as const;

const DEFAULT_SOCIAL_MEDIA = {
  facebook: undefined,
  twitter: undefined,
  instagram: undefined,
  linkedin: undefined,
  youtube: undefined,
} as const;

// Utility functions
const createTimestamp = () => serverTimestamp();
const createDateTimestamp = () => Date.now();

const createBaseUserData = (
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole = 'USER',
  language?: string,
  currency?: string,
  phoneNumber?: string,
  additionalData: Partial<User> = {}
): Omit<User, 'id'> => ({
  email,
  firstName,
  lastName,
  ...(phoneNumber && { phoneNumber }),
  role,
  status: 'ACTIVE' as UserStatus,
  emailVerified: false,
  phoneVerified: false,
  twoFactorEnabled: false,
  createdAt: createDateTimestamp(),
  updatedAt: createDateTimestamp(),
  preferences: {
    ...DEFAULT_USER_PREFERENCES,
    language: language || DEFAULT_USER_PREFERENCES.language,
    currency: currency || DEFAULT_USER_PREFERENCES.currency,
  },
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  privacySettings: DEFAULT_PRIVACY_SETTINGS,
  socialMedia: DEFAULT_SOCIAL_MEDIA,
  ...additionalData,
});

const createGoogleUserData = (user: FirebaseUser): Omit<User, 'id'> => ({
  email: user.email || '',
  firstName: user.displayName?.split(' ')[0] || 'User',
  lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
  role: 'USER',
  status: 'ACTIVE' as UserStatus,
  emailVerified: user.emailVerified,
  phoneVerified: false,
  twoFactorEnabled: false,
  createdAt: createDateTimestamp(),
  updatedAt: createDateTimestamp(),
  preferences: DEFAULT_USER_PREFERENCES,
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  privacySettings: DEFAULT_PRIVACY_SETTINGS,
  socialMedia: DEFAULT_SOCIAL_MEDIA,
});

const createBusinessProfile = (
  role: UserRole,
  firstName: string,
  lastName: string,
  email: string
) => {
  if (role !== 'VENDOR' && role !== 'ADMIN') return {};

  return {
    businessProfile: {
      companyName: '',
      businessType: 'individual' as const,
      taxId: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      contactPerson: {
        name: `${firstName} ${lastName}`,
        email,
        phone: '',
      },
      paymentMethods: [],
      subscriptionStatus: 'active' as const,
      subscriptionPlan: ROLE_CONFIG[role].subscriptionTier as
        | 'free'
        | 'basic'
        | 'enterprise'
        | 'premium',
      maxGames: ROLE_CONFIG[role].maxGames,
      canCreateGames: ROLE_CONFIG[role].canCreateGames,
      canManageUsers: ROLE_CONFIG[role].canManageUsers,
      verificationStatus: 'pending' as const,
      documents: [],
    },
  };
};

const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw error;
};

const createDocumentWithTimestamps = async <T>(
  collectionName: string,
  data: Omit<T, 'id'>,
  useServerTimestamp = true
): Promise<string> => {
  const timestamp = useServerTimestamp
    ? createTimestamp()
    : createDateTimestamp();
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return docRef.id;
};

const updateDocumentWithTimestamp = async <T>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
  useServerTimestamp = true
): Promise<void> => {
  const timestamp = useServerTimestamp
    ? createTimestamp()
    : createDateTimestamp();
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: timestamp,
  });
};

const softDeleteDocument = async (
  collectionName: string,
  docId: string,
  statusField: string,
  statusValue: string
): Promise<void> => {
  await updateDocumentWithTimestamp(collectionName, docId, {
    [statusField]: statusValue,
  } as any);
};

const mapFirestoreDocs = <T>(querySnapshot: any): T[] => {
  return querySnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

// Authentication services
export const authService = {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = 'USER',
    language?: string,
    currency?: string,
    phoneNumber?: string
  ): Promise<any> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userData = createBaseUserData(
      email,
      firstName,
      lastName,
      role,
      language,
      currency,
      phoneNumber,
      createBusinessProfile(role, firstName, lastName, email)
    );

    await setDoc(doc(db, 'users', user.uid), userData);
    return { ...userData, id: user.uid };
  },

  async login(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      // Try popup first
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        const userData = createGoogleUserData(user);
        await setDoc(doc(db, 'users', user.uid), userData);
      }

      return user;
    } catch (error: any) {
      // If popup is blocked, fall back to redirect
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        console.log('Popup blocked, falling back to redirect method');
        await signInWithRedirect(auth, provider);
        // Note: User will be redirected away from the page
        // The result will be handled when they return
        throw new Error('Redirecting to Google sign-in...');
      }
      throw error;
    }
  },

  async getRedirectResult(): Promise<FirebaseUser | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;

        // Check if user document exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
          const userData = createGoogleUserData(user);
          await setDoc(doc(db, 'users', user.uid), userData);
        }

        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting redirect result:', error);
      return null;
    }
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  async updatePassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    return updatePassword(user, newPassword);
  },

  async deleteAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    return deleteUser(user);
  },

  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    // For now, we'll simulate phone verification
    // In production, you'd integrate with a service like Twilio or Firebase Phone Auth
    console.log(`Sending verification code to ${phoneNumber}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async verifyPhoneCode(phoneNumber: string, code: string): Promise<void> {
    // For now, we'll simulate phone verification
    // In production, you'd verify the code with your phone service
    console.log(`Verifying code ${code} for ${phoneNumber}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, accept any 6-digit code
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('Invalid verification code');
    }
  },
};

// Firestore services
export const firestoreService = {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  },

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await updateDocumentWithTimestamp('users', userId, data);
  },

  async updateUserFCMToken(userId: string, fcmToken: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      fcmToken,
      updatedAt: createTimestamp(),
    });
  },

  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId));
  },

  // Category operations
  async getCategories(): Promise<GameCategory[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'categories'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      )
    );
    return mapFirestoreDocs<GameCategory>(querySnapshot);
  },

  async createCategory(category: Omit<GameCategory, 'id'>): Promise<string> {
    return createDocumentWithTimestamps('categories', category);
  },

  async updateCategory(
    categoryId: string,
    data: Partial<GameCategory>
  ): Promise<void> {
    await updateDocumentWithTimestamp('categories', categoryId, data);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await softDeleteDocument('categories', categoryId, 'isActive', 'false');
  },

  // Game operations
  async getGames(): Promise<LotteryGame[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'games'),
        where('status', 'in', ['ACTIVE', 'DRAFT']),
        orderBy('createdAt', 'desc')
      )
    );
    return mapFirestoreDocs<LotteryGame>(querySnapshot);
  },

  async getGame(gameId: string): Promise<LotteryGame | null> {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (gameDoc.exists()) {
      return { id: gameDoc.id, ...gameDoc.data() } as LotteryGame;
    }
    return null;
  },

  async createGame(game: Omit<LotteryGame, 'id'>): Promise<string> {
    return createDocumentWithTimestamps('games', game);
  },

  async updateGame(gameId: string, data: Partial<LotteryGame>): Promise<void> {
    await updateDocumentWithTimestamp('games', gameId, data);
  },

  async deleteGame(gameId: string): Promise<void> {
    await softDeleteDocument('games', gameId, 'status', 'CANCELLED');
  },

  // Ticket operations
  async getTickets(userId: string): Promise<LotteryTicket[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('purchaseDate', 'desc')
      )
    );
    return mapFirestoreDocs<LotteryTicket>(querySnapshot);
  },

  async createTicket(ticket: Omit<LotteryTicket, 'id'>): Promise<string> {
    return createDocumentWithTimestamps('tickets', ticket);
  },

  async updateTicket(
    ticketId: string,
    data: Partial<LotteryTicket>
  ): Promise<void> {
    await updateDocumentWithTimestamp('tickets', ticketId, data);
  },

  // Payment operations
  async getPayments(userId: string): Promise<Payment[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return mapFirestoreDocs<Payment>(querySnapshot);
  },

  async createPayment(payment: Omit<Payment, 'id'>): Promise<string> {
    return createDocumentWithTimestamps('payments', payment);
  },

  async updatePayment(
    paymentId: string,
    data: Partial<Payment>
  ): Promise<void> {
    await updateDocumentWithTimestamp('payments', paymentId, data);
  },

  // Winner operations
  async getWinners(gameId?: string): Promise<Winner[]> {
    let q = query(collection(db, 'winners'), orderBy('createdAt', 'desc'));

    if (gameId) {
      q = query(q, where('gameId', '==', gameId));
    }

    const querySnapshot = await getDocs(q);
    return mapFirestoreDocs<Winner>(querySnapshot);
  },

  async createWinner(winner: Omit<Winner, 'id'>): Promise<string> {
    return createDocumentWithTimestamps('winners', winner);
  },

  async updateWinner(winnerId: string, data: Partial<Winner>): Promise<void> {
    await updateDocumentWithTimestamp('winners', winnerId, data);
  },

  // Vendor application management
  async submitVendorApplication(
    application: Omit<VendorApplication, 'id' | 'submittedAt' | 'status'>
  ): Promise<string> {
    try {
      const applicationData = {
        ...application,
        submittedAt: createDateTimestamp(),
        status: 'PENDING' as const,
      };

      const docRef = await addDoc(
        collection(db, 'vendorApplications'),
        applicationData
      );
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'submitting vendor application');
      throw error; // Re-throw after handling
    }
  },

  async getVendorApplication(
    userId: string
  ): Promise<VendorApplication | null> {
    try {
      const q = query(
        collection(db, 'vendorApplications'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as VendorApplication;
      }
      return null;
    } catch (error) {
      console.error('Error getting vendor application:', error);
      return null;
    }
  },

  async getAllVendorApplications(): Promise<VendorApplication[]> {
    try {
      const q = query(
        collection(db, 'vendorApplications'),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return mapFirestoreDocs<VendorApplication>(querySnapshot);
    } catch (error) {
      console.error('Error getting all vendor applications:', error);
      return [];
    }
  },

  async approveVendorApplication(
    applicationId: string,
    adminId: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'vendorApplications', applicationId), {
        status: 'APPROVED',
        reviewedAt: createDateTimestamp(),
        reviewedBy: adminId,
      });

      const applicationDoc = await getDoc(
        doc(db, 'vendorApplications', applicationId)
      );
      if (applicationDoc.exists()) {
        const applicationData = applicationDoc.data();

        await updateDoc(doc(db, 'users', applicationData.userId), {
          role: 'VENDOR',
          updatedAt: createTimestamp(),
        });

        await setDoc(
          doc(db, 'users', applicationData.userId, 'businessProfile', 'main'),
          {
            companyName: applicationData.companyName,
            companyWebsite: applicationData.companyWebsite,
            companyLogoUrl: applicationData.companyLogoUrl,
            description: applicationData.description,
            productCategory: applicationData.productCategory,
            businessRegistrationNumber:
              applicationData.businessRegistrationNumber,
            contactEmail: applicationData.contactEmail,
            contactPhone: applicationData.contactPhone,
            createdAt: createTimestamp(),
            updatedAt: createTimestamp(),
          }
        );

        // Get user data to send notification
        const userDoc = await getDoc(doc(db, 'users', applicationData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Import notification service dynamically to avoid circular dependencies
          const { notificationService } = await import(
            '@/lib/services/notificationService'
          );

          // Send notification with user email
          await notificationService.sendVendorApplicationNotification(
            applicationData.userId,
            userData.email,
            'APPROVED',
            applicationData.companyName
          );
        }
      }
    } catch (error) {
      handleFirestoreError(error, 'approving vendor application');
      throw error; // Re-throw after handling
    }
  },

  async rejectVendorApplication(
    applicationId: string,
    adminId: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'vendorApplications', applicationId), {
        status: 'REJECTED',
        reviewedAt: createDateTimestamp(),
        reviewedBy: adminId,
        rejectionReason,
      });

      // Get application data to send notification
      const applicationDoc = await getDoc(
        doc(db, 'vendorApplications', applicationId)
      );
      if (applicationDoc.exists()) {
        const applicationData = applicationDoc.data();

        // Get user data to send notification
        const userDoc = await getDoc(doc(db, 'users', applicationData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Import notification service dynamically to avoid circular dependencies
          const { notificationService } = await import(
            '@/lib/services/notificationService'
          );

          // Send notification with user email
          await notificationService.sendVendorApplicationNotification(
            applicationData.userId,
            userData.email,
            'REJECTED',
            applicationData.companyName,
            rejectionReason
          );
        }
      }
    } catch (error) {
      handleFirestoreError(error, 'rejecting vendor application');
      throw error; // Re-throw after handling
    }
  },

  // Notification management
  async createNotification(notification: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: createTimestamp(),
        read: false,
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'creating notification');
      throw error; // Re-throw after handling
    }
  },
};

// Realtime Database services
export const realtimeService = {
  // Game counter operations
  async getGameCounter(gameId: string) {
    const counterRef = ref(database, `gameCounters/${gameId}`);
    const snapshot = await get(counterRef);
    return snapshot.val();
  },

  async updateGameCounter(gameId: string, data: any) {
    const counterRef = ref(database, `gameCounters/${gameId}`);
    await set(counterRef, {
      ...data,
      lastUpdate: createDateTimestamp(),
    });
  },

  onGameCounterChange(gameId: string, callback: (data: any) => void) {
    const counterRef = ref(database, `gameCounters/${gameId}`);
    onValue(counterRef, snapshot => {
      callback(snapshot.val());
    });
  },

  offGameCounterChange(gameId: string) {
    const counterRef = ref(database, `gameCounters/${gameId}`);
    off(counterRef);
  },

  // User presence operations
  async setUserPresence(userId: string, status: 'online' | 'offline') {
    const presenceRef = ref(database, `presence/${userId}`);
    await set(presenceRef, {
      status,
      lastSeen: createDateTimestamp(),
    });
  },

  onUserPresenceChange(userId: string, callback: (data: any) => void) {
    const presenceRef = ref(database, `presence/${userId}`);
    onValue(presenceRef, snapshot => {
      callback(snapshot.val());
    });
  },

  offUserPresenceChange(userId: string) {
    const presenceRef = ref(database, `presence/${userId}`);
    off(presenceRef);
  },
};

// Product service
export const productService = {
  async getProducts(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return mapFirestoreDocs(querySnapshot);
    } catch (error) {
      handleFirestoreError(error, 'getting products');
      return [];
    }
  },

  async getProduct(productId: string): Promise<any | null> {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'getting product');
      return null;
    }
  },

  async createProduct(data: any): Promise<string> {
    try {
      return createDocumentWithTimestamps('products', data, false);
    } catch (error) {
      handleFirestoreError(error, 'creating product');
      throw error; // Re-throw after handling
    }
  },

  async updateProduct(productId: string, data: any): Promise<void> {
    try {
      await updateDocumentWithTimestamp('products', productId, data, false);
    } catch (error) {
      handleFirestoreError(error, 'updating product');
      throw error; // Re-throw after handling
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, 'deleting product');
      throw error; // Re-throw after handling
    }
  },
};
