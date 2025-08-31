import React from 'react';
import { render, screen } from '@testing-library/react';
import { Star } from 'lucide-react';
import { FeatureCard } from '../FeatureCard';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: jest.fn() }),
}));

describe('FeatureCard', () => {
  const defaultProps = {
    icon: Star,
    title: 'Test Feature',
    description: 'This is a test feature description',
  };

  it('renders with all required props', () => {
    render(<FeatureCard {...defaultProps} />);
    
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
  });

  it('renders the icon correctly', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const icon = document.querySelector('.w-10.h-10');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-orange-600', 'dark:text-orange-400');
  });

  it('applies custom className', () => {
    render(<FeatureCard {...defaultProps} className="custom-class" />);
    
    const container = screen.getByText('Test Feature').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct base styling', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const container = screen.getByText('Test Feature').closest('div');
    expect(container).toHaveClass('text-center', 'group');
  });

  it('has correct icon container styling', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const iconContainer = document.querySelector('.w-20.h-20');
    expect(iconContainer).toHaveClass(
      'w-20', 'h-20', 'mx-auto', 'mb-6', 'rounded-full',
      'bg-slate-100', 'dark:bg-slate-700', 'group-hover:bg-orange-500'
    );
  });

  it('has correct title styling', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const title = screen.getByText('Test Feature');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'mb-3', 'text-slate-900', 'dark:text-white');
  });

  it('has correct description styling', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const description = screen.getByText('This is a test feature description');
    expect(description).toHaveClass('text-slate-300');
  });

  it('has correct transitions', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const iconContainer = document.querySelector('.w-20.h-20');
    const icon = document.querySelector('.w-10.h-10');
    
    expect(iconContainer).toHaveClass('transition-colors', 'duration-300');
    expect(icon).toHaveClass('transition-colors', 'duration-300');
  });

  it('handles different icon components', () => {
    const { Heart } = require('lucide-react');
    render(<FeatureCard {...defaultProps} icon={Heart} />);
    
    const icon = document.querySelector('.w-10.h-10');
    expect(icon).toBeInTheDocument();
  });

  it('handles long title and description', () => {
    const longProps = {
      ...defaultProps,
      title: 'This is a very long feature title that might wrap to multiple lines',
      description: 'This is a very long description that contains a lot of text and might also wrap to multiple lines in the UI',
    };
    
    render(<FeatureCard {...longProps} />);
    
    expect(screen.getByText(longProps.title)).toBeInTheDocument();
    expect(screen.getByText(longProps.description)).toBeInTheDocument();
  });

  it('handles empty description', () => {
    render(<FeatureCard {...defaultProps} description="" />);
    
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    const description = document.querySelector('p.text-slate-300');
    expect(description).toBeInTheDocument();
    expect(description?.textContent).toBe('');
  });

  it('has proper accessibility structure', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Feature');
  });
});
