'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AdminLayout } from '@/components/features/admin/components/admin-layout';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const AdminAnalyticsPage = dynamic(
  () =>
    import('@/components/features/admin/components/admin-analytics').then(
      mod => ({ default: mod.AdminAnalyticsPage })
    ),
  {
    loading: () => <LoadingSkeleton type='dashboard' />,
    ssr: false,
  }
);

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingSkeleton type='dashboard' />}>
        <AdminAnalyticsPage />
      </Suspense>
    </AdminLayout>
  );
}
