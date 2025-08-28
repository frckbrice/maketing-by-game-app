'use client';

import { authService, firestoreService } from '@/lib/firebase/services';
import type { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: 'USER' | 'VENDOR' | 'ADMIN',
    language?: string,
    currency?: string,
    phoneNumber?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  // New authentication methods
  signInWithGoogle: () => Promise<void>;
  sendPhoneVerificationCode: (phoneNumber: string) => Promise<void>;
  verifyPhoneCode: (phoneNumber: string, code: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async firebaseUser => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userData = await firestoreService.getUser(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        // If user is not authenticated and we're on a protected route, redirect to home
        if (typeof window !== 'undefined' && pathname?.includes('/dashboard')) {
          router.push('/');
        }
      }

      setLoading(false);
    });

    // Check for redirect result when component mounts
    const checkRedirectResult = async () => {
      try {
        const redirectUser = await authService.getRedirectResult();
        if (redirectUser) {
          // User signed in via redirect, fetch their data
          const userData = await firestoreService.getUser(redirectUser.uid);
          setUser(userData);
          setFirebaseUser(redirectUser);
        }
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }
    };

    checkRedirectResult();

    return unsubscribe;
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      // Role-based redirect after login
      if (user) {
        if (user.role === 'USER') {
          router.push('/games');
        } else if (user.role === 'VENDOR' || user.role === 'ADMIN') {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'USER' | 'VENDOR' | 'ADMIN' = 'USER',
    language?: string,
    currency?: string,
    phoneNumber?: string
  ) => {
    try {
      await authService.register(
        email,
        password,
        firstName,
        lastName,
        role,
        language,
        currency,
        phoneNumber
      );
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Redirect to home page after successful logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // New authentication methods
  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error: any) {
      if (error.message === 'Redirecting to Google sign-in...') {
        // This is expected when falling back to redirect
        console.log('Redirecting to Google sign-in...');
        return;
      }
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const sendPhoneVerificationCode = async (phoneNumber: string) => {
    try {
      await authService.sendPhoneVerificationCode(phoneNumber);
    } catch (error) {
      console.error('Send phone verification code error:', error);
      throw error;
    }
  };

  const verifyPhoneCode = async (phoneNumber: string, code: string) => {
    try {
      await authService.verifyPhoneCode(phoneNumber, code);
    } catch (error) {
      console.error('Verify phone code error:', error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Send password reset email error:', error);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await authService.updatePassword(newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (user) {
        await firestoreService.updateUser(user.id, updates);
        setUser(prev => ({ ...prev, ...updates }) as User);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      if (user) {
        // await authService.deleteAccount();
        // Delete Firestore data first
        await firestoreService.deleteUser(user.id);
        // Then delete the auth account
        await authService.deleteAccount();
        setUser(null);
        setFirebaseUser(null);
        // Redirect to home page after successful account deletion
        router.push('/');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    logout,
    signInWithGoogle,
    sendPhoneVerificationCode,
    verifyPhoneCode,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
