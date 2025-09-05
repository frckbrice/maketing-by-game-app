import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { ForgotPasswd } from '../forget-passwd';

// Mock external dependencies
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@/components/home/components/DesktopHeader', () => ({
  DesktopHeader: ({
    isDark,
    onThemeToggle,
  }: {
    isDark: boolean;
    onThemeToggle: () => void;
  }) => (
    <header data-testid='desktop-header' className={isDark ? 'dark' : 'light'}>
      <button onClick={onThemeToggle} data-testid='theme-toggle'>
        Toggle Theme
      </button>
    </header>
  ),
}));

jest.mock('@/components/home/components/MobileNavigation', () => ({
  MobileNavigation: ({
    isDark,
    mobileMenuOpen,
    setMobileMenuOpen,
    onThemeToggle,
  }: {
    isDark: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    onThemeToggle: () => void;
  }) => (
    <nav data-testid='mobile-nav' className={isDark ? 'dark' : 'light'}>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        data-testid='mobile-menu-toggle'
      >
        {mobileMenuOpen ? 'Close' : 'Open'} Menu
      </button>
      <button onClick={onThemeToggle} data-testid='mobile-theme-toggle'>
        Toggle Theme
      </button>
    </nav>
  ),
}));

jest.mock('../../../reset-password/components/PasswordResetForm', () => ({
  PasswordResetForm: () => (
    <div data-testid='password-reset-form'>
      <h2>Password Reset Form</h2>
      <input
        type='email'
        placeholder='Enter your email'
        data-testid='email-input'
      />
      <button type='submit' data-testid='submit-button'>
        Reset Password
      </button>
    </div>
  ),
}));

// Mock data
const mockTranslation = {
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      'auth.forgotPassword.title': 'Forgot Password',
      'auth.forgotPassword.subtitle': 'Enter your email to reset your password',
      'auth.forgotPassword.backToLogin': 'Back to Login',
    };
    return translations[key] || key;
  },
};

describe('ForgotPasswd', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    });

    (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the forgot password page with header and navigation', () => {
    render(<ForgotPasswd />);

    expect(screen.getByTestId('desktop-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('displays the main title and subtitle', () => {
    render(<ForgotPasswd />);

    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your email to reset your password')
    ).toBeInTheDocument();
  });

  it('shows the password reset form', () => {
    render(<ForgotPasswd />);

    expect(screen.getByTestId('password-reset-form')).toBeInTheDocument();
    expect(screen.getByText('Password Reset Form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('shows back to login link', () => {
    render(<ForgotPasswd />);

    const backToLoginLink = screen.getByText('Back to Login');
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('handles theme toggle from desktop header', () => {
    render(<ForgotPasswd />);

    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();

    // Theme toggle should call setTheme
    expect(mockSetTheme).not.toHaveBeenCalled();
  });

  it('handles theme toggle from mobile navigation', () => {
    render(<ForgotPasswd />);

    const mobileThemeToggle = screen.getByTestId('mobile-theme-toggle');
    expect(mobileThemeToggle).toBeInTheDocument();

    // Theme toggle should call setTheme
    expect(mockSetTheme).not.toHaveBeenCalled();
  });

  it('handles mobile menu toggle', () => {
    render(<ForgotPasswd />);

    const mobileMenuToggle = screen.getByTestId('mobile-menu-toggle');
    expect(mobileMenuToggle).toBeInTheDocument();
    expect(mobileMenuToggle).toHaveTextContent('Open Menu');
  });

  it('applies correct theme classes', () => {
    render(<ForgotPasswd />);

    const desktopHeader = screen.getByTestId('desktop-header');
    const mobileNav = screen.getByTestId('mobile-nav');

    // Should be light theme by default
    expect(desktopHeader).toHaveClass('light');
    expect(mobileNav).toHaveClass('light');
  });

  it('renders with dark theme when theme is dark', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ForgotPasswd />);

    const desktopHeader = screen.getByTestId('desktop-header');
    const mobileNav = screen.getByTestId('mobile-nav');

    expect(desktopHeader).toHaveClass('dark');
    expect(mobileNav).toHaveClass('dark');
  });

  it('has proper page structure and styling', () => {
    render(<ForgotPasswd />);

    // Check main container - find the root div with min-h-screen
    const mainContainer = document.querySelector('div.min-h-screen');
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'bg-white',
      'dark:bg-gray-900'
    );

    // Check content area - find the flex container
    const contentArea = document.querySelector(
      'div.flex.items-center.justify-center'
    );
    expect(contentArea).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'min-h-[calc(100vh-8rem)]',
      'p-4'
    );

    // Check form container - find the container with the styling classes
    const formContainer = document.querySelector(
      'div.bg-white.dark\\:bg-gray-800.rounded-2xl'
    );
    expect(formContainer).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-2xl',
      'p-8',
      'shadow-2xl',
      'border',
      'border-gray-200',
      'dark:border-gray-700'
    );
  });

  it('has proper accessibility attributes', () => {
    render(<ForgotPasswd />);

    // Check main heading
    const mainHeading = screen.getByText('Forgot Password');
    expect(mainHeading.tagName).toBe('H1');
    expect(mainHeading).toHaveClass('text-3xl', 'font-bold');

    // Check form elements
    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('handles responsive design classes', () => {
    render(<ForgotPasswd />);

    // Check responsive classes - find the wrapper with w-full max-w-md
    const contentWrapper = document.querySelector('div.w-full.max-w-md');
    expect(contentWrapper).toHaveClass('w-full', 'max-w-md');
  });

  it('renders navigation links with proper styling', () => {
    render(<ForgotPasswd />);

    const backToLoginLink = screen.getByText('Back to Login').closest('a');
    expect(backToLoginLink).toHaveClass(
      'text-orange-500',
      'hover:text-orange-600',
      'dark:text-orange-400',
      'dark:hover:text-orange-300',
      'transition-colors',
      'text-sm',
      'flex',
      'items-center',
      'justify-center',
      'gap-2'
    );
  });
});
