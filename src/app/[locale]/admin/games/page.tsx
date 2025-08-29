'use client';

import { AdminLayout } from '@/components/features/admin/admin-layout';
import { AdminGamesPage } from '@/components/features/admin/components/admin-game-page';

export default function GamesManagementPage() {
  return (
    <AdminLayout>
      <AdminGamesPage />
    </AdminLayout>
  );
}
