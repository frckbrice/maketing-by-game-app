import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { VendorAnalytics } from '../vendor-analytics';

// Mock next/navigation
jest.mock('next/navigation', () => ({}));

// Mock useAuth
const mockUser = { id: 'user123', email: 'vendor@example.com', role: 'VENDOR' };

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock react-i18next
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    'vendor.analytics': 'Analytics',
  };
  return translations[key] || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock vendorService
jest.mock('@/lib/api/vendorService', () => ({
  vendorService: {},
}));

// Mock recharts components to avoid chart rendering issues in tests
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='bar-chart'>{children}</div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='bar'>{children}</div>
  ),
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  Tooltip: () => <div data-testid='tooltip' />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='line-chart'>{children}</div>
  ),
  Line: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='line'>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='pie-chart'>{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='pie'>{children}</div>
  ),
  Cell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='cell'>{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='area-chart'>{children}</div>
  ),
  Area: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='area'>{children}</div>
  ),
}));

describe('VendorAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL and document.createElement for export functionality
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn(() => mockLink) as any;
  });

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      render(<VendorAnalytics />);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(
        screen.getByText('No analytics data available')
      ).toBeInTheDocument();
    });

    it('renders analytics data after loading', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('$24,567.89')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
        expect(screen.getByText('3,456')).toBeInTheDocument();
        expect(screen.getByText('68.4%')).toBeInTheDocument();
      });
    });

    it('displays overview cards with correct data', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        // Revenue card
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('$24,567.89')).toBeInTheDocument();
        expect(screen.getByText('+12.5%')).toBeInTheDocument();

        // Games card
        expect(screen.getByText('Total Games')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
        expect(screen.getByText('-5.2%')).toBeInTheDocument();

        // Participants card
        expect(screen.getByText('Total Participants')).toBeInTheDocument();
        expect(screen.getByText('3,456')).toBeInTheDocument();
        expect(screen.getByText('+18.7%')).toBeInTheDocument();

        // Conversion card
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('68.4%')).toBeInTheDocument();
        expect(screen.getByText('+3.2%')).toBeInTheDocument();
      });
    });

    it('displays date range selector', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('7D')).toBeInTheDocument();
        expect(screen.getByText('30D')).toBeInTheDocument();
        expect(screen.getByText('90D')).toBeInTheDocument();
        expect(screen.getByText('1Y')).toBeInTheDocument();
      });
    });

    it('displays metric selector', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Revenue')).toBeInTheDocument();
        expect(screen.getByText('Participants')).toBeInTheDocument();
        expect(screen.getByText('Games')).toBeInTheDocument();
      });
    });
  });

  describe('Charts and Data Visualization', () => {
    it('renders revenue chart', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      });
    });

    it('renders games performance chart', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Games Performance')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('renders category breakdown chart', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });

    it('renders time series chart', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Time Series Analysis')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('displays top performing games', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Top Performing Games')).toBeInTheDocument();
        expect(
          screen.getByText('iPhone 15 Pro Max Contest')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Nike Air Jordan Giveaway')
        ).toBeInTheDocument();
        expect(screen.getByText('MacBook Pro Bundle')).toBeInTheDocument();
      });
    });
  });

  describe('Data Filtering and Interaction', () => {
    it('changes date range when different period is selected', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const thirtyDayButton = screen.getByText('30D');
        fireEvent.click(thirtyDayButton);

        // The component should re-render with new data
        expect(thirtyDayButton).toBeInTheDocument();
      });
    });

    it('changes metric when different metric is selected', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const participantsButton = screen.getByText('Participants');
        fireEvent.click(participantsButton);

        // The component should re-render with new data
        expect(participantsButton).toBeInTheDocument();
      });
    });

    it('filters games by status', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Closed')).toBeInTheDocument();
        expect(screen.getByText('Drawing')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('exports analytics data when export button is clicked', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export/i });
        fireEvent.click(exportButton);

        // Check that export functionality was triggered
        expect(document.createElement).toHaveBeenCalledWith('a');
      });
    });

    it('creates downloadable file with correct name', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export/i });
        fireEvent.click(exportButton);

        const mockLink = document.createElement('a') as any;
        expect(mockLink.download).toBe('vendor-analytics-export.json');
        expect(mockLink.click).toHaveBeenCalled();
      });
    });
  });

  describe('Status Badges', () => {
    it('displays correct status badges for different game statuses', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        // Active games should have green badge
        const activeBadge = screen.getByText('Active');
        expect(activeBadge).toHaveClass('bg-green-500');

        // Closed games should have gray badge
        const closedBadge = screen.getByText('Closed');
        expect(closedBadge).toHaveClass('bg-gray-500');

        // Drawing games should have blue badge
        const drawingBadge = screen.getByText('Drawing');
        expect(drawingBadge).toHaveClass('bg-blue-500');
      });
    });
  });

  describe('Data Formatting', () => {
    it('formats currency values correctly', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('$24,567.89')).toBeInTheDocument();
        expect(screen.getByText('$8,450')).toBeInTheDocument();
        expect(screen.getByText('$5,230')).toBeInTheDocument();
      });
    });

    it('formats percentage values correctly', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('+12.5%')).toBeInTheDocument();
        expect(screen.getByText('-5.2%')).toBeInTheDocument();
        expect(screen.getByText('+18.7%')).toBeInTheDocument();
        expect(screen.getByText('+3.2%')).toBeInTheDocument();
      });
    });

    it('formats large numbers with commas', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('3,456')).toBeInTheDocument();
        expect(screen.getByText('1,690')).toBeInTheDocument();
        expect(screen.getByText('1,743')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const overviewGrid = document.querySelector(
          '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4'
        );
        expect(overviewGrid).toBeInTheDocument();

        const chartsGrid = document.querySelector(
          '.grid.grid-cols-1.lg\\:grid-cols-2'
        );
        expect(chartsGrid).toBeInTheDocument();
      });
    });

    it('applies responsive flex classes to header', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const header = document.querySelector('.flex.flex-col.sm\\:flex-row');
        expect(header).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toBeInTheDocument();
        expect(mainHeading).toHaveTextContent('Analytics');
      });
    });

    it('has proper button roles', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export/i });
        expect(exportButton).toBeInTheDocument();

        const dateRangeButtons = screen.getAllByRole('button');
        expect(dateRangeButtons.length).toBeGreaterThan(0);
      });
    });

    it('has proper chart labels', async () => {
      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Revenue')).toBeInTheDocument();
        expect(screen.getByText('Participants')).toBeInTheDocument();
        expect(screen.getByText('Games')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing user gracefully', () => {
      // Mock useAuth to return no user
      jest.doMock('@/lib/contexts/AuthContext', () => ({
        useAuth: () => ({
          user: null,
        }),
      }));

      render(<VendorAnalytics />);

      expect(
        screen.getByText('No analytics data available')
      ).toBeInTheDocument();
    });

    it('handles loading errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<VendorAnalytics />);

      await waitFor(() => {
        // Component should still render even if there's an error
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('simulates API call delay', async () => {
      const startTime = Date.now();

      render(<VendorAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('$24,567.89')).toBeInTheDocument();
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 1000ms due to simulated API delay
      expect(duration).toBeGreaterThanOrEqual(1000);
    });
  });
});
