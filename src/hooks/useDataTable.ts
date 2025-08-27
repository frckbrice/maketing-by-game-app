import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

interface UseDataTableOptions<T> {
  queryKey: string[];
  fetchFn: (params: DataTableParams) => Promise<DataTableResponse<T>>;
  initialPageSize?: number;
  staleTime?: number;
  gcTime?: number;
}

interface DataTableParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

interface DataTableResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseDataTableReturn<T> {
  data: T[] | undefined;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  refresh: () => void;
}

export function useDataTable<T>({
  queryKey,
  fetchFn,
  initialPageSize = 10,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const queryClient = useQueryClient();

  // Create query params
  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder,
      search,
      filters,
    }),
    [page, pageSize, sortBy, sortOrder, search, filters]
  );

  // Fetch data
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => fetchFn(queryParams),
    staleTime,
    gcTime,
    placeholderData: previousData => previousData, // Keep previous data while fetching new data
  });

  // Memoized values
  const data = response?.data;
  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 0;

  // Refresh function
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    refetch();
  };

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error: error as Error | null,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setSearch,
    setFilters,
    refresh,
  };
}

// Hook for mutations with optimistic updates
export function useDataTableMutation<T, TVariables>(
  mutationFn: (variables: TVariables) => Promise<T>,
  queryKey: string[],
  options?: {
    onSuccess?: (data: T, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey });
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
}

// Hook for optimistic updates
export function useOptimisticMutation<T, TVariables>(
  mutationFn: (variables: TVariables) => Promise<T>,
  queryKey: string[],
  updateFn: (oldData: T[] | undefined, variables: TVariables) => T[],
  options?: {
    onSuccess?: (data: T, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async variables => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: T[] | undefined) =>
        updateFn(old, variables)
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      options?.onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
      options?.onSuccess?.(data, variables);
    },
  });
}
