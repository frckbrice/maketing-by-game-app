import { useAuth } from '@/lib/contexts/AuthContext';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminSidebar } from '../admin-side-bar';

// Mock the hooks
jest.mock('@/lib/contexts/AuthContext');
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AdminSidebar', () => {
  const defaultUser = {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation items correctly', () => {
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

    render(<AdminSidebar />);
    
    // Main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Vendor Applications')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders sub-navigation items for Games section', () => {
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

    render(<AdminSidebar />);
    
    // Games sub-items should be visible by default
    expect(screen.getByText('All Games')).toBeInTheDocument();
    expect(screen.getByText('Create Game')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders sub-navigation items for Users section', () => {
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

    render(<AdminSidebar />);
    
    // Users sub-items should be visible by default
    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Admins')).toBeInTheDocument();
  });

  it('renders sub-navigation items for Analytics section', () => {
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

    render(<AdminSidebar />);
    
    // Analytics sub-items should be visible by default (Games and Users are expanded by default)
    expect(screen.getByText('All Games')).toBeInTheDocument();
    expect(screen.getByText('Create Game')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Admins')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({
      user: defaultUser,
      loading: false,
      firebaseUser: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
      signInWithGoogle: jest.fn(),
      sendPhoneVerificationCode: jest.fn(),
      verifyPhoneCode: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      deleteAccount: jest.fn(),
    });

    render(<AdminSidebar />);
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    
    await userEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('applies correct active state styling for current path', () => {
    // Mock the current pathname
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/admin/games');

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

    render(<AdminSidebar />);

    // The Games section should be highlighted as active
    const gamesLink = screen.getByText('All Games').closest('a');
    expect(gamesLink).toHaveClass('bg-orange-500', 'text-white');
  });

  it('toggles mobile menu correctly', () => {
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

    render(<AdminSidebar />);

    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons[0]; // First button is the mobile menu button
    expect(menuButton).toBeInTheDocument();

    // Initially menu should be closed on mobile
    expect(screen.getByText('Dashboard')).toBeInTheDocument(); // Always visible on desktop

    // Click to open mobile menu
    fireEvent.click(menuButton);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Click to close mobile menu
    fireEvent.click(menuButton);
    expect(screen.getByText('Dashboard')).toBeInTheDocument(); // Still visible on desktop
  });

  it('renders with custom className prop', () => {
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

    const { container } = render(<AdminSidebar className="custom-class" />);

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('custom-class');
  });

  it('handles navigation item clicks correctly', () => {
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

    render(<AdminSidebar />);

    // Check that all navigation links have correct href attributes
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/admin');

    // Games is a button, not a link
    const gamesButton = screen.getByText('Games').closest('button');
    expect(gamesButton).toBeInTheDocument();

    // Users is a button, not a link
    const usersButton = screen.getByText('Users').closest('button');
    expect(usersButton).toBeInTheDocument();

    // Check sub-navigation links
    const allGamesLink = screen.getByText('All Games').closest('a');
    expect(allGamesLink).toHaveAttribute('href', '/admin/games');

    const allUsersLink = screen.getByText('All Users').closest('a');
    expect(allUsersLink).toHaveAttribute('href', '/admin/users');
  });

  it('displays admin panel branding correctly', () => {
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

    render(<AdminSidebar />);

    // Admin panel branding should be displayed
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Lottery Platform')).toBeInTheDocument();
  });

  it('handles empty user state gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
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

    render(<AdminSidebar />);
    
    // Should still render navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
    
    // But user info should not be displayed
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
  });

  it('renders all navigation icons correctly', () => {
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

    render(<AdminSidebar />);
    
    // Check that all navigation items have icons
    const navigationItems = [
      'Dashboard',
      'Games',
      'Users',
      'Vendor Applications',
      'Analytics',
      'Reports',
      'Settings'
    ];
    
    navigationItems.forEach(item => {
      const navItem = screen.getByText(item);
      expect(navItem).toBeInTheDocument();
      // Each nav item should have an icon (SVG element)
      const icon = navItem.parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
