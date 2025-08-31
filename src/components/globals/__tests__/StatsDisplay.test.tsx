import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsDisplay } from '../StatsDisplay';

describe('StatsDisplay', () => {
  const mockStats = [
    { number: '1,234', label: 'Total Users' },
    { number: '567', label: 'Active Games' },
    { number: '89', label: 'Winners' },
  ];

  it('renders all stats correctly', () => {
    render(<StatsDisplay stats={mockStats} />);
    
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('567')).toBeInTheDocument();
    expect(screen.getByText('Active Games')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('Winners')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<StatsDisplay stats={mockStats} className="custom-stats" />);
    
    const container = document.querySelector('.grid.grid-cols-3');
    expect(container).toHaveClass('custom-stats');
  });

  it('has correct base container styling', () => {
    render(<StatsDisplay stats={mockStats} />);
    
    const container = document.querySelector('.grid.grid-cols-3');
    expect(container).toHaveClass('grid', 'grid-cols-3', 'gap-6', 'pt-8');
  });

  it('has correct stat number styling', () => {
    render(<StatsDisplay stats={mockStats} />);
    
    const statNumbers = screen.getAllByText(/1,234|567|89/);
    statNumbers.forEach(number => {
      expect(number).toHaveClass(
        'text-2xl', 'sm:text-3xl', 'font-bold', 'bg-gradient-to-r',
        'from-orange-500', 'to-orange-600', 'bg-clip-text', 'text-transparent', 'mb-2'
      );
    });
  });

  it('has correct stat label styling', () => {
    render(<StatsDisplay stats={mockStats} />);
    
    const statLabels = screen.getAllByText(/Total Users|Active Games|Winners/);
    statLabels.forEach(label => {
      expect(label).toHaveClass('text-sm', 'text-slate-600', 'dark:text-slate-400');
    });
  });

  it('handles numeric numbers', () => {
    const numericStats = [
      { number: 1234, label: 'Numeric Users' },
      { number: 567, label: 'Numeric Games' },
    ];
    
    render(<StatsDisplay stats={numericStats} />);
    
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('567')).toBeInTheDocument();
  });

  it('handles mixed number types', () => {
    const mixedStats = [
      { number: '1,234', label: 'String Number' },
      { number: 567, label: 'Numeric Number' },
      { number: '89', label: 'Another String' },
    ];
    
    render(<StatsDisplay stats={mixedStats} />);
    
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('567')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
  });

  it('handles single stat', () => {
    const singleStat = [{ number: 'Single', label: 'Single Label' }];
    
    render(<StatsDisplay stats={singleStat} />);
    
    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByText('Single Label')).toBeInTheDocument();
  });

  it('handles empty stats array', () => {
    render(<StatsDisplay stats={[]} />);
    
    const container = document.querySelector('.grid.grid-cols-3');
    expect(container).toBeInTheDocument();
    expect(container?.children).toHaveLength(0);
  });

  it('handles long labels', () => {
    const longLabelStats = [
      { number: '123', label: 'This is a very long label that might wrap to multiple lines' },
      { number: '456', label: 'Another very long label with lots of text content' },
    ];
    
    render(<StatsDisplay stats={longLabelStats} />);
    
    expect(screen.getByText('This is a very long label that might wrap to multiple lines')).toBeInTheDocument();
    expect(screen.getByText('Another very long label with lots of text content')).toBeInTheDocument();
  });

  it('handles special characters in numbers and labels', () => {
    const specialStats = [
      { number: '$1,234.56', label: 'Revenue (USD)' },
      { number: '99.9%', label: 'Success Rate' },
      { number: '1,000+', label: 'Users & More' },
    ];
    
    render(<StatsDisplay stats={specialStats} />);
    
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByText('Revenue (USD)')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('1,000+')).toBeInTheDocument();
    expect(screen.getByText('Users & More')).toBeInTheDocument();
  });

  it('combines custom and default classes correctly', () => {
    render(<StatsDisplay stats={mockStats} className="my-custom-stats" />);
    
    const container = document.querySelector('.grid.grid-cols-3');
    expect(container).toHaveClass('my-custom-stats', 'grid', 'grid-cols-3', 'gap-6', 'pt-8');
  });

  it('renders correct number of stat items', () => {
    render(<StatsDisplay stats={mockStats} />);
    
    const statItems = document.querySelectorAll('.text-center');
    expect(statItems).toHaveLength(3);
  });

  it('has proper accessibility structure', () => {
    render(<StatsDisplay stats={mockStats} />);
    
    // Each stat should be in its own container
    const statContainers = document.querySelectorAll('.text-center');
    expect(statContainers).toHaveLength(3);
    
    // Each container should have a number and label
    statContainers.forEach(container => {
      const number = container.querySelector('.text-2xl');
      const label = container.querySelector('.text-sm');
      expect(number).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });
  });
});
