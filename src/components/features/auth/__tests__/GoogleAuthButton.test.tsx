import { useAuth } from '@/lib/contexts/AuthContext';
import { fireEvent, render, screen } from '@testing-library/react';
import { GoogleAuthButton } from '../GoogleAuthButton';

jest.mock('@/lib/contexts/AuthContext');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('GoogleAuthButton', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      firebaseUser: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      signInWithGoogle: jest.fn(),
      sendPhoneVerificationCode: jest.fn(),
      verifyPhoneCode: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<GoogleAuthButton {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toHaveClass('w-full');
    });

    it('renders with custom variant', () => {
      render(<GoogleAuthButton {...defaultProps} variant='default' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-orange-500');
    });

    it('renders with custom size', () => {
      render(<GoogleAuthButton {...defaultProps} size='lg' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
    });

    it('renders with custom className', () => {
      render(<GoogleAuthButton {...defaultProps} className='custom-class' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('displays Google icon', () => {
      render(<GoogleAuthButton {...defaultProps} />);

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: jest.fn(),
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton {...defaultProps} />);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows normal state when not loading', () => {
      render(<GoogleAuthButton {...defaultProps} />);

      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Click Handling', () => {
    it('calls signInWithGoogle when clicked', async () => {
      const mockSignInWithGoogle = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('calls onSuccess callback when sign-in succeeds', async () => {
      const mockSignInWithGoogle = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
    });

    it('calls onError callback when sign-in fails', async () => {
      const mockError = new Error('Google sign-in failed');
      const mockSignInWithGoogle = jest.fn().mockRejectedValue(mockError);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(defaultProps.onError).toHaveBeenCalledWith(mockError);
    });

    it('handles non-Error objects in error callback', async () => {
      const mockSignInWithGoogle = jest.fn().mockRejectedValue('String error');
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(defaultProps.onError).toHaveBeenCalledWith(
        new Error('Google sign-in failed')
      );
    });
  });

  describe('Accessibility', () => {
    it('has correct button type', () => {
      render(<GoogleAuthButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('is disabled when loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: jest.fn(),
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Optional Callbacks', () => {
    it('works without onSuccess callback', async () => {
      const mockSignInWithGoogle = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton onError={defaultProps.onError} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should not throw error
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('works without onError callback', async () => {
      const mockError = new Error('Google sign-in failed');
      const mockSignInWithGoogle = jest.fn().mockRejectedValue(mockError);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        firebaseUser: null,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
        sendPhoneVerificationCode: jest.fn(),
        verifyPhoneCode: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        deleteAccount: jest.fn(),
      });

      render(<GoogleAuthButton onSuccess={defaultProps.onSuccess} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should not throw error
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });
});
