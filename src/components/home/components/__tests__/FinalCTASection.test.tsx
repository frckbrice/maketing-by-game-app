import { render, screen } from '@testing-library/react';
import { FinalCTASection } from '../FinalCTASection';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'home.cta.badge': 'Ready to Win?',
        'home.cta.title': 'Join the Lottery Revolution',
        'home.cta.subtitle': 'Start playing today and win amazing prizes',
        'home.cta.primaryButton': 'Get Started Now',
        'home.cta.secondaryButton': 'Learn More',
        'home.cta.trust.productsWon': '10,000+ Products Won',
        'home.cta.trust.prizeValue': '$2.5M+ Prize Value',
        'home.cta.trust.authenticProducts': '100% Authentic Products',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, className, variant, onClick }: any) => (
    <button className={className} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('FinalCTASection', () => {
  it('renders with light theme', () => {
    render(<FinalCTASection isDark={false} />);

    expect(screen.getByText('Ready to Win?')).toBeInTheDocument();
    expect(screen.getByText('Join the Lottery Revolution')).toBeInTheDocument();
    expect(
      screen.getByText('Start playing today and win amazing prizes')
    ).toBeInTheDocument();
  });

  it('renders with dark theme', () => {
    render(<FinalCTASection isDark={true} />);

    expect(screen.getByText('Ready to Win?')).toBeInTheDocument();
    expect(screen.getByText('Join the Lottery Revolution')).toBeInTheDocument();
    expect(
      screen.getByText('Start playing today and win amazing prizes')
    ).toBeInTheDocument();
  });

  it('renders primary button correctly', () => {
    render(<FinalCTASection isDark={false} />);

    const primaryButton = screen.getByText('Get Started Now');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton.closest('button')).toHaveClass(
      'px-12',
      'py-4',
      'text-xl',
      'font-bold'
    );
  });

  it('renders secondary button correctly', () => {
    render(<FinalCTASection isDark={false} />);

    const secondaryButton = screen.getByText('Learn More');
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton.closest('button')).toHaveAttribute(
      'data-variant',
      'outline'
    );
  });

  it('renders trust indicators correctly', () => {
    render(<FinalCTASection isDark={false} />);

    expect(screen.getByText('10,000+ Products Won')).toBeInTheDocument();
    expect(screen.getByText('$2.5M+ Prize Value')).toBeInTheDocument();
    expect(screen.getByText('100% Authentic Products')).toBeInTheDocument();
  });

  it('applies light theme styling correctly', () => {
    render(<FinalCTASection isDark={false} />);

    const section = screen.getByText('Ready to Win?').closest('section');
    expect(section).toHaveClass(
      'bg-gradient-to-r',
      'from-gray-100',
      'via-white',
      'to-gray-100'
    );
  });

  it('applies dark theme styling correctly', () => {
    render(<FinalCTASection isDark={true} />);

    const section = screen.getByText('Ready to Win?').closest('section');
    expect(section).toHaveClass(
      'bg-gradient-to-r',
      'from-black',
      'via-gray-900',
      'to-black'
    );
  });

  it('has correct badge styling for light theme', () => {
    render(<FinalCTASection isDark={false} />);

    const badge = screen.getByText('Ready to Win?');
    expect(badge).toHaveClass(
      'border-orange-300/50',
      'text-orange-600',
      'bg-orange-100/30'
    );
  });

  it('has correct badge styling for dark theme', () => {
    render(<FinalCTASection isDark={true} />);

    const badge = screen.getByText('Ready to Win?');
    expect(badge).toHaveClass(
      'border-orange-500/30',
      'text-orange-400',
      'bg-orange-500/5'
    );
  });

  it('has correct title styling for light theme', () => {
    render(<FinalCTASection isDark={false} />);

    const title = screen.getByText('Join the Lottery Revolution');
    expect(title).toHaveClass(
      'text-4xl',
      'lg:text-5xl',
      'font-bold',
      'mb-6',
      'text-gray-900'
    );
  });

  it('has correct title styling for dark theme', () => {
    render(<FinalCTASection isDark={true} />);

    const title = screen.getByText('Join the Lottery Revolution');
    expect(title).toHaveClass(
      'text-4xl',
      'lg:text-5xl',
      'font-bold',
      'mb-6',
      'text-white'
    );
  });

  it('has correct subtitle styling for light theme', () => {
    render(<FinalCTASection isDark={false} />);

    const subtitle = screen.getByText(
      'Start playing today and win amazing prizes'
    );
    expect(subtitle).toHaveClass(
      'text-xl',
      'mb-8',
      'max-w-2xl',
      'mx-auto',
      'text-gray-600'
    );
  });

  it('has correct subtitle styling for dark theme', () => {
    render(<FinalCTASection isDark={true} />);

    const subtitle = screen.getByText(
      'Start playing today and win amazing prizes'
    );
    expect(subtitle).toHaveClass(
      'text-xl',
      'mb-8',
      'max-w-2xl',
      'mx-auto',
      'text-gray-300'
    );
  });

  it('has correct button container styling', () => {
    render(<FinalCTASection isDark={false} />);

    const buttonContainer = document.querySelector(
      '.flex.flex-col.sm\\:flex-row.gap-4.justify-center.items-center.mb-12'
    );
    expect(buttonContainer).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
      'gap-4',
      'justify-center',
      'items-center',
      'mb-12'
    );
  });

  it('has correct trust indicators container styling', () => {
    render(<FinalCTASection isDark={false} />);

    const trustContainer = screen
      .getByText('10,000+ Products Won')
      .closest('div')?.parentElement;
    expect(trustContainer).toHaveClass(
      'flex',
      'justify-center',
      'items-center',
      'gap-8',
      'flex-wrap'
    );
  });

  it('renders arrow icon in primary button', () => {
    render(<FinalCTASection isDark={false} />);

    const arrowIcon = document.querySelector('.w-6.h-6');
    expect(arrowIcon).toBeInTheDocument();
  });

  it('renders trust indicator icons', () => {
    render(<FinalCTASection isDark={false} />);

    const usersIcon = document.querySelector('svg[class*="w-5 h-5"]');
    expect(usersIcon).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<FinalCTASection isDark={false} />);

    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Join the Lottery Revolution');
  });

  it('has responsive design classes', () => {
    render(<FinalCTASection isDark={false} />);

    const container = document.querySelector(
      '.max-w-4xl.mx-auto.text-center.px-4.lg\\:px-8'
    );
    expect(container).toHaveClass(
      'max-w-4xl',
      'mx-auto',
      'text-center',
      'px-4',
      'lg:px-8'
    );
  });

  it('handles theme switching correctly', () => {
    const { rerender } = render(<FinalCTASection isDark={false} />);

    // Check light theme
    let section = screen.getByText('Ready to Win?').closest('section');
    expect(section).toHaveClass('from-gray-100', 'via-white', 'to-gray-100');

    // Switch to dark theme
    rerender(<FinalCTASection isDark={true} />);
    section = screen.getByText('Ready to Win?').closest('section');
    expect(section).toHaveClass('from-black', 'via-gray-900', 'to-black');
  });
});
