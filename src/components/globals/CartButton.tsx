import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';

const CartButton = React.memo(() => {
  const router = useRouter();
  const { state } = useCart();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/cart')}
      className="relative text-white hover:bg-gray-800 p-2"
      aria-label={`Shopping cart with ${state.itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      {state.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {state.itemCount > 99 ? '99+' : state.itemCount}
        </span>
      )}
    </Button>
  );
});

CartButton.displayName = 'CartButton';

export default CartButton;