'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAllTicketNumbers } from '@/lib/utils/ticket-utils';
import { useState } from 'react';
import { QRGenerator } from './qr-generator';
import { QRScanner } from './qr-scanner';

export const QRDemo = () => {
  const [mode, setMode] = useState<'scanner' | 'generator' | 'none'>('none');
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanResult = (result: string) => {
    setScanResult(result);
    console.log('QR Scan Result:', result);
  };

  const mockTicketId =
    'ticket-' + Date.now() + Math.random().toString(36).substr(2, 9);
  const mockTicketNumbers = generateAllTicketNumbers(mockTicketId);

  const mockTicketData = {
    gameTitle: 'Demo Lottery Game',
    vendorName: 'Test Vendor',
    ...mockTicketNumbers,
    ticketId: mockTicketId,
  };

  return (
    <div className='max-w-2xl mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>QR Code Demo</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Button
              onClick={() => setMode('generator')}
              variant={mode === 'generator' ? 'default' : 'outline'}
              className='w-full'
            >
              Generate QR Code
            </Button>
            <Button
              onClick={() => setMode('scanner')}
              variant={mode === 'scanner' ? 'default' : 'outline'}
              className='w-full'
            >
              Scan QR Code
            </Button>
          </div>

          {mode === 'none' && (
            <div className='text-center text-gray-500 py-8'>
              Select an option above to test QR functionality
            </div>
          )}

          {scanResult && (
            <Card className='bg-green-50 dark:bg-green-900/20'>
              <CardHeader>
                <CardTitle className='text-green-700 dark:text-green-300'>
                  Scan Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='text-sm bg-white dark:bg-gray-800 p-4 rounded overflow-auto'>
                  {scanResult}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {mode === 'generator' && (
        <QRGenerator
          ticketId={mockTicketData.ticketId}
          gameTitle={mockTicketData.gameTitle}
          vendorName={mockTicketData.vendorName}
          ticketNumber={mockTicketData.ticketNumber}
          alternativeNumbers={mockTicketData.alternativeNumbers}
          onClose={() => setMode('none')}
        />
      )}

      {mode === 'scanner' && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setMode('none')}
          scannerType='player'
        />
      )}
    </div>
  );
};
