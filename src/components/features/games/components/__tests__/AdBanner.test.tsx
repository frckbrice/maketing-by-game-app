import { fireEvent, render, screen } from '@testing-library/react';
import { AdBanner, AdBannerSkeleton } from '../AdBanner';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('AdBanner', () => {
  const defaultProps = {
    type: 'horizontal' as const,
    title: 'Amazing Product',
    description: 'This is an amazing product that will change your life',
    ctaText: 'Learn More',
    ctaUrl: 'https://example.com',
    company: {
      name: 'Example Corp',
      logo: 'https://example.com/logo.png',
    },
    className: 'custom-class',
  };

  beforeEach(() => {
    // Mock window.open
    Object.defineProperty(window, 'open', {
      writable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<AdBanner {...defaultProps} />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('Amazing Product')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is an amazing product that will change your life'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText('Example Corp')).toBeInTheDocument();
      expect(screen.getByText('AD')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<AdBanner {...defaultProps} className='test-class' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('test-class');
    });

    it('renders without image when imageUrl is not provided', () => {
      const propsWithoutImage = { ...defaultProps, imageUrl: undefined };
      render(<AdBanner {...propsWithoutImage} />);

      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();
      expect(screen.getByText('Amazing Product')).toBeInTheDocument();
    });

    it('renders without company logo when logo is not provided', () => {
      const propsWithoutLogo = {
        ...defaultProps,
        company: { ...defaultProps.company, logo: undefined },
      };
      render(<AdBanner {...propsWithoutLogo} />);

      expect(screen.getByText('Example Corp')).toBeInTheDocument();
      // Should not have logo image
      expect(
        screen.queryByAltText('Example Corp logo')
      ).not.toBeInTheDocument();
    });
  });

  describe('Layout Types', () => {
    it('renders horizontal layout correctly', () => {
      render(<AdBanner {...defaultProps} type='horizontal' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('flex-row', 'items-center', 'h-32');
    });

    it('renders vertical layout correctly', () => {
      render(<AdBanner {...defaultProps} type='vertical' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('flex-col', 'h-64');
    });

    it('renders square layout correctly', () => {
      render(<AdBanner {...defaultProps} type='square' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('flex-col', 'aspect-square');
    });
  });

  describe('Image Handling', () => {
    it('renders image when imageUrl is provided', () => {
      render(
        <AdBanner {...defaultProps} imageUrl='https://example.com/image.jpg' />
      );

      const image = screen.getByAltText('Amazing Product');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('applies correct image classes for horizontal layout', () => {
      render(
        <AdBanner
          {...defaultProps}
          type='horizontal'
          imageUrl='https://example.com/image.jpg'
        />
      );

      const imageContainer =
        screen.getByAltText('Amazing Product').parentElement;
      expect(imageContainer).toHaveClass('w-32', 'h-full');
    });

    it('applies correct image classes for vertical layout', () => {
      render(
        <AdBanner
          {...defaultProps}
          type='vertical'
          imageUrl='https://example.com/image.jpg'
        />
      );

      const imageContainer =
        screen.getByAltText('Amazing Product').parentElement;
      expect(imageContainer).toHaveClass('w-full', 'h-40');
    });

    it('applies correct image classes for square layout', () => {
      render(
        <AdBanner
          {...defaultProps}
          type='square'
          imageUrl='https://example.com/image.jpg'
        />
      );

      const imageContainer =
        screen.getByAltText('Amazing Product').parentElement;
      expect(imageContainer).toHaveClass('w-full', 'flex-1');
    });
  });

  describe('Interactions', () => {
    it('opens URL in new tab when banner is clicked', () => {
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockOpen,
      });

      render(<AdBanner {...defaultProps} />);

      const banner = screen.getByRole('banner');
      fireEvent.click(banner);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('opens URL in new tab when CTA button is clicked', () => {
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockOpen,
      });

      render(<AdBanner {...defaultProps} />);

      const ctaButton = screen.getByRole('button', { name: 'Learn More' });
      fireEvent.click(ctaButton);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('logs ad click when banner is clicked', () => {
      render(<AdBanner {...defaultProps} />);

      const banner = screen.getByRole('banner');
      fireEvent.click(banner);

      expect(console.log).toHaveBeenCalledWith('Ad clicked:', {
        company: 'Example Corp',
        title: 'Amazing Product',
        ctaUrl: 'https://example.com',
      });
    });

    it('logs ad click when CTA button is clicked', () => {
      render(<AdBanner {...defaultProps} />);

      const cTAButton = screen.getByRole('button', { name: 'Learn More' });
      fireEvent.click(cTAButton);

      expect(console.log).toHaveBeenCalledWith('Ad clicked:', {
        company: 'Example Corp',
        title: 'Amazing Product',
        ctaUrl: 'https://example.com',
      });
    });
  });

  describe('Close Functionality', () => {
    it('renders close button when onClose is provided', () => {
      const onClose = jest.fn();
      render(<AdBanner {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', {
        name: 'Close advertisement',
      });
      expect(closeButton).toBeInTheDocument();
    });

    it('does not render close button when onClose is not provided', () => {
      render(<AdBanner {...defaultProps} />);

      const closeButton = screen.queryByRole('button', {
        name: 'Close advertisement',
      });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<AdBanner {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', {
        name: 'Close advertisement',
      });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hides banner when close button is clicked', () => {
      const onClose = jest.fn();
      render(<AdBanner {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', {
        name: 'Close advertisement',
      });
      fireEvent.click(closeButton);

      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });

    it('prevents banner click when close button is clicked', () => {
      const onClose = jest.fn();
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockOpen,
      });

      render(<AdBanner {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', {
        name: 'Close advertisement',
      });
      fireEvent.click(closeButton);

      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct banner role', () => {
      render(<AdBanner {...defaultProps} />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      render(<AdBanner {...defaultProps} />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveAttribute(
        'aria-label',
        'Advertisement: Amazing Product'
      );
    });

    it('has correct close button aria-label', () => {
      const onClose = jest.fn();
      render(<AdBanner {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', {
        name: 'Close advertisement',
      });
      expect(closeButton).toHaveAttribute('aria-label', 'Close advertisement');
    });

    it('has correct CTA button aria-label', () => {
      render(<AdBanner {...defaultProps} />);

      const ctaButton = screen.getByRole('button', { name: 'Learn More' });
      expect(ctaButton).toHaveAttribute('aria-label', 'Learn More');
    });
  });

  describe('Sponsored Content', () => {
    it('displays AD badge', () => {
      render(<AdBanner {...defaultProps} />);

      expect(screen.getByText('AD')).toBeInTheDocument();
    });

    it('displays sponsored text for horizontal layout', () => {
      render(<AdBanner {...defaultProps} type='horizontal' />);

      expect(screen.getByText('Sponsored')).toBeInTheDocument();
    });

    it('does not display sponsored text for vertical layout', () => {
      render(<AdBanner {...defaultProps} type='vertical' />);

      expect(screen.queryByText('Sponsored')).not.toBeInTheDocument();
    });

    it('does not display sponsored text for square layout', () => {
      render(<AdBanner {...defaultProps} type='square' />);

      expect(screen.queryByText('Sponsored')).not.toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('has hover classes for interactive elements', () => {
      render(<AdBanner {...defaultProps} />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass(
        'hover:border-blue-300',
        'dark:hover:border-blue-700'
      );
    });

    it('has hover effect for title', () => {
      render(<AdBanner {...defaultProps} />);

      const title = screen.getByText('Amazing Product');
      expect(title).toHaveClass(
        'group-hover:text-blue-600',
        'dark:group-hover:text-blue-400'
      );
    });

    it('has hover effect for CTA button', () => {
      render(<AdBanner {...defaultProps} />);

      const ctaButton = screen.getByRole('button', { name: 'Learn More' });
      expect(ctaButton).toHaveClass('hover:bg-blue-700');
    });
  });
});

describe('AdBannerSkeleton', () => {
  const defaultProps = {
    type: 'horizontal' as const,
    className: 'custom-class',
  };

  describe('Rendering', () => {
    it('renders skeleton with correct type', () => {
      render(<AdBannerSkeleton {...defaultProps} />);

      const skeleton = document.querySelector(
        '.bg-gray-100.dark\\:bg-gray-800.rounded-2xl.animate-pulse'
      );
      expect(skeleton).toHaveClass('flex-row', 'items-center', 'h-32');
    });

    it('renders with custom className', () => {
      render(<AdBannerSkeleton {...defaultProps} className='test-class' />);

      const skeleton = document.querySelector(
        '.bg-gray-100.dark\\:bg-gray-800.rounded-2xl.animate-pulse'
      );
      expect(skeleton).toHaveClass('test-class');
    });

    it('renders horizontal layout skeleton', () => {
      render(<AdBannerSkeleton {...defaultProps} type='horizontal' />);

      const skeleton = document.querySelector(
        '.bg-gray-100.dark\\:bg-gray-800.rounded-2xl.animate-pulse'
      );
      expect(skeleton).toHaveClass('flex-row', 'items-center', 'h-32');
    });

    it('renders vertical layout skeleton', () => {
      render(<AdBannerSkeleton {...defaultProps} type='vertical' />);

      const skeleton = document.querySelector(
        '.bg-gray-100.dark\\:bg-gray-800.rounded-2xl.animate-pulse'
      );
      expect(skeleton).toHaveClass('flex-col', 'h-64');
    });

    it('renders square layout skeleton', () => {
      render(<AdBannerSkeleton {...defaultProps} type='square' />);

      const skeleton = document.querySelector(
        '.bg-gray-100.dark\\:bg-gray-800.rounded-2xl.animate-pulse'
      );
      expect(skeleton).toHaveClass('flex-col', 'aspect-square');
    });
  });

  describe('Skeleton Elements', () => {
    it('renders image placeholder', () => {
      render(<AdBannerSkeleton {...defaultProps} />);

      const imagePlaceholder = document.querySelector('.bg-gray-200');
      expect(imagePlaceholder).toBeInTheDocument();
    });

    it('renders content placeholders', () => {
      render(<AdBannerSkeleton {...defaultProps} />);

      const placeholders = document.querySelectorAll('.bg-gray-200');
      expect(placeholders.length).toBeGreaterThan(1);
    });

    it('applies correct image classes for horizontal layout', () => {
      render(<AdBannerSkeleton {...defaultProps} type='horizontal' />);

      const imagePlaceholder = document.querySelector(
        '.bg-gray-200.dark\\:bg-gray-700.flex-shrink-0'
      );
      expect(imagePlaceholder).toHaveClass('w-32', 'h-full');
    });

    it('applies correct image classes for vertical layout', () => {
      render(<AdBannerSkeleton {...defaultProps} type='vertical' />);

      const imagePlaceholder = document.querySelector(
        '.bg-gray-200.dark\\:bg-gray-700.flex-shrink-0'
      );
      expect(imagePlaceholder).toHaveClass('w-full', 'h-40');
    });

    it('applies correct image classes for square layout', () => {
      render(<AdBannerSkeleton {...defaultProps} type='square' />);

      const imagePlaceholder = document.querySelector(
        '.bg-gray-200.dark\\:bg-gray-700.flex-shrink-0'
      );
      expect(imagePlaceholder).toHaveClass('w-full', 'flex-1');
    });
  });

  describe('Animation', () => {
    it('has pulse animation', () => {
      render(<AdBannerSkeleton {...defaultProps} />);

      const skeleton = document.querySelector(
        '.bg-gray-100.dark\\:bg-gray-800.rounded-2xl.animate-pulse'
      );
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });
});
