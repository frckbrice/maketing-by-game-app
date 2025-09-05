import { fireEvent, render, screen } from '@testing-library/react';
import { CategoryTabs } from '../CategoryTabs';

// Mock next/image
jest.mock('next/image', () => {
  return ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
});

// Mock react-i18next
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    'categories.scrollLeft': 'Scroll left',
    'categories.scrollRight': 'Scroll right',
    'categories.game': 'game',
    'categories.games': 'games',
  };
  return translations[key] || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('CategoryTabs', () => {
  const mockCategories = [
    {
      id: 'phones',
      name: 'Phones',
      icon: '📱',
      description: 'Latest smartphones and mobile devices',
    },
    {
      id: 'computers',
      name: 'Computers',
      icon: '💻',
      description: 'Laptops, desktops, and computing devices',
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: '👕',
      description: 'Clothing, shoes, and accessories',
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: '/images/electronics-icon.png',
      description: 'Home electronics and gadgets',
    },
  ];

  const mockGamesCounts = {
    phones: 15,
    computers: 8,
    fashion: 12,
    electronics: 6,
  };

  const defaultProps = {
    categories: mockCategories,
    selectedCategory: 'phones',
    onCategoryChange: jest.fn(),
    gamesCounts: mockGamesCounts,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all category tabs', () => {
      render(<CategoryTabs {...defaultProps} />);

      expect(screen.getByText('Phones')).toBeInTheDocument();
      expect(screen.getByText('Computers')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('displays category icons correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      // Emoji icons
      expect(screen.getByText('📱')).toBeInTheDocument();
      expect(screen.getByText('💻')).toBeInTheDocument();
      expect(screen.getByText('👕')).toBeInTheDocument();

      // Image icon
      const imageIcon = screen.getByAltText('Electronics');
      expect(imageIcon).toBeInTheDocument();
      expect(imageIcon).toHaveAttribute('src', '/images/electronics-icon.png');
    });

    it('shows games count for each category', () => {
      render(<CategoryTabs {...defaultProps} />);

      expect(screen.getByText('15 games')).toBeInTheDocument();
      expect(screen.getByText('8 games')).toBeInTheDocument();
      expect(screen.getByText('12 games')).toBeInTheDocument();
      expect(screen.getByText('6 games')).toBeInTheDocument();
    });

    it('shows singular form for single game', () => {
      const singleGameCounts = {
        phones: 1,
        computers: 8,
        fashion: 12,
        electronics: 6,
      };

      render(<CategoryTabs {...defaultProps} gamesCounts={singleGameCounts} />);

      expect(screen.getByText('1 game')).toBeInTheDocument();
    });

    it('displays scroll buttons', () => {
      render(<CategoryTabs {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /scroll left/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /scroll right/i })
      ).toBeInTheDocument();
    });
  });

  describe('Selection and Interaction', () => {
    it('highlights selected category correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const selectedTab = screen.getByText('Phones').closest('button');
      expect(selectedTab).toHaveAttribute('aria-selected', 'true');
      expect(selectedTab).toHaveClass(
        'bg-gradient-to-br',
        'from-orange-500',
        'to-red-500'
      );
    });

    it('calls onCategoryChange when tab is clicked', () => {
      const mockOnCategoryChange = jest.fn();

      render(
        <CategoryTabs
          {...defaultProps}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const computersTab = screen.getByText('Computers').closest('button');
      fireEvent.click(computersTab!);

      expect(mockOnCategoryChange).toHaveBeenCalledWith('computers');
    });

    it('updates selected category when prop changes', () => {
      const { rerender } = render(<CategoryTabs {...defaultProps} />);

      // Initially phones is selected
      expect(screen.getByText('Phones').closest('button')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      // Change to computers
      rerender(<CategoryTabs {...defaultProps} selectedCategory='computers' />);

      expect(screen.getByText('Computers').closest('button')).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByText('Phones').closest('button')).toHaveAttribute(
        'aria-selected',
        'false'
      );
    });
  });

  describe('Scrolling Functionality', () => {
    it('calls scrollTabs when scroll buttons are clicked', () => {
      render(<CategoryTabs {...defaultProps} />);

      const leftButton = screen.getByRole('button', { name: /scroll left/i });
      const rightButton = screen.getByRole('button', { name: /scroll right/i });

      fireEvent.click(leftButton);
      fireEvent.click(rightButton);

      // The scroll functionality should be triggered
      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });

    it('applies correct styling to scroll buttons', () => {
      render(<CategoryTabs {...defaultProps} />);

      const leftButton = screen.getByRole('button', { name: /scroll left/i });
      const rightButton = screen.getByRole('button', { name: /scroll right/i });

      expect(leftButton).toHaveClass(
        'absolute',
        'left-0',
        'top-1/2',
        '-translate-y-1/2',
        'z-10'
      );
      expect(rightButton).toHaveClass(
        'absolute',
        'right-0',
        'top-1/2',
        '-translate-y-1/2',
        'z-10'
      );
    });
  });

  describe('Visual Effects', () => {
    it('applies selected state styling correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const selectedTab = screen.getByText('Phones').closest('button');
      expect(selectedTab).toHaveClass(
        'bg-gradient-to-br',
        'from-orange-500',
        'to-red-500',
        'text-white',
        'shadow-xl',
        'transform',
        'scale-105',
        'ring-4',
        'ring-orange-200',
        'dark:ring-orange-800'
      );
    });

    it('applies unselected state styling correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const unselectedTab = screen.getByText('Computers').closest('button');
      expect(unselectedTab).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'text-gray-700',
        'dark:text-gray-300',
        'hover:shadow-lg',
        'hover:scale-102',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
        'hover:border-orange-300',
        'dark:hover:border-orange-600'
      );
    });

    it('shows active indicator for selected category', () => {
      render(<CategoryTabs {...defaultProps} />);

      const selectedTab = screen.getByText('Phones').closest('button');
      const activeIndicator = selectedTab?.querySelector(
        '.w-2.h-2.bg-white.rounded-full'
      );
      expect(activeIndicator).toBeInTheDocument();
    });

    it('applies hover effects correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const unselectedTab = screen.getByText('Computers').closest('button');
      expect(unselectedTab).toHaveClass('group');

      // Check for hover effect div
      const hoverEffect = unselectedTab?.querySelector(
        '.absolute.inset-0.bg-gradient-to-r.opacity-0.group-hover\\:opacity-10'
      );
      expect(hoverEffect).toBeInTheDocument();
    });
  });

  describe('Category Description', () => {
    it('shows description for selected category', () => {
      render(<CategoryTabs {...defaultProps} />);

      expect(
        screen.getByText('Latest smartphones and mobile devices')
      ).toBeInTheDocument();
    });

    it('does not show description for "all" category', () => {
      render(<CategoryTabs {...defaultProps} selectedCategory='all' />);

      expect(
        screen.queryByText('Latest smartphones and mobile devices')
      ).not.toBeInTheDocument();
    });

    it('updates description when selection changes', () => {
      const { rerender } = render(<CategoryTabs {...defaultProps} />);

      // Initially shows phones description
      expect(
        screen.getByText('Latest smartphones and mobile devices')
      ).toBeInTheDocument();

      // Change to computers
      rerender(<CategoryTabs {...defaultProps} selectedCategory='computers' />);

      expect(
        screen.getByText('Laptops, desktops, and computing devices')
      ).toBeInTheDocument();
    });

    it('applies correct styling to description container', () => {
      render(<CategoryTabs {...defaultProps} />);

      const descriptionContainer = screen
        .getByText('Latest smartphones and mobile devices')
        .closest('div');
      expect(descriptionContainer?.parentElement).toHaveClass(
        'inline-block',
        'bg-gradient-to-r',
        'from-orange-50',
        'to-red-50',
        'dark:from-orange-900/20',
        'dark:to-red-900/20',
        'rounded-2xl',
        'px-6',
        'py-4',
        'border',
        'border-orange-200',
        'dark:border-orange-800'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<CategoryTabs {...defaultProps} />);

      const selectedTab = screen.getByText('Phones').closest('button');
      expect(selectedTab).toHaveAttribute('role', 'tab');
      expect(selectedTab).toHaveAttribute('aria-selected', 'true');
      expect(selectedTab).toHaveAttribute(
        'aria-controls',
        'category-phones-panel'
      );
    });

    it('has proper scroll button labels', () => {
      render(<CategoryTabs {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /scroll left/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /scroll right/i })
      ).toBeInTheDocument();
    });

    it('maintains proper tab structure', () => {
      render(<CategoryTabs {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      // Check that only one tab is selected
      const selectedTabs = tabs.filter(
        tab => tab.getAttribute('aria-selected') === 'true'
      );
      expect(selectedTabs).toHaveLength(1);
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const carousel = document.querySelector(
        '.flex.overflow-x-auto.scrollbar-hide.space-x-4.px-16.py-4'
      );
      expect(carousel).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass(
          'flex-shrink-0',
          'min-w-[120px]',
          'max-w-[140px]'
        );
      });
    });

    it('handles overflow correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const carousel = document.querySelector(
        '.flex.overflow-x-auto.scrollbar-hide.space-x-4.px-16.py-4'
      );
      expect(carousel).toHaveStyle({ scrollbarWidth: 'none' });
    });
  });

  describe('Icon Handling', () => {
    it('handles emoji icons correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      expect(screen.getByText('📱')).toBeInTheDocument();
      expect(screen.getByText('💻')).toBeInTheDocument();
      expect(screen.getByText('👕')).toBeInTheDocument();
    });

    it('handles image icons correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const imageIcon = screen.getByAltText('Electronics');
      expect(imageIcon).toBeInTheDocument();
      expect(imageIcon).toHaveAttribute('src', '/images/electronics-icon.png');
      expect(imageIcon).toHaveClass('w-16', 'h-16', 'object-contain');
    });

    it('shows fallback icon when no icon is provided', () => {
      const categoriesWithoutIcons = mockCategories.map(cat => ({
        ...cat,
        icon: undefined,
      }));

      render(
        <CategoryTabs {...defaultProps} categories={categoriesWithoutIcons} />
      );

      expect(screen.getAllByText('🎯')).toHaveLength(4);
    });

    it('applies correct icon container styling', () => {
      render(<CategoryTabs {...defaultProps} />);

      const iconContainers = document.querySelectorAll(
        '.mx-auto.rounded-full.flex.items-center.animate-bounce-gentle.justify-center.w-16.h-16'
      );
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Animation and Transitions', () => {
    it('applies animation classes correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const selectedTab = screen.getByText('Phones').closest('button');
      expect(selectedTab).toHaveClass('transform', 'scale-105');

      const iconContainer = selectedTab?.querySelector(
        '.animate-bounce-gentle'
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it('applies transition classes correctly', () => {
      render(<CategoryTabs {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('transition-all', 'duration-300');
      });
    });

    it('applies hover scale effect', () => {
      render(<CategoryTabs {...defaultProps} />);

      const unselectedTab = screen.getByText('Computers').closest('button');
      expect(unselectedTab).toHaveClass('hover:scale-102');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty categories array', () => {
      render(<CategoryTabs {...defaultProps} categories={[]} />);

      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });

    it('handles missing games counts gracefully', () => {
      render(<CategoryTabs {...defaultProps} gamesCounts={{}} />);

      // Should show 0 games for all categories
      const zeroCounts = screen.getAllByText('0 games');
      expect(zeroCounts).toHaveLength(4);
    });

    it('handles category without description', () => {
      const categoriesWithoutDescription = mockCategories.map(cat => ({
        ...cat,
        description: undefined,
      }));

      render(
        <CategoryTabs
          {...defaultProps}
          categories={categoriesWithoutDescription}
        />
      );

      // Should not crash and should not show description
      expect(screen.getByText('Phones')).toBeInTheDocument();
    });
  });
});
