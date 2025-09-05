import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Address, UserNotificationPreferences } from '@/types';
import { toast } from 'sonner';

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      profileData,
    }: {
      userId: string;
      profileData: Partial<User>;
    }): Promise<void> => {
      try {
        const userRef = doc(db, 'users', userId);

        const updateData = {
          ...profileData,
          updatedAt: Date.now(),
        };

        await updateDoc(userRef, updateData);

        // Optimistically update the cache
        queryClient.setQueryData(
          ['enhanced-user-profile', userId],
          (old: User | null) => {
            if (!old) return null;
            return { ...old, ...updateData };
          }
        );
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update profile');
      }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({
        queryKey: ['enhanced-user-profile', userId],
      });
      toast.success('Profile updated successfully');
    },
    onError: error => {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    },
  });
};

// Update user notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: UserNotificationPreferences;
    }): Promise<void> => {
      try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
          notificationPreferences: preferences,
          updatedAt: Date.now(),
        });

        // Optimistically update the cache
        queryClient.setQueryData(
          ['user-notification-preferences', userId],
          preferences
        );
      } catch (error) {
        console.error('Error updating notification preferences:', error);
        throw new Error('Failed to update notification preferences');
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ['user-notification-preferences', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['enhanced-user-profile', userId],
      });
      toast.success('Notification preferences updated successfully');
    },
    onError: error => {
      console.error('Notification preferences update error:', error);
      toast.error('Failed to update notification preferences');
    },
  });
};

// Add new shipping address
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      addressData,
    }: {
      userId: string;
      addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<string> => {
      try {
        const addressesRef = collection(db, 'addresses');

        const newAddress = {
          ...addressData,
          userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const docRef = await addDoc(addressesRef, newAddress);

        // Optimistically update the cache
        queryClient.setQueryData(
          ['user-addresses', userId],
          (old: Address[] | undefined) => {
            const newAddressWithId = { ...newAddress, id: docRef.id };
            return old ? [...old, newAddressWithId] : [newAddressWithId];
          }
        );

        return docRef.id;
      } catch (error) {
        console.error('Error adding address:', error);
        throw new Error('Failed to add address');
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', userId] });
      toast.success('Address added successfully');
    },
    onError: error => {
      console.error('Add address error:', error);
      toast.error('Failed to add address');
    },
  });
};

// Update shipping address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      addressId,
      userId,
      addressData,
    }: {
      addressId: string;
      userId: string;
      addressData: Partial<Address>;
    }): Promise<void> => {
      try {
        const addressRef = doc(db, 'addresses', addressId);

        const updateData = {
          ...addressData,
          updatedAt: Date.now(),
        };

        await updateDoc(addressRef, updateData);

        // Optimistically update the cache
        queryClient.setQueryData(
          ['user-addresses', userId],
          (old: Address[] | undefined) => {
            if (!old) return old;
            return old.map(addr =>
              addr.id === addressId ? { ...addr, ...updateData } : addr
            );
          }
        );
      } catch (error) {
        console.error('Error updating address:', error);
        throw new Error('Failed to update address');
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', userId] });
      toast.success('Address updated successfully');
    },
    onError: error => {
      console.error('Update address error:', error);
      toast.error('Failed to update address');
    },
  });
};

// Delete shipping address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      addressId,
      userId,
    }: {
      addressId: string;
      userId: string;
    }): Promise<void> => {
      try {
        const addressRef = doc(db, 'addresses', addressId);
        await deleteDoc(addressRef);

        // Optimistically update the cache
        queryClient.setQueryData(
          ['user-addresses', userId],
          (old: Address[] | undefined) => {
            if (!old) return old;
            return old.filter(addr => addr.id !== addressId);
          }
        );
      } catch (error) {
        console.error('Error deleting address:', error);
        throw new Error('Failed to delete address');
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', userId] });
      toast.success('Address deleted successfully');
    },
    onError: error => {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    },
  });
};

// Set default address
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      addressId,
      userId,
    }: {
      addressId: string;
      userId: string;
    }): Promise<void> => {
      try {
        // Get current addresses to update them
        const currentAddresses = queryClient.getQueryData([
          'user-addresses',
          userId,
        ]) as Address[];

        if (!currentAddresses) return;

        // Update all addresses: set the selected one as default, others as non-default
        const updatePromises = currentAddresses.map(async address => {
          const addressRef = doc(db, 'addresses', address.id);
          const isDefault = address.id === addressId;

          await updateDoc(addressRef, {
            isDefault,
            updatedAt: Date.now(),
          });
        });

        await Promise.all(updatePromises);

        // Optimistically update the cache
        queryClient.setQueryData(
          ['user-addresses', userId],
          (old: Address[] | undefined) => {
            if (!old) return old;
            return old.map(addr => ({
              ...addr,
              isDefault: addr.id === addressId,
              updatedAt: Date.now(),
            }));
          }
        );
      } catch (error) {
        console.error('Error setting default address:', error);
        throw new Error('Failed to set default address');
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', userId] });
      toast.success('Default address updated successfully');
    },
    onError: error => {
      console.error('Set default address error:', error);
      toast.error('Failed to set default address');
    },
  });
};

// Update user password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }): Promise<void> => {
      try {
        // Note: This would typically use Firebase Auth to update password
        // For now, we'll just simulate the API call

        // Validate password strength
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real implementation, use Firebase Auth:
        // import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
        // const user = auth.currentUser;
        // if (user && user.email) {
        //   const credential = EmailAuthProvider.credential(user.email, currentPassword);
        //   await reauthenticateWithCredential(user, credential);
        //   await updatePassword(user, newPassword);
        // }

        console.log('Password update simulated');
      } catch (error) {
        console.error('Error updating password:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: Error) => {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password');
    },
  });
};

// Update user avatar
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      avatarFile,
    }: {
      userId: string;
      avatarFile: File;
    }): Promise<string> => {
      try {
        // Note: This would typically upload to Firebase Storage
        // For now, we'll simulate the upload and return a mock URL

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In real implementation:
        // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
        // import { storage } from '@/lib/firebase/config';
        // const avatarRef = ref(storage, `avatars/${userId}`);
        // const snapshot = await uploadBytes(avatarRef, avatarFile);
        // const avatarUrl = await getDownloadURL(snapshot.ref);

        const mockAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userId}&backgroundColor=f97316`;

        // Update user document with new avatar URL
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          avatar: mockAvatarUrl,
          updatedAt: Date.now(),
        });

        return mockAvatarUrl;
      } catch (error) {
        console.error('Error updating avatar:', error);
        throw new Error('Failed to update avatar');
      }
    },
    onSuccess: (avatarUrl, { userId }) => {
      // Update user data in cache
      queryClient.setQueryData(
        ['enhanced-user-profile', userId],
        (old: User | null) => {
          if (!old) return null;
          return { ...old, avatar: avatarUrl, updatedAt: Date.now() };
        }
      );

      queryClient.invalidateQueries({
        queryKey: ['enhanced-user-profile', userId],
      });
      toast.success('Avatar updated successfully');
    },
    onError: error => {
      console.error('Avatar update error:', error);
      toast.error('Failed to update avatar');
    },
  });
};
