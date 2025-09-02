'use client';

import { useEffect } from 'react';
import OrderConfirmationPage from '@/components/features/orders/components/OrderConfirmationPage';

export default function OrderSuccess() {
  useEffect(() => {
    // Clear checkout data after successful order
    sessionStorage.removeItem('checkoutItems');
    // Clear cart
    localStorage.removeItem('cart');
  }, []);

  return <OrderConfirmationPage />;
}