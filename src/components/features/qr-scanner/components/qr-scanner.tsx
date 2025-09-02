'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Camera, CheckCircle, Upload, X, XCircle } from 'lucide-react';
import jsQR from 'jsqr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useManualQREntry, useManualTicketValidation, useScanQRCode } from '../api/mutations';
import type { ScanResult } from '../api/types';

interface QRScannerProps {
  onScanResult: (result: string) => void;
  onClose?: () => void;
  scannerType: 'player' | 'vendor';
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanResult,
  onClose,
  scannerType
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Use the new mutations
  const scanQRCodeMutation = useScanQRCode();
  const manualQREntryMutation = useManualQREntry();
  const manualTicketValidation = useManualTicketValidation();

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setHasCamera(true);
        setIsScanning(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError(t('qr.cameraError'));
      setHasCamera(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  // Process QR scan
  const processScan = async (qrData: string) => {
    setIsProcessing(true);

    try {
      const scanRequest = {
        qrData,
        scannedBy: scannerType,
        device: 'web' as const,
        appVersion: '1.0.0',
        timestamp: Date.now(),
      };

      const result = await scanQRCodeMutation.mutateAsync(scanRequest);
      setScanResult(result.data || {
        success: false,
        result: 'INVALID',
        message: 'Scan failed',
      });

      if (result.success) {
        onScanResult(qrData);
      }
    } catch (error) {
      console.error('Scan processing failed:', error);
      setScanResult({
        success: false,
        result: 'INVALID',
        message: t('qr.scanError'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Scan QR from video frame
  const scanFromVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
      processScan(qrCode.data);
      stopCamera();
    }
  }, [isScanning, isProcessing]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('qr.invalidFileType'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Create image element and load the uploaded file
      const img = new Image();
      
      const imageLoadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      img.src = URL.createObjectURL(file);
      await imageLoadPromise;

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      context.drawImage(img, 0, 0);
      
      // Extract image data and scan for QR code
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

      // Clean up blob URL
      URL.revokeObjectURL(img.src);

      if (qrCode) {
        await processScan(qrCode.data);
      } else {
        setError(t('qr.noQRFound'));
      }
    } catch (error) {
      console.error('File upload QR extraction failed:', error);
      setError(t('qr.fileProcessError'));
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // State for manual input
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Manual ticket number validation and submission
  const handleManualSubmit = async () => {
    if (!manualInputValue.trim()) {
      setInputError(t('qr.ticketNumberRequired'));
      return;
    }

    setIsProcessing(true);
    setInputError(null);

    try {
      const result = await manualTicketValidation.mutateAsync({
        ticketNumber: manualInputValue.trim(),
        scannerType: scannerType,
        vendorId: scannerType === 'vendor' ? undefined : undefined, // Could be set based on user context
      });
      
      setScanResult(result.data || {
        success: false,
        result: 'INVALID',
        message: 'Manual validation failed',
      });
      
      if (result.success) {
        onScanResult(manualInputValue.trim());
        setShowManualInput(false);
        setManualInputValue('');
      }
    } catch (error) {
      console.error('Manual ticket validation failed:', error);
      setScanResult({
        success: false,
        result: 'INVALID',
        message: t('qr.scanError'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format input as user types (for better UX)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // Auto-format as XXX-XXX for 6 digit numbers
    if (value.length === 3 && !value.includes('-')) {
      value = value + '-';
    } else if (value.length === 7 && value.charAt(3) === '-') {
      // Remove extra characters beyond XXX-XXX format
      value = value.substring(0, 7);
    }
    
    setManualInputValue(value);
    setInputError(null);
  };

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(scanFromVideo, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getResultIcon = (result: ScanResult['result']) => {
    switch (result) {
      case 'VALIDATED':
      case 'VALID':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'ALREADY_USED':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'EXPIRED':
      case 'INVALID':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };

  const getResultColor = (result: ScanResult['result']) => {
    switch (result) {
      case 'VALIDATED':
      case 'VALID':
        return 'text-green-600 dark:text-green-400';
      case 'ALREADY_USED':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'EXPIRED':
      case 'INVALID':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (scanResult) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{t('qr.scanResult')}</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {getResultIcon(scanResult.result)}

          <div>
            <h3 className={`text-lg font-semibold ${getResultColor(scanResult.result)}`}>
              {scanResult.message}
            </h3>
            {scanResult.ticketId && (
              <p className="text-sm text-gray-500 mt-2">
                {t('qr.ticketId')}: {scanResult.ticketId}
              </p>
            )}
          </div>

          {scanResult.coupon && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                {t('qr.couponAvailable')}
              </h4>
              <p className="text-orange-700 dark:text-orange-300">
                {scanResult.coupon.amountOff}% {t('qr.discount')}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {t('qr.code')}: {scanResult.coupon.code}
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => setScanResult(null)}
              className="flex-1"
            >
              {t('qr.scanAnother')}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t('common.close')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>
            {scannerType === 'vendor' ? t('qr.vendorScanner') : t('qr.playerScanner')}
          </span>
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('qr.processing')}
            </p>
          </div>
        )}

        {!isScanning && !isProcessing && (
          <>
            <div className="space-y-2">
              <Button
                onClick={initializeCamera}
                disabled={!navigator.mediaDevices}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                {t('qr.startCamera')}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('qr.uploadImage')}
              </Button>

              <Button
                onClick={() => setShowManualInput(!showManualInput)}
                variant="outline"
                className="w-full"
              >
                {t('qr.manualEntry')}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Manual Input Interface */}
            {showManualInput && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('qr.enterTicketNumber')}
                  </label>
                  <input
                    type="text"
                    value={manualInputValue}
                    onChange={handleInputChange}
                    placeholder={t('qr.ticketNumberPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center font-mono text-lg"
                    maxLength={20}
                    disabled={isProcessing}
                  />
                  {inputError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {inputError}
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p>{t('qr.acceptedFormats')}:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('qr.formatSimple')}: 123-456</li>
                    <li>{t('qr.formatReadable')}: LT-2024-ABC123</li>
                    <li>{t('qr.formatNumbers')}: 123456</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualInputValue.trim() || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    {t('qr.validateTicket')}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowManualInput(false);
                      setManualInputValue('');
                      setInputError(null);
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {isScanning && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="absolute inset-0 border-2 border-orange-500 rounded-lg"></div>
            <div className="absolute top-2 left-2 right-2">
              <div className="bg-black/50 text-white p-2 rounded text-center">
                <p className="text-sm">{t('qr.pointCamera')}</p>
              </div>
            </div>
            <Button
              onClick={stopCamera}
              variant="destructive"
              size="sm"
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
            >
              {t('qr.stopScanning')}
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};