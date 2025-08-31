'use client';

import { AdminLayout } from '@/components/features/admin/components/admin-layout';
import { AdminVendorsPage } from '@/components/features/admin/components/admin-vendors-page';

export default function VendorsManagementPage() {
  return (
    <AdminLayout>
      <AdminVendorsPage />
    </AdminLayout>
  );
}