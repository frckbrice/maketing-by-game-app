'use client';

import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { AdminGamesPage } from '@/components/features/admin/components/AdminGamesPage';

export default function GamesManagementPage() {
  return (
    <AdminLayout>
      <AdminGamesPage />
    </AdminLayout>
  );
}
