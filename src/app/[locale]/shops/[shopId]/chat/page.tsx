'use client';

import { notFound } from 'next/navigation';
import { ShopChat } from '@/components/features/shops/components/ShopChat';

interface ShopChatPageProps {
  params: Promise<{
    locale: string;
    shopId: string;
  }>;
}

export default async function ShopChatPage({ params }: ShopChatPageProps) {
  const { shopId } = await params;

  if (!shopId) {
    notFound();
  }

  return <ShopChat shopId={shopId} />;
}
