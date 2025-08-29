'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

interface GoogleAuthButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function GoogleAuthButton({
  variant = 'outline',
  size = 'default',
  className = '',
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in with Google!');
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Google sign-in failed';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  return (
    <Button
      type='button'
      variant={variant}
      size={size as 'icon' | 'default' | 'sm' | 'lg' | null | undefined}
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 ${className}`}
    >
      <FcGoogle className='w-5 h-5' />
      {loading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
}
