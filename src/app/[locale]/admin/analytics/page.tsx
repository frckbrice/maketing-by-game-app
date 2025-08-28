'use client';

import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { AdminAnalyticsPage } from '@/components/features/admin/components/AdminAnalyticsPage';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <AdminAnalyticsPage />
    </AdminLayout>
  );
}
