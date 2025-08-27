'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Phone, Send, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PhoneAuthFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function PhoneAuthForm({
  onSuccess,
  onError,
  className = '',
}: PhoneAuthFormProps) {
  const { sendPhoneVerificationCode, verifyPhoneCode, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  // const [codeSent, setCodeSent] = useState(false); // TODO: Use for UI feedback or remove
  const [step, setStep] = useState<'phone' | 'verification'>('phone');

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      await sendPhoneVerificationCode(phoneNumber);
      // setCodeSent(true); // TODO: Use for UI feedback
      setStep('verification');
      toast.success('Verification code sent to your phone!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send code';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    try {
      await verifyPhoneCode(phoneNumber, verificationCode);
      toast.success('Phone number verified successfully!');
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid verification code';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setVerificationCode('');
    // setCodeSent(false); // TODO: Use for UI feedback
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {step === 'phone' ? (
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-medium text-lottery-200 mb-2'
            >
              Phone Number
            </label>
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
              <Input
                id='phone'
                type='tel'
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder='+1 (555) 123-4567'
                className='pl-10'
                disabled={loading}
              />
            </div>
          </div>

          <Button
            onClick={handleSendCode}
            disabled={loading || !phoneNumber}
            className='w-full'
          >
            <Send className='w-4 h-4 mr-2' />
            Send Verification Code
          </Button>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='text-center'>
            <Shield className='w-12 h-12 mx-auto text-lottery-500 mb-2' />
            <p className='text-sm text-lottery-300'>
              We&apos;ve sent a 6-digit code to {phoneNumber}
            </p>
          </div>

          <div>
            <label
              htmlFor='code'
              className='block text-sm font-medium text-lottery-200 mb-2'
            >
              Verification Code
            </label>
            <Input
              id='code'
              type='text'
              value={verificationCode}
              onChange={e =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, '').slice(0, 6)
                )
              }
              placeholder='123456'
              maxLength={6}
              className='text-center text-lg tracking-widest'
              disabled={loading}
            />
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleBackToPhone}
              className='flex-1'
              disabled={loading}
            >
              Back
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length !== 6}
              className='flex-1'
            >
              Verify Code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
