import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GamesPage } from '../GamesPage';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock next/navigation
const mockPush = jest.fn();
const mockRouter = { push: mockPush };
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
}));

// Mock useAuth
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'USER' as const,
};
jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: mockUser })),
}));

// Mock react-i18next
const mockT = jest.fn((key: string, defaultValue?: string) => defaultValue || key);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
  },
}));

// Mock API hooks
jest.mock('../../api/queries', () => ({
  useCategories: jest.fn(),
  useGames: jest.fn(),
  useFeaturedGames: jest.fn(),
  useGameStats: jest.fn(),
  useVendorApplication: jest.fn(),
}));

jest.mock('../../api/mutations', () => ({
  useJoinGame: jest.fn(),
  useShareGame: jest.fn(),
}));

// Get mocked functions
const mockUseCategories = require('../../api/queries').useCategories;
const mockUseGames = require('../../api/queries').useGames;
const mockUseFeaturedGames = require('../../api/queries').useFeaturedGames;
const mockUseGameStats = require('../../api/queries').useGameStats;
const mockUseVendorApplication = require('../../api/queries').useVendorApplication;
const mockUseJoinGame = require('../../api/mutations').useJoinGame;
const mockUseShareGame = require('../../api/mutations').useShareGame;

// Mock components
jest.mock('@/components/home/components/DesktopHeader', () => ({
  DesktopHeader: ({ isDark, onThemeToggle }: any) => (
    <header data-testid="desktop-header">
      <button onClick={onThemeToggle} data-testid="theme-toggle">
        {isDark ? 'Dark' : 'Light'} Theme
      </button>
    </header>
  ),
}));

jest.mock('@/components/home/components/MobileNavigation', () => ({
  MobileNavigation: ({ mobileMenuOpen, setMobileMenuOpen, onThemeToggle }: any) => (
    <nav data-testid="mobile-navigation">
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-toggle">
        {mobileMenuOpen ? 'Close' : 'Open'} Menu
      </button>
      <button onClick={onThemeToggle} data-testid="mobile-theme-toggle">
        Toggle Theme
      </button>
    </nav>
  ),
}));

jest.mock('../AdBanner', () => ({
  AdBanner: ({ title, description, ctaText }: any) => (
    <div data-testid="ad-banner">
      <h3>{title}</h3>
      <p>{description}</p>
      <button>{ctaText}</button>
    </div>
  ),
}));

jest.mock('../CategoryTabs', () => ({
  CategoryTabs: ({ categories, selectedCategory, onCategoryChange }: any) => (
    <div data-testid="category-tabs">
      {categories.map((cat: any) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          data-testid={`category-${cat.id}`}
          className={selectedCategory === cat.id ? 'selected' : ''}
        >
          {cat.name}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../game-card', () => ({
  GameCard: ({ game }: any) => (
    <div data-testid={`game-card-${game.id}`} className="game-card">
      <h3>{game.title}</h3>
      <p>{game.description}</p>
    </div>
  ),
}));

// Mock data
const mockCategories = [
  { id: 'phones', name: 'Phones', description: 'Mobile devices', icon: '📱', color: '#3b82f6', isActive: true, sortOrder: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'computers', name: 'Computers', description: 'Computing devices', icon: '💻', color: '#10b981', isActive: true, sortOrder: 2, createdAt: Date.now(), updatedAt: Date.now() },
];

const mockGames = [
  { id: 'game-1', title: 'iPhone 15 Pro', description: 'Latest iPhone model', categoryId: 'phones', category: { name: 'Phones' } },
  { id: 'game-2', title: 'MacBook Pro', description: 'Professional laptop', categoryId: 'computers', category: { name: 'Computers' } },
];

const mockFeaturedGames = [
  { id: 'featured-1', title: 'Featured Game 1', description: 'Amazing featured game' },
  { id: 'featured-2', title: 'Featured Game 2', description: 'Another featured game' },
];

const mockStats = {
  totalGames: 150,
  totalParticipants: 50000,
  totalPrizeValue: 2500000,
};

const mockVendorApplication = { status: 'pending' };

describe('GamesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockUseCategories.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
    });
    
    mockUseGames.mockReturnValue({
      data: { data: mockGames },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    mockUseFeaturedGames.mockReturnValue({
      data: mockFeaturedGames,
    });
    
    mockUseGameStats.mockReturnValue({
      data: mockStats,
    });
    
    mockUseVendorApplication.mockReturnValue({
      data: mockVendorApplication,
    });
    
    mockUseJoinGame.mockReturnValue({
      mutate: jest.fn(),
    });
    
    mockUseShareGame.mockReturnValue({
      mutate: jest.fn(),
    });
  });

  it('renders the games page with all sections', () => {
    render(<GamesPage />);
    
    // Check hero section
    expect(screen.getByText('Win Amazing Prizes')).toBeInTheDocument();
    expect(screen.getByText('Every Single Day')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of winners in our exciting lottery games. From the latest tech gadgets to designer fashion - your dream prize is just one ticket away!')).toBeInTheDocument();
    
    // Check search input
    expect(screen.getByPlaceholderText('Search amazing prizes...')).toBeInTheDocument();
    
    // Check category tabs
    expect(screen.getByTestId('category-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('category-all')).toBeInTheDocument();
    expect(screen.getByTestId('category-phones')).toBeInTheDocument();
    expect(screen.getByTestId('category-computers')).toBeInTheDocument();
    
    // Check stats cards
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Active Games')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('Happy Players')).toBeInTheDocument();
    expect(screen.getByText('Prize Value')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
    expect(screen.getByText('New Draws')).toBeInTheDocument();
    
    // Check featured games section
    expect(screen.getByText('Featured Games')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-featured-1')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-featured-2')).toBeInTheDocument();
    
    // Check main games grid
    expect(screen.getByRole('heading', { name: 'All Games' })).toBeInTheDocument();
    expect(screen.getByText('2 amazing prizes waiting for you')).toBeInTheDocument();
    expect(screen.getByText('2 Results')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-game-2')).toBeInTheDocument();
    
    // Check ad banner
    expect(screen.getByTestId('ad-banner')).toBeInTheDocument();
  });

  it('displays vendor application CTA for regular users', () => {
    render(<GamesPage />);
    
    expect(screen.getByText('Create Your Own Lottery Games')).toBeInTheDocument();
    expect(screen.getByText('Join our platform as a vendor and start earning by creating exciting lottery games for thousands of players worldwide!')).toBeInTheDocument();
    expect(screen.getByText('Become a Vendor Today')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    render(<GamesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search amazing prizes...');
    fireEvent.change(searchInput, { target: { value: 'iPhone' } });
    
    // Wait for the input value to update
    await waitFor(() => {
      expect(searchInput).toHaveValue('iPhone');
    });
    
    // The search input should have the value
    expect(searchInput).toHaveValue('iPhone');
  });

  it('handles category selection', () => {
    render(<GamesPage />);
    
    // Click on phones category
    fireEvent.click(screen.getByTestId('category-phones'));
    
    // The category should be selected
    expect(screen.getByTestId('category-phones')).toHaveClass('selected');
    expect(screen.getByTestId('category-all')).not.toHaveClass('selected');
  });

  it('changes category when category is clicked', () => {
    render(<GamesPage />);
    
    // Initially all category should be selected
    expect(screen.getByTestId('category-all')).toHaveClass('selected');
    
    // Click on computers category
    fireEvent.click(screen.getByTestId('category-computers'));
    
    // Computers category should be selected
    expect(screen.getByTestId('category-computers')).toHaveClass('selected');
    expect(screen.getByTestId('category-all')).not.toHaveClass('selected');
  });

  it('handles vendor application navigation for new users', () => {
    mockUseVendorApplication.mockReturnValue({ data: null });
    
    render(<GamesPage />);
    
    const becomeVendorButton = screen.getByText('Become a Vendor Today');
    fireEvent.click(becomeVendorButton);
    
    expect(mockPush).toHaveBeenCalledWith('/vendor-application');
  });

  it('shows info toast for pending vendor application', () => {
    mockUseVendorApplication.mockReturnValue({ data: { status: 'pending' } });
    
    render(<GamesPage />);
    
    const becomeVendorButton = screen.getByText('Become a Vendor Today');
    fireEvent.click(becomeVendorButton);
    
    expect(toast.info).toHaveBeenCalledWith('Your vendor application is already pending review.');
  });

  it('redirects approved vendors to vendor dashboard', () => {
    mockUseVendorApplication.mockReturnValue({ data: { status: 'approved' } });
    
    render(<GamesPage />);
    
    const becomeVendorButton = screen.getByText('Become a Vendor Today');
    fireEvent.click(becomeVendorButton);
    
    expect(mockPush).toHaveBeenCalledWith('/vendor-dashboard');
  });

  it('does not show vendor application CTA for unauthenticated users', () => {
    // Mock useAuth to return no user
    const mockUseAuth = require('@/lib/contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({ user: null });
    
    render(<GamesPage />);
    
    // The vendor application CTA should not be shown for unauthenticated users
    expect(screen.queryByText('Become a Vendor Today')).not.toBeInTheDocument();
  });

  it('handles loading states', () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    
    render(<GamesPage />);
    
    // Should show loading skeleton (8 placeholder divs with animate-pulse)
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements).toHaveLength(8);
  });

  it('handles empty games state', () => {
    mockUseGames.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    render(<GamesPage />);
    
    expect(screen.getByText('No games found')).toBeInTheDocument();
    expect(screen.getByText('No games are available in this category at the moment. Check back soon for new exciting prizes!')).toBeInTheDocument();
  });

  it('handles search input with nonexistent term', async () => {
    render(<GamesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search amazing prizes...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Wait for the input value to update
    await waitFor(() => {
      expect(searchInput).toHaveValue('nonexistent');
    });
    
    // The search input should have the value
    expect(searchInput).toHaveValue('nonexistent');
  });

  it('updates search input value', async () => {
    render(<GamesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search amazing prizes...');
    
    // Initially empty
    expect(searchInput).toHaveValue('');
    
    // Change to some value
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('test');
    });
    
    // Clear the input
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('handles error states', () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load categories'),
    });
    
    render(<GamesPage />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load games. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('handles theme toggle', () => {
    render(<GamesPage />);
    
    const desktopThemeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(desktopThemeToggle);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('handles mobile menu toggle', () => {
    render(<GamesPage />);
    
    const mobileMenuToggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(mobileMenuToggle);
    
    // The component should handle the mobile menu state
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('displays main games section heading', () => {
    render(<GamesPage />);
    
    // Should show "All Games" in the main section
    const mainGamesHeading = screen.getByRole('heading', { name: 'All Games' });
    expect(mainGamesHeading).toBeInTheDocument();
  });

  it('shows correct game count in results badge', () => {
    render(<GamesPage />);
    
    // Should show 2 results initially
    expect(screen.getByText('2 Results')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    render(<GamesPage />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThan(0);
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: 'Light Theme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
  });

  it('handles responsive design elements', () => {
    render(<GamesPage />);
    
    // Check for responsive classes on search container
    const searchContainer = screen.getByPlaceholderText('Search amazing prizes...').closest('.max-w-lg');
    expect(searchContainer).toHaveClass('max-w-lg');
    
    // Check for grid responsive classes
    const gamesGrid = screen.getByTestId('game-card-game-1').closest('.grid');
    expect(gamesGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  });

  it('displays loading state when categories are loading', () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    
    render(<GamesPage />);
    
    // Should show loading skeleton when categories are loading
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements).toHaveLength(8);
  });

  it('handles internationalization', () => {
    render(<GamesPage />);
    
    // Check that translation function is called for key translations
    expect(mockT).toHaveBeenCalledWith('games.categories.all', 'All Games');
    
    // The other translations are only called in error states, so we can't test them in the normal render
    // This test verifies that the translation system is working for the main content
  });
});
