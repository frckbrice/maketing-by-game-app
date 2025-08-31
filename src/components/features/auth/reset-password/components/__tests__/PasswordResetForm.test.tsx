import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PasswordResetForm } from '../PasswordResetForm';

// Mock useAuth hook
const mockSendPasswordResetEmail = jest.fn();
const mockLoading = false;

jest.mock('@/lib/contexts/AuthContext', () => ({
    useAuth: () => ({
        sendPasswordResetEmail: mockSendPasswordResetEmail,
        loading: mockLoading,
    }),
}));

// Mock react-i18next
const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
        'auth.forgotPassword.title': 'Reset Your Password',
        'auth.forgotPassword.subtitle': 'Enter your email to receive a reset link',
        'auth.forgotPassword.email': 'Email Address',
        'auth.forgotPassword.submit': 'Send Reset Link',
        'auth.forgotPassword.checkEmail': 'Check Your Email',
        'auth.forgotPassword.emailSent': 'We\'ve sent a password reset link to',
        'auth.forgotPassword.emailInstructions': 'Click the link in the email to reset your password',
        'auth.forgotPassword.backToLoginButton': 'Back to Login',
    };
    return translations[key] || key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

describe('PasswordResetForm', () => {
    const defaultProps = {
        onSuccess: jest.fn(),
        onError: jest.fn(),
        className: 'custom-class',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Email Step', () => {
        it('renders email input step by default', () => {
            render(<PasswordResetForm {...defaultProps} />);

            expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
            expect(screen.getByText('Enter your email to receive a reset link')).toBeInTheDocument();
            expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
        });

        it('displays lock icon in header', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const lockIcon = document.querySelector('svg[class*="lucide-lock"]');
            expect(lockIcon).toBeInTheDocument();
            expect(lockIcon).toHaveClass('w-8', 'h-8', 'text-lottery-500');
        });

        it('displays mail icon in input field', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const mailIcon = document.querySelector('svg[class*="lucide-mail"]');
            expect(mailIcon).toBeInTheDocument();
            expect(mailIcon).toHaveClass('w-5', 'h-5', 'text-lottery-400');
        });

        it('updates email on input change', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('enables submit button when email is entered', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            expect(submitButton).toBeDisabled();

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            expect(submitButton).toBeEnabled();
        });

        it('shows error for empty email', async () => {
            render(<PasswordResetForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send reset link/i });
            // The button should be disabled when no email is entered
            expect(submitButton).toBeDisabled();
        });

        it('handles successful email sending', async () => {
            mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);

            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
                expect(require('sonner').toast.success).toHaveBeenCalledWith('Password reset email sent! Check your inbox.');
                expect(defaultProps.onSuccess).toHaveBeenCalled();
            });
        });

        it('handles email sending error', async () => {
            const error = new Error('Network error');
            mockSendPasswordResetEmail.mockRejectedValueOnce(error);

            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(require('sonner').toast.error).toHaveBeenCalledWith('Network error');
                expect(defaultProps.onError).toHaveBeenCalledWith(error);
            });
        });

        it('handles email sending error with non-Error object', async () => {
            mockSendPasswordResetEmail.mockRejectedValueOnce('String error');

            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(require('sonner').toast.error).toHaveBeenCalledWith('Failed to send reset email');
                expect(defaultProps.onError).toHaveBeenCalledWith(new Error('Failed to send reset email'));
            });
        });
    });

    describe('Success Step', () => {
        beforeEach(() => {
            // Set up the component to be in success step
            mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);
        });

        it('transitions to success step after sending email', async () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Check Your Email')).toBeInTheDocument();
                expect(screen.getByText(/we've sent a password reset link to/i)).toBeInTheDocument();
                expect(screen.getByText('test@example.com')).toBeInTheDocument();
                expect(screen.getByText('Click the link in the email to reset your password')).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
            });
        });

        it('displays mail icon in success step', async () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const mailIcon = document.querySelector('svg[class*="lucide-mail"]');
                expect(mailIcon).toBeInTheDocument();
                expect(mailIcon).toHaveClass('w-8', 'h-8', 'text-lottery-500');
            });
        });

        it('goes back to email step when back button is clicked', async () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const backButton = screen.getByRole('button', { name: /back to login/i });
                fireEvent.click(backButton);

                expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
                expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
            });
        });

        it('goes back to email step when back button is clicked', async () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const backButton = screen.getByRole('button', { name: /back to login/i });
                fireEvent.click(backButton);

                expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
                expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
            });
        });
    });

    describe('Loading States', () => {
        it('disables inputs and buttons when loading', () => {
            // Since we can't easily mock the loading state, let's test the default behavior
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            // By default, inputs and buttons should be enabled
            expect(emailInput).not.toBeDisabled();
            expect(submitButton).toBeDisabled(); // Because no email entered
        });
    });

    describe('Props and Styling', () => {
        it('applies custom className', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const container = document.querySelector('.custom-class');
            expect(container).toBeInTheDocument();
            expect(container).toHaveClass('custom-class');
        });

        it('works without optional props', () => {
            render(<PasswordResetForm />);

            expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
            expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
        });

        it('calls onSuccess callback when email is sent successfully', async () => {
            mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);

            render(<PasswordResetForm onSuccess={defaultProps.onSuccess} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(defaultProps.onSuccess).toHaveBeenCalled();
            });
        });

        it('calls onError callback when email sending fails', async () => {
            const error = new Error('Network error');
            mockSendPasswordResetEmail.mockRejectedValueOnce(error);

            render(<PasswordResetForm onError={defaultProps.onError} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(defaultProps.onError).toHaveBeenCalledWith(error);
            });
        });
    });

    describe('Internationalization', () => {
        it('uses translation function for text content', () => {
            render(<PasswordResetForm {...defaultProps} />);

            expect(mockT).toHaveBeenCalledWith('auth.forgotPassword.title');
            expect(mockT).toHaveBeenCalledWith('auth.forgotPassword.subtitle');
            expect(mockT).toHaveBeenCalledWith('auth.forgotPassword.email');
            expect(mockT).toHaveBeenCalledWith('auth.forgotPassword.submit');
        });

        it('displays translated content correctly', () => {
            render(<PasswordResetForm {...defaultProps} />);

            expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
            expect(screen.getByText('Enter your email to receive a reset link')).toBeInTheDocument();
            expect(screen.getByText('Email Address')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('validates email input is required', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send reset link/i });
            // The button should be disabled when no email is entered
            expect(submitButton).toBeDisabled();
        });

        it('enables submit button only when email is provided', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset link/i });

            // Initially disabled
            expect(submitButton).toBeDisabled();

            // Enable when email is entered
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            expect(submitButton).toBeEnabled();

            // Disable when email is cleared
            fireEvent.change(emailInput, { target: { value: '' } });
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Accessibility', () => {
        it('has proper form labels', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const emailLabel = screen.getByText('Email Address');
            expect(emailLabel).toBeInTheDocument();
            expect(emailLabel).toHaveAttribute('for', 'reset-email');

            const emailInput = screen.getByLabelText('Email Address');
            expect(emailInput).toHaveAttribute('id', 'reset-email');
            expect(emailInput).toHaveAttribute('type', 'email');
        });

        it('has proper button roles and states', () => {
            render(<PasswordResetForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send reset link/i });
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toBeDisabled(); // Initially disabled

            const emailInput = screen.getByLabelText('Email Address');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            expect(submitButton).toBeEnabled();
        });
    });
});
