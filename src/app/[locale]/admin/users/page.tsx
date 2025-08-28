'use client';

import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { AdminUsersPage } from '@/components/features/admin/components/AdminUsersPage';

export default function UsersManagementPage() {
  return (
    <AdminLayout>
      <AdminUsersPage />
    </AdminLayout>
  );
}
