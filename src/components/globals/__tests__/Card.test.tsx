import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('renders with default variant', () => {
    render(<Card>Card content</Card>);
    
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white/80', 'dark:bg-slate-800/50', 'backdrop-blur-sm');
  });

  it('renders with elevated variant', () => {
    render(<Card variant="elevated">Elevated card</Card>);
    
    const card = screen.getByText('Elevated card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white/90', 'dark:bg-slate-800/70', 'shadow-lg', 'hover:shadow-xl');
  });

  it('renders with outlined variant', () => {
    render(<Card variant="outlined">Outlined card</Card>);
    
    const card = screen.getByText('Outlined card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-transparent', 'border-2', 'border-slate-200', 'dark:border-slate-700');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom card</Card>);
    
    const card = screen.getByText('Custom card');
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Ref card</Card>);
    
    expect(ref.current).toBeInTheDocument();
    expect(ref.current).toHaveTextContent('Ref card');
  });

  it('forwards additional props', () => {
    render(<Card data-testid="test-card" aria-label="Test card">Props card</Card>);
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('aria-label', 'Test card');
  });

  it('has correct base classes', () => {
    render(<Card>Base card</Card>);
    
    const card = screen.getByText('Base card');
    expect(card).toHaveClass('rounded-2xl', 'transition-all', 'duration-300');
  });

  it('handles empty content', () => {
    const { container } = render(<Card />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white/80', 'dark:bg-slate-800/50');
  });

  it('combines variant and custom classes', () => {
    render(<Card variant="elevated" className="my-custom-class">Combined card</Card>);
    
    const card = screen.getByText('Combined card');
    expect(card).toHaveClass('my-custom-class', 'shadow-lg', 'hover:shadow-xl');
  });

  it('has correct display name', () => {
    expect(Card.displayName).toBe('Card');
  });
});
