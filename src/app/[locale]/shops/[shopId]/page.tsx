
import { ShopPage } from '@/components/features/shops/components/ShopPage';
import { notFound } from 'next/navigation';

interface ShopPageProps {
  params: {
    locale: string;
    shopId: string;
  };
}

export default function ShopPageLayout({ params }: ShopPageProps) {
  const { shopId } = params;

  if (!shopId) {
    notFound();
  }

  return <ShopPage shopId={shopId} />;
}