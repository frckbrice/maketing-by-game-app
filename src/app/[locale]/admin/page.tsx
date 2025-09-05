'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const AdminDashboard = dynamic(
  () =>
    import('@/components/features/admin').then(mod => ({
      default: mod.AdminDashboard,
    })),
  {
    loading: () => <LoadingSkeleton type='dashboard' />,
    ssr: false,
  }
);

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type='dashboard' />}>
      <AdminDashboard />
    </Suspense>
  );
}
