'use client';

import { notFound } from 'next/navigation';
import { ShopChat } from '@/components/features/shops/components/ShopChat';

interface ShopChatPageProps {
  params: {
    locale: string;
    shopId: string;
  };
}

export default function ShopChatPage({ params }: ShopChatPageProps) {
  const { shopId } = params;

  if (!shopId) {
    notFound();
  }

  return <ShopChat shopId={shopId} />;
}