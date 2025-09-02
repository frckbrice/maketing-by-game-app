'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateQRCodeData } from '@/lib/utils/qr-utils';
import { Download, Eye, FileText, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface QRGeneratorProps {
  ticketId: string;
  gameTitle: string;
  vendorName: string;
  ticketNumber?: string;
  alternativeNumbers?: {
    readable: string;
    simple: string;
    formatted: string;
  };
  onClose?: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  ticketId,
  gameTitle,
  vendorName,
  ticketNumber,
  alternativeNumbers,
  onClose,
}) => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate QR code data and visual QR code
  const generateQRCode = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate secure QR code data
      const qrData = generateQRCodeData(ticketId);
      setQrCodeData(qrData);

      // Generate visual QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937', // Dark gray for QR code
          light: '#FFFFFF', // White background
        },
        errorCorrectionLevel: 'M',
      });

      setQrCodeUrl(qrCodeDataURL);
    } catch (err) {
      console.error('QR code generation failed:', err);
      setError(t('qr.generationError'));
    } finally {
      setIsGenerating(false);
    }
  }, [ticketId, t]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `ticket-${ticketId}-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket QR Code - ${ticketId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin: 20px;
              background: white;
            }
            .ticket-info {
              margin-bottom: 20px;
              padding: 15px;
              border: 2px solid #1F2937;
              border-radius: 10px;
              display: inline-block;
            }
            .qr-code {
              margin: 20px 0;
            }
            .ticket-id {
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
            }
            .game-title {
              font-size: 16px;
              color: #666;
              margin: 5px 0;
            }
            .vendor-name {
              font-size: 14px;
              color: #888;
              margin: 5px 0;
            }
            .instructions {
              font-size: 12px;
              color: #666;
              margin-top: 15px;
              max-width: 300px;
              margin-left: auto;
              margin-right: auto;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-info">
            <h2>${t('qr.lotteryTicket')}</h2>
            <div class="ticket-id">ID: ${ticketId}</div>
            <div class="game-title">${gameTitle}</div>
            <div class="vendor-name">${vendorName}</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="instructions">
              ${t('qr.scanInstructions')}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleShowData = () => {
    alert(`QR Code Data:\n${qrCodeData}`);
  };

  if (isGenerating) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>{t('qr.generatingQR')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('qr.pleaseWait')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>{t('qr.generator')}</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <Button onClick={generateQRCode} className="w-full">
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>{t('qr.ticketQRCode')}</span>
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ticket Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          {/* Primary Ticket Number - Most Prominent */}
          <div className="text-center bg-white dark:bg-gray-700 p-3 rounded-lg border-2 border-orange-500">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {t('qr.primaryTicketNumber')}
            </div>
            <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
              {ticketNumber || alternativeNumbers?.formatted || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('qr.easyToRemember')}
            </div>
          </div>

          {/* Alternative Numbers */}
          {alternativeNumbers && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('qr.alternativeNumbers')}:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-gray-700 p-2 rounded text-center">
                  <div className="text-gray-500">{t('qr.readable')}</div>
                  <div className="font-mono">{alternativeNumbers.readable}</div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-2 rounded text-center">
                  <div className="text-gray-500">{t('qr.simple')}</div>
                  <div className="font-mono">{alternativeNumbers.simple}</div>
                </div>
              </div>
            </div>
          )}

          {/* Game Information */}
          <div className="border-t pt-3 space-y-1">
            <div className="text-sm">
              <span className="font-semibold">{t('qr.game')}:</span>
              <span className="ml-2">{gameTitle}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">{t('qr.vendor')}:</span>
              <span className="ml-2">{vendorName}</span>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {qrCodeUrl && (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('qr.scanToValidate')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>{t('qr.download')}</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>{t('qr.print')}</span>
          </Button>
        </div>

        <Button
          onClick={handleShowData}
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center space-x-1"
        >
          <Eye className="w-4 h-4" />
          <span>{t('qr.showData')}</span>
        </Button>

        <div className="text-xs text-gray-500 text-center">
          {t('qr.securelyGenerated')}
        </div>
      </CardContent>
    </Card>
  );
};