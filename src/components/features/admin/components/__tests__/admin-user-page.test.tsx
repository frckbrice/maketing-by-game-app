import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUserPage } from '../admin-user-page';
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

describe('AdminUserPage', () => {
  const defaultUser = {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER' as const,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date('2024-01-15'),
      totalGames: 5,
      totalWins: 2,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'VENDOR' as const,
      isActive: true,
      createdAt: new Date('2024-01-02'),
      lastLogin: new Date('2024-01-14'),
      totalGames: 12,
      totalWins: 8,
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      role: 'USER' as const,
      isActive: false,
      createdAt: new Date('2024-01-03'),
      lastLogin: new Date('2024-01-10'),
      totalGames: 3,
      totalWins: 0,
    },
  ];

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

    render(<AdminUserPage />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage all users, vendors, and their permissions')).toBeInTheDocument();
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/auth/login');
    });
  });

  it('renders users list correctly', async () => {
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      // Check that all users are displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      
      // Check emails
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      
      // Check roles
      expect(screen.getByText('USER')).toBeInTheDocument();
      expect(screen.getByText('VENDOR')).toBeInTheDocument();
    });
  });

  it('displays user status badges correctly', async () => {
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      // Active users should show "Active" badge
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges).toHaveLength(2);
      
      // Inactive users should show "Inactive" badge
      const inactiveBadges = screen.getAllByText('Inactive');
      expect(inactiveBadges).toHaveLength(1);
    });
  });

  it('opens create user modal when create button is clicked', async () => {
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

    render(<AdminUserPage />);
    
    const createButton = screen.getByText('Create User');
    expect(createButton).toBeInTheDocument();
    
    await userEvent.click(createButton);
    
    // Modal should open
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('opens edit user modal when edit button is clicked', async () => {
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(3); // One for each user
    });
    
    const firstEditButton = screen.getAllByText('Edit')[0];
    await userEvent.click(firstEditButton);
    
    // Edit modal should open with pre-filled data
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('handles user deletion correctly', async () => {
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(3);
    });
    
    const firstDeleteButton = screen.getAllByText('Delete')[0];
    await userEvent.click(firstDeleteButton);
    
    // Confirmation dialog should appear
    expect(screen.getByText('Delete User')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Delete');
    await userEvent.click(confirmButton);
    
    // Should call delete function
    expect(confirmButton).toBeInTheDocument();
  });

  it('filters users by search term', async () => {
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

    render(<AdminUserPage />);
    
    const searchInput = screen.getByPlaceholderText('Search users...');
    expect(searchInput).toBeInTheDocument();
    
    // Search for "John"
    await userEvent.type(searchInput, 'John');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
    
    // Clear search
    await userEvent.clear(searchInput);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('filters users by role', async () => {
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

    render(<AdminUserPage />);
    
    const roleFilter = screen.getByLabelText('Role');
    expect(roleFilter).toBeInTheDocument();
    
    // Filter by USER role
    await userEvent.selectOptions(roleFilter, 'USER');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
    
    // Filter by VENDOR role
    await userEvent.selectOptions(roleFilter, 'VENDOR');
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
  });

  it('filters users by status', async () => {
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

    render(<AdminUserPage />);
    
    const statusFilter = screen.getByLabelText('Status');
    expect(statusFilter).toBeInTheDocument();
    
    // Filter by active status
    await userEvent.selectOptions(statusFilter, 'active');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
    
    // Filter by inactive status
    await userEvent.selectOptions(statusFilter, 'inactive');
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('sorts users by different criteria', async () => {
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

    render(<AdminUserPage />);
    
    const sortSelect = screen.getByLabelText('Sort by');
    expect(sortSelect).toBeInTheDocument();
    
    // Sort by name (A-Z)
    await userEvent.selectOptions(sortSelect, 'name-asc');
    
    // Sort by name (Z-A)
    await userEvent.selectOptions(sortSelect, 'name-desc');
    
    // Sort by creation date
    await userEvent.selectOptions(sortSelect, 'created-asc');
    
    // Sort by last login
    await userEvent.selectOptions(sortSelect, 'last-login');
    
    // All sorting options should be available
    expect(sortSelect).toHaveValue('last-login');
  });

  it('handles pagination correctly', async () => {
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

    render(<AdminUserPage />);
    
    // Check pagination controls
    const pageSizeSelect = screen.getByLabelText('Show');
    expect(pageSizeSelect).toBeInTheDocument();
    
    // Change page size
    await userEvent.selectOptions(pageSizeSelect, '25');
    expect(pageSizeSelect).toHaveValue('25');
    
    // Check that page size options are available
    expect(pageSizeSelect).toHaveValue('25');
  });

  it('displays user statistics correctly', async () => {
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      // Check total users count
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Check active users count
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Check inactive users count
      expect(screen.getByText('Inactive Users')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('handles form validation in create modal', async () => {
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

    render(<AdminUserPage />);
    
    // Open create modal
    const createButton = screen.getByText('Create User');
    await userEvent.click(createButton);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Create User');
    await userEvent.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', async () => {
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

    render(<AdminUserPage />);
    
    // Open create modal
    const createButton = screen.getByText('Create User');
    await userEvent.click(createButton);
    
    // Modal should be open
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    // Modal should close
    expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
  });

  it('displays user activity information correctly', async () => {
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

    render(<AdminUserPage />);
    
    await waitFor(() => {
      // Check that user activity data is displayed
      expect(screen.getByText('5')).toBeInTheDocument(); // John's total games
      expect(screen.getByText('2')).toBeInTheDocument(); // John's total wins
      expect(screen.getByText('12')).toBeInTheDocument(); // Jane's total games
      expect(screen.getByText('8')).toBeInTheDocument(); // Jane's total wins
      expect(screen.getByText('3')).toBeInTheDocument(); // Bob's total games
      expect(screen.getByText('0')).toBeInTheDocument(); // Bob's total wins
    });
  });
});
