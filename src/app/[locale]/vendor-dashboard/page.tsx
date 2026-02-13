'use client';

import { VendorLayout } from '@/components/features/vendor/vendor-layout';
import { VendorDashboard } from '@/components/features/vendor/components/vendor-dashboard';

export default function VendorDashboardPage() {
  return (
    <VendorLayout>
      <VendorDashboard />
    </VendorLayout>
  );
}
