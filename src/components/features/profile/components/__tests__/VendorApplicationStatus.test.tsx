import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VendorApplicationStatus } from '../VendorApplicationStatus';

// Mock next/navigation
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
const mockUser = { id: 'user123', email: 'user@example.com' };

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock firestoreService
const mockGetVendorApplication = jest.fn();

jest.mock('@/lib/firebase/services', () => ({
  firestoreService: {
    getVendorApplication: mockGetVendorApplication,
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('VendorApplicationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear timers
    jest.clearAllTimers();
    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders the component with correct title', () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      expect(screen.getByText('Vendor Application Status')).toBeInTheDocument();
      expect(
        screen.getByText("You haven't applied to become a vendor yet.")
      ).toBeInTheDocument();
    });

    it('displays building icon in header', () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      const buildingIcon = document.querySelector(
        'svg[class*="lucide-building-2"]'
      );
      expect(buildingIcon).toBeInTheDocument();
      expect(buildingIcon).toHaveClass('w-6', 'h-6', 'text-blue-500');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when checking application status', () => {
      // Mock a delayed response
      mockGetVendorApplication.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<VendorApplicationStatus />);

      // Should show loading skeleton
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('shows loading state initially', () => {
      mockGetVendorApplication.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<VendorApplicationStatus />);

      // Should show loading state
      expect(screen.getByText('Vendor Application Status')).toBeInTheDocument();
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('No Application State', () => {
    it('shows no application message when user has not applied', async () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(
          screen.getByText("You haven't applied to become a vendor yet.")
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /apply now/i })
        ).toBeInTheDocument();
      });
    });

    it('navigates to vendor application when apply button is clicked', async () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply now/i });
        fireEvent.click(applyButton);

        expect(mockPush).toHaveBeenCalledWith('/vendor-application');
      });
    });
  });

  describe('Pending Application State', () => {
    it('shows pending status with correct icon and badge', async () => {
      const pendingApplication = {
        id: 'app123',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(pendingApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(screen.getByText('Pending Review')).toBeInTheDocument();
        expect(
          screen.getByText(
            "Your application is currently under review. We'll notify you once a decision has been made."
          )
        ).toBeInTheDocument();
      });
    });

    it('displays pending status icon correctly', async () => {
      const pendingApplication = {
        id: 'app123',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(pendingApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const pendingIcon = document.querySelector(
          'svg[class*="lucide-clock"]'
        );
        expect(pendingIcon).toBeInTheDocument();
        expect(pendingIcon).toHaveClass('w-5', 'h-5', 'text-yellow-500');
      });
    });

    it('applies correct CSS classes for pending status', async () => {
      const pendingApplication = {
        id: 'app123',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(pendingApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const pendingBadge = screen.getByText('Pending Review');
        expect(pendingBadge).toHaveClass('bg-yellow-500', 'text-white');

        const pendingMessage = screen.getByText(
          "Your application is currently under review. We'll notify you once a decision has been made."
        );
        expect(pendingMessage.closest('div')).toHaveClass(
          'bg-yellow-50',
          'dark:bg-yellow-900/20',
          'border-yellow-200',
          'dark:border-yellow-800'
        );
      });
    });
  });

  describe('Approved Application State', () => {
    it('shows approved status with correct icon and badge', async () => {
      const approvedApplication = {
        id: 'app123',
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(approvedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(
          screen.getByText(
            '🎉 Congratulations! Your vendor application has been approved. You can now create and manage lottery games.'
          )
        ).toBeInTheDocument();
      });
    });

    it('displays approved status icon correctly', async () => {
      const approvedApplication = {
        id: 'app123',
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(approvedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const approvedIcon = document.querySelector(
          'svg[class*="lucide-check-circle"]'
        );
        expect(approvedIcon).toBeInTheDocument();
        expect(approvedIcon).toHaveClass('w-5', 'h-5', 'text-green-500');
      });
    });

    it('shows access vendor dashboard button', async () => {
      const approvedApplication = {
        id: 'app123',
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(approvedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const dashboardButton = screen.getByRole('button', {
          name: /access vendor dashboard/i,
        });
        expect(dashboardButton).toBeInTheDocument();
        expect(dashboardButton).toHaveClass(
          'bg-green-500',
          'hover:bg-green-600'
        );
      });
    });

    it('navigates to dashboard when button is clicked', async () => {
      const approvedApplication = {
        id: 'app123',
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(approvedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const dashboardButton = screen.getByRole('button', {
          name: /access vendor dashboard/i,
        });
        fireEvent.click(dashboardButton);

        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('applies correct CSS classes for approved status', async () => {
      const approvedApplication = {
        id: 'app123',
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(approvedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const approvedBadge = screen.getByText('Approved');
        expect(approvedBadge).toHaveClass('bg-green-500', 'text-white');

        const approvedMessage = screen.getByText(
          '🎉 Congratulations! Your vendor application has been approved. You can now create and manage lottery games.'
        );
        expect(approvedMessage.closest('div')).toHaveClass(
          'bg-green-50',
          'dark:bg-green-900/20',
          'border-green-200',
          'dark:border-green-800'
        );
      });
    });
  });

  describe('Rejected Application State', () => {
    it('shows rejected status with correct icon and badge', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(screen.getByText('Rejected')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Your vendor application was not approved at this time.'
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText('Reason: Insufficient documentation')
        ).toBeInTheDocument();
      });
    });

    it('displays rejected status icon correctly', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const rejectedIcon = document.querySelector(
          'svg[class*="lucide-x-circle"]'
        );
        expect(rejectedIcon).toBeInTheDocument();
        expect(rejectedIcon).toHaveClass('w-5', 'h-5', 'text-red-500');
      });
    });

    it('shows reapply button', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const reapplyButton = screen.getByRole('button', { name: /reapply/i });
        expect(reapplyButton).toBeInTheDocument();
        expect(reapplyButton).toHaveClass('bg-red-500', 'hover:bg-red-600');
      });
    });

    it('navigates to vendor application when reapply button is clicked', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const reapplyButton = screen.getByRole('button', { name: /reapply/i });
        fireEvent.click(reapplyButton);

        expect(mockPush).toHaveBeenCalledWith('/vendor-application');
      });
    });

    it('applies correct CSS classes for rejected status', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const rejectedBadge = screen.getByText('Rejected');
        expect(rejectedBadge).toHaveClass('bg-red-500', 'text-white');

        const rejectedMessage = screen.getByText(
          'Your vendor application was not approved at this time.'
        );
        expect(rejectedMessage.closest('div')).toHaveClass(
          'bg-red-50',
          'dark:bg-red-900/20',
          'border-red-200',
          'dark:border-red-800'
        );
      });
    });

    it('shows rejection reason when available', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(
          screen.getByText('Reason: Insufficient documentation')
        ).toBeInTheDocument();
      });
    });

    it('handles rejection without reason gracefully', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        // No rejectionReason
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Your vendor application was not approved at this time.'
          )
        ).toBeInTheDocument();
        expect(screen.queryByText(/reason:/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Status Updates and Notifications', () => {
    it('shows success toast when application is approved', async () => {
      const approvedApplication = {
        id: 'app123',
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(approvedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(require('sonner').toast.success).toHaveBeenCalledWith(
          '🎉 Your vendor application has been approved!'
        );
      });
    });

    it('shows error toast when application is rejected', async () => {
      const rejectedApplication = {
        id: 'app123',
        status: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Insufficient documentation',
      };

      mockGetVendorApplication.mockResolvedValue(rejectedApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(require('sonner').toast.error).toHaveBeenCalledWith(
          'Your vendor application was rejected. Check details below.'
        );
      });
    });

    it('does not show toast for pending status', async () => {
      const pendingApplication = {
        id: 'app123',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(pendingApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(require('sonner').toast.success).not.toHaveBeenCalled();
        expect(require('sonner').toast.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('sets up interval for pending applications', async () => {
      const pendingApplication = {
        id: 'app123',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(pendingApplication);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(screen.getByText('Pending Review')).toBeInTheDocument();
      });

      // Fast-forward time to trigger interval
      jest.advanceTimersByTime(30000);

      // Should call checkApplicationStatus again
      expect(mockGetVendorApplication).toHaveBeenCalledTimes(2);
    });

    it('clears interval when component unmounts', async () => {
      const pendingApplication = {
        id: 'app123',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      mockGetVendorApplication.mockResolvedValue(pendingApplication);

      const { unmount } = render(<VendorApplicationStatus />);

      await waitFor(() => {
        expect(screen.getByText('Pending Review')).toBeInTheDocument();
      });

      unmount();

      // Fast-forward time - should not trigger interval
      jest.advanceTimersByTime(30000);

      // Should only be called once (initial call)
      expect(mockGetVendorApplication).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockGetVendorApplication.mockRejectedValue(new Error('Network error'));

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        // Component should still render even if there's an error
        expect(
          screen.getByText('Vendor Application Status')
        ).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct container styling', async () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const container = document.querySelector(
          '.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md.p-6.border.border-gray-200.dark\\:border-gray-700'
        );
        expect(container).toBeInTheDocument();
      });
    });

    it('applies correct button styling', async () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply now/i });
        expect(applyButton).toHaveClass(
          'bg-blue-500',
          'hover:bg-blue-600',
          'text-white',
          'py-2',
          'px-4',
          'rounded-md',
          'transition-colors'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Vendor Application Status');
      });
    });

    it('has proper button roles', async () => {
      mockGetVendorApplication.mockResolvedValue(null);

      render(<VendorApplicationStatus />);

      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply now/i });
        expect(applyButton).toBeInTheDocument();
      });
    });
  });
});
