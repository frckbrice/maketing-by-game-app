'use client';

import { VendorLayout } from '@/components/features/vendor/vendor-layout';
import { CreateGame } from '@/components/features/vendor/components/create-game';

export default function VendorCreateGamePage() {
  return (
    <VendorLayout>
      <CreateGame />
    </VendorLayout>
  );
}
