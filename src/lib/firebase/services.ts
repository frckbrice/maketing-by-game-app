import type {
  GameCategory,
  LotteryGame,
  LotteryTicket,
  Payment,
  User,
  UserStatus,
  Winner,
} from '@/types';
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { get, off, onValue, ref, set } from 'firebase/database';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ROLE_CONFIG } from '../constants';
import { auth, database, db } from './config';

// Authentication services
export const authService = {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'USER' | 'VENDOR' | 'ADMIN' = 'USER',
    language?: string,
    currency?: string
  ): Promise<any> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Default values based on role
    const defaultLanguage = language || 'en';
    const defaultCurrency = currency || 'USD';

    const userData: Omit<User, 'id'> = {
      email,
      firstName,
      lastName,
      role,
      status: 'PENDING_VERIFICATION' as UserStatus,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preferences: {
        language: defaultLanguage,
        theme: 'system',
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        timezone: 'UTC',
        currency: defaultCurrency,
      },
      notificationSettings: {
        email: true,
        sms: false,
        push: true,
        inApp: true,
        marketing: false,
        gameUpdates: true,
        winnerAnnouncements: true,
      },
      privacySettings: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowContact: true,
        dataSharing: true,
      },
      // Role-specific business settings
      businessProfile:
        role === 'VENDOR' || role === 'ADMIN'
          ? {
              companyName: '',
              businessType: 'individual',
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
              subscriptionStatus: 'active',
              subscriptionPlan: ROLE_CONFIG[role].subscriptionTier as
                | 'free'
                | 'basic'
                | 'enterprise'
                | 'premium',
              maxGames: ROLE_CONFIG[role].maxGames,
              canCreateGames: ROLE_CONFIG[role].canCreateGames,
              canManageUsers: ROLE_CONFIG[role].canManageUsers,
              verificationStatus: 'pending',
              documents: [],
            }
          : undefined,
    };

    await addDoc(collection(db, 'users'), {
      ...userData,
      id: user.uid,
    });

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
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as GameCategory[];
  },

  async createCategory(category: Omit<GameCategory, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateCategory(
    categoryId: string,
    data: Partial<GameCategory>
  ): Promise<void> {
    await updateDoc(doc(db, 'categories', categoryId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await updateDoc(doc(db, 'categories', categoryId), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as LotteryGame[];
  },

  async getGame(gameId: string): Promise<LotteryGame | null> {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (gameDoc.exists()) {
      return { id: gameDoc.id, ...gameDoc.data() } as LotteryGame;
    }
    return null;
  },

  async createGame(game: Omit<LotteryGame, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'games'), {
      ...game,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateGame(gameId: string, data: Partial<LotteryGame>): Promise<void> {
    await updateDoc(doc(db, 'games', gameId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteGame(gameId: string): Promise<void> {
    await updateDoc(doc(db, 'games', gameId), {
      status: 'CANCELLED',
      updatedAt: serverTimestamp(),
    });
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as LotteryTicket[];
  },

  async createTicket(ticket: Omit<LotteryTicket, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...ticket,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateTicket(
    ticketId: string,
    data: Partial<LotteryTicket>
  ): Promise<void> {
    await updateDoc(doc(db, 'tickets', ticketId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Payment[];
  },

  async createPayment(payment: Omit<Payment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...payment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updatePayment(
    paymentId: string,
    data: Partial<Payment>
  ): Promise<void> {
    await updateDoc(doc(db, 'payments', paymentId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  // Winner operations
  async getWinners(gameId?: string): Promise<Winner[]> {
    let q = query(collection(db, 'winners'), orderBy('createdAt', 'desc'));

    if (gameId) {
      q = query(q, where('gameId', '==', gameId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Winner[];
  },

  async createWinner(winner: Omit<Winner, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'winners'), {
      ...winner,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateWinner(winnerId: string, data: Partial<Winner>): Promise<void> {
    await updateDoc(doc(db, 'winners', winnerId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
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
      lastUpdate: Date.now(),
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
      lastSeen: Date.now(),
    });
  },

  onUserPresenceChange(userId: string, callback: (data: any) => void) {
    const presenceRef = ref(database, `gameCounters/${userId}`);
    onValue(presenceRef, snapshot => {
      callback(snapshot.val());
    });
  },

  offUserPresenceChange(userId: string) {
    const presenceRef = ref(database, `gameCounters/${userId}`);
    off(presenceRef);
  },
};

// Product service
export const productService = {
  async getProducts(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting products:', error);
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
      console.error('Error getting product:', error);
      return null;
    }
  },

  async createProduct(data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(productId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};
