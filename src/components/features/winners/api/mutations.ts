import { firestoreService } from '@/lib/firebase/client-services';
import { db } from '@/lib/firebase/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { winnerQueryKeys } from './queries';
import type { Winner, WinnerAnnouncement, WinnerVerification } from './types';

// Winner claim mutation
export const useClaimPrize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      winnerId,
      claimMethod,
      claimDetails = {},
    }: {
      winnerId: string;
      claimMethod: 'AUTOMATIC' | 'MANUAL';
      claimDetails?: Record<string, any>;
    }) => {
      await firestoreService.updateWinner(winnerId, {
        isClaimed: true,
        claimedAt: Date.now(),
        claimMethod,
        status: 'CLAIMED',
        updatedAt: Date.now(),
      });

      return {
        success: true,
        winnerId,
        claimMethod,
        message: 'Prize claimed successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.winner(data.winnerId),
      });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });

      queryClient.setQueryData(
        winnerQueryKeys.winner(data.winnerId),
        (oldData: Winner | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              isClaimed: true,
              claimedAt: Date.now(),
              claimMethod: data.claimMethod,
              status: 'CLAIMED' as const,
              updatedAt: Date.now(),
            };
          }
          return oldData;
        }
      );
    },
    onError: (error: Error) => {
      console.error('Error claiming prize:', error);
      toast.error('Failed to claim prize. Please try again.');
    },
  });
};

// Winner status update mutation (Admin only)
export const useUpdateWinnerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      winnerId,
      status,
      adminId,
      notes = '',
    }: {
      winnerId: string;
      status: 'PENDING' | 'CLAIMED' | 'DELIVERED' | 'CANCELLED';
      adminId: string;
      notes?: string;
    }) => {
      const updateData: Partial<Winner> = {
        status,
        updatedAt: Date.now(),
      };

      switch (status) {
        case 'CLAIMED':
          updateData.isClaimed = true;
          updateData.claimedAt = Date.now();
          break;
        case 'DELIVERED':
          updateData.isClaimed = true;
          if (!updateData.claimedAt) {
            updateData.claimedAt = Date.now();
          }
          break;
        case 'CANCELLED':
          updateData.isClaimed = false;
          break;
      }

      await firestoreService.updateWinner(winnerId, updateData);

      return {
        success: true,
        winnerId,
        status,
        adminId,
        message: `Winner status updated to ${status.toLowerCase()}`,
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.winner(data.winnerId),
      });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });
    },
    onError: (error: Error) => {
      console.error('Error updating winner status:', error);
      toast.error('Failed to update winner status. Please try again.');
    },
  });
};

// Winner announcement creation mutation
export const useCreateWinnerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      announcement: Omit<WinnerAnnouncement, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      const newAnnouncement = {
        ...announcement,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        publishedAt: announcement.publishedAt || Date.now(),
      };

      const docRef = await addDoc(
        collection(db, 'winnerAnnouncements'),
        newAnnouncement
      );
      const id = docRef.id;

      return {
        success: true,
        announcement: { ...newAnnouncement, id },
        message: 'Winner announcement created successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.announcements,
      });
    },
    onError: (error: Error) => {
      console.error('Error creating winner announcement:', error);
      toast.error('Failed to create announcement. Please try again.');
    },
  });
};

// Winner announcement update mutation
export const useUpdateWinnerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      announcementId,
      updates,
    }: {
      announcementId: string;
      updates: Partial<WinnerAnnouncement>;
    }) => {
      const updateData = {
        ...updates,
        updatedAt: Date.now(),
      };

      await updateDoc(
        doc(db, 'winnerAnnouncements', announcementId),
        updateData
      );

      return {
        success: true,
        announcementId,
        updates: updateData,
        message: 'Announcement updated successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.announcements,
      });
    },
    onError: (error: Error) => {
      console.error('Error updating winner announcement:', error);
      toast.error('Failed to update announcement. Please try again.');
    },
  });
};

// Winner announcement deletion mutation
export const useDeleteWinnerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      await deleteDoc(doc(db, 'winnerAnnouncements', announcementId));

      return {
        success: true,
        announcementId,
        message: 'Announcement deleted successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.announcements,
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting winner announcement:', error);
      toast.error('Failed to delete announcement. Please try again.');
    },
  });
};

// Winner verification mutation (for admin use)
export const useVerifyWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      winnerId,
      adminId,
      verificationNotes = '',
      isVerified = true,
    }: {
      winnerId: string;
      adminId: string;
      verificationNotes?: string;
      isVerified?: boolean;
    }) => {
      await firestoreService.updateWinner(winnerId, {
        updatedAt: Date.now(),
      });

      const verificationRecord: Omit<WinnerVerification, 'id'> = {
        winnerId,
        verificationType: 'OTHER',
        documentUrl: '',
        documentType: 'verification_notes',
        status: isVerified ? 'VERIFIED' : 'REJECTED',
        verifiedAt: isVerified ? Date.now() : undefined,
        verifiedBy: adminId,
        rejectionReason: !isVerified ? verificationNotes : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, 'winnerVerifications'), verificationRecord);

      return {
        success: true,
        winnerId,
        adminId,
        verificationNotes,
        isVerified,
        message: `Winner ${isVerified ? 'verified' : 'rejected'} successfully!`,
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.winner(data.winnerId),
      });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });
    },
    onError: (error: Error) => {
      console.error('Error verifying winner:', error);
      toast.error('Failed to verify winner. Please try again.');
    },
  });
};

// Winner prize delivery mutation
export const useDeliverPrize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      winnerId,
      deliveryMethod,
      trackingNumber = '',
      adminId,
      deliveryNotes = '',
    }: {
      winnerId: string;
      deliveryMethod: string;
      trackingNumber?: string;
      adminId: string;
      deliveryNotes?: string;
    }) => {
      await firestoreService.updateWinner(winnerId, {
        status: 'DELIVERED',
        isClaimed: true,
        claimedAt: Date.now(),
        updatedAt: Date.now(),
      });

      return {
        success: true,
        winnerId,
        deliveryMethod,
        trackingNumber,
        adminId,
        message: 'Prize delivery recorded successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.winner(data.winnerId),
      });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });

      queryClient.setQueryData(
        winnerQueryKeys.winner(data.winnerId),
        (oldData: Winner | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              status: 'DELIVERED' as const,
              isClaimed: true,
              updatedAt: Date.now(),
            };
          }
          return oldData;
        }
      );
    },
    onError: (error: Error) => {
      console.error('Error delivering prize:', error);
      toast.error('Failed to record prize delivery. Please try again.');
    },
  });
};

// Create winner mutation (Admin only)
export const useCreateWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      winnerData: Omit<Winner, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      const newWinner = {
        ...winnerData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'winners'), newWinner);
      const id = docRef.id;

      return {
        success: true,
        winner: { ...newWinner, id },
        message: 'Winner created successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });

      queryClient.setQueryData(
        winnerQueryKeys.all,
        (oldData: Winner[] | undefined) => {
          return oldData ? [...oldData, data.winner] : [data.winner];
        }
      );
    },
    onError: (error: Error) => {
      console.error('Error creating winner:', error);
      toast.error('Failed to create winner. Please try again.');
    },
  });
};

// Bulk winner status update mutation (Admin only)
export const useBulkUpdateWinnerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      winnerIds,
      status,
      adminId,
    }: {
      winnerIds: string[];
      status: 'PENDING' | 'CLAIMED' | 'DELIVERED' | 'CANCELLED';
      adminId: string;
    }) => {
      const updatePromises = winnerIds.map(winnerId =>
        firestoreService.updateWinner(winnerId, {
          status,
          updatedAt: Date.now(),
        })
      );

      await Promise.all(updatePromises);

      return {
        success: true,
        winnerIds,
        status,
        adminId,
        count: winnerIds.length,
        message: `${winnerIds.length} winners updated successfully!`,
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });

      data.winnerIds.forEach(winnerId => {
        queryClient.invalidateQueries({
          queryKey: winnerQueryKeys.winner(winnerId),
        });
      });
    },
    onError: (error: Error) => {
      console.error('Error bulk updating winner status:', error);
      toast.error('Failed to update winners. Please try again.');
    },
  });
};

// Winner leaderboard refresh mutation (Admin only)
export const useRefreshLeaderboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ['winners', 'leaderboard'] });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });

      return {
        success: true,
        message: 'Leaderboard refreshed successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      console.error('Error refreshing leaderboard:', error);
      toast.error('Failed to refresh leaderboard. Please try again.');
    },
  });
};

// Delete winner mutation (Admin only)
export const useDeleteWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (winnerId: string) => {
      await deleteDoc(doc(db, 'winners', winnerId));

      return {
        success: true,
        winnerId,
        message: 'Winner deleted successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: winnerQueryKeys.stats });
      queryClient.removeQueries({
        queryKey: winnerQueryKeys.winner(data.winnerId),
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting winner:', error);
      toast.error('Failed to delete winner. Please try again.');
    },
  });
};

// Winner contact mutation (Admin use)
export const useContactWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      winnerId,
      message,
      contactMethod,
      adminId,
    }: {
      winnerId: string;
      message: string;
      contactMethod: 'EMAIL' | 'SMS' | 'PHONE';
      adminId: string;
    }) => {
      const contactRecord = {
        winnerId,
        message,
        contactMethod,
        contactedBy: adminId,
        contactedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, 'winnerContacts'), contactRecord);

      return {
        success: true,
        winnerId,
        message: 'Winner contacted successfully!',
      };
    },
    onSuccess: data => {
      toast.success(data.message);

      queryClient.invalidateQueries({
        queryKey: winnerQueryKeys.winner(data.winnerId),
      });
    },
    onError: (error: Error) => {
      console.error('Error contacting winner:', error);
      toast.error('Failed to contact winner. Please try again.');
    },
  });
};
