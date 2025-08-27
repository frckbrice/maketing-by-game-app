import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showSearch?: boolean;
  showPagination?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showSearch = true,
  showPagination = true,
}: TableSkeletonProps) {
  return (
    <div className='space-y-4'>
      {/* Search and Filters Skeleton */}
      {(showSearch || showPagination) && (
        <div className='flex items-center justify-between'>
          {showSearch && (
            <div className='flex items-center space-x-2'>
              <Skeleton className='w-4 h-4' />
              <Skeleton className='w-64 h-10' />
            </div>
          )}

          <Skeleton className='w-32 h-10' />
        </div>
      )}

      {/* Table Skeleton */}
      <div className='rounded-md border'>
        <div className='border-b'>
          <div className='flex'>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className='flex-1 p-4'>
                <Skeleton className='h-4 w-20' />
              </div>
            ))}
          </div>
        </div>

        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='flex border-b last:border-b-0'>
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className='flex-1 p-4'>
                <Skeleton className='h-4 w-full' />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className='flex items-center justify-between space-x-2 py-4'>
          <Skeleton className='h-4 w-32' />
          <div className='space-x-2'>
            <Skeleton className='w-20 h-9' />
            <Skeleton className='w-20 h-9' />
          </div>
        </div>
      )}
    </div>
  );
}
