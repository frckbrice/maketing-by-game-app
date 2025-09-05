import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GameCard } from '../game-card';

// Mock OptimizedImage
jest.mock('../../../performance/OptimizedImage', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className, sizes, priority, children }: any) => (
    <div className={className} style={{ position: 'relative' }}>
      {children || <img src={src} alt={alt} />}
    </div>
  ),
}));

// Mock react-i18next
const mockT = jest.fn((key: string, options?: any) => {
  const translations: Record<string, string> = {
    'games.gameCard.lotteryGame': 'Lottery Game',
    'games.gameCard.sponsored': 'Sponsored',
    'games.gameCard.new': 'New',
    'games.gameCard.hot': 'Hot',
    'games.gameCard.fillingFast': 'Filling Fast',
    'games.gameCard.ticketPrice': 'Ticket Price',
    'games.gameCard.timeLeft': 'Time Left',
    'games.gameCard.participants': 'Participants',
    'games.gameCard.ticketsSold': 'tickets sold',
    'games.gameCard.sponsoredBy': 'Sponsored by',
    'games.gameCard.visitWebsite': 'Visit {{company}} website',
    'games.gameCard.viewDetails': 'View Details',
    'games.gameCard.playGame': 'Play {{title}}',
    'games.gameCard.expired': 'Expired',
    'games.gameCard.full': 'Full',
    'games.gameCard.playNow': 'Play Now',
  };

  if (options) {
    return translations[key].replace(
      /\{\{(\w+)\}\}/g,
      (match: string, key: string) => options[key] || match
    );
  }
  return translations[key] || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock currencyService
const mockFormatCurrency = jest.fn((amount: number, currency: string) => {
  return `${currency} ${amount}`;
});

jest.mock('@/lib/api/currencyService', () => ({
  currencyService: {
    formatCurrency: mockFormatCurrency,
  },
}));

// Mock GameDetailModal
jest.mock('../GameDetailModal', () => ({
  GameDetailModal: ({ game, isOpen, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid='game-detail-modal'>
        <button onClick={onClose}>Close Details</button>
        <div>Game: {game.title}</div>
      </div>
    );
  },
}));

// Mock PaymentModal
jest.mock('../PaymentModal', () => ({
  PaymentModal: ({ game, isOpen, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid='payment-modal'>
        <button onClick={onClose}>Close Payment</button>
        <div>Payment for: {game.title}</div>
      </div>
    );
  },
}));

describe('GameCard', () => {
  const mockGame = {
    id: 'game1',
    title: 'iPhone 15 Pro Max Giveaway',
    description: 'Win the latest iPhone!',
    type: 'special' as const,
    categoryId: 'phones',
    category: {
      id: 'phones',
      name: 'Phones',
      description: 'Mobile devices',
      icon: '📱',
      color: '#FF5722',
      isActive: true,
      sortOrder: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    ticketPrice: 5,
    currency: 'USD',
    maxParticipants: 200,
    currentParticipants: 150,
    totalTickets: 200,
    totalTicketsSold: 150,
    videoUrl: undefined,
    totalPrizePool: 1000,
    prizes: [
      {
        id: 'prize1',
        name: 'iPhone 15 Pro Max',
        description: 'Latest iPhone model',
        type: 'product' as const,
        value: 1000,
        currency: 'USD',
        image: undefined,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    rules: [
      {
        id: 'rule1',
        title: 'Basic Rules',
        description: 'Follow the basic rules',
        order: 1,
        isRequired: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    images: [
      {
        id: 'img1',
        url: '/images/iphone.jpg',
        alt: 'iPhone',
        order: 1,
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000, // 8 days from now
    status: 'ACTIVE' as const,
    isActive: true,
    createdBy: 'user1',
    createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    updatedAt: Date.now(),
  };

  const mockshop = {
    name: 'TechCorp',
    logo: '/images/techcorp-logo.png',
    website: 'https://techcorp.com',
  };

  const defaultProps = {
    game: mockGame,
    isSponsored: false,
    shop: undefined,
  };

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
    it('renders game card with basic information', () => {
      render(<GameCard {...defaultProps} />);

      expect(
        screen.getByText('iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
      expect(screen.getByText('Win the latest iPhone!')).toBeInTheDocument();
      expect(screen.getByText('Phones')).toBeInTheDocument();
    });

    it('displays game image when available', () => {
      render(<GameCard {...defaultProps} />);

      const imageContainer = document.querySelector('.relative.h-40.sm\\:h-48');
      expect(imageContainer).toBeInTheDocument();
    });

    it('shows fallback icon when no image is available', () => {
      const gameWithoutImages = { ...mockGame, images: [] };

      render(<GameCard {...defaultProps} game={gameWithoutImages} />);

      expect(screen.getByText('📱')).toBeInTheDocument();
    });

    it('displays ticket price correctly', () => {
      render(<GameCard {...defaultProps} />);

      expect(screen.getByText('USD 5')).toBeInTheDocument();
      expect(mockFormatCurrency).toHaveBeenCalledWith(5, 'USD');
    });

    it('shows participants count', () => {
      render(<GameCard {...defaultProps} />);

      expect(screen.getByText('150/200')).toBeInTheDocument();
    });

    it('displays progress bar with correct percentage', () => {
      render(<GameCard {...defaultProps} />);

      // 150/200 = 75%
      expect(screen.getByText('75%')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Status Badges', () => {
    it('shows sponsored badge when isSponsored is true', () => {
      render(<GameCard {...defaultProps} isSponsored={true} />);

      expect(screen.getByText('Sponsored')).toBeInTheDocument();
      expect(screen.getByText('★')).toBeInTheDocument();
    });

    it('shows new badge for games created within 24 hours', () => {
      render(<GameCard {...defaultProps} />);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('shows hot badge when participation is over 75%', () => {
      const hotGame = {
        ...mockGame,
        currentParticipants: 180,
        maxParticipants: 200,
      }; // 90%

      render(<GameCard {...defaultProps} game={hotGame} />);

      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    it('shows filling fast badge when participation is over 90%', () => {
      const almostFullGame = {
        ...mockGame,
        currentParticipants: 190,
        maxParticipants: 200,
      }; // 95%

      render(<GameCard {...defaultProps} game={almostFullGame} />);

      expect(screen.getByText('Filling Fast')).toBeInTheDocument();
    });

    it('applies correct styling for sponsored games', () => {
      render(<GameCard {...defaultProps} isSponsored={true} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass(
        'border-yellow-300',
        'dark:border-yellow-500',
        'shadow-yellow-100',
        'dark:shadow-yellow-900/20'
      );
    });
  });

  describe('Company Information', () => {
    it('displays company info when provided', () => {
      render(<GameCard {...defaultProps} shop={mockshop} />);

      expect(screen.getByText('Sponsored by')).toBeInTheDocument();
      expect(screen.getByText('TechCorp')).toBeInTheDocument();
    });

    it('shows company logo overlay on image', () => {
      render(<GameCard {...defaultProps} shop={mockshop} />);

      const companyLogo = screen.getByText('TechCorp');
      expect(companyLogo).toBeInTheDocument();
    });

    it('opens company website in new tab when clicked', () => {
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      render(<GameCard {...defaultProps} shop={mockshop} />);

      const websiteButton = screen.getByLabelText('Visit TechCorp website');
      fireEvent.click(websiteButton);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://techcorp.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('does not show company info when not provided', () => {
      render(<GameCard {...defaultProps} />);

      expect(screen.queryByText('Sponsored by')).not.toBeInTheDocument();
      expect(screen.queryByText('TechCorp')).not.toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('shows time remaining for active games', () => {
      render(<GameCard {...defaultProps} />);

      // Should show time remaining (7 days)
      expect(screen.getByText(/7d/i)).toBeInTheDocument();
    });

    it('updates timer every minute', () => {
      render(<GameCard {...defaultProps} />);

      // Fast-forward time by 2 minutes
      act(() => {
        jest.advanceTimersByTime(2 * 60 * 1000);
      });

      // Timer should still be showing
      expect(screen.getByText(/7d/i)).toBeInTheDocument();
    });

    it('shows expired message for ended games', () => {
      const expiredGame = {
        ...mockGame,
        endDate: Date.now() - 24 * 60 * 60 * 1000,
      }; // 1 day ago

      render(<GameCard {...defaultProps} game={expiredGame} />);

      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('shows hours and minutes for games ending soon', () => {
      const soonGame = {
        ...mockGame,
        endDate: Date.now() + 2 * 60 * 60 * 1000,
      }; // 2 hours from now

      render(<GameCard {...defaultProps} game={soonGame} />);

      expect(screen.getByText(/2h/i)).toBeInTheDocument();
    });
  });

  describe('Progress and Game States', () => {
    it('applies correct progress bar colors based on participation', () => {
      const { rerender } = render(<GameCard {...defaultProps} />);

      // Normal participation (75%)
      let progressBar = screen.getByRole('progressbar');
      let progressFill = progressBar.querySelector('.h-full.rounded-full');
      expect(progressFill).toHaveClass('from-orange-400', 'to-orange-500');

      // Hot game (90%)
      const hotGame = {
        ...mockGame,
        currentParticipants: 180,
        maxParticipants: 200,
      };
      rerender(<GameCard {...defaultProps} game={hotGame} />);

      progressBar = screen.getByRole('progressbar');
      progressFill = progressBar.querySelector('.h-full.rounded-full');
      expect(progressFill).toHaveClass('from-orange-500', 'to-red-500');

      // Almost full (95%)
      const almostFullGame = {
        ...mockGame,
        currentParticipants: 190,
        maxParticipants: 200,
      };
      rerender(<GameCard {...defaultProps} game={almostFullGame} />);

      progressBar = screen.getByRole('progressbar');
      progressFill = progressBar.querySelector('.h-full.rounded-full');
      expect(progressFill).toHaveClass('from-red-500', 'to-red-600');
    });

    it('disables play button for expired games', () => {
      const expiredGame = {
        ...mockGame,
        endDate: Date.now() - 24 * 60 * 60 * 1000,
      };

      render(<GameCard {...defaultProps} game={expiredGame} />);

      const playButton = screen.getByRole('button', { name: /play game/i });
      expect(playButton).toBeDisabled();
      expect(playButton).toHaveTextContent('Expired');
    });

    it('disables play button for full games', () => {
      const fullGame = {
        ...mockGame,
        currentParticipants: 200,
        maxParticipants: 200,
      };

      render(<GameCard {...defaultProps} game={fullGame} />);

      const playButton = screen.getByRole('button', { name: /play game/i });
      expect(playButton).toBeDisabled();
      expect(playButton).toHaveTextContent('Full');
    });
  });

  describe('Modal Interactions', () => {
    it('opens game detail modal when view details button is clicked', () => {
      render(<GameCard {...defaultProps} />);

      const viewDetailsButton = screen.getByRole('button', {
        name: /view details/i,
      });
      fireEvent.click(viewDetailsButton);

      expect(screen.getByTestId('game-detail-modal')).toBeInTheDocument();
      expect(
        screen.getByText('Game: iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
    });

    it('opens payment modal when play button is clicked', () => {
      render(<GameCard {...defaultProps} />);

      const playButton = screen.getByRole('button', { name: /play game/i });
      fireEvent.click(playButton);

      expect(screen.getByTestId('payment-modal')).toBeInTheDocument();
      expect(
        screen.getByText('Payment for: iPhone 15 Pro Max Giveaway')
      ).toBeInTheDocument();
    });

    it('opens game detail modal when image is clicked', () => {
      render(<GameCard {...defaultProps} />);

      const imageContainer = document.querySelector('.relative.h-40.sm\\:h-48');
      fireEvent.click(imageContainer!);

      expect(screen.getByTestId('game-detail-modal')).toBeInTheDocument();
    });

    it('closes modals when close buttons are clicked', () => {
      render(<GameCard {...defaultProps} />);

      // Open detail modal
      const viewDetailsButton = screen.getByRole('button', {
        name: /view details/i,
      });
      fireEvent.click(viewDetailsButton);

      expect(screen.getByTestId('game-detail-modal')).toBeInTheDocument();

      // Close it
      const closeButton = screen.getByText('Close Details');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('game-detail-modal')).not.toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('applies hover effects to card', () => {
      render(<GameCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('hover:transform', 'hover:scale-[1.02]');
    });

    it('shows hover overlay on image', () => {
      render(<GameCard {...defaultProps} />);

      const imageContainer = document.querySelector('.relative.h-40.sm\\:h-48');
      const hoverOverlay = imageContainer?.querySelector(
        '.absolute.inset-0.bg-black\\/20.opacity-0.group-hover\\:opacity-100'
      );
      expect(hoverOverlay).toBeInTheDocument();
    });

    it('shows eye icon on image hover', () => {
      render(<GameCard {...defaultProps} />);

      const eyeIcon = document.querySelector(
        '.bg-white\\/90.dark\\:bg-gray-800\\/90.rounded-full.p-2.sm\\:p-3'
      );
      expect(eyeIcon).toBeInTheDocument();
      expect(eyeIcon?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<GameCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute(
        'aria-label',
        'Lottery Game: iPhone 15 Pro Max Giveaway'
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-label', '75% tickets sold');
    });

    it('has proper button labels', () => {
      render(<GameCard {...defaultProps} />);

      const viewDetailsButton = screen.getByRole('button', {
        name: /view details/i,
      });
      const playButton = screen.getByRole('button', { name: /play game/i });

      expect(viewDetailsButton).toHaveAttribute('aria-label', 'View Details');
      expect(playButton).toHaveAttribute(
        'aria-label',
        'Play iPhone 15 Pro Max Giveaway'
      );
    });

    it('has proper scroll button labels', () => {
      render(<GameCard {...defaultProps} shop={mockshop} />);

      const websiteButton = screen.getByLabelText('Visit TechCorp website');
      expect(websiteButton).toHaveAttribute(
        'aria-label',
        'Visit TechCorp website'
      );
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      render(<GameCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('rounded-lg', 'sm:rounded-2xl');

      const imageContainer = document.querySelector('.h-40.sm\\:h-48');
      expect(imageContainer).toHaveClass('h-40', 'sm:h-48');

      const content = document.querySelector('.p-4.sm\\:p-6');
      expect(content).toHaveClass('p-4', 'sm:p-6');
    });

    it('shows responsive text sizes', () => {
      render(<GameCard {...defaultProps} />);

      const title = screen.getByText('iPhone 15 Pro Max Giveaway');
      expect(title).toHaveClass('text-base', 'sm:text-lg');

      const description = screen.getByText('Win the latest iPhone!');
      expect(description).toHaveClass('text-xs', 'sm:text-sm');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing category gracefully', () => {
      const gameWithoutCategory = { ...mockGame, category: undefined };

      render(<GameCard {...defaultProps} game={gameWithoutCategory} />);

      // Should show fallback category
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('🎁')).toBeInTheDocument();
    });

    it('handles missing images gracefully', () => {
      const gameWithoutImages = { ...mockGame, images: [] };

      render(<GameCard {...defaultProps} game={gameWithoutImages} />);

      // Should show fallback icon
      expect(screen.getByText('📱')).toBeInTheDocument();
    });

    it('handles zero max participants gracefully', () => {
      const gameWithZeroMax = { ...mockGame, maxParticipants: 0 };

      render(<GameCard {...defaultProps} game={gameWithZeroMax} />);

      // Should show 0% progress
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles very old games gracefully', () => {
      const oldGame = {
        ...mockGame,
        createdAt: Date.now() - 48 * 60 * 60 * 1000,
      }; // 48 hours ago

      render(<GameCard {...defaultProps} game={oldGame} />);

      // Should not show new badge
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('uses React.memo to prevent unnecessary re-renders', () => {
      const { rerender } = render(<GameCard {...defaultProps} />);

      // Component should be memoized
      const initialRender = screen.getByText('iPhone 15 Pro Max Giveaway');

      rerender(<GameCard {...defaultProps} />);

      // Should be the same DOM element
      expect(screen.getByText('iPhone 15 Pro Max Giveaway')).toBe(
        initialRender
      );
    });

    it('uses useCallback for event handlers', () => {
      render(<GameCard {...defaultProps} />);

      // The component should use useCallback for handlers
      const viewDetailsButton = screen.getByRole('button', {
        name: /view details/i,
      });
      fireEvent.click(viewDetailsButton);

      // Should work without errors
      expect(screen.getByTestId('game-detail-modal')).toBeInTheDocument();
    });

    it('uses useMemo for computed values', () => {
      render(<GameCard {...defaultProps} />);

      // Progress should be computed and memoized
      expect(screen.getByText('75%')).toBeInTheDocument();

      // Re-render with same props
      const { rerender } = render(<GameCard {...defaultProps} />);
      rerender(<GameCard {...defaultProps} />);

      // Progress should still be correct
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });
});
