import { fireEvent, render, screen } from '@testing-library/react';
import { LocaleSwitcher, LocaleSwitcherCompact } from '../LocaleSwitcher';

// Mock next/navigation
const mockPathname = '/en/dashboard';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

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
const mockI18n = {
  language: 'en',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset pathname
    Object.defineProperty(
      jest.requireActual('next/navigation'),
      'usePathname',
      {
        value: () => mockPathname,
        writable: true,
      }
    );
  });

  describe('Main LocaleSwitcher', () => {
    it('renders the locale switcher button', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      expect(button).toBeInTheDocument();
    });

    it('displays current locale code', () => {
      render(<LocaleSwitcher />);

      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('shows globe icon', () => {
      render(<LocaleSwitcher />);

      const globeIcon = document.querySelector('svg[class*="lucide-globe"]');
      expect(globeIcon).toBeInTheDocument();
    });

    it('shows chevron down icon', () => {
      render(<LocaleSwitcher />);

      const chevronIcon = document.querySelector(
        'svg[class*="lucide-chevron-down"]'
      );
      expect(chevronIcon).toBeInTheDocument();
    });

    it('opens dropdown when clicked', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('rotates chevron when dropdown is open', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const chevronIcon = document.querySelector(
        'svg[class*="lucide-chevron-down"]'
      );
      expect(chevronIcon).toHaveClass('rotate-180');
    });

    it('displays all supported locales', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('🇫🇷')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('highlights current locale as active', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const activeLocale = screen.getByText('English').closest('a');
      expect(activeLocale).toHaveClass(
        'bg-orange-700',
        'text-white',
        'dark:bg-orange-600'
      );
    });

    it('shows active badge for current locale', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('generates correct locale paths', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/dashboard');
      expect(frenchLink).toHaveAttribute('href', '/fr/dashboard');
    });

    it('handles root path correctly', () => {
      // Mock root pathname
      Object.defineProperty(
        jest.requireActual('next/navigation'),
        'usePathname',
        {
          value: () => '/en',
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/');
      expect(frenchLink).toHaveAttribute('href', '/fr/');
    });

    it('handles path without locale prefix', () => {
      // Mock pathname without locale
      Object.defineProperty(
        jest.requireActual('next/navigation'),
        'usePathname',
        {
          value: () => '/dashboard',
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/dashboard');
      expect(frenchLink).toHaveAttribute('href', '/fr/dashboard');
    });

    it('closes dropdown when clicking outside', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('closes dropdown when locale is selected', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();

      const frenchLink = screen.getByText('Français');
      fireEvent.click(frenchLink);

      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('applies correct styling to dropdown', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const dropdown = screen.getByText('English').closest('div');
      expect(dropdown?.parentElement).toHaveClass(
        'absolute',
        'right-0',
        'mt-2',
        'w-48',
        'bg-white/90',
        'dark:bg-black/90',
        'backdrop-blur-md',
        'rounded-lg',
        'shadow-lg',
        'border',
        'border-gray-200/50',
        'dark:border-gray-700/50',
        'z-50'
      );
    });

    it('applies hover effects to locale options', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const frenchLink = screen.getByText('Français').closest('a');
      expect(frenchLink).toHaveClass(
        'text-gray-700',
        'dark:text-gray-300',
        'hover:bg-gray-100/80',
        'dark:hover:bg-gray-800/80'
      );
    });
  });

  describe('LocaleSwitcherCompact', () => {
    it('renders the compact locale switcher button', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      expect(button).toBeInTheDocument();
    });

    it('displays current locale code in compact format', () => {
      render(<LocaleSwitcherCompact />);

      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('shows globe icon', () => {
      render(<LocaleSwitcherCompact />);

      const globeIcon = document.querySelector('svg[class*="lucide-globe"]');
      expect(globeIcon).toBeInTheDocument();
    });

    it('opens compact dropdown when clicked', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('🇫🇷')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('FR')).toBeInTheDocument();
    });

    it('displays compact locale information', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      // Should show flags and codes, not full names
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('🇫🇷')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('FR')).toBeInTheDocument();

      // Should not show full names
      expect(screen.queryByText('English')).not.toBeInTheDocument();
      expect(screen.queryByText('Français')).not.toBeInTheDocument();
    });

    it('highlights current locale as active in compact mode', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const activeLocale = screen.getByText('EN').closest('a');
      expect(activeLocale).toHaveClass('bg-orange-500', 'text-white');
    });

    it('generates correct locale paths in compact mode', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('EN').closest('a');
      const frenchLink = screen.getByText('FR').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/dashboard');
      expect(frenchLink).toHaveAttribute('href', '/fr/dashboard');
    });

    it('applies compact styling to dropdown', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const dropdown = screen.getByText('EN').closest('div');
      expect(dropdown?.parentElement).toHaveClass(
        'absolute',
        'right-0',
        'mt-1',
        'w-32',
        'bg-white/90',
        'dark:bg-black/90',
        'backdrop-blur-md',
        'rounded-lg',
        'shadow-lg',
        'border',
        'border-gray-200/50',
        'dark:border-gray-700/50',
        'z-50'
      );
    });

    it('closes dropdown when clicking outside in compact mode', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('EN')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('EN')).not.toBeInTheDocument();
    });

    it('closes dropdown when locale is selected in compact mode', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      expect(screen.getByText('EN')).toBeInTheDocument();

      const frenchLink = screen.getByText('FR');
      fireEvent.click(frenchLink);

      expect(screen.queryByText('EN')).not.toBeInTheDocument();
    });
  });

  describe('Path Handling', () => {
    it('handles null pathname gracefully', () => {
      // Mock null pathname
      Object.defineProperty(
        jest.requireActual('next/navigation'),
        'usePathname',
        {
          value: () => null,
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/');
      expect(frenchLink).toHaveAttribute('href', '/fr/');
    });

    it('handles complex nested paths', () => {
      // Mock complex pathname
      Object.defineProperty(
        jest.requireActual('next/navigation'),
        'usePathname',
        {
          value: () => '/en/dashboard/games/123',
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/dashboard/games/123');
      expect(frenchLink).toHaveAttribute('href', '/fr/dashboard/games/123');
    });

    it('handles paths with query parameters', () => {
      // Mock pathname with query params
      Object.defineProperty(
        jest.requireActual('next/navigation'),
        'usePathname',
        {
          value: () => '/en/search?q=test',
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en/search?q=test');
      expect(frenchLink).toHaveAttribute('href', '/fr/search?q=test');
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      expect(button).toHaveAttribute('aria-label', 'Switch language');
    });

    it('has proper link structure', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toBeInTheDocument();
      expect(frenchLink).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      button.focus();

      fireEvent.click(button);

      // Dropdown should be visible
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('hides locale code on small screens in main switcher', () => {
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      const localeCode = button.querySelector('.hidden.sm\\:inline');

      expect(localeCode).toHaveClass('hidden', 'sm:inline');
    });

    it('shows compact layout for mobile in compact switcher', () => {
      render(<LocaleSwitcherCompact />);

      const button = screen.getByRole('button', { name: /switch language/i });
      const localeCode = button.querySelector('.text-xs');

      expect(localeCode).toHaveClass('text-xs');
    });
  });

  describe('Edge Cases', () => {
    it('handles unsupported locales gracefully', () => {
      // Mock unsupported locale
      Object.defineProperty(
        jest.requireActual('react-i18next'),
        'useTranslation',
        {
          value: () => ({
            i18n: { language: 'de' },
          }),
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      // Should still show available locales
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('handles empty path segments', () => {
      // Mock pathname with empty segments
      Object.defineProperty(
        jest.requireActual('next/navigation'),
        'usePathname',
        {
          value: () => '/en//dashboard',
          writable: true,
        }
      );

      render(<LocaleSwitcher />);

      const button = screen.getByRole('button', { name: /switch language/i });
      fireEvent.click(button);

      const englishLink = screen.getByText('English').closest('a');
      const frenchLink = screen.getByText('Français').closest('a');

      expect(englishLink).toHaveAttribute('href', '/en//dashboard');
      expect(frenchLink).toHaveAttribute('href', '/fr//dashboard');
    });
  });
});
