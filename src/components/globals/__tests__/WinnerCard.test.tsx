import { render, screen } from '@testing-library/react';
import { WinnerCard } from '../WinnerCard';

// Mock the Card component
jest.mock('../Card', () => ({
  Card: ({ children, className, variant }: any) => (
    <div data-testid='card' className={className} data-variant={variant}>
      {children}
    </div>
  ),
}));

describe('WinnerCard', () => {
  const mockWinner = {
    name: 'John Doe',
    date: '2024-01-15',
    contest: 'iPhone 15 Pro Lottery',
    numbers: '7-14-23-45-67-89',
  };

  it('renders winner information correctly', () => {
    render(<WinnerCard winner={mockWinner} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15 Pro Lottery')).toBeInTheDocument();
    expect(screen.getByText('7-14-23-45-67-89')).toBeInTheDocument();
  });

  it('renders the award icon', () => {
    render(<WinnerCard winner={mockWinner} />);

    const icon = document.querySelector('.w-6.h-6.text-white');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<WinnerCard winner={mockWinner} className='custom-winner-card' />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-winner-card');
  });

  it('uses elevated variant for Card component', () => {
    render(<WinnerCard winner={mockWinner} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-variant', 'elevated');
  });

  it('has correct base container styling', () => {
    render(<WinnerCard winner={mockWinner} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6', 'hover:-translate-y-2');
  });

  it('has correct icon container styling', () => {
    render(<WinnerCard winner={mockWinner} />);

    const iconContainer = document.querySelector('.w-12.h-12.rounded-full');
    expect(iconContainer).toHaveClass(
      'w-12',
      'h-12',
      'rounded-full',
      'bg-gradient-to-r',
      'from-orange-500',
      'to-orange-600',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('has correct winner name styling', () => {
    render(<WinnerCard winner={mockWinner} />);

    const name = screen.getByText('John Doe');
    expect(name).toHaveClass(
      'font-semibold',
      'text-slate-900',
      'dark:text-white'
    );
  });

  it('has correct date styling', () => {
    render(<WinnerCard winner={mockWinner} />);

    const date = screen.getByText('2024-01-15');
    expect(date).toHaveClass(
      'text-sm',
      'text-slate-600',
      'dark:text-slate-400'
    );
  });

  it('has correct contest and numbers styling', () => {
    render(<WinnerCard winner={mockWinner} />);

    const contestText = screen.getByText('Contest:');
    const numbersText = screen.getByText('Numbers:');

    expect(contestText).toHaveClass('font-medium');
    expect(numbersText).toHaveClass('font-medium');
  });

  it('handles long winner names', () => {
    const longNameWinner = {
      ...mockWinner,
      name: 'This is a very long winner name that might wrap to multiple lines',
    };

    render(<WinnerCard winner={longNameWinner} />);

    expect(screen.getByText(longNameWinner.name)).toBeInTheDocument();
  });

  it('handles long contest names', () => {
    const longContestWinner = {
      ...mockWinner,
      contest:
        'This is a very long contest name that might wrap to multiple lines in the UI',
    };

    render(<WinnerCard winner={longContestWinner} />);

    expect(screen.getByText(longContestWinner.contest)).toBeInTheDocument();
  });

  it('handles long number sequences', () => {
    const longNumbersWinner = {
      ...mockWinner,
      numbers: '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20',
    };

    render(<WinnerCard winner={longNumbersWinner} />);

    expect(screen.getByText(longNumbersWinner.numbers)).toBeInTheDocument();
  });

  it('handles special characters in winner data', () => {
    const specialWinner = {
      name: "José María O'Connor-Smith",
      date: '2024-01-15',
      contest: 'iPhone 15 Pro & MacBook Air Lottery! 🎉',
      numbers: '7-14-23-45-67-89',
    };

    render(<WinnerCard winner={specialWinner} />);

    expect(screen.getByText(specialWinner.name)).toBeInTheDocument();
    expect(screen.getByText(specialWinner.contest)).toBeInTheDocument();
  });

  it('combines custom and default classes correctly', () => {
    render(<WinnerCard winner={mockWinner} className='my-custom-winner' />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('my-custom-winner', 'p-6', 'hover:-translate-y-2');
  });

  it('has proper accessibility structure', () => {
    render(<WinnerCard winner={mockWinner} />);

    const name = screen.getByRole('heading', { level: 3 });
    expect(name).toBeInTheDocument();
    expect(name).toHaveTextContent('John Doe');
  });

  it('renders contest and numbers with proper labels', () => {
    render(<WinnerCard winner={mockWinner} />);

    expect(screen.getByText('Contest:')).toBeInTheDocument();
    expect(screen.getByText('Numbers:')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15 Pro Lottery')).toBeInTheDocument();
    expect(screen.getByText('7-14-23-45-67-89')).toBeInTheDocument();
  });

  it('maintains consistent spacing and layout', () => {
    render(<WinnerCard winner={mockWinner} />);

    const iconContainer = document.querySelector('.w-12.h-12.rounded-full');
    const contestContainer = document.querySelector('.space-y-2');

    expect(iconContainer?.parentElement).toHaveClass(
      'flex',
      'items-center',
      'space-x-4',
      'mb-4'
    );
    expect(contestContainer).toHaveClass('space-y-2');
  });

  it('handles different date formats', () => {
    const differentDateFormats = [
      '2024-01-15',
      '15/01/2024',
      'January 15, 2024',
      '15.01.2024',
    ];

    differentDateFormats.forEach(dateFormat => {
      const winnerWithDate = { ...mockWinner, date: dateFormat };
      const { unmount } = render(<WinnerCard winner={winnerWithDate} />);

      expect(screen.getByText(dateFormat)).toBeInTheDocument();
      unmount();
    });
  });
});
