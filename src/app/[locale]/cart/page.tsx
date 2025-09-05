'use client';

import CartPage from '@/components/features/orders/components/CartPage';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { user } = useAuth();
  const router = useRouter();
  const { state, updateQuantity, removeItem } = useCart();

  const handleCheckout = async (items: typeof state.items) => {
    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    // Store checkout items in session
    sessionStorage.setItem('checkoutItems', JSON.stringify(items));
    router.push('/checkout');
  };

  return (
    <CartPage
      items={state.items}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onCheckout={handleCheckout}
    />
  );
}
