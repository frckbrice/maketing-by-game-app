'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/contexts/AuthContext';
import { securePaymentService } from '@/lib/services/securePaymentService';
import { formatCurrency } from '@/lib/utils/currency';
import { Product } from '@/types';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Phone,
  RefreshCw,
  Shield,
  Smartphone,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface MarketplacePaymentModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  quantity?: number;
}

export const MarketplacePaymentModal: React.FC<
  MarketplacePaymentModalProps
> = ({ product, isOpen, onClose, onPaymentSuccess, quantity = 1 }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Payment state
  const [step, setStep] = useState<
    'details' | 'payment' | 'processing' | 'success' | 'error'
  >('details');
  const [selectedMethod, setSelectedMethod] = useState<
    'MTN_MOMO' | 'ORANGE_MONEY'
  >('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [currentTransactionId, setCurrentTransactionId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const unitPrice = product.price;
  const totalAmount = unitPrice * quantity;
  const userCurrency = 'XAF'; // Default currency for Cameroon

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setError(null);
      setProcessing(false);
      setPaymentStatus('');
      setCurrentTransactionId(null);
    }
  }, [isOpen]);

  // Payment submission handler
  const handlePayment = useCallback(
    async (method: 'MTN_MOMO' | 'ORANGE_MONEY', phone: string) => {
      if (!user?.id || !product) {
        toast.error(t('payment.error.authentication'));
        return;
      }

      setProcessing(true);
      setStep('processing');
      setPaymentStatus(t('payment.status.initializing'));
      setError(null);

      try {
        const paymentData = {
          productId: product.id,
          amount: totalAmount,
          currency: userCurrency,
          paymentMethod: method,
          phoneNumber: phone,
          userId: user.id,
          paymentType: 'PRODUCT' as const,
          quantity,
        };

        console.log('Initiating marketplace payment:', paymentData);

        const response =
          await securePaymentService.initiatePayment(paymentData);

        if (response.success && response.transactionId) {
          setCurrentTransactionId(response.transactionId);
          setPaymentStatus(t('payment.status.initiated'));

          // Start checking payment status
          setTimeout(() => checkStatus(), 3000);
        } else {
          throw new Error(response.message || 'Payment initiation failed');
        }
      } catch (error: any) {
        console.error('Marketplace payment error:', error);
        setProcessing(false);
        setStep('error');
        setError(error.message || t('payment.error.general'));
        toast.error(error.message || t('payment.error.general'));
      }
    },
    [product, totalAmount, userCurrency, user, quantity, t]
  );

  // Check payment status
  const checkStatus = useCallback(async () => {
    if (!currentTransactionId || !user?.id) {
      return;
    }

    try {
      setPaymentStatus(t('payment.status.checking'));

      const response =
        await securePaymentService.checkTransactionStatus(currentTransactionId);

      if (response) {
        const status = response.status;

        switch (status) {
          case 'SUCCESS':
            setStep('success');
            setProcessing(false);
            setPaymentStatus(t('payment.status.completed'));
            toast.success(t('payment.success.completed'));
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
            break;
          case 'FAILED':
            setStep('error');
            setProcessing(false);
            setError(response.message || t('payment.error.failed'));
            setPaymentStatus(t('payment.status.failed'));
            break;
          case 'PENDING':
            setPaymentStatus(t('payment.status.processing'));
            break;
          default:
            setPaymentStatus(t('payment.status.checking'));
        }
      } else {
        setError(t('payment.error.statusCheck'));
        setPaymentStatus(t('payment.status.checkFailed'));
      }
    } catch (error: any) {
      console.error('Status check error:', error);
      setError(error.message || t('payment.error.statusCheck'));
      setPaymentStatus(t('payment.status.checkFailed'));
    }
  }, [currentTransactionId, user?.id, t, onPaymentSuccess]);

  // Payment timeout handler
  useEffect(() => {
    if (processing && currentTransactionId) {
      const timeout = setTimeout(() => {
        if (processing) {
          console.log(
            'Marketplace payment processing timeout reached - stopping automatic checks'
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

      return () => clearTimeout(timeout);
    }
  }, [processing, currentTransactionId, t]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (processing && step === 'processing') {
      toast.warning(
        t('payment.warning.closeWhileProcessing') ||
          'Payment is still processing'
      );
      return;
    }
    onClose();
  }, [processing, step, onClose, t]);

  const renderStepContent = () => {
    switch (step) {
      case 'details':
        return (
          <div className='space-y-6'>
            {/* Product Info */}
            <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
              <div className='flex items-center space-x-4'>
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className='w-16 h-16 object-cover rounded-lg'
                  />
                )}
                <div className='flex-1'>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    {product.name}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Quantity: {quantity}
                  </p>
                  <p className='text-lg font-bold text-purple-600'>
                    {formatCurrency(totalAmount, userCurrency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                {t('payment.method.title')}
              </label>
              <div className='grid grid-cols-1 gap-3'>
                {['MTN_MOMO', 'ORANGE_MONEY'].map(method => (
                  <button
                    key={method}
                    type='button'
                    onClick={() => setSelectedMethod(method as any)}
                    className={`flex items-center space-x-3 p-4 border rounded-lg transition-all ${
                      selectedMethod === method
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className='w-5 h-5 text-gray-400' />
                    <span className='font-medium'>
                      {method === 'MTN_MOMO'
                        ? 'MTN Mobile Money'
                        : 'Orange Money'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                {t('payment.phone.title')}
              </label>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='tel'
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder='6XXXXXXXX'
                  className='w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                />
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                {t('payment.phone.format')}
              </p>
            </div>

            {/* Payment Button */}
            <Button
              onClick={() => handlePayment(selectedMethod, phoneNumber)}
              disabled={!phoneNumber.trim() || phoneNumber.length < 9}
              className='w-full'
              size='lg'
            >
              <Shield className='w-4 h-4 mr-2' />
              {t('payment.button.pay')}{' '}
              {formatCurrency(totalAmount, userCurrency)}
            </Button>
          </div>
        );

      case 'processing':
        return (
          <div className='text-center space-y-4'>
            <Loader2 className='w-12 h-12 animate-spin mx-auto text-purple-600' />
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                {t('payment.processing.title')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                {paymentStatus}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('payment.processing.phonePrompt')}
              </p>

              {currentTransactionId && (
                <div className='mt-4 space-y-2'>
                  <Button
                    variant='outline'
                    onClick={checkStatus}
                    disabled={processing}
                    className='w-full'
                  >
                    <RefreshCw className='w-4 h-4 mr-2' />
                    {t('payment.button.checkStatus')}
                  </Button>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Transaction ID: {currentTransactionId}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className='text-center space-y-4'>
            <CheckCircle className='w-16 h-16 mx-auto text-green-500' />
            <div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                {t('payment.success.title')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                {t('payment.success.message')}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-4'>
                Product: {product.name} (x{quantity})
              </p>
            </div>
            <Button onClick={handleClose} className='w-full' size='lg'>
              {t('common.close')}
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className='text-center space-y-4'>
            <AlertCircle className='w-16 h-16 mx-auto text-red-500' />
            <div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                {t('payment.error.title')}
              </h3>
              <p className='text-red-600 dark:text-red-400 mt-2'>
                {error || t('payment.error.general')}
              </p>
            </div>
            <div className='space-y-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setStep('details');
                  setError(null);
                }}
                className='w-full'
              >
                {t('payment.button.tryAgain')}
              </Button>
              <Button variant='ghost' onClick={handleClose} className='w-full'>
                {t('common.close')}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {step === 'details' && t('payment.title.purchase')}
            {step === 'processing' && t('payment.title.processing')}
            {step === 'success' && t('payment.title.success')}
            {step === 'error' && t('payment.title.error')}
          </DialogTitle>
          <DialogDescription>
            {step === 'details' && t('payment.description.purchase')}
            {step === 'processing' && t('payment.description.processing')}
            {step === 'success' && t('payment.description.success')}
            {step === 'error' && t('payment.description.error')}
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  );
};
