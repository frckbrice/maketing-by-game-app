import { db } from '@/lib/firebase/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AdminUser, AppSettings, Notification, Role, VendorData } from './type';

// Admin User Mutations
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      adminData: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>
    ) => {
      try {
        const newAdmin = {
          ...adminData,
          createdAt: new Date(),
          lastLogin: undefined,
        };

        const docRef = await addDoc(collection(db, 'admins'), newAdmin);
        return { id: docRef.id, ...newAdmin };
      } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: Partial<AdminUser> & { id: string }) => {
      try {
        await updateDoc(doc(db, 'admins', id), updateData);
        return { id, ...updateData };
      } catch (error) {
        console.error('Error updating admin:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      try {
        await deleteDoc(doc(db, 'admins', adminId));
        return adminId;
      } catch (error) {
        console.error('Error deleting admin:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Vendor Mutations
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: Partial<VendorData> & { id: string }) => {
      try {
        await updateDoc(doc(db, 'users', id), {
          ...updateData,
          updatedAt: Date.now(),
        });
        return { id, ...updateData };
      } catch (error) {
        console.error('Error updating vendor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useSuspendVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      try {
        await updateDoc(doc(db, 'users', id), {
          status: 'SUSPENDED',
          suspensionReason: reason,
          suspendedAt: Date.now(),
          updatedAt: Date.now(),
        });
        return id;
      } catch (error) {
        console.error('Error suspending vendor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useActivateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await updateDoc(doc(db, 'users', id), {
          status: 'ACTIVE',
          suspensionReason: null,
          suspendedAt: null,
          updatedAt: Date.now(),
        });
        return id;
      } catch (error) {
        console.error('Error activating vendor:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

// Notification Mutations
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      notificationData: Omit<
        Notification,
        'id' | 'createdAt' | 'sentAt' | 'readCount' | 'totalRecipients'
      >
    ) => {
      try {
        const newNotification = {
          ...notificationData,
          createdAt: new Date(),
          readCount: 0,
          totalRecipients: 0,
        };

        const docRef = await addDoc(
          collection(db, 'notifications'),
          newNotification
        );
        return { id: docRef.id, ...newNotification };
      } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        await updateDoc(doc(db, 'notifications', notificationId), {
          status: 'SENT',
          sentAt: new Date(),
        });

        // Send the notification through all channels
        try {
          // Get the notification data
          const notificationDoc = await getDoc(
            doc(db, 'notifications', notificationId)
          );
          const notification = notificationDoc.data();

          if (notification) {
            // Call the comprehensive notification API
            const response = await fetch('/api/admin/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`,
              },
              body: JSON.stringify({
                notificationId,
                title: notification.title,
                message: notification.message,
                targetAudience: notification.targetAudience,
                recipients: notification.recipients,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to send notification');
            }

            const result = await response.json();
            console.log('✅ Notification sent successfully:', result);

            // Update notification with final delivery stats
            await updateDoc(doc(db, 'notifications', notificationId), {
              finalDeliveryStats: result.stats,
              fullyProcessed: true,
            });
          }
        } catch (sendError) {
          console.error('❌ Failed to send notification:', sendError);

          // Update notification status to show sending failed
          await updateDoc(doc(db, 'notifications', notificationId), {
            status: 'FAILED',
            errorMessage:
              sendError instanceof Error
                ? sendError.message
                : String(sendError),
            failedAt: new Date(),
          }).catch(updateError => {
            console.error('Failed to update notification status:', updateError);
          });

          // Re-throw error so the UI can show the failure
          throw sendError;
        }

        return notificationId;
      } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        return notificationId;
      } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

// Role Mutations
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>
    ) => {
      try {
        const newRole = {
          ...roleData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          userCount: 0,
        };

        const docRef = await addDoc(collection(db, 'roles'), newRole);
        return { id: docRef.id, ...newRole };
      } catch (error) {
        console.error('Error creating role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: Partial<Role> & { id: string }) => {
      try {
        await updateDoc(doc(db, 'roles', id), {
          ...updateData,
          updatedAt: Date.now(),
        });
        return { id, ...updateData };
      } catch (error) {
        console.error('Error updating role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      try {
        // Check if role is in use before deleting
        const usersWithRoleQuery = query(
          collection(db, 'users'),
          where('role', '==', roleId),
          limit(1)
        );
        const usersWithRole = await getDocs(usersWithRoleQuery);

        if (!usersWithRole.empty) {
          throw new Error(
            'Cannot delete role that is currently assigned to users'
          );
        }

        await deleteDoc(doc(db, 'roles', roleId));
        return roleId;
      } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
  });
};

// Settings Mutations
export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      try {
        const updatedSettings = {
          ...settings,
          updatedAt: Date.now(),
        };

        await setDoc(doc(db, 'settings', 'app'), updatedSettings, {
          merge: true,
        });

        return updatedSettings;
      } catch (error) {
        console.error('Error updating app settings:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
};

// Game Mutations
export const useCreateGameAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameData: any) => {
      try {
        const newGame = {
          ...gameData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'PENDING', // Admin approval required
        };

        const docRef = await addDoc(collection(db, 'games'), newGame);
        return { id: docRef.id, ...newGame };
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
};

export const useApproveGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      try {
        await updateDoc(doc(db, 'games', gameId), {
          status: 'ACTIVE',
          approvedAt: Date.now(),
          updatedAt: Date.now(),
        });
        return gameId;
      } catch (error) {
        console.error('Error approving game:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useRejectGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      reason,
    }: {
      gameId: string;
      reason?: string;
    }) => {
      try {
        await updateDoc(doc(db, 'games', gameId), {
          status: 'REJECTED',
          rejectionReason: reason,
          rejectedAt: Date.now(),
          updatedAt: Date.now(),
        });
        return gameId;
      } catch (error) {
        console.error('Error rejecting game:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};
