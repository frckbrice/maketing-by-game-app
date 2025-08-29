'use client';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { GoogleAuthButton } from './GoogleAuthButton';

// Separate schemas for login and registration
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface EnhancedAuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function EnhancedAuthForm({
  mode,
  onSuccess,
  onError,
  className = '',
}: EnhancedAuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const { login, register: registerUser, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  // Use different schemas based on mode
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'login'
        ? { email: '', password: '' }
        : {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
          },
  });

  const handleEmailAuth = async (data: LoginFormData | RegisterFormData) => {
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const loginData = data as LoginFormData;
        await login(loginData.email, loginData.password);
        toast.success('Login successful!');
      } else {
        const registerData = data as RegisterFormData;

        // Validate password confirmation
        if (registerData.password !== registerData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        await registerUser(
          registerData.firstName,
          registerData.lastName || '',
          registerData.email,
          registerData.password,
          'USER'
        );
        toast.success('Registration successful!');
      }
      router.push('/dashboard');
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `${mode === 'login' ? 'Login' : 'Registration'} failed`;
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push('/dashboard');
    onSuccess?.();
  };

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'google':
        return (
          <div className='mt-6'>
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={onError}
              className='w-full'
            />
          </div>
        );
      default:
        return (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEmailAuth)}
              className='space-y-6'
            >
              {/* Email Field */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {t('auth.login.email')}
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
                        <Input
                          {...field}
                          type='email'
                          className='pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                          placeholder='Enter your email'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name Field - Only for Registration */}
              {mode === 'register' && (
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('auth.register.firstName')}
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
                          <Input
                            {...field}
                            type='text'
                            className='pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                            placeholder='Enter your first name'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Last Name Field - Only for Registration */}
              {mode === 'register' && (
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('auth.register.lastName')} (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
                          <Input
                            {...field}
                            type='text'
                            className='pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                            placeholder='Enter your last name (optional)'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Password Field */}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {t('auth.login.password')}
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          className='pl-10 pr-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                          placeholder='Enter your password'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors'
                        >
                          {showPassword ? (
                            <EyeOff className='w-5 h-5' />
                          ) : (
                            <Eye className='w-5 h-5' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field - Only for Registration */}
              {mode === 'register' && (
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('auth.register.confirmPassword')}
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            className='pl-10 pr-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                            placeholder='Confirm your password'
                          />
                          <button
                            type='button'
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors'
                          >
                            {showConfirmPassword ? (
                              <EyeOff className='w-5 h-5' />
                            ) : (
                              <Eye className='w-5 h-5' />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                disabled={loading || submitting}
                className='w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading || submitting
                  ? 'Processing...'
                  : mode === 'login'
                    ? t('auth.login.submit')
                    : t('auth.register.submit')}
              </Button>
            </form>
          </Form>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Auth Method Tabs */}
      <div className='flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
        <button
          onClick={() => setAuthMethod('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMethod === 'email'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Mail className='w-4 h-4 inline mr-2' />
          {t('common.email')}
        </button>
        <button className='flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'>
          <svg
            className='w-4 h-4 inline mr-2'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' />
          </svg>
          Phone (Coming Soon)
        </button>
        <button
          onClick={() => setAuthMethod('google')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMethod === 'google'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <svg className='w-4 h-4 inline mr-2' viewBox='0 0 24 24'>
            <path
              fill='#4285F4'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='#34A853'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='#FBBC05'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='#EA4335'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          Google
        </button>
      </div>

      {/* Auth Form */}
      {renderAuthMethod()}

      {/* Links */}
      {authMethod === 'email' && (
        <div className='text-center space-y-3'>
          {mode === 'login' ? (
            <>
              <Link
                href='/auth/register'
                className='block text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors text-sm'
              >
                {t('auth.login.noAccount')} {t('auth.login.signUp')}
              </Link>
              <Link
                href='/auth/forgot-password'
                className='block text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors text-sm'
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </>
          ) : (
            <Link
              href='/auth/login'
              className='block text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors text-sm'
            >
              {t('auth.register.hasAccount')} {t('auth.register.signIn')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
