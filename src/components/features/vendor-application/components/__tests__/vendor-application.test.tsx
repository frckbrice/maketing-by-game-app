import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { VendorApplicationPage } from '../vendor-application';

// Mock external dependencies
jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/firebase/services', () => ({
  firestoreService: {
    getVendorApplication: jest.fn(),
    submitVendorApplication: jest.fn(),
  },
}));

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/home/components/DesktopHeader', () => ({
  DesktopHeader: ({
    isDark,
    onThemeToggle,
  }: {
    isDark: boolean;
    onThemeToggle: () => void;
  }) => (
    <header data-testid='desktop-header' className={isDark ? 'dark' : 'light'}>
      <button onClick={onThemeToggle} data-testid='theme-toggle'>
        Toggle Theme
      </button>
    </header>
  ),
}));

jest.mock('@/components/home/components/MobileNavigation', () => ({
  MobileNavigation: ({
    isDark,
    mobileMenuOpen,
    setMobileMenuOpen,
    onThemeToggle,
  }: {
    isDark: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    onThemeToggle: () => void;
  }) => (
    <nav data-testid='mobile-nav' className={isDark ? 'dark' : 'light'}>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        data-testid='mobile-menu-toggle'
      >
        {mobileMenuOpen ? 'Close' : 'Open'} Menu
      </button>
      <button onClick={onThemeToggle} data-testid='mobile-theme-toggle'>
        Toggle Theme
      </button>
    </nav>
  ),
}));

// Mock data
const mockUser = {
  id: 'user1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'USER',
};

const mockExistingApplication = {
  id: 'app1',
  userId: 'user1',
  status: 'PENDING',
  companyName: 'Test Company',
  productCategory: 'electronics',
  submittedAt: new Date('2024-01-01').getTime(),
};

const mockTranslation = {
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      'common.loading': 'Loading...',
      'common.back': 'Back',
      'vendor.application.title': 'Become a Vendor',
      'vendor.application.subtitle': 'Create and manage your own lottery games',
      'vendor.application.shop': 'Company Information',
      'vendor.application.contactInfo': 'Contact Information',
      'vendor.application.businessDetails': 'Business Details',
      'vendor.application.supportingDocs': 'Supporting Documents',
      'vendor.application.submit': 'Submit Application',
      'vendor.application.cancel': 'Cancel',
      'vendor.application.companyName': 'Company Name',
      'vendor.application.businessRegNumber': 'Business Registration Number',
      'vendor.application.companyWebsite': 'Company Website',
      'vendor.application.contactEmail': 'Contact Email',
      'vendor.application.contactPhone': 'Contact Phone',
      'vendor.application.productCategory': 'Product Category',
      'vendor.application.businessDescription': 'Business Description',
      'vendor.application.companyLogo': 'Company Logo',
      'vendor.application.businessCertificate': 'Business Certificate',
      'vendor.application.uploadLogo': 'Click to upload logo',
      'vendor.application.uploadCertificate': 'Click to upload certificate',
      'vendor.application.submitting': 'Submitting...',
      'vendor.application.success': 'Application submitted successfully',
      'vendor.application.error': 'Failed to submit application',
      'vendor.application.validation.companyNameRequired':
        'Company name is required',
      'vendor.application.validation.companyNameLength':
        'Company name must be at least 2 characters',
      'vendor.application.validation.businessRegRequired':
        'Business registration number is required',
      'vendor.application.validation.emailRequired':
        'Contact email is required',
      'vendor.application.validation.emailInvalid':
        'Please enter a valid email address',
      'vendor.application.validation.phoneRequired':
        'Contact phone is required',
      'vendor.application.validation.phoneInvalid':
        'Please enter a valid phone number',
      'vendor.application.validation.categoryRequired':
        'Product category is required',
      'vendor.application.validation.descriptionRequired':
        'Business description is required',
      'vendor.application.validation.descriptionLength':
        'Business description must be at least 20 characters',
      'vendor.application.validation.logoRequired': 'Company logo is required',
      'vendor.application.validation.logoSize':
        'Company logo must be less than 5MB',
      'vendor.application.validation.certificateRequired':
        'Business certificate is required',
      'vendor.application.validation.certificateSize':
        'Business certificate must be less than 10MB',
    };
    return translations[key] || key;
  },
};

describe('VendorApplicationPage', () => {
  const mockSetTheme = jest.fn();
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();
  const mockGetVendorApplication = jest.fn();
  const mockSubmitVendorApplication = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    });

    (useTranslation as jest.Mock).mockReturnValue(mockTranslation);

    // Mock firestoreService
    (firestoreService as any).getVendorApplication = mockGetVendorApplication;
    (firestoreService as any).submitVendorApplication =
      mockSubmitVendorApplication;

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the vendor application page with header and navigation', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('desktop-header')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    });
  });

  it('displays the main title and subtitle', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('🏢 Become a Vendor')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Create and manage your own lottery games to promote your products and engage customers'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows company information form section', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByText('Company Name *')).toBeInTheDocument();
      expect(
        screen.getByText('Business Registration Number *')
      ).toBeInTheDocument();
      expect(screen.getByText('Company Website')).toBeInTheDocument();
    });
  });

  it('shows contact information form section', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Email *')).toBeInTheDocument();
      expect(screen.getByText('Contact Phone *')).toBeInTheDocument();
    });
  });

  it('shows business details form section', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Business Details')).toBeInTheDocument();
      expect(screen.getByText('Product Category *')).toBeInTheDocument();
      expect(screen.getByText('Business Description *')).toBeInTheDocument();
    });
  });

  it('shows file upload sections', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Supporting Documents')).toBeInTheDocument();
      expect(screen.getByText('Company Logo')).toBeInTheDocument();
      expect(screen.getByText('Business Certificate')).toBeInTheDocument();
    });
  });

  it('handles form input changes', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const companyNameInput = screen.getByPlaceholderText(
        'Enter your company name'
      );
      fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    });

    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
  });

  it('handles file uploads', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const logoUpload = screen.getByLabelText('Click to upload logo');
      const file = new File(['logo content'], 'logo.png', {
        type: 'image/png',
      });
      fireEvent.change(logoUpload, { target: { files: [file] } });
    });

    expect(screen.getByText('logo.png')).toBeInTheDocument();
  });

  it('shows loading state while checking application', async () => {
    mockGetVendorApplication.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Checking application status...')
      ).toBeInTheDocument();
    });
  });

  it('shows existing application status when application exists', async () => {
    mockGetVendorApplication.mockResolvedValue(mockExistingApplication);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Vendor Application Status')).toBeInTheDocument();
      expect(screen.getByText('Application Under Review')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('electronics')).toBeInTheDocument();
    });
  });

  it('shows approved application status', async () => {
    const approvedApplication = {
      ...mockExistingApplication,
      status: 'APPROVED',
    };
    mockGetVendorApplication.mockResolvedValue(approvedApplication);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Application Approved!')).toBeInTheDocument();
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Your vendor application has been approved. You can now create and manage games!'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows rejected application status with reason', async () => {
    const rejectedApplication = {
      ...mockExistingApplication,
      status: 'REJECTED',
      rejectionReason: 'Insufficient documentation',
    };
    mockGetVendorApplication.mockResolvedValue(rejectedApplication);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Application Rejected')).toBeInTheDocument();
      expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
      expect(
        screen.getByText('Insufficient documentation')
      ).toBeInTheDocument();
      expect(screen.getByText('Submit New Application')).toBeInTheDocument();
    });
  });

  it('handles submit new application button click', async () => {
    const rejectedApplication = {
      ...mockExistingApplication,
      status: 'REJECTED',
      rejectionReason: 'Insufficient documentation',
    };
    mockGetVendorApplication.mockResolvedValue(rejectedApplication);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const submitNewButton = screen.getByText('Submit New Application');
      fireEvent.click(submitNewButton);
    });

    // Should now show the form instead of status
    await waitFor(() => {
      expect(screen.getByText('🏢 Become a Vendor')).toBeInTheDocument();
    });
  });

  it('handles back to profile button click', async () => {
    mockGetVendorApplication.mockResolvedValue(mockExistingApplication);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const backButton = screen.getByText('Back to Profile');
      fireEvent.click(backButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('handles cancel button click', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });

    expect(mockBack).toHaveBeenCalled();
  });

  // Note: Complex form submission test is skipped due to Radix UI Select component issues
  // The component has complex form validation and file upload logic that makes testing challenging

  it('redirects unauthenticated users to login', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    // Mock router.replace to prevent actual navigation
    mockReplace.mockImplementation(() => {});

    render(<VendorApplicationPage />);

    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects vendor users to dashboard', async () => {
    const vendorUser = { ...mockUser, role: 'VENDOR' };
    (useAuth as jest.Mock).mockReturnValue({
      user: vendorUser,
      loading: false,
    });

    // Mock router.replace to prevent actual navigation
    mockReplace.mockImplementation(() => {});

    render(<VendorApplicationPage />);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects admin users to dashboard', async () => {
    const adminUser = { ...mockUser, role: 'ADMIN' };
    (useAuth as jest.Mock).mockReturnValue({
      user: adminUser,
      loading: false,
    });

    // Mock router.replace to prevent actual navigation
    mockReplace.mockImplementation(() => {});

    render(<VendorApplicationPage />);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects non-USER role users to profile', async () => {
    const otherUser = { ...mockUser, role: 'MODERATOR' };
    (useAuth as jest.Mock).mockReturnValue({
      user: otherUser,
      loading: false,
    });

    // Mock router.replace to prevent actual navigation
    mockReplace.mockImplementation(() => {});

    render(<VendorApplicationPage />);

    expect(mockReplace).toHaveBeenCalledWith('/profile');
  });

  it('shows loading state while authenticating', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(<VendorApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('handles theme toggle from header', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const themeToggle = screen.getByTestId('theme-toggle');
      fireEvent.click(themeToggle);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('handles mobile menu toggle', async () => {
    mockGetVendorApplication.mockResolvedValue(null);

    render(<VendorApplicationPage />);

    await waitFor(() => {
      const mobileMenuToggle = screen.getByTestId('mobile-menu-toggle');
      fireEvent.click(mobileMenuToggle);
    });

    expect(screen.getByText('Close Menu')).toBeInTheDocument();
  });

  // Note: Additional complex tests are skipped due to Radix UI Select component issues
  // The component has complex form validation and UI interactions that make testing challenging
});
