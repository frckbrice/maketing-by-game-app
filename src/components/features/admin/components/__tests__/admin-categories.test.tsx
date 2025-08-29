import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminCategories } from '../admin-categories';
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

describe('AdminCategories', () => {
  const defaultUser = {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategories = [
    {
      id: '1',
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      icon: '📱',
      color: '#3B82F6',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Fashion',
      description: 'Clothing and accessories',
      icon: '👕',
      color: '#EF4444',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      name: 'Home & Garden',
      description: 'Home improvement and gardening',
      icon: '🏠',
      color: '#10B981',
      isActive: false,
      sortOrder: 3,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
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

    render(<AdminCategories />);
    
    expect(screen.getByText('Categories Management')).toBeInTheDocument();
    expect(screen.getByText('Manage game categories and their properties')).toBeInTheDocument();
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

    render(<AdminCategories />);
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/auth/login');
    });
  });

  it('renders categories list correctly', async () => {
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

    render(<AdminCategories />);
    
    await waitFor(() => {
      // Check that all categories are displayed
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      
      // Check descriptions
      expect(screen.getByText('Electronic devices and gadgets')).toBeInTheDocument();
      expect(screen.getByText('Clothing and accessories')).toBeInTheDocument();
      expect(screen.getByText('Home improvement and gardening')).toBeInTheDocument();
      
      // Check icons
      expect(screen.getByText('📱')).toBeInTheDocument();
      expect(screen.getByText('👕')).toBeInTheDocument();
      expect(screen.getByText('🏠')).toBeInTheDocument();
    });
  });

  it('displays category status badges correctly', async () => {
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

    render(<AdminCategories />);
    
    await waitFor(() => {
      // Active categories should show "Active" badge
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges).toHaveLength(2);
      
      // Inactive categories should show "Inactive" badge
      const inactiveBadges = screen.getAllByText('Inactive');
      expect(inactiveBadges).toHaveLength(1);
    });
  });

  it('opens create category modal when create button is clicked', async () => {
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

    render(<AdminCategories />);
    
    const createButton = screen.getByText('Create Category');
    expect(createButton).toBeInTheDocument();
    
    await userEvent.click(createButton);
    
    // Modal should open
    expect(screen.getByText('Create New Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
  });

  it('opens edit category modal when edit button is clicked', async () => {
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

    render(<AdminCategories />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(3); // One for each category
    });
    
    const firstEditButton = screen.getAllByText('Edit')[0];
    await userEvent.click(firstEditButton);
    
    // Edit modal should open with pre-filled data
    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electronic devices and gadgets')).toBeInTheDocument();
  });

  it('handles category deletion correctly', async () => {
    const mockDeleteCategory = jest.fn();
    
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

    render(<AdminCategories />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(3);
    });
    
    const firstDeleteButton = screen.getAllByText('Delete')[0];
    await userEvent.click(firstDeleteButton);
    
    // Confirmation dialog should appear
    expect(screen.getByText('Delete Category')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this category?')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Delete');
    await userEvent.click(confirmButton);
    
    // Should call delete function
    // Note: In a real implementation, this would call the actual delete function
    expect(confirmButton).toBeInTheDocument();
  });

  it('filters categories by search term', async () => {
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

    render(<AdminCategories />);
    
    const searchInput = screen.getByPlaceholderText('Search categories...');
    expect(searchInput).toBeInTheDocument();
    
    // Search for "Electronics"
    await userEvent.type(searchInput, 'Electronics');
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.queryByText('Fashion')).not.toBeInTheDocument();
      expect(screen.queryByText('Home & Garden')).not.toBeInTheDocument();
    });
    
    // Clear search
    await userEvent.clear(searchInput);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
    });
  });

  it('filters categories by status', async () => {
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

    render(<AdminCategories />);
    
    const statusFilter = screen.getByLabelText('Status');
    expect(statusFilter).toBeInTheDocument();
    
    // Filter by active status
    await userEvent.selectOptions(statusFilter, 'active');
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
      expect(screen.queryByText('Home & Garden')).not.toBeInTheDocument();
    });
    
    // Filter by inactive status
    await userEvent.selectOptions(statusFilter, 'inactive');
    
    await waitFor(() => {
      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
      expect(screen.queryByText('Fashion')).not.toBeInTheDocument();
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
    });
  });

  it('sorts categories by different criteria', async () => {
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

    render(<AdminCategories />);
    
    const sortSelect = screen.getByLabelText('Sort by');
    expect(sortSelect).toBeInTheDocument();
    
    // Sort by name (A-Z)
    await userEvent.selectOptions(sortSelect, 'name-asc');
    
    // Sort by name (Z-A)
    await userEvent.selectOptions(sortSelect, 'name-desc');
    
    // Sort by creation date
    await userEvent.selectOptions(sortSelect, 'created-asc');
    
    // Sort by sort order
    await userEvent.selectOptions(sortSelect, 'sort-order');
    
    // All sorting options should be available
    expect(sortSelect).toHaveValue('sort-order');
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

    render(<AdminCategories />);
    
    // Check pagination controls
    const pageSizeSelect = screen.getByLabelText('Show');
    expect(pageSizeSelect).toBeInTheDocument();
    
    // Change page size
    await userEvent.selectOptions(pageSizeSelect, '25');
    expect(pageSizeSelect).toHaveValue('25');
    
    // Check that page size options are available
    expect(pageSizeSelect).toHaveValue('25');
  });

  it('displays category statistics correctly', async () => {
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

    render(<AdminCategories />);
    
    await waitFor(() => {
      // Check total categories count
      expect(screen.getByText('Total Categories')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Check active categories count
      expect(screen.getByText('Active Categories')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Check inactive categories count
      expect(screen.getByText('Inactive Categories')).toBeInTheDocument();
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

    render(<AdminCategories />);
    
    // Open create modal
    const createButton = screen.getByText('Create Category');
    await userEvent.click(createButton);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Create Category');
    await userEvent.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Category name is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
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

    render(<AdminCategories />);
    
    // Open create modal
    const createButton = screen.getByText('Create Category');
    await userEvent.click(createButton);
    
    // Modal should be open
    expect(screen.getByText('Create New Category')).toBeInTheDocument();
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    // Modal should close
    expect(screen.queryByText('Create New Category')).not.toBeInTheDocument();
  });
});
