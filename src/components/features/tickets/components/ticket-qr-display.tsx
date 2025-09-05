'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Share2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateQRCodeData } from '@/lib/utils/qr-utils';
import { LotteryTicket } from '@/types';

interface TicketQRDisplayProps {
  ticket: LotteryTicket;
  showActions?: boolean;
}

export const TicketQRDisplay: React.FC<TicketQRDisplayProps> = ({
  ticket,
  showActions = true,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code
  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    const qrData = generateQRCodeData(ticket.id);

    // In a real implementation, use a QR code library like 'qrcode'
    // For now, we'll create a placeholder
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Set canvas size
      canvas.width = 200;
      canvas.height = 200;

      // Create a simple QR-like pattern (placeholder)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 200, 200);

      ctx.fillStyle = '#FFFFFF';
      // Draw some QR-like squares
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * 10, j * 10, 10, 10);
          }
        }
      }

      // Add positioning squares (corner markers)
      ctx.fillStyle = '#000000';
      // Top-left
      ctx.fillRect(0, 0, 70, 70);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(10, 10, 50, 50);
      ctx.fillStyle = '#000000';
      ctx.fillRect(20, 20, 30, 30);

      // Top-right
      ctx.fillStyle = '#000000';
      ctx.fillRect(130, 0, 70, 70);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(140, 10, 50, 50);
      ctx.fillStyle = '#000000';
      ctx.fillRect(150, 20, 30, 30);

      // Bottom-left
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 130, 70, 70);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(10, 140, 50, 50);
      ctx.fillStyle = '#000000';
      ctx.fillRect(20, 150, 30, 30);

      // In real implementation, you would use:
      // import QRCode from 'qrcode';
      // QRCode.toCanvas(canvas, qrData, { width: 200 });
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `ticket-${ticket.ticketNumber}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Share QR code
  const shareQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async blob => {
        if (!blob) return;

        const file = new File([blob], `ticket-${ticket.ticketNumber}-qr.png`, {
          type: 'image/png',
        });

        if (navigator.share) {
          await navigator.share({
            title: t('tickets.shareTicket'),
            text: t('tickets.ticketNumber', { number: ticket.ticketNumber }),
            files: [file],
          });
        } else {
          // Fallback: copy QR data to clipboard
          const qrData = generateQRCodeData(ticket.id);
          await navigator.clipboard.writeText(qrData);
          alert(t('tickets.qrDataCopied'));
        }
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Print ticket with QR code
  const printTicket = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const qrDataUrl = canvas.toDataURL();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('tickets.ticketTitle')} - ${ticket.ticketNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .ticket-header {
              border-bottom: 2px solid #FF5722;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .qr-container {
              margin: 20px 0;
            }
            .ticket-info {
              text-align: left;
              margin: 20px 0;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .ticket-number {
              font-size: 24px;
              font-weight: bold;
              color: #FF5722;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-header">
            <h1>🎫 ${t('tickets.ticketTitle')}</h1>
            <div class="ticket-number">#${ticket.ticketNumber}</div>
          </div>
          
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
            <p><strong>${t('tickets.scanToValidate')}</strong></p>
          </div>
          
          <div class="ticket-info">
            <p><strong>${t('tickets.gameId')}:</strong> ${ticket.gameId}</p>
            <p><strong>${t('tickets.purchaseDate')}:</strong> ${new Date(ticket.purchaseDate).toLocaleDateString()}</p>
            <p><strong>${t('tickets.price')}:</strong> ${ticket.currency} ${ticket.price}</p>
            <p><strong>${t('tickets.status')}:</strong> ${t(`tickets.status.${ticket.status}`)}</p>
            ${ticket.expiresAt ? `<p><strong>${t('tickets.expiresAt')}:</strong> ${new Date(ticket.expiresAt).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>${t('tickets.authenticityNote')}</p>
            <p>${t('tickets.supportContact')}: support@lotteryapp.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  useEffect(() => {
    generateQRCode();
  }, [ticket.id]);

  return (
    <Card className='w-full max-w-sm mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <QrCode className='w-5 h-5' />
          <span>{t('tickets.qrCode')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='text-center space-y-4'>
        {/* QR Code Display */}
        <div className='flex justify-center'>
          <canvas
            ref={canvasRef}
            className='border rounded-lg shadow-sm'
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
        </div>

        {/* Ticket Information */}
        <div className='text-left space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
          <div className='flex justify-between'>
            <span className='font-medium'>{t('tickets.ticketNumber')}:</span>
            <span className='text-orange-600 dark:text-orange-400 font-mono'>
              #{ticket.ticketNumber}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='font-medium'>{t('tickets.status')}:</span>
            <span
              className={`capitalize ${
                ticket.status === 'valid'
                  ? 'text-green-600'
                  : ticket.status === 'used'
                    ? 'text-gray-600'
                    : ticket.status === 'expired'
                      ? 'text-red-600'
                      : 'text-yellow-600'
              }`}
            >
              {t(`tickets.status.${ticket.status}`)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='font-medium'>{t('tickets.price')}:</span>
            <span>
              {ticket.currency} {ticket.price}
            </span>
          </div>
          {ticket.expiresAt && (
            <div className='flex justify-between'>
              <span className='font-medium'>{t('tickets.expiresAt')}:</span>
              <span>{new Date(ticket.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Winner/Coupon Information */}
        {ticket.isWinner && ticket.prizeAmount && (
          <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg'>
            <h4 className='font-bold text-green-800 dark:text-green-200 flex items-center'>
              🏆 {t('tickets.congratulations')}
            </h4>
            <p className='text-green-700 dark:text-green-300'>
              {t('tickets.prizeWon')}: {ticket.currency} {ticket.prizeAmount}
            </p>
          </div>
        )}

        {ticket.coupon && !ticket.coupon.used && (
          <div className='bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg'>
            <h4 className='font-bold text-orange-800 dark:text-orange-200'>
              🎟️ {t('tickets.consolationPrize')}
            </h4>
            <p className='text-orange-700 dark:text-orange-300'>
              {ticket.coupon.amountOff}% {t('tickets.discount')}
            </p>
            <p className='text-sm text-orange-600 dark:text-orange-400 font-mono'>
              {t('tickets.code')}: {ticket.coupon.code}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className='grid grid-cols-2 gap-2'>
            <Button
              onClick={downloadQRCode}
              variant='outline'
              size='sm'
              className='flex items-center space-x-1'
            >
              <Download className='w-4 h-4' />
              <span>{t('common.download')}</span>
            </Button>
            <Button
              onClick={shareQRCode}
              variant='outline'
              size='sm'
              className='flex items-center space-x-1'
            >
              <Share2 className='w-4 h-4' />
              <span>{t('common.share')}</span>
            </Button>
            <Button
              onClick={printTicket}
              variant='outline'
              size='sm'
              className='col-span-2 flex items-center justify-center space-x-1'
            >
              <QrCode className='w-4 h-4' />
              <span>{t('tickets.printTicket')}</span>
            </Button>
          </div>
        )}

        {/* Security Note */}
        <div className='text-xs text-gray-500 dark:text-gray-400 mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded'>
          <p>{t('tickets.securityNote')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
