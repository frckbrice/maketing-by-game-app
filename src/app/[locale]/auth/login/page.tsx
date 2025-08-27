'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch {
      toast.error('Login failed. Please check your credentials.');
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
            <Lock className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
          <p className='text-lottery-300'>Sign in to your lottery account</p>
        </div>

        {/* Login Form */}
        <div className='bg-lottery-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-lottery-700/30'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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
                  placeholder='Enter your password'
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

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={loading || submitting}
              className='w-full py-3 bg-gradient-to-r from-lottery-500 to-lottery-600 hover:from-lottery-600 hover:to-lottery-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Links */}
          <div className='mt-6 text-center space-y-3'>
            <Link
              href='/auth/register'
              className='block text-lottery-400 hover:text-lottery-300 transition-colors text-sm'
            >
              Don&apos;t have an account? Sign up
            </Link>
            <Link
              href='/auth/forgot-password'
              className='block text-lottery-400 hover:text-lottery-300 transition-colors text-sm'
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className='text-center mt-6'>
          <Link
            href='/'
            className='text-lottery-400 hover:text-lottery-300 transition-colors text-sm flex items-center justify-center gap-2'
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
