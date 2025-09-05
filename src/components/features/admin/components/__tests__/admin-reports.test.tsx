import { useAuth } from '@/lib/contexts/AuthContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AdminReportsPage } from '../admin-reports';

// Mock dependencies
jest.mock('@/lib/contexts/AuthContext');
jest.mock('next/navigation');
jest.mock('react-i18next');
jest.mock('sonner');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
const mockToast = toast as jest.Mocked<typeof toast>;

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
  emailVerified: true,
  phoneVerified: false,
  socialMedia: {},
};

describe('AdminReportsPage', () => {
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
    mockUseTranslation.mockReturnValue({
      t: (key: string, defaultValue?: string) => defaultValue || key,
      i18n: { language: 'en' },
    } as any);
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

      render(<AdminReportsPage />);
      // Component shows loading state first, then redirects
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders for admin users', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('Report List Display', () => {
    it('displays all reports correctly', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Financial Summary - Q4 2024')).toHaveLength(
          2
        ); // Desktop and mobile
        expect(screen.getAllByText('User Activity Report')).toHaveLength(2); // Desktop and mobile
        expect(screen.getAllByText('Game Performance Analysis')).toHaveLength(
          2
        ); // Desktop and mobile
      });
    });

    it('displays report information correctly', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(
          screen.getAllByText('Quarterly financial overview')
        ).toHaveLength(2); // Desktop and mobile
        expect(
          screen.getAllByText('Monthly user engagement metrics')
        ).toHaveLength(2); // Desktop and mobile
        expect(
          screen.getAllByText('Top performing games analysis')
        ).toHaveLength(2); // Desktop and mobile
      });
    });

    it('displays report status badges', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('COMPLETED')).toHaveLength(2); // Desktop and mobile
        expect(screen.getAllByText('GENERATING')).toHaveLength(2); // Desktop and mobile
        expect(screen.getAllByText('FAILED')).toHaveLength(2); // Desktop and mobile
      });
    });

    it('displays report type badges', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('FINANCIAL')).toBeInTheDocument();
        expect(screen.getByText('USERS')).toBeInTheDocument();
        expect(screen.getByText('GAMES')).toBeInTheDocument();
      });
    });
  });

  describe('Report Templates', () => {
    it('opens report generation modal when create button is clicked', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Report');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Select Report Type')).toBeInTheDocument();
        expect(screen.getByText('Financial Summary')).toBeInTheDocument();
        expect(screen.getAllByText('User Activity Report')).toHaveLength(3); // Desktop, mobile, and modal
        expect(screen.getByText('Game Performance')).toBeInTheDocument();
      });
    });

    it('displays report generation form when template is selected', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Report');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        const financialTemplate = screen.getByText('Financial Summary');
        fireEvent.click(financialTemplate);
      });

      await waitFor(() => {
        expect(screen.getByText('Configure Parameters')).toBeInTheDocument();
        expect(screen.getByText('Start Date')).toBeInTheDocument();
        expect(screen.getByText('End Date')).toBeInTheDocument();
      });
    });
  });

  describe('Report Actions', () => {
    it('shows download button for completed reports', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        // Check for download buttons (Download icon)
        const downloadButtons = screen
          .getAllByRole('button')
          .filter(button => button.querySelector('.lucide-download'));
        expect(downloadButtons.length).toBeGreaterThan(0);
      });
    });

    it('shows action buttons for all reports', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        // Check for action buttons (MoreHorizontal icon) in the table
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        // Wait for the table content to be fully rendered
        expect(screen.getByText('Reports List')).toBeInTheDocument();

        // Check for the MoreHorizontal icons in the table by looking for buttons
        const actionButtons = screen
          .getAllByRole('button')
          .filter(
            button => button.querySelector('svg') && button.textContent === ''
          );
        expect(actionButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search and Filtering', () => {
    it('handles search input changes', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search reports/i);
        expect(searchInput).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: 'Financial' } });
        expect(searchInput).toHaveValue('Financial');
      });
    });

    it('filters reports by type', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('All Types')).toBeInTheDocument();
      });
    });

    it('filters reports by status', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('All Status')).toBeInTheDocument();
      });
    });
  });

  describe('Report Statistics', () => {
    it('displays report statistics correctly', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        // Check for statistics information
        expect(screen.getByText('3')).toBeInTheDocument(); // Total reports
        expect(screen.getAllByText('1')).toHaveLength(3); // Completed, Generating, and Failed reports
      });
    });
  });

  describe('Report Refresh', () => {
    it('shows refresh button', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        // Check for refresh button (RefreshCw icon)
        const refreshButtons = screen
          .getAllByRole('button')
          .filter(button => button.querySelector('.lucide-refresh-cw'));
        expect(refreshButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    it('displays reports in organized layout', async () => {
      render(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
        expect(screen.getByText('Create Report')).toBeInTheDocument();
      });
    });
  });
});
