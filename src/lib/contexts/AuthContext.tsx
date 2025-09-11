'use client';

import { authService, firestoreService } from '@/lib/firebase/client-services';
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
    let isMounted = true;
    let sessionCheckTimeout: NodeJS.Timeout | null = null;

    // Enhanced session persistence with localStorage backup
    const initializeAuth = async () => {
      try {
        // Check if user session exists in localStorage (for PWA offline support)
        const cachedUser = localStorage.getItem('lottery-user-session');
        const cachedTimestamp = localStorage.getItem(
          'lottery-session-timestamp'
        );

        if (cachedUser && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          // Cache valid for 30 days
          if (now - timestamp < 30 * 24 * 60 * 60 * 1000) {
            const parsedUser = JSON.parse(cachedUser);
            if (isMounted) {
              setUser(parsedUser);
            }
          } else {
            // Clear expired cache
            localStorage.removeItem('lottery-user-session');
            localStorage.removeItem('lottery-session-timestamp');
          }
        }
      } catch (error) {
        console.error('Error loading cached session:', error);
        // Clear corrupted cache
        localStorage.removeItem('lottery-user-session');
        localStorage.removeItem('lottery-session-timestamp');
      }
    };

    const unsubscribe = authService.onAuthStateChange(async firebaseUser => {
      if (!isMounted) return;

      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          let userData;

          // Try to get user data
          try {
            userData = await firestoreService.getUser(firebaseUser.uid);
          } catch (firestoreError: any) {
            console.error(
              'Failed to get user data from Firestore:',
              firestoreError
            );

            // If offline, try to use only cached user data from previous successful login
            if (
              firestoreError.code === 'unavailable' ||
              firestoreError.message?.includes('offline')
            ) {
              const cachedUser = localStorage.getItem('lottery-user-session');
              const cachedTimestamp = localStorage.getItem(
                'lottery-session-timestamp'
              );

              if (cachedUser && cachedTimestamp) {
                const timestamp = parseInt(cachedTimestamp, 10);
                const now = Date.now();
                // Only use cache if it's less than 24 hours old and from a real user
                if (now - timestamp < 24 * 60 * 60 * 1000) {
                  try {
                    const parsedUser = JSON.parse(cachedUser);
                    // Only use cached data if it has a real database ID (not mock data)
                    if (
                      parsedUser.id === firebaseUser.uid &&
                      !parsedUser._pendingSync
                    ) {
                      userData = parsedUser;
                      console.log(
                        'Using cached user data due to offline status'
                      );
                    }
                  } catch (parseError) {
                    console.error(
                      'Failed to parse cached user data:',
                      parseError
                    );
                  }
                }
              }
            }

            // If no userData at this point, we cannot proceed safely
            if (!userData) {
              console.error('Cannot access user data - database unavailable');
              throw new Error(
                'Cannot access user data. Please check your internet connection and try again.'
              );
            }
          }

          // If user exists in Firebase Auth but not in Firestore, create the document
          if (!userData && firebaseUser.email) {
            console.log(
              'User found in Firebase Auth but not in Firestore. Creating user document...'
            );
            const newUserData = {
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName:
                firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: 'USER' as const,
              status: 'ACTIVE' as const,
              emailVerified: firebaseUser.emailVerified,
              phoneVerified: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              preferences: {
                language: 'en',
                theme: 'system',
                notifications: true,
                emailUpdates: true,
                smsUpdates: false,
                timezone: 'UTC',
                currency: 'XAF',
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
                profileVisibility: 'public' as const,
                showEmail: false,
                showPhone: false,
                allowContact: true,
                dataSharing: false,
              },
              socialMedia: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
              },
            };

            try {
              // Use setDoc to create user with specific UID
              const { setDoc, doc } = await import('firebase/firestore');
              const { db } = await import('@/lib/firebase/config');

              await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
              userData = { ...newUserData, id: firebaseUser.uid };
              console.log('Successfully created user document in Firestore');
            } catch (createError) {
              console.error(
                'Failed to create user document in Firestore:',
                createError
              );
              // Continue without userData, user will see auth issues
            }
          }

          if (isMounted && userData) {
            setUser(userData);

            // Persist session with enhanced security
            try {
              localStorage.setItem(
                'lottery-user-session',
                JSON.stringify(userData)
              );
              localStorage.setItem(
                'lottery-session-timestamp',
                Date.now().toString()
              );

              // Set session expiry check
              if (sessionCheckTimeout) clearTimeout(sessionCheckTimeout);
              sessionCheckTimeout = setTimeout(
                () => {
                  // Refresh session every 24 hours
                  if (isMounted && firebaseUser) {
                    firestoreService
                      .getUser(firebaseUser.uid)
                      .then(refreshedUser => {
                        if (refreshedUser && isMounted) {
                          setUser(refreshedUser);
                          localStorage.setItem(
                            'lottery-user-session',
                            JSON.stringify(refreshedUser)
                          );
                          localStorage.setItem(
                            'lottery-session-timestamp',
                            Date.now().toString()
                          );
                        }
                      })
                      .catch(console.error);
                  }
                },
                24 * 60 * 60 * 1000
              ); // 24 hours
            } catch (error) {
              console.error('Error persisting session:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (isMounted) {
            setUser(null);
            // Clear invalid session
            localStorage.removeItem('lottery-user-session');
            localStorage.removeItem('lottery-session-timestamp');
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          // Clear session on logout
          localStorage.removeItem('lottery-user-session');
          localStorage.removeItem('lottery-session-timestamp');
        }

        // Enhanced protected route handling
        if (typeof window !== 'undefined' && pathname) {
          const protectedPaths = [
            '/admin',
            '/dashboard',
            '/vendor-dashboard',
            '/profile',
          ];
          const isProtectedRoute = protectedPaths.some(path =>
            pathname.includes(path)
          );

          if (isProtectedRoute) {
            router.push('/');
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    // Check for redirect result when component mounts
    const checkRedirectResult = async () => {
      try {
        const redirectUser = await authService.getRedirectResult();
        if (redirectUser && isMounted) {
          const userData = await firestoreService.getUser(redirectUser.uid);
          if (isMounted && userData) {
            setUser(userData);
            setFirebaseUser(redirectUser);

            // Persist redirect session
            localStorage.setItem(
              'lottery-user-session',
              JSON.stringify(userData)
            );
            localStorage.setItem(
              'lottery-session-timestamp',
              Date.now().toString()
            );
          }
        }
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }
    };

    // Initialize with cached session first, then verify with Firebase
    initializeAuth();
    checkRedirectResult();

    return () => {
      isMounted = false;
      if (sessionCheckTimeout) clearTimeout(sessionCheckTimeout);
      unsubscribe();
    };
  }, [router, pathname]);

  const login = async (email: string, password: string) => {
    try {
      const firebaseUser = await authService.login(email, password);

      let userData;

      // Try to get user data, handle offline gracefully
      try {
        userData = await firestoreService.getUser(firebaseUser.uid);
      } catch (firestoreError: any) {
        console.warn('Firestore error during login:', firestoreError);

        // If offline, try cached data or create minimal user
        if (
          firestoreError.code === 'unavailable' ||
          firestoreError.message?.includes('offline')
        ) {
          const cachedUser = localStorage.getItem('lottery-user-session');
          if (cachedUser) {
            try {
              userData = JSON.parse(cachedUser);
            } catch (parseError) {
              console.error('Failed to parse cached user data:', parseError);
            }
          }

          // Create minimal user data if no cache
          if (!userData) {
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName:
                firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: 'USER' as const,
              status: 'ACTIVE' as const,
              emailVerified: firebaseUser.emailVerified,
              phoneVerified: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
          }
        } else {
          throw firestoreError; // Re-throw non-offline errors
        }
      }

      if (userData) {
        setUser(userData);

        // Enhanced role-based redirect with vendor dashboard support
        switch (userData.role) {
          case 'ADMIN':
            router.push('/admin');
            break;
          case 'VENDOR':
            router.push('/vendor-dashboard');
            break;
          case 'USER':
          default:
            router.push('/games');
            break;
        }

        // Persist session immediately after login
        localStorage.setItem('lottery-user-session', JSON.stringify(userData));
        localStorage.setItem(
          'lottery-session-timestamp',
          Date.now().toString()
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any corrupted session data
      localStorage.removeItem('lottery-user-session');
      localStorage.removeItem('lottery-session-timestamp');
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
      // Clear session data immediately
      setUser(null);
      setFirebaseUser(null);

      // Clear persisted session
      localStorage.removeItem('lottery-user-session');
      localStorage.removeItem('lottery-session-timestamp');

      // Clear any other cached data
      sessionStorage.clear();

      // Sign out from Firebase
      await authService.logout();

      // Redirect to home page after successful logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase logout fails, clear local session
      localStorage.removeItem('lottery-user-session');
      localStorage.removeItem('lottery-session-timestamp');
      sessionStorage.clear();
      router.push('/');
      throw error;
    }
  };

  // New authentication methods
  const signInWithGoogle = async () => {
    try {
      const firebaseUser = await authService.signInWithGoogle();

      if (firebaseUser) {
        let userData;

        // Try to fetch user data, handle offline gracefully
        try {
          userData = await firestoreService.getUser(firebaseUser.uid);
        } catch (firestoreError: any) {
          console.warn(
            'Firestore error during Google sign-in:',
            firestoreError
          );

          if (
            firestoreError.code === 'unavailable' ||
            firestoreError.message?.includes('offline')
          ) {
            // Create minimal user data for offline mode
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName:
                firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: 'USER' as const,
              status: 'ACTIVE' as const,
              emailVerified: firebaseUser.emailVerified,
              phoneVerified: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
          } else {
            throw firestoreError;
          }
        }

        if (userData) {
          setUser(userData);

          // Enhanced role-based redirect
          switch (userData.role) {
            case 'ADMIN':
              router.push('/admin');
              break;
            case 'VENDOR':
              router.push('/vendor-dashboard');
              break;
            case 'USER':
            default:
              router.push('/games');
              break;
          }

          // Persist session
          localStorage.setItem(
            'lottery-user-session',
            JSON.stringify(userData)
          );
          localStorage.setItem(
            'lottery-session-timestamp',
            Date.now().toString()
          );
        }
      }
    } catch (error: any) {
      if (error.message === 'Redirecting to Google sign-in...') {
        // This is expected when falling back to redirect
        console.log('Redirecting to Google sign-in...');
        return;
      }
      console.error('Google sign-in error:', error);
      // Clear any corrupted session data
      localStorage.removeItem('lottery-user-session');
      localStorage.removeItem('lottery-session-timestamp');
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
        const updatedUser = { ...user, ...updates } as User;
        setUser(updatedUser);

        // Update persisted session
        localStorage.setItem(
          'lottery-user-session',
          JSON.stringify(updatedUser)
        );
        localStorage.setItem(
          'lottery-session-timestamp',
          Date.now().toString()
        );
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
