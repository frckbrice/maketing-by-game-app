import { fireEvent, render, screen } from '@testing-library/react';
import { VendorGames } from '../vendor-games';

// Mock next/navigation
jest.mock('next/navigation', () => ({}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock useAuth
const mockUser = { id: 'user123', email: 'vendor@example.com', role: 'VENDOR' };

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock react-i18next
const mockT = jest.fn((key: string, options?: any) => {
  const translations: Record<string, string> = {
    'vendor.myGames': 'My Games',
    'vendor.myGamesDescription': 'Manage your lottery games',
    'vendor.createGame': 'Create Game',
    'vendor.searchGames': 'Search games...',
    'vendor.filterByStatus': 'Filter by status',
    'vendor.allStatus': 'All Status',
    'vendor.status.active': 'Active',
    'vendor.status.pending': 'Pending',
    'vendor.status.drawing': 'Drawing',
    'vendor.status.closed': 'Closed',
    'vendor.status.draft': 'Draft',
    'vendor.status.rejected': 'Rejected',
    'vendor.participation': 'Participation',
    'vendor.noGamesFound': 'No games found',
    'vendor.noGamesYet': 'No games yet',
    'vendor.tryAdjustingFilters': 'Try adjusting your filters',
    'vendor.createFirstGame': 'Create your first game to get started',
    'vendor.games': 'games',
    'common.unknown': 'Unknown',
    'common.ended': 'Ended',
    'common.timeLeft': '{{days}}d {{hours}}h left',
    'common.hoursLeft': '{{hours}}h left',
    'common.view': 'View',
    'common.edit': 'Edit',
    'common.apply': 'Apply',
    'common.showing': 'Showing',
    'common.to': 'to',
    'common.of': 'of',
    'common.page': 'Page',
  };
  return translations[key] || key;
});

const mockI18n = {
  language: 'en',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

// Mock useVendorGames hook
const mockGamesData = [
  {
    id: 'game1',
    title: 'iPhone 15 Pro Max Giveaway',
    description: 'Win the latest iPhone!',
    category: { name: 'Electronics' },
    status: 'ACTIVE',
    ticketPrice: 5,
    currentParticipants: 150,
    maxParticipants: 200,
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000, // 8 days from now
  },
  {
    id: 'game2',
    title: 'Nike Air Jordan Contest',
    description: 'Exclusive sneaker giveaway',
    category: { name: 'Fashion' },
    status: 'PENDING',
    ticketPrice: 3,
    currentParticipants: 0,
    maxParticipants: 100,
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
    drawDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
  },
  {
    id: 'game3',
    title: 'MacBook Pro Bundle',
    description: 'Premium laptop package',
    category: { name: 'Computers' },
    status: 'DRAFT',
    ticketPrice: 10,
    currentParticipants: 0,
    maxParticipants: 50,
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    drawDate: Date.now() + 31 * 24 * 60 * 60 * 1000, // 31 days from now
  },
];

const mockUseVendorGames = jest.fn(() => ({
  data: mockGamesData,
  isLoading: false,
  refetch: jest.fn(),
}));

jest.mock('@/hooks/useApi', () => ({
  useVendorGames: mockUseVendorGames,
}));

describe('VendorGames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVendorGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders the vendor games page', () => {
      render(<VendorGames />);

      expect(screen.getByText('My Games')).toBeInTheDocument();
      expect(screen.getByText('Manage your lottery games')).toBeInTheDocument();
    });

    it('displays create game button', () => {
      render(<VendorGames />);

      const createButton = screen.getByRole('link', { name: /create game/i });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveAttribute(
        'href',
        '/vendor-dashboard/create-game'
      );
    });

    it('shows search and filter controls', () => {
      render(<VendorGames />);

      expect(
        screen.getByPlaceholderText('Search games...')
      ).toBeInTheDocument();
      expect(screen.getByText('Filter by status')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /apply/i })
      ).toBeInTheDocument();
    });

    it('displays games grid when games exist', () => {
      render(<VendorGames />);

      expect(
        screen.getByText('iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
      expect(screen.getByText('Nike Air Jordan Contest')).toBeInTheDocument();
      expect(screen.getByText('MacBook Pro Bundle')).toBeInTheDocument();
    });
  });

  describe('Game Cards', () => {
    it('displays game information correctly', () => {
      render(<VendorGames />);

      // Check first game details
      expect(
        screen.getByText('iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
      expect(screen.getByText('Win the latest iPhone!')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('$5')).toBeInTheDocument();
      expect(screen.getByText('150/200')).toBeInTheDocument();
    });

    it('shows correct status badges', () => {
      render(<VendorGames />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('displays participation progress bar', () => {
      render(<VendorGames />);

      expect(screen.getByText('Participation')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument(); // 150/200 = 75%
    });

    it('shows time remaining for active games', () => {
      render(<VendorGames />);

      // Should show time remaining for active games
      expect(screen.getByText(/7d/i)).toBeInTheDocument();
    });

    it('shows draw date', () => {
      render(<VendorGames />);

      // Should show formatted draw dates
      const drawDates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(drawDates.length).toBeGreaterThan(0);
    });
  });

  describe('Search and Filtering', () => {
    it('filters games by search term', () => {
      render(<VendorGames />);

      const searchInput = screen.getByPlaceholderText('Search games...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });

      expect(
        screen.getByText('iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Nike Air Jordan Contest')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('MacBook Pro Bundle')).not.toBeInTheDocument();
    });

    it('filters games by status', () => {
      render(<VendorGames />);

      const statusSelect = screen.getByText('Filter by status');
      fireEvent.click(statusSelect);

      // Select Active status
      const activeOption = screen.getByText('Active');
      fireEvent.click(activeOption);

      // Apply filter
      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      expect(
        screen.getByText('iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Nike Air Jordan Contest')
      ).not.toBeInTheDocument();
    });

    it('shows no games found message when search has no results', () => {
      render(<VendorGames />);

      const searchInput = screen.getByPlaceholderText('Search games...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentGame' } });

      expect(screen.getByText('No games found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your filters')
      ).toBeInTheDocument();
    });

    it('resets to page 1 when searching', () => {
      render(<VendorGames />);

      const searchInput = screen.getByPlaceholderText('Search games...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      // Should show first page results
      expect(
        screen.getByText('iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
    });
  });

  describe('Game Actions', () => {
    it('shows view button for all games', () => {
      render(<VendorGames />);

      const viewButtons = screen.getAllByRole('link', { name: /view/i });
      expect(viewButtons).toHaveLength(3);

      // Check first view button href
      expect(viewButtons[0]).toHaveAttribute(
        'href',
        '/vendor-dashboard/games/game1'
      );
    });

    it('shows edit button for draft games', () => {
      render(<VendorGames />);

      const editButtons = screen.getAllByRole('link', { name: /edit/i });
      expect(editButtons).toHaveLength(1); // Only draft game should have edit button

      expect(editButtons[0]).toHaveAttribute(
        'href',
        '/vendor-dashboard/games/game3/edit'
      );
    });

    it('shows edit button for closed games', () => {
      // Mock a closed game
      const closedGameData = [
        {
          ...mockGamesData[0],
          status: 'CLOSED',
        },
      ];

      mockUseVendorGames.mockReturnValue({
        data: closedGameData,
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<VendorGames />);

      const editButton = screen.getByRole('link', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveAttribute(
        'href',
        '/vendor-dashboard/games/game1/edit'
      );
    });

    it('does not show edit button for active games', () => {
      render(<VendorGames />);

      const editButtons = screen.queryAllByRole('link', { name: /edit/i });
      const activeGame = screen
        .getByText('iPhone 15 Pro Max Giveaway')
        .closest('div');

      // Active game should not have edit button
      expect(activeGame).not.toContainElement(
        screen.queryByRole('link', { name: /edit/i })
      );
    });
  });

  describe('Empty States', () => {
    it('shows no games message when no games exist', () => {
      mockUseVendorGames.mockReturnValue({
        data: [],
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<VendorGames />);

      expect(screen.getByText('No games yet')).toBeInTheDocument();
      expect(
        screen.getByText('Create your first game to get started')
      ).toBeInTheDocument();

      const createButton = screen.getByRole('link', { name: /create game/i });
      expect(createButton).toHaveAttribute(
        'href',
        '/vendor-dashboard/create-game'
      );
    });

    it('shows no games found message when filters return no results', () => {
      render(<VendorGames />);

      const searchInput = screen.getByPlaceholderText('Search games...');
      fireEvent.change(searchInput, { target: { value: 'XYZ' } });

      expect(screen.getByText('No games found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your filters')
      ).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('shows pagination when there are multiple pages', () => {
      // Mock games data with pagination
      const paginatedGamesData = Array.from({ length: 25 }, (_, i) => ({
        id: `game${i}`,
        title: `Game ${i}`,
        description: `Description ${i}`,
        category: { name: 'Test' },
        status: 'ACTIVE',
        ticketPrice: 5,
        currentParticipants: 50,
        maxParticipants: 100,
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000,
      }));

      mockUseVendorGames.mockReturnValue({
        data: paginatedGamesData,
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<VendorGames />);

      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(
        screen.getByText('Showing 1 to 12 of 25 games')
      ).toBeInTheDocument();
    });

    it('enables/disables pagination buttons correctly', () => {
      // Mock games data with pagination
      const paginatedGamesData = Array.from({ length: 25 }, (_, i) => ({
        id: `game${i}`,
        title: `Game ${i}`,
        description: `Description ${i}`,
        category: { name: 'Test' },
        status: 'ACTIVE',
        ticketPrice: 5,
        currentParticipants: 50,
        maxParticipants: 100,
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000,
      }));

      mockUseVendorGames.mockReturnValue({
        data: paginatedGamesData,
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<VendorGames />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });

      // First page: previous should be disabled, next should be enabled
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeEnabled();
    });

    it('changes page when pagination buttons are clicked', () => {
      // Mock games data with pagination
      const paginatedGamesData = Array.from({ length: 25 }, (_, i) => ({
        id: `game${i}`,
        title: `Game ${i}`,
        description: `Description ${i}`,
        category: { name: 'Test' },
        status: 'ACTIVE',
        ticketPrice: 5,
        currentParticipants: 50,
        maxParticipants: 100,
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000,
      }));

      mockUseVendorGames.mockReturnValue({
        data: paginatedGamesData,
        isLoading: false,
        refetch: jest.fn(),
      });

      render(<VendorGames />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should show page 2
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when data is loading', () => {
      mockUseVendorGames.mockReturnValue({
        data: [],
        isLoading: true,
        refetch: jest.fn(),
      });

      render(<VendorGames />);

      // Should show loading skeleton
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Status Badges', () => {
    it('applies correct CSS classes for different statuses', () => {
      render(<VendorGames />);

      const activeBadge = screen.getByText('Active');
      const pendingBadge = screen.getByText('Pending');
      const draftBadge = screen.getByText('Draft');

      expect(activeBadge).toHaveClass('bg-green-500');
      expect(pendingBadge).toHaveClass('bg-yellow-500');
      expect(draftBadge).toHaveClass('bg-gray-400');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes', () => {
      render(<VendorGames />);

      const gamesGrid = document.querySelector(
        '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3'
      );
      expect(gamesGrid).toBeInTheDocument();
    });

    it('applies responsive flex classes to header', () => {
      render(<VendorGames />);

      const header = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<VendorGames />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('My Games');
    });

    it('has proper button roles', () => {
      render(<VendorGames />);

      const applyButton = screen.getByRole('button', { name: /apply/i });
      expect(applyButton).toBeInTheDocument();

      const createButton = screen.getByRole('link', { name: /create game/i });
      expect(createButton).toBeInTheDocument();
    });

    it('has proper form labels and placeholders', () => {
      render(<VendorGames />);

      const searchInput = screen.getByPlaceholderText('Search games...');
      expect(searchInput).toBeInTheDocument();

      const statusSelect = screen.getByText('Filter by status');
      expect(statusSelect).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('uses translation function for text content', () => {
      render(<VendorGames />);

      expect(mockT).toHaveBeenCalledWith('vendor.myGames');
      expect(mockT).toHaveBeenCalledWith('vendor.myGamesDescription');
      expect(mockT).toHaveBeenCalledWith('vendor.createGame');
    });

    it('displays translated content correctly', () => {
      render(<VendorGames />);

      expect(screen.getByText('My Games')).toBeInTheDocument();
      expect(screen.getByText('Manage your lottery games')).toBeInTheDocument();
      expect(screen.getByText('Create Game')).toBeInTheDocument();
    });
  });
});
