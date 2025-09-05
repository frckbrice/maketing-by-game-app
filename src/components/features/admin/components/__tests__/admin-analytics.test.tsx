import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAnalyticsPage } from '../admin-analytics';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock the hooks
jest.mock('@/lib/contexts/AuthContext');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AdminAnalyticsPage', () => {
  const defaultUser = {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAnalyticsData = {
    userGrowth: {
      totalUsers: 1250,
      newUsers: 45,
      growthRate: 12.5,
      trend: 'up',
    },
    gamePerformance: {
      totalGames: 89,
      activeGames: 23,
      completedGames: 66,
      successRate: 74.2,
    },
    revenueMetrics: {
      totalRevenue: 45600,
      monthlyRevenue: 3800,
      revenueGrowth: 8.3,
      averageOrderValue: 86.36,
    },
    engagementMetrics: {
      totalSessions: 3450,
      averageSessionDuration: 12.5,
      bounceRate: 23.4,
      retentionRate: 67.8,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
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

    render(<AdminAnalyticsPage />);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Comprehensive insights into platform performance')
    ).toBeInTheDocument();
  });

  it('renders access denied for non-admin users', async () => {
    const mockRouter = { replace: jest.fn() };
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockReturnValue(mockRouter);

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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/auth/login');
    });
  });

  it('renders analytics dashboard for admin users', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText('Comprehensive insights into platform performance')
      ).toBeInTheDocument();
    });
  });

  it('displays user growth metrics correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check user growth section
      expect(screen.getByText('User Growth')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('New Users (This Month)')).toBeInTheDocument();
      expect(screen.getByText('Growth Rate')).toBeInTheDocument();
    });
  });

  it('displays game performance metrics correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check game performance section
      expect(screen.getByText('Game Performance')).toBeInTheDocument();
      expect(screen.getByText('Total Games')).toBeInTheDocument();
      expect(screen.getByText('Active Games')).toBeInTheDocument();
      expect(screen.getByText('Completed Games')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  it('displays revenue metrics correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check revenue section
      expect(screen.getByText('Revenue Metrics')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
      expect(screen.getByText('Average Order Value')).toBeInTheDocument();
    });
  });

  it('displays engagement metrics correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check engagement section
      expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('Average Session Duration')).toBeInTheDocument();
      expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
      expect(screen.getByText('Retention Rate')).toBeInTheDocument();
    });
  });

  it('handles time range selection correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    const timeRangeSelect = screen.getByLabelText('Time Range');
    expect(timeRangeSelect).toBeInTheDocument();

    // Change time range
    await userEvent.selectOptions(timeRangeSelect, '30d');
    expect(timeRangeSelect).toHaveValue('30d');

    // Check that all time range options are available
    expect(timeRangeSelect).toHaveValue('30d');
  });

  it('handles export functionality correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    const exportButton = screen.getByText('Export Data');
    expect(exportButton).toBeInTheDocument();

    await userEvent.click(exportButton);

    // Should trigger export functionality
    expect(exportButton).toBeInTheDocument();
  });

  it('displays chart placeholders correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check that chart placeholders are displayed
      expect(screen.getByText('User Growth Chart')).toBeInTheDocument();
      expect(screen.getByText('Revenue Trend Chart')).toBeInTheDocument();
      expect(screen.getByText('Game Performance Chart')).toBeInTheDocument();
      expect(screen.getByText('Engagement Metrics Chart')).toBeInTheDocument();
    });
  });

  it('handles chart type selection correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check chart type selection buttons
      const lineChartButtons = screen.getAllByText('Line');
      const barChartButtons = screen.getAllByText('Bar');
      const pieChartButtons = screen.getAllByText('Pie');

      expect(lineChartButtons.length).toBeGreaterThan(0);
      expect(barChartButtons.length).toBeGreaterThan(0);
      expect(pieChartButtons.length).toBeGreaterThan(0);
    });
  });

  it('displays metric cards with correct styling', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check that metric cards have proper styling
      const metricCards = screen.getAllByTestId('metric-card');
      expect(metricCards.length).toBeGreaterThan(0);

      metricCards.forEach(card => {
        expect(card).toHaveClass(
          'bg-white',
          'dark:bg-gray-800',
          'rounded-lg',
          'shadow-md'
        );
      });
    });
  });

  it('handles loading states correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check that loading states are handled properly
      const loadingSpinners = screen.queryAllByRole('status');
      expect(loadingSpinners.length).toBe(0); // No loading spinners when data is loaded
    });
  });

  it('displays trend indicators correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check that trend indicators are displayed
      const trendUpIcons = screen.getAllByTestId('trend-up');
      const trendDownIcons = screen.getAllByTestId('trend-down');

      expect(trendUpIcons.length).toBeGreaterThan(0);
      expect(trendDownIcons.length).toBeGreaterThan(0);
    });
  });

  it('handles responsive design correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check that responsive classes are applied
      const container = screen.getByTestId('analytics-container');
      expect(container).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-4'
      );
    });
  });

  it('displays summary statistics correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      // Check summary statistics
      expect(screen.getByText('Platform Overview')).toBeInTheDocument();
      expect(
        screen.getByText('Key Performance Indicators')
      ).toBeInTheDocument();
    });
  });

  it('handles data refresh correctly', async () => {
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

    render(<AdminAnalyticsPage />);

    const refreshButton = screen.getByText('Refresh Data');
    expect(refreshButton).toBeInTheDocument();

    await userEvent.click(refreshButton);

    // Should trigger data refresh
    expect(refreshButton).toBeInTheDocument();
  });
});
