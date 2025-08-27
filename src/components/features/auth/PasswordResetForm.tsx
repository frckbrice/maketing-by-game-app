'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function PasswordResetForm({
  onSuccess,
  onError,
  className = '',
}: PasswordResetFormProps) {
  const { sendPasswordResetEmail, loading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');

  const handleSendResetEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setStep('sent');
      toast.success('Password reset email sent! Check your inbox.');
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
  };

  if (step === 'sent') {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className='w-16 h-16 mx-auto bg-lottery-500/20 rounded-full flex items-center justify-center'>
          <Mail className='w-8 h-8 text-lottery-500' />
        </div>
        <h3 className='text-lg font-semibold text-white'>
          {t('auth.forgotPassword.checkEmail')}
        </h3>
        <p className='text-lottery-300'>
          {t('auth.forgotPassword.emailSent')} <strong>{email}</strong>
        </p>
        <p className='text-sm text-lottery-400'>
          {t('auth.forgotPassword.emailInstructions')}
        </p>
        <Button variant='outline' onClick={handleBackToEmail} className='mt-4'>
          {t('auth.forgotPassword.backToLoginButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='text-center'>
        <div className='w-16 h-16 mx-auto bg-lottery-500/20 rounded-full flex items-center justify-center mb-4'>
          <Lock className='w-8 h-8 text-lottery-500' />
        </div>
        <h3 className='text-lg font-semibold text-white mb-2'>
          {t('auth.forgotPassword.title')}
        </h3>
        <p className='text-lottery-300'>{t('auth.forgotPassword.subtitle')}</p>
      </div>

      <div>
        <label
          htmlFor='reset-email'
          className='block text-sm font-medium text-lottery-200 mb-2'
        >
          {t('auth.forgotPassword.email')}
        </label>
        <div className='relative'>
          <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
          <Input
            id='reset-email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Enter your email'
            className='pl-10'
            disabled={loading}
          />
        </div>
      </div>

      <Button
        onClick={handleSendResetEmail}
        disabled={loading || !email}
        className='w-full'
      >
        {loading ? 'Sending...' : t('auth.forgotPassword.submit')}
      </Button>
    </div>
  );
}
