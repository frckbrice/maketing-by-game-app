'use client';

import { VendorLayout } from '@/components/features/vendor/vendor-layout';
import { VendorGames } from '@/components/features/vendor/components/vendor-games';

export default function VendorGamesPage() {
  return (
    <VendorLayout>
      <VendorGames />
    </VendorLayout>
  );
}
