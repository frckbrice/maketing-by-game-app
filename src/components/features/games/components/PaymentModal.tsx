'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils/currency';
import { useAuth } from '@/lib/contexts/AuthContext';
import { securePaymentService } from '@/lib/services/securePaymentService';
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
  RefreshCw,
  Shield,
  Smartphone,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PaymentModalProps {
  game: LotteryGame;
  isOpen: boolean;
  onClose: () => void;
}

interface Ticket {
  id?: string;
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
type PaymentStep = 'method' | 'phone' | 'processing' | 'success' | 'failed';

export const PaymentModal = React.memo<PaymentModalProps>(
  function PaymentModal({ game, isOpen, onClose }) {
    const { user } = useAuth();
    const { t } = useTranslation();

    // State management
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
    const [currentTransactionId, setCurrentTransactionId] = useState<
      string | null
    >(null);
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [retryCount, setRetryCount] = useState(0);

    // Handle payment status changes
    const handlePaymentStatusChange = useCallback(
      (status: string) => {
        const methodInfo =
          securePaymentService.getPaymentMethodInfo(selectedMethod);

        switch (status) {
          case 'SUCCESS':
            const newTicket = generateTicket(game);
            setTicket(newTicket);
            setStep('success');
            setProcessing(false);

            toast.success(
              t('payment.notifications.successful', { method: methodInfo.name })
            );

            // Send notifications in background
            Promise.all([
              sendTicketEmail(newTicket),
              sendTicketSMS(newTicket, phoneNumber),
            ]).catch(() => {
              toast.info(t('payment.notifications.emailDelayed'));
            });

            // Log payment success notification (service will be implemented later)
            console.log('Payment success notification needed:', {
              userId: user?.id || '',
              type: 'payment_success',
              transactionId: currentTransactionId || '',
              gameId: game.id,
              amount: convertedPrice,
              currency: userCurrency,
            });
            break;

          case 'FAILED':
          case 'CANCELLED':
          case 'EXPIRED':
            setStep('failed');
            setProcessing(false);

            const errorMessage =
              status === 'EXPIRED'
                ? t('payment.errors.paymentExpired')
                : status === 'CANCELLED'
                  ? t('payment.errors.paymentCancelled')
                  : t('payment.errors.paymentDeclined');

            toast.error(errorMessage);

            // Log failure notification data (notification service removed)
            console.log('Payment failure notification data:', {
              userId: user?.id || '',
              type:
                status === 'EXPIRED'
                  ? 'payment_timeout'
                  : status === 'CANCELLED'
                    ? 'payment_cancelled'
                    : 'payment_failed',
              transactionId: currentTransactionId || '',
              gameId: game.id,
              amount: convertedPrice,
              currency: userCurrency,
            });
            break;

          case 'PROCESSING':
          case 'PENDING':
            setPaymentStatus(t('payment.status.processing'));
            break;
        }
      },
      [
        selectedMethod,
        game,
        convertedPrice,
        userCurrency,
        phoneNumber,
        user,
        currentTransactionId,
        t,
      ]
    );

    // Manual status checking - no automatic polling to prevent infinite loops
    const stopPolling = useCallback(() => {
      console.log('Manual polling control - no automatic polling active');
    }, []);

    // Payment timeout handler to prevent infinite processing state
    useEffect(() => {
      if (processing && currentTransactionId) {
        // Set up a timeout to remind user to check status after 2 minutes
        const reminderTimeout = setTimeout(() => {
          if (processing) {
            toast.info(
              t('payment.notifications.longProcessing') ||
                'Payment is taking longer than usual. Please use the "Check Status" button to verify.'
            );
            setPaymentStatus(
              t('payment.status.takingLong') ||
                'Payment taking longer than usual - please check status'
            );
          }
        }, 120000); // 2 minutes

        // Set up a timeout to automatically suggest manual check after 5 minutes
        const checkTimeout = setTimeout(() => {
          if (processing && step === 'processing') {
            setPaymentStatus(
              t('payment.status.pleaseCheck') ||
                'Please use the "Check Status" button to verify your payment'
            );
            toast.warning(
              t('payment.notifications.pleaseCheck') ||
                'Please check your payment status manually by clicking "Check Status"'
            );
          }
        }, 300000); // 5 minutes

        // Set up a final timeout to stop processing after 5 minutes (for development)
        const stopProcessingTimeout = setTimeout(() => {
          if (processing && step === 'processing') {
            console.log(
              'Payment processing timeout reached - stopping automatic checks'
            );
            setProcessing(false);
            setPaymentStatus(
              t('payment.status.timeout') ||
                'Payment processing timeout. Please check status manually or contact support.'
            );
            toast.info(
              t('payment.notifications.timeout') ||
                'Processing timeout reached. You can now close this modal or check status manually.'
            );
          }
        }, 300000); // 5 minutes

        return () => {
          clearTimeout(reminderTimeout);
          clearTimeout(checkTimeout);
          clearTimeout(stopProcessingTimeout);
        };
      }
    }, [processing, currentTransactionId, step, t]);

    // Convert price to XAF
    const convertPrice = useCallback(async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          // TEMPORARY: Fixed amount for testing - REVERT AFTER TESTING
          setConvertedPrice(50);
          setUserCurrency('XAF');
          return;
        }

        // Production: Use real currency conversion
        if (game.currency === 'XAF') {
          setConvertedPrice(game.ticketPrice);
          setUserCurrency('XAF');
          return;
        }

        // Use real currency conversion service in production
        try {
          // For now, we'll use the base price as converted price
          // TODO: Implement proper currency conversion service
          setConvertedPrice(game.ticketPrice);
          setUserCurrency(game.currency);
        } catch (error) {
          console.error('Currency conversion failed:', error);
          // Fallback: use base price if currency service unavailable
          setConvertedPrice(game.ticketPrice);
          setUserCurrency(game.currency || 'XAF');
        }
      } catch (error) {
        console.error('Currency conversion failed:', error);
        setConvertedPrice(game.ticketPrice);
        setUserCurrency(game.currency || 'XAF');
      }
    }, [game.ticketPrice, game.currency]);

    // Initialize modal
    useEffect(() => {
      if (isOpen) {
        convertPrice();
        setStep('method');
        setPhoneNumber('');
        setProcessing(false);
        setTicket(null);
        setCurrentTransactionId(null);
        setPaymentStatus('');
        setRetryCount(0);
      }
    }, [isOpen, convertPrice]);

    // Listen for real-time payment status updates
    useEffect(() => {
      if (!currentTransactionId) return;

      const handleStatusUpdate = (event: CustomEvent) => {
        const { transactionId, status } = event.detail;
        if (transactionId === currentTransactionId) {
          console.log('Payment status update:', status);
          setPaymentStatus(status);
          handlePaymentStatusChange(status);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener(
          'paymentStatusUpdate',
          handleStatusUpdate as EventListener
        );
        return () => {
          window.removeEventListener(
            'paymentStatusUpdate',
            handleStatusUpdate as EventListener
          );
        };
      }
    }, [currentTransactionId]);

    // Generate ticket with proper unique ID
    const generateTicket = (gameData: LotteryGame): Ticket => {
      // Generate proper unique ID without creating Firebase collection ID
      const uniqueId = `TKT_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const ticketNumbers = generateAllTicketNumbers(uniqueId);

      return {
        id: uniqueId,
        gameId: gameData.id,
        gameTitle: gameData.title,
        ticketNumber: ticketNumbers.ticketNumber,
        alternativeNumbers: ticketNumbers.alternativeNumbers,
        price: convertedPrice,
        currency: userCurrency,
        purchaseDate: Date.now(),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uniqueId)}`,
      };
    };

    // Validate phone number
    const validatePhoneNumber = (
      phone: string,
      method: PaymentMethod
    ): boolean => {
      return securePaymentService.validatePhoneNumber(phone, method);
    };

    // Handle phone number submission
    const handlePhoneSubmit = () => {
      if (!phoneNumber.trim()) {
        toast.error(t('payment.errors.enterPhone'));
        return;
      }

      if (!validatePhoneNumber(phoneNumber, selectedMethod)) {
        const methodInfo =
          securePaymentService.getPaymentMethodInfo(selectedMethod);
        toast.error(
          t('payment.errors.invalidPhone', { method: methodInfo.name })
        );
        return;
      }

      setStep('processing');
      handlePayment();
    };

    // Main payment handler - Optimized NOKASH flow
    const handlePayment = async () => {
      if (!user) {
        toast.error(t('payment.errors.loginRequired'));
        return;
      }

      setProcessing(true);
      setPaymentStatus(t('payment.status.initiating'));

      try {
        const methodInfo =
          securePaymentService.getPaymentMethodInfo(selectedMethod);

        // 1. Initiate payment with NOKASH
        const paymentResult = await securePaymentService.initiatePayment({
          gameId: game.id,
          paymentType: 'GAME',
          paymentMethod: selectedMethod,
          phoneNumber,
          amount: convertedPrice,
          currency: userCurrency || 'XAF',
          userId: user?.id || '',
        });

        if (!paymentResult.success || !paymentResult.transactionId) {
          throw new Error(
            paymentResult.message || t('payment.errors.paymentFailed')
          );
        }

        // 2. Set transaction ID for real-time updates
        setCurrentTransactionId(paymentResult.transactionId);
        setPaymentStatus(t('payment.status.waiting'));

        toast.info(
          t('payment.notifications.initiated', { method: methodInfo.name })
        );

        // 3. Payment initiated successfully - user can manually check status
        console.log(
          'Payment initiated successfully. Transaction ID:',
          paymentResult.transactionId
        );
        console.log('Use manual status check button to check payment status.');
      } catch (error) {
        console.error('Payment failed:', error);
        setProcessing(false);
        setStep('failed');

        let errorMessage = t('payment.errors.paymentFailed');
        if (error instanceof Error) {
          if (error.message.includes('Internal server error')) {
            errorMessage = t('payment.errors.serverError');
          } else if (
            error.message.includes('NetworkError') ||
            error.message.includes('fetch failed')
          ) {
            errorMessage = t('payment.errors.networkError');
          } else if (error.message.includes('timeout')) {
            errorMessage = t('payment.errors.timeout');
          } else {
            errorMessage = error.message;
          }
        }

        toast.error(errorMessage);
      }
    };

    // Retry payment
    const handleRetry = () => {
      if (retryCount >= 3) {
        toast.error(t('payment.errors.maxRetriesReached'));
        return;
      }

      setRetryCount(prev => prev + 1);
      setStep('processing');
      setProcessing(true);
      handlePayment();
    };

    // Manual status check with improved error handling and timeout protection
    const handleManualCheck = async () => {
      if (!currentTransactionId) {
        toast.error(
          t('payment.errors.noTransactionId') || 'No transaction ID available'
        );
        return;
      }

      try {
        setPaymentStatus(t('payment.status.checking'));

        // Add a timeout wrapper to prevent hanging (increased to 30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Check timeout')), 30000);
        });

        const statusPromise =
          securePaymentService.checkTransactionStatus(currentTransactionId);

        const statusResult = (await Promise.race([
          statusPromise,
          timeoutPromise,
        ])) as any;

        if (statusResult?.status) {
          console.log('Manual status check result:', statusResult.status);
          handlePaymentStatusChange(statusResult.status);

          // Don't show success toast for pending status
          if (statusResult.status !== 'PENDING') {
            toast.success(
              t('payment.notifications.statusUpdated') ||
                'Status updated successfully'
            );
          } else {
            setPaymentStatus(t('payment.status.stillProcessing'));
            toast.info(
              t('payment.notifications.stillProcessing') ||
                'Payment is still being processed. Please try again in a few moments.'
            );
          }
        } else {
          setPaymentStatus(t('payment.status.stillProcessing'));
          toast.info(
            t('payment.notifications.stillProcessing') ||
              'Payment is still being processed. Please try again in a few moments.'
          );
        }
      } catch (error: any) {
        console.error('Manual status check failed:', error);
        setPaymentStatus(
          t('payment.errors.statusCheckFailed') || 'Status check failed'
        );

        // More specific error handling based on error codes
        let errorMessage =
          t('payment.errors.statusCheckFailed') ||
          'Unable to check payment status. Please try again.';

        if (error?.code) {
          switch (error.code) {
            case 'DATABASE_OFFLINE':
              errorMessage =
                t('payment.errors.databaseOffline') ||
                'Service temporarily unavailable. Please try again in 30 seconds.';
              break;
            case 'PAYMENT_NOT_FOUND':
              errorMessage =
                t('payment.errors.paymentNotFound') ||
                'Payment record not found. Please try initiating payment again.';
              // Suggest going back to payment method selection
              setTimeout(() => {
                setStep('phone');
                setProcessing(false);
                setCurrentTransactionId(null);
              }, 20000);
              break;
            case 'TIMEOUT_ERROR':
              errorMessage =
                t('payment.errors.checkTimeout') ||
                'Request timed out. Please check your connection and try again.';
              break;
            case 'AUTH_ERROR':
              errorMessage =
                t('payment.errors.authError') ||
                'Authentication error. Please refresh the page and try again.';
              break;
          }
        } else if (error instanceof Error) {
          if (error.message === 'Check timeout') {
            errorMessage =
              t('payment.errors.checkTimeout') ||
              'Status check timed out. Please try again.';
          } else if (
            error.message.includes('unavailable') ||
            error.message.includes('offline')
          ) {
            errorMessage =
              t('payment.errors.databaseOffline') ||
              'Service temporarily unavailable. Please try again in 30 seconds.';
          } else if (error.message.includes('timeout')) {
            errorMessage =
              t('payment.errors.checkTimeout') ||
              'Request timed out. Please check your connection and try again.';
          } else if (error.message.includes('auth')) {
            errorMessage =
              t('payment.errors.authError') ||
              'Authentication error. Please refresh the page and try again.';
          }
        }

        toast.error(errorMessage);
      }
    };

    // Send SMS notification
    const sendTicketSMS = async (ticketData: Ticket, phone: string) => {
      try {
        await fetch('/api/notifications/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            message: `🎫 Your lottery ticket: ${ticketData.ticketNumber} for ${ticketData.gameTitle}. Good luck! Check your email for full details.`,
            ticketNumber: ticketData.ticketNumber,
          }),
        });
      } catch (error) {
        console.error('Error sending SMS:', error);
      }
    };

    // Send email notification
    const sendTicketEmail = async (ticketData: Ticket) => {
      try {
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
              purchaseDate: new Date(
                ticketData.purchaseDate
              ).toLocaleDateString(),
              drawDate: new Date(game.drawDate).toLocaleDateString(),
              qrCode: ticketData.qrCode,
              userName: `${user?.firstName} ${user?.lastName}`,
            },
          }),
        });
      } catch (error) {
        console.error('Error sending email:', error);
      }
    };

    // Utility functions
    const printTicket = () => {
      if (!ticket) return;

      const printWindow = window.open('', '_blank');
      if (printWindow?.document) {
        const htmlContent = `
        <html>
          <head>
            <title>Game Ticket - ${ticket.ticketNumber}</title>
            <style>
              body { 
                font-family: Arial, sansaf-serif; 
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
              <p><strong>Price:</strong> {formatCurrency(ticket.price, ticket.currency)}</p>
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
        // Clean up polling
        if (currentTransactionId) {
          stopPolling();
        }

        setStep('method');
        setPhoneNumber('');
        setTicket(null);
        setCurrentTransactionId(null);
        onClose();
      }
    };

    const handlePlayAgain = () => {
      handleClose();
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
        case 'failed':
          return t('payment.failed');
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
          return paymentStatus || t('payment.processingSubtitle');
        case 'success':
          return t('payment.successSubtitle');
        case 'failed':
          return t('payment.failedSubtitle');
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
                      <span className='text-muted-foreground'>
                        {t('payment.ticketPrice')}:
                      </span>
                      <span className='font-semibold'>
                        {formatCurrency(convertedPrice, userCurrency)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>
                        {t('payment.participants')}:
                      </span>
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
                        <div className='font-semibold'>
                          {t('payment.methods.orangeMoney')}
                        </div>
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
                        <div className='font-semibold'>
                          {t('payment.methods.mtnMomo')}
                        </div>
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
                  {formatCurrency(convertedPrice, userCurrency)}
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
                        securePaymentService.getPaymentMethodInfo(
                          selectedMethod
                        ).name
                      }
                    </h4>
                  </div>

                  <div className='space-y-2'>
                    <label
                      htmlFor='phoneNumber'
                      className='text-sm font-medium'
                    >
                      {t('payment.phoneNumber')}
                    </label>
                    <input
                      id='phoneNumber'
                      type='tel'
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder={
                        securePaymentService.getPaymentMethodInfo(
                          selectedMethod
                        ).placeholder
                      }
                      className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                      maxLength={12}
                    />
                    <p className='text-xs text-muted-foreground'>
                      {t('payment.enterPhonePrompt', {
                        method:
                          securePaymentService.getPaymentMethodInfo(
                            selectedMethod
                          ).name,
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
                <h3 className='text-lg font-semibold mb-2'>
                  {t('payment.processing')}
                </h3>
                <p className='text-muted-foreground text-sm mb-4'>
                  {t('payment.checkPhone')}
                </p>

                {paymentStatus && (
                  <div className='bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 mb-4'>
                    <div className='flex items-center justify-center space-x-2'>
                      <AlertCircle className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                      <span className='text-sm text-blue-700 dark:text-blue-200'>
                        {paymentStatus}
                      </span>
                    </div>
                  </div>
                )}

                <div className='flex space-x-3 mt-6'>
                  <Button
                    variant='outline'
                    onClick={handleManualCheck}
                    disabled={!currentTransactionId}
                    className='flex-1'
                  >
                    <RefreshCw className='w-4 h-4 mr-2' />
                    {t('payment.checkStatus')}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      if (currentTransactionId) {
                        stopPolling();
                      }
                      setProcessing(false);
                      setStep('phone');
                    }}
                    className='flex-1'
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            )}

            {step === 'failed' && (
              <div className='text-center py-8'>
                <div className='w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center'>
                  <AlertCircle className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>
                  {t('payment.failed')}
                </h3>
                <p className='text-muted-foreground text-sm mb-6'>
                  {t('payment.failedSubtitle')}
                </p>

                <div className='flex space-x-3'>
                  <Button
                    variant='outline'
                    onClick={() => setStep('phone')}
                    className='flex-1'
                  >
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleRetry}
                    disabled={retryCount >= 3}
                    className='flex-1'
                  >
                    <RefreshCw className='w-4 h-4 mr-2' />
                    {t('payment.retry')} ({3 - retryCount})
                  </Button>
                </div>
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
                    <h4 className='text-lg font-bold'>
                      🎫 {t('payment.ticket.yourTicket')}
                    </h4>
                    <div className='text-sm opacity-90'>{ticket.gameTitle}</div>
                  </div>

                  <div className='bg-white/20 rounded-lg p-4 mb-4'>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <div className='opacity-75'>
                          {t('payment.ticket.ticketNumber')}
                        </div>
                        <div className='font-mono font-bold text-xs'>
                          {ticket.ticketNumber}
                        </div>
                      </div>
                      <div>
                        <div className='opacity-75'>
                          {t('payment.ticket.pricePaid')}
                        </div>
                        <div className='font-bold'>
                          {formatCurrency(ticket.price, ticket.currency)}
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
                    <div className='text-xs opacity-75 mt-2'>
                      {t('payment.ticket.scanToVerify')}
                    </div>
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
                      <span className='text-xs'>
                        {t('payment.ticket.print')}
                      </span>
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        toast.success(t('payment.ticket.emailSent'))
                      }
                      className='flex flex-col items-center gap-1 h-auto py-3'
                    >
                      <Mail className='w-4 h-4' />
                      <span className='text-xs'>
                        {t('payment.ticket.email')}
                      </span>
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={downloadTicket}
                      className='flex flex-col items-center gap-1 h-auto py-3'
                    >
                      <Download className='w-4 h-4' />
                      <span className='text-xs'>
                        {t('payment.ticket.save')}
                      </span>
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
  }
);
