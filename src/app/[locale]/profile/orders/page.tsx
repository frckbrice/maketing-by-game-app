'use client';

import OrderHistory from '@/components/features/orders/components/OrderHistory';

export default function OrdersPage() {
  return (
    <div className='min-h-screen bg-gray-900 pt-20'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <OrderHistory />
      </div>
    </div>
  );
}
