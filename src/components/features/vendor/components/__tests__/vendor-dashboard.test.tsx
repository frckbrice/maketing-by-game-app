import { useAuth } from '@/lib/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import { VendorDashboard } from '../vendor-dashboard';

jest.mock('@/lib/contexts/AuthContext');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const translations: Record<string, string> = {
                'vendor.welcomeMessage': 'Welcome back!',
                'vendor.createGame': 'Create Game',
                'vendor.analytics': 'Analytics',
                'vendor.profile': 'Profile',
            };
            return translations[key] || fallback || key;
        },
    }),
}));
jest.mock('@/hooks/useApi', () => ({
    useVendorStats: jest.fn(),
    useVendorGames: jest.fn(),
    useVendorRevenueChart: jest.fn(),
    useVendorParticipationChart: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the API hooks
const mockUseVendorStats = require('@/hooks/useApi').useVendorStats as jest.MockedFunction<any>;
const mockUseVendorGames = require('@/hooks/useApi').useVendorGames as jest.MockedFunction<any>;
const mockUseVendorRevenueChart = require('@/hooks/useApi').useVendorRevenueChart as jest.MockedFunction<any>;
const mockUseVendorParticipationChart = require('@/hooks/useApi').useVendorParticipationChart as jest.MockedFunction<any>;

const defaultUser = {
    id: 'vendor-1',
    email: 'vendor@example.com',
    role: 'VENDOR',
    firstName: 'Vendor',
    lastName: 'User',
    preferences: {
        theme: 'light',
        language: 'en',
        notifications: true,
    },
    notificationSettings: {
        email: true,
        push: true,
        sms: false,
    },
    privacySettings: {
        profileVisibility: 'public',
        dataSharing: false,
    },
    emailVerified: true,
    phoneVerified: false,
    socialMedia: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
};

const mockStats = {
    totalGames: 15,
    activeGames: 8,
    totalRevenue: 1250.75,
    monthlyRevenue: 450.25,
    totalParticipants: 1250,
    averageParticipation: 83.33,
    conversionRate: 12.5,
    pendingApprovals: 2,
};

const mockGames = [
    {
        id: 'game-1',
        title: 'Tech Gadget Lottery',
        status: 'ACTIVE',
        currentParticipants: 45,
        ticketPrice: 10,
        endDate: Date.now() + 86400000, // 1 day from now
    },
    {
        id: 'game-2',
        title: 'Fashion Accessories Draw',
        status: 'PENDING',
        currentParticipants: 0,
        ticketPrice: 5,
        endDate: Date.now() + 172800000, // 2 days from now
    },
];

const mockRevenueChart = [
    { date: Date.now() - 86400000, revenue: 150 },
    { date: Date.now(), revenue: 200 },
];

const mockParticipationChart = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home & Garden', value: 200 },
];

describe('VendorDashboard', () => {
    beforeEach(() => {
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

        mockUseVendorStats.mockReturnValue({
            data: mockStats,
            isLoading: false,
        });

        mockUseVendorGames.mockReturnValue({
            data: mockGames,
            isLoading: false,
        });

        mockUseVendorRevenueChart.mockReturnValue({
            data: mockRevenueChart,
            isLoading: false,
        });

        mockUseVendorParticipationChart.mockReturnValue({
            data: mockParticipationChart,
            isLoading: false,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('shows loading skeleton when data is loading', () => {
            mockUseVendorStats.mockReturnValue({
                data: null,
                isLoading: true,
            });

            render(<VendorDashboard />);

            expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
            expect(document.querySelectorAll('.bg-gray-200').length).toBeGreaterThan(0);
        });

        it('shows loading skeleton when any API is loading', () => {
            mockUseVendorGames.mockReturnValue({
                data: [],
                isLoading: true,
            });

            render(<VendorDashboard />);

            expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
        });
    });

    describe('Header Section', () => {
        it('displays welcome message', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Welcome back!')).toBeInTheDocument();
            });
        });

        it('displays subtitle text', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText("Here's what's happening with your games today.")).toBeInTheDocument();
            });
        });

        it('displays create game button', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Create Game')).toBeInTheDocument();
            });
        });

        it('displays analytics button', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Analytics')).toBeInTheDocument();
            });
        });
    });

    describe('Stats Grid', () => {
        it('displays total games stat', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Total Games')).toBeInTheDocument();
                expect(screen.getByText('15')).toBeInTheDocument();
            });
        });

        it('displays active games stat', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Active Games')).toBeInTheDocument();
                expect(screen.getByText('8')).toBeInTheDocument();
            });
        });

        it('displays total revenue stat', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Total Revenue')).toBeInTheDocument();
                expect(screen.getByText('$1250.75')).toBeInTheDocument();
            });
        });

        it('displays total participants stat', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Total Participants')).toBeInTheDocument();
                expect(screen.getByText('1,250')).toBeInTheDocument();
            });
        });

        it('displays stats with correct icons', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                // Check that icons are present (they have specific classes)
                const gameIcon = document.querySelector('.lucide-gamepad');
                const activityIcon = document.querySelector('.lucide-activity');
                const dollarIcon = document.querySelector('.lucide-dollar-sign');
                const usersIcon = document.querySelector('.lucide-users');

                expect(gameIcon).toBeInTheDocument();
                expect(activityIcon).toBeInTheDocument();
                expect(dollarIcon).toBeInTheDocument();
                expect(usersIcon).toBeInTheDocument();
            });
        });
    });

    describe('Charts Section', () => {
        it('displays revenue trends chart', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
            });
        });

        it('displays category performance chart', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Category Performance')).toBeInTheDocument();
            });
        });

        it('displays chart icons', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                const trendingIcon = document.querySelector('.lucide-trending-up');
                const awardIcon = document.querySelector('.lucide-award');

                expect(trendingIcon).toBeInTheDocument();
                expect(awardIcon).toBeInTheDocument();
            });
        });
    });

    describe('Recent Games Section', () => {
        it('displays recent games title', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Recent Games')).toBeInTheDocument();
            });
        });

        it('displays view all button', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('View All')).toBeInTheDocument();
            });
        });

        it('displays game information correctly', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Tech Gadget Lottery')).toBeInTheDocument();
                expect(screen.getByText('45 participants')).toBeInTheDocument();
                expect(screen.getByText('$450')).toBeInTheDocument();
            });
        });

        it('displays correct status badges', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Active')).toBeInTheDocument();
                expect(screen.getByText('Pending Approval')).toBeInTheDocument();
            });
        });

        it('displays game icons', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                const gameIcons = document.querySelectorAll('.lucide-gamepad');
                expect(gameIcons.length).toBeGreaterThan(0);
            });
        });

        it('displays empty state when no games exist', () => {
            mockUseVendorGames.mockReturnValue({
                data: [],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('No games yet')).toBeInTheDocument();
            expect(screen.getByText('Create your first game to start earning revenue.')).toBeInTheDocument();
        });
    });

    describe('Quick Actions Section', () => {
        it('displays create new game action', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Create New Game')).toBeInTheDocument();
                expect(screen.getByText('Design and launch a new lottery game for your products.')).toBeInTheDocument();
            });
        });

        it('displays view analytics action', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('View Analytics')).toBeInTheDocument();
                expect(screen.getByText('Track performance, revenue, and user engagement metrics.')).toBeInTheDocument();
            });
        });

        it('displays profile action', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                expect(screen.getByText('Profile')).toBeInTheDocument();
                expect(screen.getByText('Manage your vendor profile and business information.')).toBeInTheDocument();
            });
        });

        it('displays action icons', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                const plusIcons = document.querySelectorAll('.lucide-plus');
                const barChartIcons = document.querySelectorAll('.lucide-bar-chart');
                const settingsIcons = document.querySelectorAll('.lucide-settings');

                expect(plusIcons.length).toBeGreaterThan(0);
                // Check that some icons are present
                expect(plusIcons.length + barChartIcons.length + settingsIcons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Data Handling', () => {
        it('handles missing stats data gracefully', () => {
            mockUseVendorStats.mockReturnValue({
                data: null,
                isLoading: false,
            });

            render(<VendorDashboard />);

            const zeroElements = screen.getAllByText('0');
            expect(zeroElements.length).toBeGreaterThan(0);
            expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total Revenue
        });

        it('handles missing games data gracefully', () => {
            mockUseVendorGames.mockReturnValue({
                data: [],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('No games yet')).toBeInTheDocument();
        });

        it('handles missing chart data gracefully', () => {
            mockUseVendorRevenueChart.mockReturnValue({
                data: [],
                isLoading: false,
            });

            mockUseVendorParticipationChart.mockReturnValue({
                data: [],
                isLoading: false,
            });

            render(<VendorDashboard />);

            // Charts should still render even with empty data
            expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
            expect(screen.getByText('Category Performance')).toBeInTheDocument();
        });
    });

    describe('Status Badge Logic', () => {
        it('displays correct badge for ACTIVE status', () => {
            const activeGame = { ...mockGames[0], status: 'ACTIVE' };
            mockUseVendorGames.mockReturnValue({
                data: [activeGame],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('Active')).toBeInTheDocument();
        });

        it('displays correct badge for PENDING status', () => {
            const pendingGame = { ...mockGames[0], status: 'PENDING' };
            mockUseVendorGames.mockReturnValue({
                data: [pendingGame],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('Pending Approval')).toBeInTheDocument();
        });

        it('displays correct badge for DRAWING status', () => {
            const drawingGame = { ...mockGames[0], status: 'DRAWING' };
            mockUseVendorGames.mockReturnValue({
                data: [drawingGame],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('Drawing Soon')).toBeInTheDocument();
        });

        it('displays correct badge for CLOSED status', () => {
            const closedGame = { ...mockGames[0], status: 'CLOSED' };
            mockUseVendorGames.mockReturnValue({
                data: [closedGame],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('Closed')).toBeInTheDocument();
        });

        it('displays correct badge for DRAFT status', () => {
            const draftGame = { ...mockGames[0], status: 'DRAFT' };
            mockUseVendorGames.mockReturnValue({
                data: [draftGame],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('Draft')).toBeInTheDocument();
        });

        it('displays unknown badge for invalid status', () => {
            const invalidGame = { ...mockGames[0], status: 'INVALID_STATUS' };
            mockUseVendorGames.mockReturnValue({
                data: [invalidGame],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('Unknown')).toBeInTheDocument();
        });
    });

    describe('Revenue Calculation', () => {
        it('calculates revenue correctly from participants and ticket price', () => {
            const gameWithRevenue = {
                id: 'game-3',
                title: 'Test Game',
                status: 'ACTIVE',
                currentParticipants: 100,
                ticketPrice: 25,
                endDate: Date.now() + 86400000,
            };

            mockUseVendorGames.mockReturnValue({
                data: [gameWithRevenue],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('$2500')).toBeInTheDocument(); // 100 * 25
        });

        it('handles zero participants correctly', () => {
            const gameWithNoParticipants = {
                id: 'game-4',
                title: 'Empty Game',
                status: 'PENDING',
                currentParticipants: 0,
                ticketPrice: 10,
                endDate: Date.now() + 86400000,
            };

            mockUseVendorGames.mockReturnValue({
                data: [gameWithNoParticipants],
                isLoading: false,
            });

            render(<VendorDashboard />);

            expect(screen.getByText('$0')).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('applies responsive grid classes', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                const statsGrid = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
                const chartsGrid = document.querySelector('.grid-cols-1.lg\\:grid-cols-2');
                const actionsGrid = document.querySelector('.grid-cols-1.md\\:grid-cols-3');

                expect(statsGrid).toBeInTheDocument();
                expect(chartsGrid).toBeInTheDocument();
                expect(actionsGrid).toBeInTheDocument();
            });
        });

        it('applies responsive spacing classes', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                const container = document.querySelector('.space-y-4.sm\\:space-y-6');
                expect(container).toBeInTheDocument();
            });
        });

        it('applies responsive padding classes', async () => {
            render(<VendorDashboard />);

            await waitFor(() => {
                const container = document.querySelector('.px-3.sm\\:px-4.lg\\:px-0');
                expect(container).toBeInTheDocument();
            });
        });
    });
});
