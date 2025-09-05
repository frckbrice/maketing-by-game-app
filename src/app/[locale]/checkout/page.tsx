'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutPage from '@/components/features/orders/components/CheckoutPage';
import { useAuth } from '@/lib/contexts/AuthContext';

interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
}

export default function Checkout() {
  const { user } = useAuth();
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<{
    items: CheckoutItem[];
    shopId: string;
    shopName: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    // Get checkout items from session
    const storedItems = sessionStorage.getItem('checkoutItems');
    if (!storedItems) {
      router.push('/cart');
      return;
    }

    try {
      const items = JSON.parse(storedItems);
      if (!items || items.length === 0) {
        router.push('/cart');
        return;
      }

      // For simplicity, assume all items are from the same shop (first item's shop)
      // In a real scenario, we'd handle multi-vendor checkout differently
      const firstItem = items[0];
      setCheckoutData({
        items: items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        shopId: firstItem.shopId,
        shopName: firstItem.shopName,
      });
    } catch (error) {
      console.error('Error loading checkout data:', error);
      router.push('/cart');
    }
  }, [user, router]);

  const handleBack = () => {
    router.push('/cart');
  };

  if (!checkoutData) {
    return (
      <div className='min-h-screen bg-gray-900 pt-20 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400'></div>
      </div>
    );
  }

  return (
    <CheckoutPage
      items={checkoutData.items}
      shopId={checkoutData.shopId}
      shopName={checkoutData.shopName}
      onBack={handleBack}
    />
  );
}
