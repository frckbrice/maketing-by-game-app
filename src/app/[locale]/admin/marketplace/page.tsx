'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const AdminMarketplaceAnalytics = dynamic(
  () =>
    import(
      '@/components/features/admin/components/admin-marketplace-analytics'
    ).then(mod => ({ default: mod.AdminMarketplaceAnalytics })),
  {
    loading: () => <LoadingSkeleton type='dashboard' />,
    ssr: false,
  }
);

export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingSkeleton type='dashboard' />}>
      <AdminMarketplaceAnalytics />
    </Suspense>
  );
}
