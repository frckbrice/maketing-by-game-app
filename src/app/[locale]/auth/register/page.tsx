'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['USER', 'VENDOR']),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = params?.locale as string;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitting(true);
    try {
      // Determine currency based on locale
      const currency = locale === 'fr' ? 'EUR' : 'USD';

      await registerUser(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.role,
        locale,
        currency
      );
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-lottery-900 via-lottery-800 to-lottery-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo and Header */}
        <div className='text-center mb-8'>
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-lottery-500 to-lottery-600 rounded-full flex items-center justify-center'>
            <CheckCircle className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>
            {t('auth.register.title')}
          </h1>
          <p className='text-lottery-300'>
            {t('auth.register.subtitle')}
          </p>
        </div>

        {/* Registration Form */}
        <div className='bg-lottery-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-lottery-700/30'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* First Name Field */}
            <div>
              <label
                htmlFor='firstName'
                className='block text-sm font-medium text-lottery-200 mb-2'
              >
                {t('auth.register.firstName')}
              </label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                <input
                  {...register('firstName')}
                  type='text'
                  id='firstName'
                  className='w-full pl-10 pr-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                  placeholder={t('auth.register.firstName')}
                />
              </div>
              {errors.firstName && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label
                htmlFor='lastName'
                className='block text-sm font-medium text-lottery-200 mb-2'
              >
                {t('auth.register.lastName')}
              </label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                <input
                  {...register('lastName')}
                  type='text'
                  id='lastName'
                  className='w-full pl-10 pr-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                  placeholder={t('auth.register.lastName')}
                />
              </div>
              {errors.lastName && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-lottery-200 mb-2'
              >
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                <input
                  {...register('email')}
                  type='email'
                  id='email'
                  className='w-full pl-10 pr-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                  placeholder='Enter your email'
                />
              </div>
              {errors.email && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-lottery-200 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  className='w-full pl-10 pr-12 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                  placeholder='Create a password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-lottery-400 hover:text-lottery-300 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-lottery-200 mb-2'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  className='w-full pl-10 pr-12 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                  placeholder='Confirm your password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-lottery-400 hover:text-lottery-300 transition-colors'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className='block text-sm font-medium text-lottery-200 mb-2'>
                {t('auth.register.role')}
              </label>
              <p className='text-sm text-lottery-300 mb-3'>
                {t('auth.register.roleDescription')}
              </p>
              <div className='flex items-center space-x-4'>
                <label
                  htmlFor='userRole'
                  className='flex items-center cursor-pointer'
                >
                  <input
                    {...register('role')}
                    type='radio'
                    id='userRole'
                    value='USER'
                    className='form-radio text-lottery-500 focus:ring-lottery-500 border-lottery-600 rounded'
                  />
                  <span className='ml-2 text-sm text-lottery-300'>
                    {t('auth.register.roleUser')}
                  </span>
                </label>
                <label
                  htmlFor='vendorRole'
                  className='flex items-center cursor-pointer'
                >
                  <input
                    {...register('role')}
                    type='radio'
                    id='vendorRole'
                    value='VENDOR'
                    className='form-radio text-lottery-500 focus:ring-lottery-500 border-lottery-600 rounded'
                  />
                  <span className='ml-2 text-sm text-lottery-300'>
                    {t('auth.register.roleVendor')}
                  </span>
                </label>
              </div>
              {errors.role && (
                <p className='mt-2 text-sm text-red-400'>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className='flex items-start space-x-3'>
              <input
                type='checkbox'
                id='terms'
                required
                className='mt-1 h-4 w-4 text-lottery-500 focus:ring-lottery-500 border-lottery-600 rounded'
              />
              <label htmlFor='terms' className='text-sm text-lottery-300'>
                {t('auth.register.terms')}
                <Link
                  href='/terms'
                  className='text-lottery-400 hover:text-lottery-300 underline'
                >
                  {t('auth.register.termsLink')}
                </Link>{' '}
                {t('auth.register.and')}
                <Link
                  href='/privacy'
                  className='text-lottery-400 hover:text-lottery-300 underline'
                >
                  {t('auth.register.privacyLink')}
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={loading || submitting}
              className='w-full py-3 bg-gradient-to-r from-lottery-500 to-lottery-600 hover:from-lottery-600 hover:to-lottery-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'
            >
              {loading || submitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Links */}
          <div className='mt-6 text-center'>
            <p className='text-lottery-300 text-sm'>
              {t('auth.register.alreadyHaveAccount')}
              <Link
                href='/auth/login'
                className='text-lottery-400 hover:text-lottery-300 font-medium transition-colors'
              >
                {t('auth.register.signInHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className='text-center mt-6'>
          <Link
            href='/'
            className='text-lottery-400 hover:text-lottery-300 transition-colors text-sm flex items-center justify-center gap-2'
          >
            ← {t('auth.register.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
