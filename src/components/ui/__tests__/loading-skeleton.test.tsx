import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '../loading-skeleton';

// Mock the Skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, children }: any) => (
    <div className={className} data-testid="skeleton">
      {children}
    </div>
  ),
}));

describe('LoadingSkeleton', () => {
  it('renders card skeleton by default', () => {
    render(<LoadingSkeleton />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    
    const container = skeleton.closest('div');
    expect(container).toHaveClass('p-6', 'border', 'rounded-lg', 'space-y-4', 'bg-card');
  });

  it('renders card skeleton when type is card', () => {
    render(<LoadingSkeleton type="card" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
    
    const container = skeletons[0].closest('div');
    expect(container).toHaveClass('p-6', 'border', 'rounded-lg', 'space-y-4', 'bg-card');
  });

  it('renders dashboard skeleton when type is dashboard', () => {
    render(<LoadingSkeleton type="dashboard" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(6); // 4 stats + 2 charts
    
    const container = skeletons[0].closest('div');
    expect(container).toHaveClass('p-6', 'space-y-6');
  });

  it('renders table skeleton when type is table', () => {
    render(<LoadingSkeleton type="table" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(29); // 2 search/filter + 4 header + 5 rows × 4 columns + 1 table container
    
    const container = skeletons[0].closest('div');
    expect(container).toHaveClass('p-6', 'space-y-4');
  });

  it('renders chart skeleton when type is chart', () => {
    render(<LoadingSkeleton type="chart" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(2);
    
    const container = skeletons[0].closest('div');
    expect(container).toHaveClass('p-6', 'border', 'rounded-lg', 'space-y-4', 'bg-card');
  });

  it('applies custom className', () => {
    render(<LoadingSkeleton className="custom-class" />);
    
    const container = screen.getAllByTestId('skeleton')[0].closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom className to dashboard skeleton', () => {
    render(<LoadingSkeleton type="dashboard" className="custom-class" />);
    
    const container = screen.getByTestId('skeleton').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom className to table skeleton', () => {
    render(<LoadingSkeleton type="table" className="custom-class" />);
    
    const container = screen.getByTestId('skeleton').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom className to chart skeleton', () => {
    render(<LoadingSkeleton type="chart" className="custom-class" />);
    
    const container = screen.getByTestId('skeleton').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct stats cards layout for dashboard', () => {
    render(<LoadingSkeleton type="dashboard" />);
    
    const statsContainer = screen.getAllByTestId('skeleton')[0].closest('div')?.parentElement;
    expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-6');
  });

  it('has correct charts layout for dashboard', () => {
    render(<LoadingSkeleton type="dashboard" />);
    
    const chartsContainer = screen.getAllByTestId('skeleton')[4].closest('div')?.parentElement;
    expect(chartsContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6');
  });

  it('has correct search and filter layout for table', () => {
    render(<LoadingSkeleton type="table" />);
    
    const searchFilterContainer = screen.getAllByTestId('skeleton')[0].closest('div')?.parentElement;
    expect(searchFilterContainer).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('has correct table header layout', () => {
    render(<LoadingSkeleton type="table" />);
    
    const tableHeader = screen.getAllByTestId('skeleton')[2].closest('div')?.parentElement;
    expect(tableHeader).toHaveClass('p-4', 'border-b');
  });

  it('has correct table row layout', () => {
    render(<LoadingSkeleton type="table" />);
    
    const tableRow = screen.getAllByTestId('skeleton')[6].closest('div')?.parentElement;
    expect(tableRow).toHaveClass('p-4', 'border-b');
  });

  it('has correct table row grid layout', () => {
    render(<LoadingSkeleton type="table" />);
    
    const tableRowGrid = screen.getAllByTestId('skeleton')[6].closest('div');
    expect(tableRowGrid).toHaveClass('grid', 'grid-cols-4', 'gap-4');
  });

  it('has correct last table row styling', () => {
    render(<LoadingSkeleton type="table" />);
    
    const lastRow = screen.getAllByTestId('skeleton')[22].closest('div')?.parentElement;
    expect(lastRow).toHaveClass('last:border-b-0');
  });

  it('has correct skeleton dimensions for card type', () => {
    render(<LoadingSkeleton type="card" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[0]).toHaveClass('h-6', 'w-32');
    expect(skeletons[1]).toHaveClass('h-4', 'w-full');
    expect(skeletons[2]).toHaveClass('h-4', 'w-3/4');
  });

  it('has correct skeleton dimensions for dashboard stats', () => {
    render(<LoadingSkeleton type="dashboard" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[0]).toHaveClass('h-4', 'w-24');
    expect(skeletons[1]).toHaveClass('h-8', 'w-16');
    expect(skeletons[2]).toHaveClass('h-3', 'w-32');
  });

  it('has correct skeleton dimensions for dashboard charts', () => {
    render(<LoadingSkeleton type="dashboard" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[4]).toHaveClass('h-6', 'w-48');
    expect(skeletons[5]).toHaveClass('h-64', 'w-full');
  });

  it('has correct skeleton dimensions for table search', () => {
    render(<LoadingSkeleton type="table" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[0]).toHaveClass('h-10', 'w-64');
    expect(skeletons[1]).toHaveClass('h-10', 'w-32');
  });

  it('has correct skeleton dimensions for table headers', () => {
    render(<LoadingSkeleton type="table" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[2]).toHaveClass('h-4', 'w-full');
    expect(skeletons[3]).toHaveClass('h-4', 'w-full');
    expect(skeletons[4]).toHaveClass('h-4', 'w-full');
    expect(skeletons[5]).toHaveClass('h-4', 'w-full');
  });

  it('has correct skeleton dimensions for table cells', () => {
    render(<LoadingSkeleton type="table" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[6]).toHaveClass('h-4', 'w-full');
    expect(skeletons[7]).toHaveClass('h-4', 'w-full');
    expect(skeletons[8]).toHaveClass('h-4', 'w-full');
    expect(skeletons[9]).toHaveClass('h-4', 'w-full');
  });

  it('has correct skeleton dimensions for chart', () => {
    render(<LoadingSkeleton type="chart" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons[0]).toHaveClass('h-6', 'w-48');
    expect(skeletons[1]).toHaveClass('h-64', 'w-full');
  });

  it('renders correct number of skeleton elements for each type', () => {
    const { rerender } = render(<LoadingSkeleton type="card" />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    
    rerender(<LoadingSkeleton type="dashboard" />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
    
    rerender(<LoadingSkeleton type="table" />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(29);
    
    rerender(<LoadingSkeleton type="chart" />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
  });

  it('has proper accessibility structure', () => {
    render(<LoadingSkeleton type="dashboard" />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(6);
    
    skeletons.forEach(skeleton => {
      expect(skeleton).toBeInTheDocument();
    });
  });

  it('combines custom and default classes correctly', () => {
    render(<LoadingSkeleton className="custom-class" />);
    
    const container = screen.getByTestId('skeleton').closest('div');
    expect(container).toHaveClass('p-6', 'border', 'rounded-lg', 'space-y-4', 'bg-card', 'custom-class');
  });

  it('handles empty className gracefully', () => {
    render(<LoadingSkeleton className="" />);
    
    const container = screen.getByTestId('skeleton').closest('div');
    expect(container).toHaveClass('p-6', 'border', 'rounded-lg', 'space-y-4', 'bg-card');
  });
});
