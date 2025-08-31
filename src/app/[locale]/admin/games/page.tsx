'use client';

import { AdminGamesPage } from '@/components/features/admin/components/admin-game-page';
import { AdminLayout } from '@/components/features/admin/components/admin-layout';

export default function GamesManagementPage() {
  return (
    <AdminLayout>
      <AdminGamesPage />
    </AdminLayout>
  );
}
