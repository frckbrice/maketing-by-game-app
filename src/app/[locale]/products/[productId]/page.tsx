'use client';

import { ProductDetailsPage } from '@/components/features/shops/components/ProductDetailsPage';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: {
    locale: string;
    productId: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = params;

  if (!productId) {
    notFound();
  }

  return <ProductDetailsPage productId={productId} />;
}