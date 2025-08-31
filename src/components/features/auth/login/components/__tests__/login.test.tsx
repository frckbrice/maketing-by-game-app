import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { LoginPage } from '../login';

// Mock external dependencies
jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('@/components/home/components/DesktopHeader', () => ({
    DesktopHeader: ({ isDark, onThemeToggle }: { isDark: boolean; onThemeToggle: () => void }) => (
        <header data-testid="desktop-header" className={isDark ? 'dark' : 'light'}>
            <button onClick={onThemeToggle} data-testid="theme-toggle">
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
        onThemeToggle
    }: {
        isDark: boolean;
        mobileMenuOpen: boolean;
        setMobileMenuOpen: (open: boolean) => void;
        onThemeToggle: () => void;
    }) => (
        <nav data-testid="mobile-nav" className={isDark ? 'dark' : 'light'}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-toggle">
                {mobileMenuOpen ? 'Close' : 'Open'} Menu
            </button>
            <button onClick={onThemeToggle} data-testid="mobile-theme-toggle">
                Toggle Theme
            </button>
        </nav>
    ),
}));

jest.mock('../../../EnhancedAuthForm', () => ({
    EnhancedAuthForm: ({ mode }: { mode: string }) => (
        <div data-testid="enhanced-auth-form">
            <h2>Enhanced Auth Form - {mode}</h2>
            <input type="email" placeholder="Enter your email" data-testid="email-input" />
            <input type="password" placeholder="Enter your password" data-testid="password-input" />
            <button type="submit" data-testid="submit-button">Sign In</button>
        </div>
    ),
}));

// Mock data
const mockTranslation = {
    t: (key: string) => {
        const translations: { [key: string]: string } = {
            'auth.login.title': 'Welcome Back',
            'auth.login.subtitle': 'Sign in to your account to continue',
        };
        return translations[key] || key;
    },
};

describe('LoginPage', () => {
    const mockSetTheme = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useTheme as jest.Mock).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });

        (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the login page with header and navigation', () => {
        render(<LoginPage />);

        expect(screen.getByTestId('desktop-header')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    });

    it('displays the main title and subtitle', () => {
        render(<LoginPage />);

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    });

    it('shows the logo with lock icon', () => {
        render(<LoginPage />);

        // Check for the logo container
        const logoContainer = document.querySelector('div.w-20.h-20.mx-auto.mb-4.bg-gradient-to-r.from-orange-500.to-red-500.rounded-full');
        expect(logoContainer).toBeInTheDocument();

        // Check for the lock icon SVG
        const lockIcon = document.querySelector('svg.w-10.h-10.text-white');
        expect(lockIcon).toBeInTheDocument();
    });

    it('shows the enhanced authentication form', () => {
        render(<LoginPage />);

        expect(screen.getByTestId('enhanced-auth-form')).toBeInTheDocument();
        expect(screen.getByText('Enhanced Auth Form - login')).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('passes correct mode to EnhancedAuthForm', () => {
        render(<LoginPage />);

        expect(screen.getByText('Enhanced Auth Form - login')).toBeInTheDocument();
    });

    it('handles theme toggle from desktop header', () => {
        render(<LoginPage />);

        const themeToggle = screen.getByTestId('theme-toggle');
        expect(themeToggle).toBeInTheDocument();

        // Theme toggle should call setTheme
        expect(mockSetTheme).not.toHaveBeenCalled();
    });

    it('handles theme toggle from mobile navigation', () => {
        render(<LoginPage />);

        const mobileThemeToggle = screen.getByTestId('mobile-theme-toggle');
        expect(mobileThemeToggle).toBeInTheDocument();

        // Theme toggle should call setTheme
        expect(mockSetTheme).not.toHaveBeenCalled();
    });

    it('handles mobile menu toggle', () => {
        render(<LoginPage />);

        const mobileMenuToggle = screen.getByTestId('mobile-menu-toggle');
        expect(mobileMenuToggle).toBeInTheDocument();
        expect(mobileMenuToggle).toHaveTextContent('Open Menu');
    });

    it('applies correct theme classes', () => {
        render(<LoginPage />);

        const desktopHeader = screen.getByTestId('desktop-header');
        const mobileNav = screen.getByTestId('mobile-nav');

        // Should be light theme by default
        expect(desktopHeader).toHaveClass('light');
        expect(mobileNav).toHaveClass('light');
    });

    it('renders with dark theme when theme is dark', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });

        render(<LoginPage />);

        const desktopHeader = screen.getByTestId('desktop-header');
        const mobileNav = screen.getByTestId('mobile-nav');

        expect(desktopHeader).toHaveClass('dark');
        expect(mobileNav).toHaveClass('dark');
    });

    it('has proper page structure and styling', () => {
        render(<LoginPage />);

        // Check main container - find the root div with min-h-screen
        const mainContainer = document.querySelector('div.min-h-screen');
        expect(mainContainer).toHaveClass('min-h-screen', 'bg-white', 'dark:bg-gray-900');

        // Check content area - find the flex container
        const contentArea = document.querySelector('div.flex.items-center.justify-center');
        expect(contentArea).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[calc(100vh-8rem)]', 'p-4');

        // Check form container
        const formContainer = document.querySelector('div.bg-white.dark\\:bg-gray-800.rounded-2xl');
        expect(formContainer).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-2xl', 'p-8', 'shadow-2xl', 'border', 'border-gray-200', 'dark:border-gray-700');
    });

    it('has proper accessibility attributes', () => {
        render(<LoginPage />);

        // Check main heading
        const mainHeading = screen.getByText('Welcome Back');
        expect(mainHeading.tagName).toBe('H1');
        expect(mainHeading).toHaveClass('text-3xl', 'font-bold');

        // Check form elements
        const emailInput = screen.getByTestId('email-input');
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');

        const passwordInput = screen.getByTestId('password-input');
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');

        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('handles responsive design classes', () => {
        render(<LoginPage />);

        // Check responsive classes - find the wrapper with w-full max-w-md
        const contentWrapper = document.querySelector('div.w-full.max-w-md');
        expect(contentWrapper).toHaveClass('w-full', 'max-w-md');
    });

    it('renders logo with proper styling', () => {
        render(<LoginPage />);

        // Check logo container styling
        const logoContainer = document.querySelector('div.w-20.h-20.mx-auto.mb-4.bg-gradient-to-r.from-orange-500.to-red-500.rounded-full');
        expect(logoContainer).toHaveClass(
            'w-20',
            'h-20',
            'mx-auto',
            'mb-4',
            'bg-gradient-to-r',
            'from-orange-500',
            'to-red-500',
            'rounded-full',
            'flex',
            'items-center',
            'justify-center'
        );
    });

    it('renders header section with proper styling', () => {
        render(<LoginPage />);

        // Check header section styling
        const headerSection = screen.getByText('Welcome Back').closest('div');
        expect(headerSection).toHaveClass('text-center', 'mb-8');

        // Check logo spacing
        const logoContainer = headerSection?.querySelector('div.w-20.h-20');
        expect(logoContainer).toHaveClass('mb-4');

        // Check title spacing
        const title = screen.getByText('Welcome Back');
        expect(title).toHaveClass('mb-2');
    });
});
