import { render, screen } from '@testing-library/react';
import { HomePageClient } from '../HomePageClient';

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

// Mock react-i18next
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    'common.currentLanguage': 'Current Language',
    'common.english': 'English',
    'common.french': 'French',
  };
  return translations[key] || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock HomePageComponent
jest.mock('../../home/components/home', () => ({
  __esModule: true,
  default: () => <div data-testid='home-page-component'>Home Page Content</div>,
}));

describe('HomePageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with language switcher banner', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByLabelText('Language switcher')).toBeInTheDocument();
    });

    it('renders the home page component', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByTestId('home-page-component')).toBeInTheDocument();
      expect(screen.getByText('Home Page Content')).toBeInTheDocument();
    });

    it('displays current language information', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('🌍 Current Language:')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('displays language switcher links', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByLabelText('Switch to English')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to French')).toBeInTheDocument();
    });

    it('shows flag emojis for languages', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    });
  });

  describe('Locale Handling', () => {
    it('displays English locale correctly', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('displays French locale correctly', () => {
      render(<HomePageClient locale='fr' />);

      expect(screen.getByText('FR')).toBeInTheDocument();
    });

    it('displays other locales correctly', () => {
      render(<HomePageClient locale='de' />);

      expect(screen.getByText('DE')).toBeInTheDocument();
    });

    it('handles empty locale gracefully', () => {
      render(<HomePageClient locale='' />);

      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('handles undefined locale gracefully', () => {
      render(<HomePageClient locale={undefined as any} />);

      expect(screen.getByText('UNDEFINED')).toBeInTheDocument();
    });
  });

  describe('Language Switcher Links', () => {
    it('has correct English link', () => {
      render(<HomePageClient locale='en' />);

      const englishLink = screen.getByLabelText('Switch to English');
      expect(englishLink).toHaveAttribute('href', '/en');
    });

    it('has correct French link', () => {
      render(<HomePageClient locale='en' />);

      const frenchLink = screen.getByLabelText('Switch to French');
      expect(frenchLink).toHaveAttribute('href', '/fr');
    });

    it('applies correct styling to language links', () => {
      render(<HomePageClient locale='en' />);

      const englishLink = screen.getByLabelText('Switch to English');
      expect(englishLink).toHaveClass(
        'underline',
        'hover:text-[#FF9800]',
        'text-xs',
        'sm:text-sm',
        'flex',
        'items-center',
        'space-x-1'
      );
    });

    it('shows full language names on larger screens', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
    });

    it('shows abbreviated language codes on small screens', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('FR')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive flex classes to banner', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      const flexContainer = banner.querySelector(
        '.flex.flex-col.sm\\:flex-row'
      );
      expect(flexContainer).toBeInTheDocument();
    });

    it('applies responsive spacing classes', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      const spacingContainer = banner.querySelector(
        '.space-y-1.sm\\:space-y-0'
      );
      expect(spacingContainer).toBeInTheDocument();
    });

    it('applies responsive padding classes', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('py-2', 'px-3', 'sm:px-4');
    });

    it('applies responsive text sizes', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      const textElements = banner.querySelectorAll('.text-xs.sm\\:text-sm');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('applies responsive margin classes', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      const marginElement = banner.querySelector('.sm\\:ml-4');
      expect(marginElement).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct background color to banner', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('bg-[#FF5722]');
    });

    it('applies correct text color to banner', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      expect(banner).toHaveClass('text-white');
    });

    it('applies correct hover colors to language links', () => {
      render(<HomePageClient locale='en' />);

      const englishLink = screen.getByLabelText('Switch to English');
      expect(englishLink).toHaveClass('hover:text-[#FF9800]');
    });

    it('applies correct styling to separator', () => {
      render(<HomePageClient locale='en' />);

      const separator = screen.getByText('|');
      expect(separator).toHaveClass('text-white/80');
    });

    it('applies correct flexbox classes', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      const flexContainer = banner.querySelector(
        '.flex.flex-col.sm\\:flex-row'
      );
      expect(flexContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('applies correct alignment classes', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      const alignContainer = banner.querySelector(
        '.items-center.justify-center'
      );
      expect(alignContainer).toHaveClass('items-center', 'justify-center');
    });
  });

  describe('Accessibility', () => {
    it('has proper banner role', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();
    });

    it('has proper aria-label for banner', () => {
      render(<HomePageClient locale='en' />);

      const banner = screen.getByLabelText('Language switcher');
      expect(banner).toBeInTheDocument();
    });

    it('has proper aria-labels for language links', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByLabelText('Switch to English')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to French')).toBeInTheDocument();
    });

    it('has proper link structure', () => {
      render(<HomePageClient locale='en' />);

      const englishLink = screen.getByLabelText('Switch to English');
      const frenchLink = screen.getByLabelText('Switch to French');

      expect(englishLink.tagName).toBe('A');
      expect(frenchLink.tagName).toBe('A');
    });
  });

  describe('Internationalization', () => {
    it('uses translation function for text content', () => {
      render(<HomePageClient locale='en' />);

      expect(mockT).toHaveBeenCalledWith('common.currentLanguage');
      expect(mockT).toHaveBeenCalledWith('common.english');
      expect(mockT).toHaveBeenCalledWith('common.french');
    });

    it('displays translated content correctly', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('Current Language:')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
    });

    it('handles missing translations gracefully', () => {
      // Mock missing translation
      const mockTWithMissing = jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'common.currentLanguage': 'Current Language',
          // Missing English and French translations
        };
        return translations[key] || key;
      });

      jest.doMock('react-i18next', () => ({
        useTranslation: () => ({
          t: mockTWithMissing,
        }),
      }));

      render(<HomePageClient locale='en' />);

      // Should fall back to translation keys
      expect(screen.getByText('common.english')).toBeInTheDocument();
      expect(screen.getByText('common.french')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders in correct order', () => {
      render(<HomePageClient locale='en' />);

      const container = screen.getByTestId('home-page-component').parentElement;
      const banner = container?.querySelector('[role="banner"]');
      const homeComponent = container?.querySelector(
        '[data-testid="home-page-component"]'
      );

      expect(banner).toBeInTheDocument();
      expect(homeComponent).toBeInTheDocument();
      expect(container?.children[0]).toBe(banner);
      expect(container?.children[1]).toBe(homeComponent);
    });

    it('has proper container structure', () => {
      render(<HomePageClient locale='en' />);

      const container = screen.getByTestId('home-page-component').parentElement;
      expect(container?.tagName).toBe('DIV');
    });
  });

  describe('Props Validation', () => {
    it('accepts string locale prop', () => {
      render(<HomePageClient locale='en' />);

      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('handles different locale values', () => {
      const { rerender } = render(<HomePageClient locale='en' />);

      expect(screen.getByText('EN')).toBeInTheDocument();

      rerender(<HomePageClient locale='fr' />);

      expect(screen.getByText('FR')).toBeInTheDocument();
    });

    it('handles locale prop changes', () => {
      const { rerender } = render(<HomePageClient locale='en' />);

      expect(screen.getByText('EN')).toBeInTheDocument();

      rerender(<HomePageClient locale='es' />);

      expect(screen.getByText('ES')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long locale strings', () => {
      render(<HomePageClient locale='very-long-locale-string' />);

      expect(screen.getByText('VERY-LONG-LOCALE-STRING')).toBeInTheDocument();
    });

    it('handles special characters in locale', () => {
      render(<HomePageClient locale='en-US' />);

      expect(screen.getByText('EN-US')).toBeInTheDocument();
    });

    it('handles numeric locale strings', () => {
      render(<HomePageClient locale='123' />);

      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });
});
