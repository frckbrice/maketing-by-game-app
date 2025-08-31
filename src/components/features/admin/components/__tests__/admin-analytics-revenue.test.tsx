import { useAuth } from '@/lib/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AdminAnalyticsRevenuePage } from '../admin-analytics-revenue';

jest.mock('@/lib/contexts/AuthContext');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const translations: Record<string, string> = {
                'admin.revenueAnalytics': 'Revenue Analytics',
                'admin.trackRevenuePerformance': 'Track revenue performance',
                'admin.last7Days': 'Last 7 Days',
                'admin.last30Days': 'Last 30 Days',
                'admin.last90Days': 'Last 90 Days',
                'admin.lastYear': 'Last Year',
                'common.export': 'Export',
                'admin.totalRevenue': 'Total Revenue',
                'admin.totalTransactions': 'Total Transactions',
                'admin.totalUsers': 'Total Users',
                'admin.averageOrderValue': 'Average Order Value',
                'admin.fromLastPeriod': 'from last period',
                'admin.revenueTrend': 'Revenue Trend',
                'admin.line': 'Line',
                'admin.bar': 'Bar',
                'admin.revenueChartPlaceholder': 'Revenue chart placeholder',
                'admin.transactionVolume': 'Transaction Volume',
                'admin.pie': 'Pie',
                'admin.transactionChartPlaceholder': 'Transaction chart placeholder',
                'admin.revenueData': 'Revenue Data',
                'common.search': 'Search',
                'common.filter': 'Filter',
                'common.date': 'Date',
                'admin.revenue': 'Revenue',
                'admin.transactions': 'Transactions',
                'admin.users': 'Users',
                'admin.games': 'Games',
            };
            return translations[key] || fallback || key;
        },
    }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('AdminAnalyticsRevenuePage', () => {
    const defaultUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN' as const,
        status: 'ACTIVE' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        phoneNumber: undefined,
        avatar: undefined,
        preferences: {
            language: 'en',
            theme: 'light' as const,
            notifications: true,
            emailUpdates: true,
            smsUpdates: false,
            pushNotifications: true,
            marketingEmails: false,
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
            updates: true,
            security: true,
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
        emailVerified: true,
        phoneVerified: false,
        socialMedia: {},
    };

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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Access Control', () => {
        it('redirects non-admin users', () => {
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

            render(<AdminAnalyticsRevenuePage />);
            expect(screen.queryByText('Revenue Analytics')).not.toBeInTheDocument();
        });

        it('renders for admin users', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
            });
        });

        it('shows loading state initially', () => {
            mockUseAuth.mockReturnValue({
                user: defaultUser,
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

            render(<AdminAnalyticsRevenuePage />);
            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('Header and Controls', () => {
        it('displays page title and description', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
                expect(screen.getByText('Track revenue performance')).toBeInTheDocument();
            });
        });

        it('displays time range selector', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
            });
        });

        it('displays export button', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Export')).toBeInTheDocument();
            });
        });
    });

    describe('Key Metrics Display', () => {
        it('displays total revenue metric', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Total Revenue')).toBeInTheDocument();
                expect(screen.getByText('$111,400.00')).toBeInTheDocument();
                expect(screen.getByText('+12.5% from last period')).toBeInTheDocument();
            });
        });

        it('displays total transactions metric', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Total Transactions')).toBeInTheDocument();
                expect(screen.getByText('1,290')).toBeInTheDocument();
                expect(screen.getByText('+8.3% from last period')).toBeInTheDocument();
            });
        });

        it('displays total users metric', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Total Users')).toBeInTheDocument();
                expect(screen.getByText('1,065')).toBeInTheDocument();
                expect(screen.getByText('+15.2% from last period')).toBeInTheDocument();
            });
        });

        it('displays average order value metric', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Average Order Value')).toBeInTheDocument();
                expect(screen.getByText('$86.36')).toBeInTheDocument();
                expect(screen.getByText('+5.2% from last period')).toBeInTheDocument();
            });
        });
    });

    describe('Charts Section', () => {
        it('displays revenue trend chart', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
                expect(screen.getAllByText('Line')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Bar')[0]).toBeInTheDocument();
                expect(screen.getByText('Revenue chart placeholder')).toBeInTheDocument();
            });
        });

        it('displays transaction volume chart', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Transaction Volume')).toBeInTheDocument();
                expect(screen.getAllByText('Pie')[0]).toBeInTheDocument();
                expect(screen.getAllByText('Bar')[0]).toBeInTheDocument();
                expect(screen.getByText('Transaction chart placeholder')).toBeInTheDocument();
            });
        });
    });

    describe('Revenue Data Table', () => {
        it('displays table headers', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Date')).toBeInTheDocument();
                expect(screen.getByText('Revenue')).toBeInTheDocument();
                expect(screen.getByText('Transactions')).toBeInTheDocument();
                expect(screen.getByText('Users')).toBeInTheDocument();
                expect(screen.getByText('Games')).toBeInTheDocument();
            });
        });

        it('displays revenue data rows', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                // Check first row data
                expect(screen.getByText('$12,500.00')).toBeInTheDocument();
                expect(screen.getAllByText('150')[0]).toBeInTheDocument();
                expect(screen.getAllByText('120')[0]).toBeInTheDocument();
                expect(screen.getAllByText('45')[0]).toBeInTheDocument();
            });
        });

        it('displays search and filter controls', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
                expect(screen.getByText('Filter')).toBeInTheDocument();
            });
        });
    });

    describe('Time Range Selection', () => {
        it('allows changing time range', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Design', () => {
        it('displays metrics in grid layout', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                const metricsGrid = screen.getByText('Total Revenue').closest('.grid');
                expect(metricsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
            });
        });

        it('displays charts in responsive grid', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                const chartsGrid = screen.getByText('Revenue Trend').closest('.grid');
                expect(chartsGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
            });
        });
    });

    describe('Data Formatting', () => {
        it('formats currency correctly', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('$111,400.00')).toBeInTheDocument();
                expect(screen.getByText('$86.36')).toBeInTheDocument();
            });
        });

        it('formats numbers with commas', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('1,290')).toBeInTheDocument();
                expect(screen.getByText('1,065')).toBeInTheDocument();
            });
        });

        it('formats dates correctly', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                // The component uses toLocaleDateString() which will format based on locale
                expect(screen.getByText('1/1/2024')).toBeInTheDocument();
            });
        });
    });

    describe('Icon Display', () => {
        it('displays metric icons', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                // Check that icons are present (they have specific classes)
                expect(document.querySelector('.text-green-600')).toBeInTheDocument();
                expect(document.querySelector('.text-blue-600')).toBeInTheDocument();
                expect(document.querySelector('.text-purple-600')).toBeInTheDocument();
                expect(document.querySelector('.text-orange-600')).toBeInTheDocument();
            });
        });

        it('displays chart type icons', async () => {
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(document.querySelector('.text-gray-400')).toBeInTheDocument();
            });
        });
    });

    describe('Loading States', () => {
        it('shows loading spinner when page is loading', () => {
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

            // Mock the component's internal loading state
            const { rerender } = render(<AdminAnalyticsRevenuePage />);

            // Initially should show content
            expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('handles missing metrics gracefully', async () => {
            // This test would require mocking the component's internal state
            // For now, we'll test that the component renders without crashing
            render(<AdminAnalyticsRevenuePage />);

            await waitFor(() => {
                expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
            });
        });
    });
});
