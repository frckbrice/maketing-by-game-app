import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '../SectionHeader';

describe('SectionHeader', () => {
  const defaultProps = {
    title: 'Section Title',
  };

  it('renders with title only', () => {
    render(<SectionHeader {...defaultProps} />);
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.queryByText('Section Subtitle')).not.toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    render(<SectionHeader {...defaultProps} subtitle="Section Subtitle" />);
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section Subtitle')).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    render(<SectionHeader {...defaultProps} className="custom-container" />);
    
    const container = screen.getByText('Section Title').closest('div');
    expect(container).toHaveClass('custom-container');
  });

  it('applies custom titleClassName', () => {
    render(<SectionHeader {...defaultProps} titleClassName="custom-title" />);
    
    const title = screen.getByText('Section Title');
    expect(title).toHaveClass('custom-title');
  });

  it('applies custom subtitleClassName', () => {
    render(<SectionHeader {...defaultProps} subtitle="Section Subtitle" subtitleClassName="custom-subtitle" />);
    
    const subtitle = screen.getByText('Section Subtitle');
    expect(subtitle).toHaveClass('custom-subtitle');
  });

  it('has correct base container styling', () => {
    render(<SectionHeader {...defaultProps} />);
    
    const container = screen.getByText('Section Title').closest('div');
    expect(container).toHaveClass('text-center', 'mb-16');
  });

  it('has correct base title styling', () => {
    render(<SectionHeader {...defaultProps} />);
    
    const title = screen.getByText('Section Title');
    expect(title).toHaveClass(
      'text-3xl', 'sm:text-4xl', 'lg:text-5xl', 'font-bold', 'mb-6',
      'text-slate-900', 'dark:text-white'
    );
  });

  it('has correct base subtitle styling', () => {
    render(<SectionHeader {...defaultProps} subtitle="Section Subtitle" />);
    
    const subtitle = screen.getByText('Section Subtitle');
    expect(subtitle).toHaveClass(
      'text-lg', 'text-slate-600', 'dark:text-slate-300', 'max-w-3xl', 'mx-auto'
    );
  });

  it('combines custom and default classes correctly', () => {
    render(
      <SectionHeader 
        {...defaultProps} 
        className="custom-container"
        titleClassName="custom-title"
        subtitle="Section Subtitle"
        subtitleClassName="custom-subtitle"
      />
    );
    
    const container = screen.getByText('Section Title').closest('div');
    const title = screen.getByText('Section Title');
    const subtitle = screen.getByText('Section Subtitle');
    
    expect(container).toHaveClass('custom-container', 'text-center', 'mb-16');
    expect(title).toHaveClass('custom-title', 'text-3xl', 'sm:text-4xl', 'lg:text-5xl');
    expect(subtitle).toHaveClass('custom-subtitle', 'text-lg', 'text-slate-600');
  });

  it('handles long title and subtitle', () => {
    const longTitle = 'This is a very long section title that might wrap to multiple lines in the UI';
    const longSubtitle = 'This is a very long subtitle that contains a lot of text and might also wrap to multiple lines in the UI';
    
    render(<SectionHeader title={longTitle} subtitle={longSubtitle} />);
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longSubtitle)).toBeInTheDocument();
  });

  it('handles empty subtitle gracefully', () => {
    render(<SectionHeader {...defaultProps} subtitle="" />);
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    // Empty subtitle should not render the subtitle element
    const subtitleElement = document.querySelector('p');
    expect(subtitleElement).not.toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<SectionHeader {...defaultProps} subtitle="Section Subtitle" />);
    
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Section Title');
  });

  it('renders without subtitle when subtitle is undefined', () => {
    render(<SectionHeader {...defaultProps} subtitle={undefined} />);
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.queryByText('Section Subtitle')).not.toBeInTheDocument();
  });

  it('renders without subtitle when subtitle is null', () => {
    render(<SectionHeader {...defaultProps} subtitle={null as any} />);
    
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.queryByText('Section Subtitle')).not.toBeInTheDocument();
  });
});
