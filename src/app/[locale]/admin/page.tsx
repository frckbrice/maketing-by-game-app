'use client';

import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { AdminDashboard } from '@/components/features/admin/components/AdminDashboard';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
