import { firestoreService } from '@/lib/firebase/client-services';
import { useQuery } from '@tanstack/react-query';
import type { VendorApplication, VendorApplicationWithDetails } from './types';

// Query keys
export const vendorApplicationQueryKeys = {
  all: ['vendor-applications'] as const,
  application: (id: string) => ['vendor-applications', id] as const,
  userApplication: (userId: string) =>
    ['vendor-applications', 'user', userId] as const,
  pending: ['vendor-applications', 'pending'] as const,
  approved: ['vendor-applications', 'approved'] as const,
  rejected: ['vendor-applications', 'rejected'] as const,
};

// Get all vendor applications
export const useVendorApplications = (status?: string) => {
  const queryKey = status
    ? status === 'pending'
      ? vendorApplicationQueryKeys.pending
      : status === 'approved'
        ? vendorApplicationQueryKeys.approved
        : status === 'rejected'
          ? vendorApplicationQueryKeys.rejected
          : vendorApplicationQueryKeys.all
    : vendorApplicationQueryKeys.all;

  return useQuery({
    queryKey,
    queryFn: async (): Promise<VendorApplication[]> => {
      try {
        const applications = await firestoreService.getAllVendorApplications();
        if (status) {
          return applications.filter(
            app => app.status === status.toUpperCase()
          );
        }
        return applications;
      } catch (error) {
        console.error('Error fetching vendor applications:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Get vendor application by ID
export const useVendorApplication = (id: string) => {
  return useQuery({
    queryKey: vendorApplicationQueryKeys.application(id),
    queryFn: async (): Promise<VendorApplicationWithDetails | null> => {
      if (!id) return null;

      try {
        const applications = await firestoreService.getAllVendorApplications();
        const application = applications.find(app => app.id === id);
        return application
          ? {
              ...application,
              user: {},
              reviewer: undefined,
              documents: [],
              notes: [],
            }
          : null;
      } catch (error) {
        console.error('Error fetching vendor application:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get vendor application by user ID
export const useUserVendorApplication = (userId: string) => {
  return useQuery({
    queryKey: vendorApplicationQueryKeys.userApplication(userId),
    queryFn: async (): Promise<VendorApplication | null> => {
      if (!userId) return null;

      try {
        return await firestoreService.getVendorApplication(userId);
      } catch (error) {
        console.error('Error fetching user vendor application:', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get pending vendor applications
export const usePendingVendorApplications = () => {
  return useQuery({
    queryKey: vendorApplicationQueryKeys.pending,
    queryFn: async (): Promise<VendorApplication[]> => {
      try {
        const applications = await firestoreService.getAllVendorApplications();
        return applications.filter(app => app.status === 'PENDING');
      } catch (error) {
        console.error('Error fetching pending vendor applications:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get approved vendor applications
export const useApprovedVendorApplications = () => {
  return useQuery({
    queryKey: vendorApplicationQueryKeys.approved,
    queryFn: async (): Promise<VendorApplication[]> => {
      try {
        const applications = await firestoreService.getAllVendorApplications();
        return applications.filter(app => app.status === 'APPROVED');
      } catch (error) {
        console.error('Error fetching approved vendor applications:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Get rejected vendor applications
export const useRejectedVendorApplications = () => {
  return useQuery({
    queryKey: vendorApplicationQueryKeys.rejected,
    queryFn: async (): Promise<VendorApplication[]> => {
      try {
        const applications = await firestoreService.getAllVendorApplications();
        return applications.filter(app => app.status === 'REJECTED');
      } catch (error) {
        console.error('Error fetching rejected vendor applications:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
