import { useAdminStats } from '@/hooks/useApi';
import { useAuth } from '@/lib/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../admin-dashboard';

// Mock the hooks
jest.mock('@/lib/contexts/AuthContext');
jest.mock('@/hooks/useApi');
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
const mockUseAdminStats = useAdminStats as jest.MockedFunction<typeof useAdminStats>;

describe('AdminDashboard', () => {
    const defaultUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
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

        render(<AdminDashboard />);

        expect(screen.getByText('common.loading')).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: true,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

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

        mockUseAdminStats.mockReturnValue({
            data: defaultStats,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText('admin.welcomeMessage, Admin!')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
    });
});
