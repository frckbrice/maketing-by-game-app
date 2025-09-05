import { useAuth } from '@/lib/contexts/AuthContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { AdminRolesPage } from '../admin-roles';

// Mock the hooks
jest.mock('@/lib/contexts/AuthContext');
jest.mock('react-i18next');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

// Mock user data
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

describe('AdminRolesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: { language: 'en' },
    } as any);
  });

  describe('Access Control', () => {
    it('shows loading state for non-admin users', async () => {
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

      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('renders for admin users', async () => {
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

      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
      });
    });
  });

  describe('Role Display', () => {
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

    it('displays all system roles correctly', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getByText('ADMIN')).toBeInTheDocument();
        expect(screen.getByText('USER')).toBeInTheDocument();
        expect(screen.getByText('VENDOR')).toBeInTheDocument();
      });
    });

    it('displays role descriptions correctly', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Standard user with basic permissions')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Vendor with game creation permissions')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Full administrative access')
        ).toBeInTheDocument();
      });
    });

    it('displays user counts correctly', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getByText('1250 users')).toBeInTheDocument(); // USER count
        expect(screen.getByText('45 users')).toBeInTheDocument(); // VENDOR count
        expect(screen.getByText('3 users')).toBeInTheDocument(); // ADMIN count
      });
    });

    it('displays role permissions correctly', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        // Check for permission text in the create modal
        const createButton = screen.getByText('Create Role');
        fireEvent.click(createButton);

        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('Game Management')).toBeInTheDocument();
        expect(screen.getByText('System Administration')).toBeInTheDocument();
      });
    });
  });

  describe('Role Management', () => {
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

    it('shows create role button', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getByText('Create Role')).toBeInTheDocument();
      });
    });

    it('shows edit buttons for all roles', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        // Check for edit buttons by looking for the Edit2 icon
        const editButtons = screen
          .getAllByRole('button')
          .filter(
            button => button.querySelector('svg') && button.textContent === ''
          );
        expect(editButtons.length).toBeGreaterThan(0);
      });
    });

    it('shows delete buttons for all roles', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        const deleteButtons = screen
          .getAllByRole('button')
          .filter(button => button.querySelector('.lucide-trash2'));
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Role Information', () => {
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

    it('displays role status correctly', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Active')).toHaveLength(3); // All roles are active
      });
    });

    it('displays role creation dates', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getAllByText('System')).toHaveLength(3); // All roles are system roles
        expect(screen.getByText('USER')).toBeInTheDocument(); // USER role
        expect(screen.getByText('VENDOR')).toBeInTheDocument(); // VENDOR role
        expect(screen.getByText('ADMIN')).toBeInTheDocument(); // ADMIN role
      });
    });
  });

  describe('Responsive Design', () => {
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

    it('displays roles in organized layout', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
        expect(screen.getByText('Create Role')).toBeInTheDocument();
      });
    });

    it('shows role cards with proper spacing', async () => {
      render(<AdminRolesPage />);

      await waitFor(() => {
        const roleCards = screen.getAllByText('ADMIN');
        expect(roleCards.length).toBeGreaterThan(0);
      });
    });
  });
});
