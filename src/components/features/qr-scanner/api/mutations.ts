import { useAuth } from '@/lib/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ScanRequest, ScanResponse } from './types';

// Query keys for QR scanner
export const qrScannerQueryKeys = {
  all: ['qr-scanner'] as const,
  scanHistory: ['qr-scanner', 'history'] as const,
  analytics: ['qr-scanner', 'analytics'] as const,
  settings: ['qr-scanner', 'settings'] as const,
};

// QR Code scan mutation
export const useScanQRCode = () => {
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (scanRequest: ScanRequest): Promise<ScanResponse> => {
      try {
        // Get Firebase auth token
        const token = await firebaseUser?.getIdToken();

        const response = await fetch('/api/tickets/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scanRequest),
        });

        if (!response.ok) {
          throw new Error(`Scan failed: ${response.statusText}`);
        }

        const result: ScanResponse = await response.json();
        return result;
      } catch (error) {
        console.error('QR scan failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Scan failed',
          message: 'Failed to process QR code scan',
        };
      }
    },
    onSuccess: data => {
      // Invalidate scan history and analytics
      queryClient.invalidateQueries({
        queryKey: qrScannerQueryKeys.scanHistory,
      });
      queryClient.invalidateQueries({ queryKey: qrScannerQueryKeys.analytics });
    },
    onError: error => {
      console.error('Error in QR scan mutation:', error);
    },
  });
};

// Manual QR code entry mutation
export const useManualQREntry = () => {
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (qrData: string): Promise<ScanResponse> => {
      try {
        // Get Firebase auth token
        const token = await firebaseUser?.getIdToken();

        const scanRequest: ScanRequest = {
          qrData,
          scannedBy: 'player', // Default to player, can be overridden
          device: 'web',
          appVersion: '1.0.0',
          timestamp: Date.now(),
        };

        const response = await fetch('/api/tickets/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scanRequest),
        });

        if (!response.ok) {
          throw new Error(`Manual entry failed: ${response.statusText}`);
        }

        const result: ScanResponse = await response.json();
        return result;
      } catch (error) {
        console.error('Manual QR entry failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Manual entry failed',
          message: 'Failed to process manual QR code entry',
        };
      }
    },
    onSuccess: data => {
      // Invalidate scan history and analytics
      queryClient.invalidateQueries({
        queryKey: qrScannerQueryKeys.scanHistory,
      });
      queryClient.invalidateQueries({ queryKey: qrScannerQueryKeys.analytics });
    },
    onError: error => {
      console.error('Error in manual QR entry mutation:', error);
    },
  });
};

// Manual ticket validation mutation (using ticket numbers)
export const useManualTicketValidation = () => {
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      ticketNumber,
      scannerType = 'player',
      vendorId,
    }: {
      ticketNumber: string;
      scannerType?: 'player' | 'vendor';
      vendorId?: string;
    }): Promise<ScanResponse> => {
      try {
        // Get Firebase auth token
        const token = await firebaseUser?.getIdToken();

        const validationRequest = {
          ticketNumber,
          scannedBy: scannerType,
          vendorId,
          device: 'web' as const,
          appVersion: '1.0.0',
        };

        const response = await fetch('/api/tickets/validate-manual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(validationRequest),
        });

        if (!response.ok) {
          throw new Error(`Ticket validation failed: ${response.statusText}`);
        }

        const result: ScanResponse = await response.json();
        return result;
      } catch (error) {
        console.error('Manual ticket validation failed:', error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ticket validation failed',
          message: 'Failed to validate ticket manually',
        };
      }
    },
    onSuccess: data => {
      // Invalidate scan history and analytics
      queryClient.invalidateQueries({
        queryKey: qrScannerQueryKeys.scanHistory,
      });
      queryClient.invalidateQueries({ queryKey: qrScannerQueryKeys.analytics });
    },
    onError: error => {
      console.error('Error in manual ticket validation mutation:', error);
    },
  });
};

// QR code validation mutation
export const useValidateQRCode = () => {
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      qrData,
      validationType,
    }: {
      qrData: string;
      validationType: 'TICKET' | 'COUPON' | 'PRODUCT';
    }): Promise<ScanResponse> => {
      try {
        // Get Firebase auth token
        const token = await firebaseUser?.getIdToken();

        const response = await fetch('/api/tickets/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            qrData,
            validationType,
            timestamp: Date.now(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Validation failed: ${response.statusText}`);
        }

        const result: ScanResponse = await response.json();
        return result;
      } catch (error) {
        console.error('QR validation failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Validation failed',
          message: 'Failed to validate QR code',
        };
      }
    },
    onSuccess: data => {
      // Invalidate scan history and analytics
      queryClient.invalidateQueries({
        queryKey: qrScannerQueryKeys.scanHistory,
      });
      queryClient.invalidateQueries({ queryKey: qrScannerQueryKeys.analytics });
    },
    onError: error => {
      console.error('Error in QR validation mutation:', error);
    },
  });
};

// QR scanner settings update mutation
export const useUpdateQRScannerSettings = () => {
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (
      settings: Partial<{
        enableCamera: boolean;
        enableFileUpload: boolean;
        enableManualEntry: boolean;
        cameraResolution: 'low' | 'medium' | 'high';
        scanTimeout: number;
        maxRetries: number;
      }>
    ) => {
      try {
        // Get Firebase auth token
        const token = await firebaseUser?.getIdToken();

        const response = await fetch('/api/qr-scanner/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        });

        if (!response.ok) {
          throw new Error(`Settings update failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('QR scanner settings update failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate settings query
      queryClient.invalidateQueries({ queryKey: qrScannerQueryKeys.settings });
    },
    onError: error => {
      console.error('Error in QR scanner settings update mutation:', error);
    },
  });
};

// QR code generation mutation (for creating QR codes)
export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (qrData: {
      type: 'TICKET' | 'COUPON' | 'PRODUCT' | 'GAME';
      data: string;
      metadata?: Record<string, any>;
      expiresAt?: number;
    }) => {
      try {
        // Get Firebase auth token
        const token = await firebaseUser?.getIdToken();

        const response = await fetch('/api/qr-scanner/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(qrData),
        });

        if (!response.ok) {
          throw new Error(`QR generation failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('QR generation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate any related queries
      queryClient.invalidateQueries({ queryKey: qrScannerQueryKeys.all });
    },
    onError: error => {
      console.error('Error in QR generation mutation:', error);
    },
  });
};
