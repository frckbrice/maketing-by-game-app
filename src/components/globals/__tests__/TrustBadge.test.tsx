import React from 'react';
import { render, screen } from '@testing-library/react';
import { Shield, CheckCircle, Star } from 'lucide-react';
import { TrustBadge } from '../TrustBadge';

describe('TrustBadge', () => {
  const defaultProps = {
    icon: Shield,
    text: 'Secure & Trusted',
  };

  it('renders with default props', () => {
    render(<TrustBadge {...defaultProps} />);
    
    expect(screen.getByText('Secure & Trusted')).toBeInTheDocument();
  });

  it('renders the icon correctly', () => {
    render(<TrustBadge {...defaultProps} />);
    
    const icon = document.querySelector('.w-4.h-4');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-green-500');
  });

  it('applies custom className', () => {
    render(<TrustBadge {...defaultProps} className="custom-badge" />);
    
    const container = screen.getByText('Secure & Trusted').closest('div');
    expect(container).toHaveClass('custom-badge');
  });

  it('applies custom icon color', () => {
    render(<TrustBadge {...defaultProps} iconColor="text-blue-500" />);
    
    const icon = document.querySelector('.w-4.h-4');
    expect(icon).toHaveClass('text-blue-500');
    expect(icon).not.toHaveClass('text-green-500');
  });

  it('has correct base container styling', () => {
    render(<TrustBadge {...defaultProps} />);
    
    const container = screen.getByText('Secure & Trusted').closest('div');
    expect(container).toHaveClass(
      'flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'rounded-full',
      'bg-white/80', 'dark:bg-slate-800/50', 'backdrop-blur-sm',
      'border', 'border-slate-200/50', 'dark:border-slate-700/30'
    );
  });

  it('has correct icon styling', () => {
    render(<TrustBadge {...defaultProps} />);
    
    const icon = document.querySelector('.w-4.h-4');
    expect(icon).toHaveClass('w-4', 'h-4');
  });

  it('has correct text styling', () => {
    render(<TrustBadge {...defaultProps} />);
    
    const text = screen.getByText('Secure & Trusted');
    expect(text).toHaveClass('text-sm', 'font-medium', 'text-slate-700', 'dark:text-slate-300');
  });

  it('handles different icon components', () => {
    render(<TrustBadge {...defaultProps} icon={CheckCircle} />);
    
    const icon = document.querySelector('.w-4.h-4');
    expect(icon).toBeInTheDocument();
  });

  it('handles long text', () => {
    const longText = 'This is a very long trust badge text that might wrap to multiple lines';
    render(<TrustBadge {...defaultProps} text={longText} />);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('handles empty text', () => {
    render(<TrustBadge {...defaultProps} text="" />);
    
    const text = document.querySelector('.text-sm.font-medium');
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe('');
  });

  it('handles special characters in text', () => {
    const specialText = '100% Secure & Trusted! 🛡️';
    render(<TrustBadge {...defaultProps} text={specialText} />);
    
    expect(screen.getByText(specialText)).toBeInTheDocument();
  });

  it('combines custom and default classes correctly', () => {
    render(
      <TrustBadge 
        {...defaultProps} 
        className="my-custom-badge"
        iconColor="text-red-500"
      />
    );
    
    const container = screen.getByText('Secure & Trusted').closest('div');
    const icon = document.querySelector('.w-4.h-4');
    
    expect(container).toHaveClass('my-custom-badge', 'flex', 'items-center', 'gap-2');
    expect(icon).toHaveClass('text-red-500', 'w-4', 'h-4');
  });

  it('handles multiple trust badges with different colors', () => {
    const { rerender } = render(<TrustBadge {...defaultProps} iconColor="text-green-500" />);
    
    let icon = document.querySelector('.w-4.h-4');
    expect(icon).toHaveClass('text-green-500');
    
    rerender(<TrustBadge {...defaultProps} iconColor="text-blue-500" />);
    icon = document.querySelector('.w-4.h-4');
    expect(icon).toHaveClass('text-blue-500');
    
    rerender(<TrustBadge {...defaultProps} iconColor="text-purple-500" />);
    icon = document.querySelector('.w-4.h-4');
    expect(icon).toHaveClass('text-purple-500');
  });

  it('has proper accessibility structure', () => {
    render(<TrustBadge {...defaultProps} />);
    
    const container = screen.getByText('Secure & Trusted').closest('div');
    const icon = container?.querySelector('svg');
    const text = container?.querySelector('span');
    
    expect(container).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent('Secure & Trusted');
  });

  it('renders with different icon types', () => {
    const icons = [Shield, CheckCircle, Star];
    
    icons.forEach((IconComponent) => {
      const { unmount } = render(<TrustBadge {...defaultProps} icon={IconComponent} />);
      
      const icon = document.querySelector('.w-4.h-4');
      expect(icon).toBeInTheDocument();
      
      unmount();
    });
  });

  it('maintains consistent spacing and layout', () => {
    render(<TrustBadge {...defaultProps} />);
    
    const container = screen.getByText('Secure & Trusted').closest('div');
    expect(container).toHaveClass('gap-2', 'px-4', 'py-2');
  });
});
