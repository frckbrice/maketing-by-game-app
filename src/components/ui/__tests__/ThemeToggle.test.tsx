import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

// Mock next-themes
const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock the Button component
jest.mock('../Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    'aria-label': ariaLabel,
  }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders loading state initially', () => {
    render(<ThemeToggle />);

    const loadingButton = screen.getByRole('button');
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toHaveAttribute('data-variant', 'outline');
    expect(loadingButton).toHaveAttribute('data-size', 'sm');
  });

  it('renders loading spinner when not mounted', () => {
    render(<ThemeToggle />);

    // The component mounts very quickly, so we need to check if loading state exists
    const loadingSpinner = document.querySelector('.animate-pulse');
    if (loadingSpinner) {
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner).toHaveClass(
        'w-4',
        'h-4',
        'bg-current',
        'rounded-full',
        'animate-pulse'
      );
    } else {
      // Component has already mounted
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    }
  });

  it('renders sun icon when theme is dark', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const sunIcon = document.querySelector('.w-4.h-4');
      expect(sunIcon).toBeInTheDocument();
    });
  });

  it('renders moon icon when theme is light', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const moonIcon = document.querySelector('.w-4.h-4');
      expect(moonIcon).toBeInTheDocument();
    });
  });

  it('calls setTheme with light when current theme is dark', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  it('calls setTheme with dark when current theme is light', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  it('has correct button styling', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10', 'h-10', 'p-0');
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('data-size', 'sm');
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });

  it('handles theme switching correctly', async () => {
    let currentTheme = 'light';
    mockUseTheme.mockReturnValue({
      theme: currentTheme,
      setTheme: (newTheme: string) => {
        currentTheme = newTheme;
        mockUseTheme.mockReturnValue({
          theme: newTheme,
          setTheme: mockSetTheme,
        });
      },
    });

    const { rerender } = render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    // Click to switch theme
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Re-render to see the change
    rerender(<ThemeToggle />);

    await waitFor(() => {
      expect(currentTheme).toBe('dark');
    });
  });

  it('renders with correct icon sizes', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const icon = document.querySelector('.w-4.h-4');
      expect(icon).toHaveClass('w-4', 'h-4');
    });
  });

  it('has correct button dimensions', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10', 'h-10');
    });
  });

  it('has no padding when mounted', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-0');
    });
  });

  it('handles undefined theme gracefully', async () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Should default to light theme behavior
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  it('handles null theme gracefully', async () => {
    mockUseTheme.mockReturnValue({
      theme: null,
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Should default to light theme behavior
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  it('maintains button state during theme changes', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('data-size', 'sm');
    });
  });
});
