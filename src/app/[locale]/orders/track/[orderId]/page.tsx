'use client';

import { notFound } from 'next/navigation';
import OrderTrackingPage from '@/components/features/orders/components/OrderTrackingPage';

interface TrackOrderPageProps {
  params: {
    locale: string;
    orderId: string;
  };
}

export default function TrackOrder({ params }: TrackOrderPageProps) {
  const { orderId } = params;

  if (!orderId) {
    notFound();
  }

  return <OrderTrackingPage orderId={orderId} />;
}