'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AdminLayout } from '@/components/features/admin/components/admin-layout';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const AdminUsersPage = dynamic(
  () =>
    import('@/components/features/admin/components/admin-user-page').then(
      mod => ({ default: mod.AdminUsersPage })
    ),
  {
    loading: () => <LoadingSkeleton type='table' />,
    ssr: false,
  }
);

export default function UsersManagementPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingSkeleton type='table' />}>
        <AdminUsersPage />
      </Suspense>
    </AdminLayout>
  );
}
