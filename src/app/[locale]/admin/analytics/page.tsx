'use client';

import { AdminLayout } from '@/components/features/admin/admin-layout';
import { AdminAnalyticsPage } from '@/components/features/admin/components/admin-analytics';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <AdminAnalyticsPage />
    </AdminLayout>
  );
}
