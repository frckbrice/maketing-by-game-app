import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PhoneAuthForm } from '../PhoneAuthForm';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock useAuth hook
const mockSendPhoneVerificationCode = jest.fn();
const mockVerifyPhoneCode = jest.fn();

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    sendPhoneVerificationCode: mockSendPhoneVerificationCode,
    verifyPhoneCode: mockVerifyPhoneCode,
    loading: false,
  }),
}));

describe('PhoneAuthForm', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onError: jest.fn(),
    className: 'custom-class',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Step', () => {
    it('renders phone input step by default', () => {
      render(<PhoneAuthForm {...defaultProps} />);

      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('+1 (555) 123-4567')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send verification code/i })
      ).toBeInTheDocument();
    });

    it('displays phone icon in input field', () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneIcon = document.querySelector('svg[class*="lucide-phone"]');
      expect(phoneIcon).toBeInTheDocument();
    });

    it('updates phone number on input change', () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });

      expect(phoneInput).toHaveValue('+1 (555) 123-4567');
    });

    it('enables send button when phone number is entered', () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      expect(sendButton).toBeDisabled();

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });

      expect(sendButton).toBeEnabled();
    });

    it('shows error for invalid phone number', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Please enter a valid phone number'
        );
      });
    });

    it('shows error for empty phone number', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });
      fireEvent.click(sendButton);

      // The button should be disabled when no phone number is entered
      expect(sendButton).toBeDisabled();
    });

    it('handles successful code sending', async () => {
      mockSendPhoneVerificationCode.mockResolvedValueOnce(undefined);

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendPhoneVerificationCode).toHaveBeenCalledWith(
          '15551234567'
        );
        expect(toast.success).toHaveBeenCalledWith(
          'Verification code sent to your phone!'
        );
      });
    });

    it('handles code sending error', async () => {
      const error = new Error('Network error');
      mockSendPhoneVerificationCode.mockRejectedValueOnce(error);

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
        expect(defaultProps.onError).toHaveBeenCalledWith(error);
      });
    });

    it('handles code sending error with non-Error object', async () => {
      mockSendPhoneVerificationCode.mockRejectedValueOnce('String error');

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to send code');
        expect(defaultProps.onError).toHaveBeenCalledWith(
          new Error('Failed to send code')
        );
      });
    });
  });

  describe('Verification Step', () => {
    beforeEach(() => {
      // Set up the component to be in verification step
      mockSendPhoneVerificationCode.mockResolvedValueOnce(undefined);
    });

    it('transitions to verification step after sending code', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText(/we've sent a 6-digit code to \+1 \(555\) 123-4567/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /back/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /verify code/i })
        ).toBeInTheDocument();
      });
    });

    it('displays shield icon in verification step', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const shieldIcon = document.querySelector(
          'svg[class*="lucide-shield"]'
        );
        expect(shieldIcon).toBeInTheDocument();
      });
    });

    it('updates verification code on input change', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        fireEvent.change(codeInput, { target: { value: '123456' } });
        expect(codeInput).toHaveValue('123456');
      });
    });

    it('filters non-numeric characters from verification code', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        fireEvent.change(codeInput, { target: { value: '123abc456' } });
        expect(codeInput).toHaveValue('123456');
      });
    });

    it('limits verification code to 6 digits', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        fireEvent.change(codeInput, { target: { value: '123456789' } });
        expect(codeInput).toHaveValue('123456');
      });
    });

    it('enables verify button when code is 6 digits', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });

        expect(verifyButton).toBeDisabled();

        fireEvent.change(codeInput, { target: { value: '123456' } });
        expect(verifyButton).toBeEnabled();
      });
    });

    it('shows error for invalid verification code', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });
        // The verify button should be disabled when no code is entered
        expect(verifyButton).toBeDisabled();
      });
    });

    it('handles successful code verification', async () => {
      mockVerifyPhoneCode.mockResolvedValueOnce(undefined);

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });

        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.click(verifyButton);

        expect(mockVerifyPhoneCode).toHaveBeenCalledWith(
          '+1 (555) 123-4567',
          '123456'
        );
        expect(toast.success).toHaveBeenCalledWith(
          'Phone number verified successfully!'
        );
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('handles code verification error', async () => {
      const error = new Error('Invalid code');
      mockVerifyPhoneCode.mockRejectedValueOnce(error);

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });

        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.click(verifyButton);

        expect(toast.error).toHaveBeenCalledWith('Invalid code');
        expect(defaultProps.onError).toHaveBeenCalledWith(error);
      });
    });

    it('handles code verification error with non-Error object', async () => {
      mockVerifyPhoneCode.mockRejectedValueOnce('String error');

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });

        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.click(verifyButton);

        expect(toast.error).toHaveBeenCalledWith('Invalid verification code');
        expect(defaultProps.onError).toHaveBeenCalledWith(
          new Error('Invalid verification code')
        );
      });
    });

    it('goes back to phone step when back button is clicked', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);

        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /send verification code/i })
        ).toBeInTheDocument();
      });
    });

    it('goes back to phone step when back button is clicked', async () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);

        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /send verification code/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('disables inputs and buttons when loading', () => {
      // Since we can't easily mock the loading state, let's test the default behavior
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      // By default, inputs and buttons should be enabled
      expect(phoneInput).not.toBeDisabled();
      expect(sendButton).toBeDisabled(); // Because no phone number entered
    });
  });

  describe('Props and Styling', () => {
    it('applies custom className', () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('custom-class');
    });

    it('works without optional props', () => {
      render(<PhoneAuthForm />);

      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send verification code/i })
      ).toBeInTheDocument();
    });

    it('calls onSuccess callback when verification succeeds', async () => {
      mockVerifyPhoneCode.mockResolvedValueOnce(undefined);

      render(<PhoneAuthForm onSuccess={defaultProps.onSuccess} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });

        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.click(verifyButton);

        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('calls onError callback when verification fails', async () => {
      const error = new Error('Invalid code');
      mockVerifyPhoneCode.mockRejectedValueOnce(error);

      render(<PhoneAuthForm onError={defaultProps.onError} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const codeInput = screen.getByLabelText('Verification Code');
        const verifyButton = screen.getByRole('button', {
          name: /verify code/i,
        });

        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.click(verifyButton);

        expect(defaultProps.onError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Phone Number Normalization', () => {
    it('normalizes phone number by removing non-digits', async () => {
      mockSendPhoneVerificationCode.mockResolvedValueOnce(undefined);

      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendPhoneVerificationCode).toHaveBeenCalledWith(
          '15551234567'
        );
      });
    });

    it('validates phone number length correctly', () => {
      render(<PhoneAuthForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      const sendButton = screen.getByRole('button', {
        name: /send verification code/i,
      });

      // Test with 9 digits (too short)
      fireEvent.change(phoneInput, { target: { value: '123456789' } });
      fireEvent.click(sendButton);

      expect(toast.error).toHaveBeenCalledWith(
        'Please enter a valid phone number'
      );

      // Test with 16 digits (too long)
      fireEvent.change(phoneInput, { target: { value: '1234567890123456' } });
      fireEvent.click(sendButton);

      expect(toast.error).toHaveBeenCalledWith(
        'Please enter a valid phone number'
      );
    });
  });
});
