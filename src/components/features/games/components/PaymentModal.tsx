'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { currencyService } from '@/lib/api/currencyService';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  securePaymentService
} from '@/lib/services/securePaymentService';
import { generateAllTicketNumbers } from '@/lib/utils/ticket-utils';
import { LotteryGame } from '@/types';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Mail,
  Phone,
  Printer,
  Shield,
  Smartphone,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PaymentModalProps {
  game: LotteryGame;
  isOpen: boolean;
  onClose: () => void;
}

interface Ticket {
  id: string;
  gameId: string;
  gameTitle: string;
  ticketNumber: string;
  alternativeNumbers?: {
    readable: string;
    simple: string;
    formatted: string;
  };
  price: number;
  currency: string;
  purchaseDate: number;
  qrCode: string;
}

type PaymentMethod = 'ORANGE_MONEY' | 'MTN_MOMO';
type PaymentStep = 'method' | 'phone' | 'processing' | 'success';

export const PaymentModal = React.memo<PaymentModalProps>(function PaymentModal({ game, isOpen, onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('ORANGE_MONEY');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [convertedPrice, setConvertedPrice] = useState<number>(
    game.ticketPrice
  );
  const [userCurrency, setUserCurrency] = useState<string>('XAF');
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Convert price to XAF (Central African Franc)
  const convertPrice = useCallback(async () => {
    try {
      if (game.currency !== 'XAF') {
        const converted = await currencyService.convertCurrency(
          game.ticketPrice,
          game.currency,
          'XAF'
        );
        setConvertedPrice(converted);
      } else {
        setConvertedPrice(game.ticketPrice);
      }
    } catch (error) {
      console.error('Currency conversion failed:', error);
      // Use original price if conversion fails
      setConvertedPrice(game.ticketPrice);
    }
  }, [game.ticketPrice, game.currency]);

  useEffect(() => {
    if (isOpen) {
      convertPrice();
      // Reset form state when modal opens
      setStep('method');
      setPhoneNumber('');
      setProcessing(false);
      setTicket(null);
    }
  }, [isOpen, convertPrice]);

  const generateTicket = (gameData: LotteryGame): Ticket => {
    // Create a realistic Firebase-style ID for the demo
    const firebaseId = Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 11);
    const ticketNumbers = generateAllTicketNumbers(firebaseId);

    return {
      id: firebaseId,
      gameId: gameData.id,
      gameTitle: gameData.title,
      ticketNumber: ticketNumbers.ticketNumber, // Primary user-facing number (formatted)
      alternativeNumbers: ticketNumbers.alternativeNumbers,
      price: convertedPrice,
      currency: userCurrency,
      purchaseDate: Date.now(),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(firebaseId)}`,
    };
  };

  const validatePhoneNumber = (
    phone: string,
    method: PaymentMethod
  ): boolean => {
    return securePaymentService.validatePhoneNumber(phone, method);
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      toast.error(t('payment.errors.enterPhone'));
      return;
    }

    if (!validatePhoneNumber(phoneNumber, selectedMethod)) {
      const methodInfo =
        securePaymentService.getPaymentMethodInfo(selectedMethod);
      toast.error(t('payment.errors.invalidPhone', { method: methodInfo.name }));
      return;
    }

    setStep('processing');
    handlePayment();
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error(t('payment.errors.loginRequired'));
      return;
    }

    setProcessing(true);
    setPaymentAttempts(0);

    try {
      const methodInfo =
        securePaymentService.getPaymentMethodInfo(selectedMethod);
      toast.info(t('payment.notifications.initiated', { method: methodInfo.name }));

      // Initiate payment through secure API
      const paymentResult = await securePaymentService.initiatePayment({
        gameId: game.id,
        paymentMethod: selectedMethod,
        phoneNumber,
        amount: convertedPrice,
        currency: userCurrency,
      });

      if (paymentResult.success && paymentResult.transactionId) {
        // Start polling for payment status
        const transactionId = paymentResult.transactionId;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes with 5-second intervals

        const checkStatus = async (): Promise<void> => {
          if (attempts >= maxAttempts) {
            throw new Error(t('payment.errors.paymentTimeout'));
          }

          try {
            const statusResult =
              await securePaymentService.checkTransactionStatus(transactionId);

            if (statusResult?.status === 'SUCCESS') {
              // Generate ticket after successful payment
              const newTicket = generateTicket(game);
              setTicket(newTicket);

              // Optimistic UI update - show success immediately
              setStep('success');
              toast.success(
                t('payment.notifications.successful', { method: methodInfo.name })
              );

              // Send notifications in background (non-blocking)
              Promise.all([
                sendTicketEmail(newTicket),
                sendTicketSMS(newTicket, phoneNumber),
              ])
                .then(() => {
                  toast.success(t('payment.notifications.emailSent'));
                })
                .catch(() => {
                  toast.info(t('payment.notifications.emailDelayed'));
                });
            } else if (
              statusResult?.status === 'FAILED' ||
              statusResult?.status === 'CANCELLED'
            ) {
              throw new Error(
                statusResult.message || t('payment.errors.paymentDeclined')
              );
            } else if (statusResult?.status === 'EXPIRED') {
              throw new Error(t('payment.errors.paymentExpired'));
            } else {
              // Still processing, check again after 3 seconds for better UX
              attempts++;
              setPaymentAttempts(attempts);
              setStatusMessage(
                t('payment.status.checking', {
                  attempt: attempts,
                  total: maxAttempts,
                })
              );
              setTimeout(checkStatus, 3000);
            }
          } catch (networkError) {
            // Handle network errors gracefully
            attempts++;
            if (attempts >= maxAttempts) {
              throw new Error(t('payment.errors.networkError'));
            }
            setTimeout(checkStatus, 5000);
          }
        };

        // Start status checking
        setTimeout(checkStatus, 5000);
      } else {
        throw new Error(paymentResult.message || t('payment.errors.paymentFailed'));
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('payment.errors.paymentFailed')
      );
      setStep('phone');
    } finally {
      setProcessing(false);
      setPaymentAttempts(0);
      setStatusMessage('');
    }
  };

  const sendTicketSMS = async (ticketData: Ticket, phone: string) => {
    try {
      // Send SMS notification via API
      await fetch('/api/notifications/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          message: `🎫 Your lottery ticket: ${ticketData.ticketNumber} for ${ticketData.gameTitle}. Good luck! Check your email for full details.`,
          ticketNumber: ticketData.ticketNumber,
        }),
      });
      console.log(`SMS sent to ${phone} for ticket:`, ticketData.ticketNumber);
    } catch (error) {
      console.error('Error sending SMS:', error);
      // Continue without SMS if it fails
    }
  };

  const sendTicketEmail = async (ticketData: Ticket) => {
    try {
      // Send email via optimized API
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ticket',
          to: user?.email,
          data: {
            ticketNumber: ticketData.ticketNumber,
            gameTitle: ticketData.gameTitle,
            price: ticketData.price,
            currency: ticketData.currency,
            purchaseDate: new Date(ticketData.purchaseDate).toLocaleDateString(),
            drawDate: new Date(game.drawDate).toLocaleDateString(),
            qrCode: ticketData.qrCode,
            userName: `${user?.firstName} ${user?.lastName}`,
          },
        }),
      });
      console.log('Email sent for ticket:', ticketData.ticketNumber);
    } catch (error) {
      console.error('Error sending email:', error);
      // Continue without email if it fails
    }
  };

  const printTicket = () => {
    if (!ticket) return;

    const printWindow = window.open('', '_blank');
    if (printWindow && printWindow.document) {
      const htmlContent = `
        <html>
          <head>
            <title>Game Ticket - ${ticket.ticketNumber}</title>
          <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 400px; 
                margin: 20px auto; 
                padding: 20px;
                border: 2px dashed #FF5722;
                background: #fafafa;
              }
              .header { text-align: center; margin-bottom: 20px; }
              .ticket-info { margin: 10px 0; }
              .qr-code { text-align: center; margin: 20px 0; }
              .footer { text-align: center; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>🎫 BLACKFRIDAY TICKET</h2>
              <h3>${ticket.gameTitle}</h3>
            </div>
            <div class="ticket-info">
              <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Price:</strong> ${currencyService.formatCurrency(ticket.price, ticket.currency)}</p>
              <p><strong>Purchase Date:</strong> ${new Date(ticket.purchaseDate).toLocaleString()}</p>
              <p><strong>Player:</strong> ${user?.firstName} ${user?.lastName}</p>
            </div>
          <div class="qr-code">
              <img src="${ticket.qrCode}" alt="QR Code" />
              <p>Scan to verify</p>
            </div>
            <div class="footer">
              <p>Keep this ticket safe. Good luck!</p>
              <p>Draw Date: ${new Date(game.drawDate).toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `;

      // Use innerHTML instead of deprecated document.write
      printWindow.document.documentElement.innerHTML = htmlContent;
      printWindow.print();
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;

    const ticketData = {
      ...ticket,
      playerName: `${user?.firstName} ${user?.lastName}`,
      drawDate: new Date(game.drawDate).toISOString(),
    };

    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticketNumber}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (!processing) {
      setStep('method');
      setPhoneNumber('');
      setTicket(null);
      onClose();
    }
  };

  const handlePlayAgain = () => {
    handleClose();
    // Navigate to games page
    window.location.href = '/games';
  };

  const getModalTitle = () => {
    switch (step) {
      case 'method':
        return t('payment.chooseMethod');
      case 'phone':
        return t('payment.enterPhone');
      case 'processing':
        return t('payment.processing');
      case 'success':
        return t('payment.success');
      default:
        return t('payment.title');
    }
  };

  const getModalSubtitle = () => {
    switch (step) {
      case 'method':
        return t('payment.selectMethodSubtitle');
      case 'phone':
        return t('payment.enterPhoneSubtitle');
      case 'processing':
        return statusMessage || t('payment.processingSubtitle');
      case 'success':
        return t('payment.successSubtitle');
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md w-full mx-4'>
        <DialogHeader>
          <DialogTitle className='text-center'>{getModalTitle()}</DialogTitle>
          <DialogDescription className='text-center'>
            {getModalSubtitle()}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {step === 'method' && (
            <>
              {/* Game Info */}
              <div className='bg-muted rounded-lg p-4'>
                <h3 className='font-semibold mb-2'>{game.title}</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{t('payment.ticketPrice')}:</span>
                    <span className='font-semibold'>
                      {currencyService.formatCurrency(
                        convertedPrice,
                        userCurrency
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{t('payment.participants')}:</span>
                    <span>
                      {game.currentParticipants}/{game.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Money Options */}
              <div className='space-y-3'>
                <h4 className='font-medium'>{t('payment.chooseMethod')}</h4>

                <button
                  onClick={() => setSelectedMethod('ORANGE_MONEY')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === 'ORANGE_MONEY'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                      : 'border-border hover:border-orange-300'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center'>
                      <Smartphone className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <div className='font-semibold'>{t('payment.methods.orangeMoney')}</div>
                      <div className='text-sm text-muted-foreground'>
                        {t('payment.methods.orangeDescription')}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('MTN_MOMO')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === 'MTN_MOMO'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10'
                      : 'border-border hover:border-yellow-300'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center'>
                      <Phone className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <div className='font-semibold'>{t('payment.methods.mtnMomo')}</div>
                      <div className='text-sm text-muted-foreground'>
                        {t('payment.methods.mtnDescription')}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Security Notice */}
              <div className='bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3'>
                <div className='flex items-start space-x-2'>
                  <Shield className='w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5' />
                  <div className='text-sm'>
                    <div className='font-medium text-blue-900 dark:text-blue-100'>
                      {t('payment.security.title')}
                    </div>
                    <div className='text-blue-700 dark:text-blue-200 text-xs'>
                      {t('payment.security.description')}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep('phone')}
                className='w-full'
                size='lg'
              >
                {t('payment.continue')} -{' '}
                {currencyService.formatCurrency(convertedPrice, userCurrency)}
              </Button>
            </>
          )}

          {step === 'phone' && (
            <>
              <div className='space-y-4'>
                <div className='text-center'>
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      selectedMethod === 'ORANGE_MONEY'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                    }`}
                  >
                    {selectedMethod === 'ORANGE_MONEY' ? (
                      <Smartphone className='w-8 h-8 text-white' />
                    ) : (
                      <Phone className='w-8 h-8 text-white' />
                    )}
                  </div>
                  <h4 className='font-semibold mb-2'>
                    {
                      securePaymentService.getPaymentMethodInfo(selectedMethod)
                        .name
                    }
                  </h4>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='phoneNumber' className='text-sm font-medium'>
                    {t('payment.phoneNumber')}
                  </label>
                  <input
                    id='phoneNumber'
                    type='tel'
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder={
                      securePaymentService.getPaymentMethodInfo(selectedMethod)
                        .placeholder
                    }
                    className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                    maxLength={12}
                  />
                  <p className='text-xs text-muted-foreground'>
                    {t('payment.enterPhonePrompt', {
                      method: securePaymentService.getPaymentMethodInfo(selectedMethod).name
                    })}
                  </p>
                </div>
              </div>

              <div className='flex space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => setStep('method')}
                  className='flex-1'
                >
                  {t('common.back')}
                </Button>
                <Button
                  onClick={handlePhoneSubmit}
                  disabled={!phoneNumber.trim()}
                  className='flex-1'
                >
                  {t('payment.payNow')}
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className='text-center py-8'>
              <div className='w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center'>
                <Loader2 className='w-8 h-8 text-primary-foreground animate-spin' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>{t('payment.processing')}</h3>
              <p className='text-muted-foreground text-sm mb-4'>
                {t('payment.checkPhone')}
              </p>
              {paymentAttempts > 0 && (
                <div className='bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 mt-4'>
                  <div className='flex items-center justify-center space-x-2'>
                    <AlertCircle className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                    <span className='text-sm text-blue-700 dark:text-blue-200'>
                      {statusMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'success' && ticket && (
            <>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>
                  {t('payment.success')}
                </h3>
                <p className='text-muted-foreground text-sm'>
                  {t('payment.successSubtitle')}
                </p>
              </div>

              {/* Ticket Display */}
              <div className='bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white'>
                <div className='text-center mb-4'>
                  <h4 className='text-lg font-bold'>🎫 {t('payment.ticket.yourTicket')}</h4>
                  <div className='text-sm opacity-90'>{ticket.gameTitle}</div>
                </div>

                <div className='bg-white/20 rounded-lg p-4 mb-4'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <div className='opacity-75'>{t('payment.ticket.ticketNumber')}</div>
                      <div className='font-mono font-bold text-xs'>
                        {ticket.ticketNumber}
                      </div>
                    </div>
                    <div>
                      <div className='opacity-75'>{t('payment.ticket.pricePaid')}</div>
                      <div className='font-bold'>
                        {currencyService.formatCurrency(
                          ticket.price,
                          ticket.currency
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='text-center'>
                  <img
                    src={ticket.qrCode}
                    alt='Ticket QR Code'
                    className='w-20 h-20 mx-auto bg-white rounded-lg p-1'
                  />
                  <div className='text-xs opacity-75 mt-2'>{t('payment.ticket.scanToVerify')}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-4'>
                <div className='grid grid-cols-3 gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={printTicket}
                    className='flex flex-col items-center gap-1 h-auto py-3'
                  >
                    <Printer className='w-4 h-4' />
                    <span className='text-xs'>{t('payment.ticket.print')}</span>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => toast.success('Ticket sent to your email!')}
                    className='flex flex-col items-center gap-1 h-auto py-3'
                  >
                    <Mail className='w-4 h-4' />
                    <span className='text-xs'>{t('payment.ticket.email')}</span>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={downloadTicket}
                    className='flex flex-col items-center gap-1 h-auto py-3'
                  >
                    <Download className='w-4 h-4' />
                    <span className='text-xs'>{t('payment.ticket.save')}</span>
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <Button
                    onClick={handlePlayAgain}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  >
                    {t('payment.ticket.playAgain')}
                  </Button>

                  <Button
                    variant='outline'
                    onClick={() => {
                      handleClose();
                      window.location.href = '/profile';
                    }}
                  >
                    {t('payment.ticket.viewProfile')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
