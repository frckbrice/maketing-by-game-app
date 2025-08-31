import * as useApiHooks from '@/hooks/useApi';
import { useAuth } from '@/lib/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../admin-dashboard';

// Mock the hooks
jest.mock('@/lib/contexts/AuthContext');
jest.mock('@/hooks/useApi', () => ({
    useAdminStats: jest.fn(),
}));
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

// Mock the home components
jest.mock('@/components/home/components/DesktopHeader', () => ({
    DesktopHeader: ({ isDark, onThemeToggle }: { isDark: boolean; onThemeToggle: () => void }) => (
        <div data-testid="desktop-header">
            <button onClick={onThemeToggle}>Toggle Theme</button>
            <span>Dark: {isDark ? 'true' : 'false'}</span>
        </div>
    ),
}));

jest.mock('@/components/home/components/MobileNavigation', () => ({
    MobileNavigation: ({ isDark, onThemeToggle }: { isDark: boolean; onThemeToggle: () => void }) => (
        <div data-testid="mobile-navigation">
            <button onClick={onThemeToggle}>Toggle Theme</button>
            <span>Dark: {isDark ? 'true' : 'false'}</span>
        </div>
    ),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: jest.fn(),
    }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AdminDashboard', () => {
    const defaultUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'ACTIVE' as const,
        emailVerified: true,
        phoneVerified: false,
        socialMedia: {},
        phoneNumber: undefined,
        avatar: undefined,
        preferences: {
            language: 'en',
            theme: 'light' as const,
            notifications: true,
            emailUpdates: true,
            smsUpdates: false,
            timezone: 'UTC',
            currency: 'USD',
        },
        twoFactorEnabled: false,
        notificationSettings: {
            email: true,
            sms: false,
            push: true,
            inApp: true,
            marketing: false,
            gameUpdates: true,
            winnerAnnouncements: true,
        },
        privacySettings: {
            profileVisibility: 'public' as const,
            showEmail: false,
            showPhone: false,
            allowContact: true,
            dataSharing: false,
        },
    };

    const defaultStats = {
        totalUsers: 1250,
        totalGames: 89,
        totalWinners: 45,
        pendingApplications: 12,
        totalRevenue: 45600,
        activeGames: 23,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock the useAdminStats hook
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);
    });

    it('renders loading state initially', () => {
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

        // Override the mock for loading state
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        expect(screen.getByText('common.loading')).toBeInTheDocument();
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('renders access denied for non-admin users', async () => {
        const mockRouter = { replace: jest.fn() };
        jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);

        mockUseAuth.mockReturnValue({
            user: { ...defaultUser, role: 'USER' },
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

        // Override the mock for access denied
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('renders admin dashboard for admin users', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for admin dashboard
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('admin.adminDashboard')).toBeInTheDocument();
            expect(screen.getByText('admin.welcomeMessage, Admin!')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
    });

    it('displays all statistics correctly', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for statistics
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('admin.totalUsers')).toBeInTheDocument();
            expect(screen.getByText('1250')).toBeInTheDocument();

            expect(screen.getByText('admin.totalGames')).toBeInTheDocument();
            expect(screen.getByText('89')).toBeInTheDocument();

            expect(screen.getByText('admin.pendingApplications')).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();

            expect(screen.getByText('admin.activeGames')).toBeInTheDocument();
            expect(screen.getByText('23')).toBeInTheDocument();

            expect(screen.getByText('admin.totalWinners')).toBeInTheDocument();
            expect(screen.getByText('45')).toBeInTheDocument();

            expect(screen.getByText('admin.totalRevenue')).toBeInTheDocument();
            expect(screen.getByText('$45,600')).toBeInTheDocument();
        });
    });

    it('displays loading state for statistics', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for loading state
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: true,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            // Should show loading indicators
            const loadingElements = screen.getAllByText('...');
            expect(loadingElements).toHaveLength(6); // 6 stat cards
        });
    });

    it('renders quick action sections', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for quick actions
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('admin.contentManagement')).toBeInTheDocument();
            expect(screen.getByText('admin.manageCategories')).toBeInTheDocument();
            expect(screen.getByText('admin.manageGames')).toBeInTheDocument();
            expect(screen.getByText('admin.manageWinners')).toBeInTheDocument();

            expect(screen.getByText('admin.userManagement')).toBeInTheDocument();
            expect(screen.getByText('admin.manageUsers')).toBeInTheDocument();
            expect(screen.getByText('admin.vendorApplications')).toBeInTheDocument();
            expect(screen.getByText('admin.manageRoles')).toBeInTheDocument();

            expect(screen.getByText('admin.systemSettings')).toBeInTheDocument();
            expect(screen.getByText('admin.generalSettings')).toBeInTheDocument();
            expect(screen.getByText('admin.notificationSettings')).toBeInTheDocument();
            expect(screen.getByText('admin.analytics')).toBeInTheDocument();
        });
    });

    it('renders recent activity section', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for recent activity
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('admin.recentActivity')).toBeInTheDocument();
            expect(screen.getByText('admin.noRecentActivity')).toBeInTheDocument();
        });
    });

    it('renders desktop and mobile navigation components', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for navigation
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId('desktop-header')).toBeInTheDocument();
            expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
        });
    });

    it('handles theme toggle correctly', async () => {
        const mockSetTheme = jest.fn();
        jest.spyOn(require('next-themes'), 'useTheme').mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });

        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for theme toggle
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            const themeButtons = screen.getAllByText('Toggle Theme');
            expect(themeButtons).toHaveLength(2); // Desktop and mobile
        });
    });

    it('displays correct user information', async () => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
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

        // Override the mock for user info
        (useApiHooks.useAdminStats as jest.Mock).mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any);

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('admin.welcomeMessage, Admin!')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
    });
});






