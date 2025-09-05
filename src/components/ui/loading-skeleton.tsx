import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  className?: string;
  type?: 'card' | 'table' | 'chart' | 'dashboard';
}

export function LoadingSkeleton({
  className = '',
  type = 'card',
}: LoadingSkeletonProps) {
  switch (type) {
    case 'dashboard':
      return (
        <div className={`p-6 space-y-6 ${className}`}>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='p-6 border rounded-lg space-y-3 bg-card'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-16' />
                <Skeleton className='h-3 w-32' />
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='p-6 border rounded-lg space-y-4 bg-card'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-64 w-full' />
            </div>
            <div className='p-6 border rounded-lg space-y-4 bg-card'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-64 w-full' />
            </div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div className={`p-6 space-y-4 ${className}`}>
          {/* Search and Filter */}
          <div className='flex justify-between items-center'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-10 w-32' />
          </div>

          {/* Table */}
          <div className='border rounded-lg bg-card'>
            <div className='p-4 border-b'>
              <div className='grid grid-cols-4 gap-4'>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className='h-4 w-full' />
                ))}
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='p-4 border-b last:border-b-0'>
                <div className='grid grid-cols-4 gap-4'>
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className='h-4 w-full' />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className={`p-6 border rounded-lg space-y-4 bg-card ${className}`}>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-64 w-full' />
        </div>
      );

    default: // card
      return (
        <div className={`p-6 border rounded-lg space-y-4 bg-card ${className}`}>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
      );
  }
}
