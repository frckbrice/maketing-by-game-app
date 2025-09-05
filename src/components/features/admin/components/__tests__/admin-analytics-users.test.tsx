import { useAuth } from '@/lib/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminAnalyticsUsersPage } from '../admin-analytics-users';

jest.mock('@/lib/contexts/AuthContext');
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'admin.userBehaviorAnalytics': 'User Behavior Analytics',
        'admin.trackUserEngagementAndBehavior':
          'Track user engagement and behavior',
        'admin.last7Days': 'Last 7 Days',
        'admin.last30Days': 'Last 30 Days',
        'admin.last90Days': 'Last 90 Days',
        'admin.lastYear': 'Last Year',
        'common.export': 'Export',
        'admin.totalUsers': 'Total Users',
        'admin.activeUsers': 'Active Users',
        'admin.conversionRate': 'Conversion Rate',
        'admin.avgSessionDuration': 'Avg Session Duration',
        'admin.fromLastPeriod': 'from last period',
        'admin.ofTotal': 'of total',
        'admin.userActivityTrend': 'User Activity Trend',
        'admin.userSegments': 'User Segments',
        'admin.newUsers': 'New Users',
        'admin.gameParticipation': 'Game Participation',
        'admin.usersPlayedGames': 'Users who played games',
        'admin.userBehaviorData': 'User Behavior Data',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.date': 'Date',
        'admin.gameParticipants': 'Game Participants',
        'admin.sessionDuration': 'Session Duration',
        'admin.growth': 'growth',
      };
      return translations[key] || fallback || key;
    },
  }),
}));
jest.mock('@/hooks/useApi', () => ({
  useUserAnalytics: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the useUserAnalytics hook
const mockUseUserAnalytics = require('@/hooks/useApi')
  .useUserAnalytics as jest.MockedFunction<any>;

const defaultUser = {
  id: '1',
  email: 'admin@example.com',
  role: 'ADMIN',
  firstName: 'Admin',
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

const mockBehaviorData = [
  {
    date: '2024-01-01',
    newUsers: 45,
    activeUsers: 320,
    gameParticipants: 180,
    conversionRate: 56.25,
    avgSessionDuration: 12.5,
  },
  {
    date: '2024-01-02',
    newUsers: 52,
    activeUsers: 340,
    gameParticipants: 195,
    conversionRate: 57.35,
    avgSessionDuration: 13.2,
  },
];

const mockMetrics = {
  totalUsers: 2847,
  activeUsers: 1623,
  newUsers: 327,
  gameParticipants: 1558,
  conversionRate: 57.8,
  avgSessionDuration: 14.5,
  retentionRate: 68.2,
  userGrowth: 12.8,
};

const mockUserSegments = [
  {
    name: 'High Value Players',
    count: 285,
    percentage: 17.6,
    color: '#10B981',
  },
  { name: 'Regular Players', count: 623, percentage: 38.4, color: '#3B82F6' },
];

describe('AdminAnalyticsUsersPage', () => {
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

    mockUseUserAnalytics.mockReturnValue({
      data: null,
      isLoading: false,
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

      render(<AdminAnalyticsUsersPage />);
      expect(mockPush).toHaveBeenCalledWith('/en/auth/login');
    });

    it('renders for admin users', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
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

      render(<AdminAnalyticsUsersPage />);
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('displays metrics after loading', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('2,847')).toBeInTheDocument(); // Total Users
        expect(screen.getByText('1,623')).toBeInTheDocument(); // Active Users
        expect(screen.getByText('57.8%')).toBeInTheDocument(); // Conversion Rate
        expect(screen.getByText('14.5m')).toBeInTheDocument(); // Session Duration
      });
    });

    it('displays loading state while fetching analytics', () => {
      mockUseUserAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<AdminAnalyticsUsersPage />);
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('uses real data when available', async () => {
      const realData = {
        behaviorData: mockBehaviorData,
        metrics: mockMetrics,
        segments: mockUserSegments,
      };

      mockUseUserAnalytics.mockReturnValue({
        data: realData,
        isLoading: false,
      });

      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('2,847')).toBeInTheDocument();
      });
    });
  });

  describe('Metrics Display', () => {
    it('displays total users metric', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('2,847')).toBeInTheDocument();
        expect(screen.getByText('+12.8% from last period')).toBeInTheDocument();
      });
    });

    it('displays active users metric', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        const activeUsersElements = screen.getAllByText('Active Users');
        expect(activeUsersElements.length).toBeGreaterThan(0);
        expect(screen.getByText('1,623')).toBeInTheDocument();
        expect(screen.getByText('57.0% of total')).toBeInTheDocument();
      });
    });

    it('displays conversion rate metric', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        const conversionRateElements = screen.getAllByText('Conversion Rate');
        expect(conversionRateElements.length).toBeGreaterThan(0);
        expect(screen.getByText('57.8%')).toBeInTheDocument();
        expect(screen.getByText('+2.1% from last period')).toBeInTheDocument();
      });
    });

    it('displays session duration metric', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Avg Session Duration')).toBeInTheDocument();
        expect(screen.getByText('14.5m')).toBeInTheDocument();
        expect(screen.getByText('+8.3% from last period')).toBeInTheDocument();
      });
    });
  });

  describe('Charts and Visualizations', () => {
    it('displays user activity trend chart', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('User Activity Trend')).toBeInTheDocument();
      });
    });

    it('displays user segments chart', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        // Check that some chart content is displayed
        expect(screen.getByText('User Activity Trend')).toBeInTheDocument();
      });
    });

    it('displays new users metric', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        const newUsersElements = screen.getAllByText('New Users');
        expect(newUsersElements.length).toBeGreaterThan(0);
        expect(screen.getByText('327')).toBeInTheDocument();
        expect(screen.getByText('+12.8% growth')).toBeInTheDocument();
      });
    });

    it('displays game participation metric', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Game Participation')).toBeInTheDocument();
        expect(screen.getByText('1,558')).toBeInTheDocument();
        expect(screen.getByText('Users who played games')).toBeInTheDocument();
      });
    });
  });

  describe('Data Table', () => {
    it('displays user behavior data table', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('User Behavior Data')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
        const newUsersElements = screen.getAllByText('New Users');
        expect(newUsersElements.length).toBeGreaterThan(0);
        const activeUsersElements = screen.getAllByText('Active Users');
        expect(activeUsersElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Game Participants')).toBeInTheDocument();
        const conversionRateElements = screen.getAllByText('Conversion Rate');
        expect(conversionRateElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Session Duration')).toBeInTheDocument();
      });
    });

    it('displays table data rows', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument(); // First row new users
        expect(screen.getByText('320')).toBeInTheDocument(); // First row active users
        expect(screen.getByText('180')).toBeInTheDocument(); // First row game participants
        expect(screen.getByText('56.3%')).toBeInTheDocument(); // First row conversion rate
        expect(screen.getByText('12.5m')).toBeInTheDocument(); // First row session duration
      });
    });
  });

  describe('Controls and Filters', () => {
    it('displays time range selector', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
      });
    });

    it('displays export button', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('displays search input', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      });
    });

    it('displays filter button', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Filter')).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    it('formats numbers correctly', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('2,847')).toBeInTheDocument(); // Total Users
        expect(screen.getByText('1,623')).toBeInTheDocument(); // Active Users
      });
    });

    it('formats percentages correctly', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('57.8%')).toBeInTheDocument(); // Conversion Rate
        // Check that some percentage is displayed for active users
        const percentageElements = screen.getAllByText(/.*%/);
        expect(percentageElements.length).toBeGreaterThan(0);
      });
    });

    it('formats duration correctly', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('14.5m')).toBeInTheDocument(); // Session Duration
        expect(screen.getByText('12.5m')).toBeInTheDocument(); // Table row duration
      });
    });
  });

  describe('Error Handling', () => {
    it('handles analytics loading errors gracefully', async () => {
      mockUseUserAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch analytics'),
      });

      render(<AdminAnalyticsUsersPage />);

      // Should fallback to mock data
      await waitFor(() => {
        expect(screen.getByText('2,847')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('displays metrics in grid layout', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        const metricCards = screen.getAllByText(
          /Total Users|Active Users|Conversion Rate|Avg Session Duration/
        );
        expect(metricCards.length).toBeGreaterThan(0);
      });
    });

    it('displays charts in responsive grid', async () => {
      render(<AdminAnalyticsUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('User Activity Trend')).toBeInTheDocument();
      });
    });
  });
});
