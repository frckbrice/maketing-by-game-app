'use client';

import { AdminLayout } from '@/components/features/admin/admin-layout';
import { AdminUsersPage } from '@/components/features/admin/components/admin-user-page';

export default function UsersManagementPage() {
  return (
    <AdminLayout>
      <AdminUsersPage />
    </AdminLayout>
  );
}
