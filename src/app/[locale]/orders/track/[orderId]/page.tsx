import { notFound } from 'next/navigation';
import OrderTrackingPage from '@/components/features/orders/components/OrderTrackingPage';
import { generateOrderMetadata } from '@/lib/seo/metadata';

interface TrackOrderPageProps {
  params: Promise<{
    locale: string;
    orderId: string;
  }>;
}

export async function generateStaticParams() {
  // Order pages are typically not pre-generated as they're user-specific
  // But we can generate some example ones for SEO purposes
  return [{ orderId: 'example-order-1' }, { orderId: 'example-order-2' }];
}

export async function generateMetadata({ params }: TrackOrderPageProps) {
  const { locale, orderId } = await params;
  return generateOrderMetadata(orderId, locale);
}

export default async function TrackOrder({ params }: TrackOrderPageProps) {
  const { orderId } = await params;

  if (!orderId) {
    notFound();
  }

  return <OrderTrackingPage orderId={orderId} />;
}
