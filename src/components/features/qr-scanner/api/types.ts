import { ID, Timestamp } from '@/types';

// QR Scanner Types
export interface QRScannerProps {
  onScanResult: (result: string) => void;
  onClose?: () => void;
  scannerType: 'player' | 'vendor';
}

export type ScanResult = {
  success: boolean;
  result: 'VALIDATED' | 'VALID' | 'ALREADY_USED' | 'INVALID' | 'EXPIRED';
  message: string;
  ticketId?: string;
  coupon?: any;
  shopName?: string;
};

// QR Code Types
export interface QRCodeData {
  id: string;
  type: 'TICKET' | 'COUPON' | 'PRODUCT' | 'GAME';
  data: string;
  metadata?: Record<string, any>;
  expiresAt?: Timestamp;
  isActive: boolean;
}

// Scan Request Types
export interface ScanRequest {
  qrData: string;
  scannedBy: 'player' | 'vendor';
  device: 'web' | 'mobile' | 'tablet';
  appVersion: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Timestamp;
}

// Scan Response Types
export interface ScanResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
  message?: string;
}

// QR Scanner Settings
export interface QRScannerSettings {
  enableCamera: boolean;
  enableFileUpload: boolean;
  enableManualEntry: boolean;
  cameraResolution: 'low' | 'medium' | 'high';
  scanTimeout: number;
  maxRetries: number;
}

// Scan History
export interface ScanHistory {
  id: ID;
  scannerId: ID;
  scannerType: 'player' | 'vendor';
  qrData: string;
  scanResult: ScanResult;
  scannedAt: Timestamp;
  device: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// QR Scanner Analytics
export interface QRScannerAnalytics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  scansByType: Record<string, number>;
  scansByDevice: Record<string, number>;
  averageScanTime: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
}
