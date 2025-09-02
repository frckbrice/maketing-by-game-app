import { Button } from '@/components/ui/Button';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../api/types';


interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (items: CartItem[]) => void;
}

const CartPage = React.memo<CartPageProps>(({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const estimatedTax = subtotal * 0.1; // 10% tax
  const estimatedTotal = subtotal + estimatedTax;

  // Group items by shop
  const itemsByShop = items.reduce((groups, item) => {
    const shopId = item.shopId;
    if (!groups[shopId]) {
      groups[shopId] = {
        shopName: item.shopName,
        items: []
      };
    }
    groups[shopId].items.push(item);
    return groups;
  }, {} as Record<string, { shopName: string; items: CartItem[] }>);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
      return;
    }
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      await onCheckout(items);
      router.push('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('cart.empty.title')}
            </h2>
            <p className="text-gray-400 mb-6">
              {t('cart.empty.description')}
            </p>
            <Button
              onClick={() => router.push('/games')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {t('cart.empty.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            {t('cart.title')} ({items.length} {t('cart.items')})
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push('/games')}
            className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
          >
            {t('cart.continueShopping')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByShop).map(([shopId, group]) => (
              <div key={shopId} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {group.shopName}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {group.items.length} {t('cart.items')}
                  </span>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                      <div className="w-20 h-20 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">
                          {item.productName}
                        </h4>
                        {item.size && (
                          <p className="text-sm text-gray-400">
                            {t('cart.size')}: {item.size}
                          </p>
                        )}
                        <p className="text-orange-400 font-semibold">
                          {item.price.toLocaleString()} XAF
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0 border-gray-600 hover:bg-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-white w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 border-gray-600 hover:bg-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {(item.price * item.quantity).toLocaleString()} XAF
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('cart.orderSummary')}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>{t('cart.subtotal')}</span>
                  <span>{subtotal.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('cart.estimatedTax')}</span>
                  <span>{estimatedTax.toLocaleString()} XAF</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>{estimatedTotal.toLocaleString()} XAF</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('cart.processing')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {t('cart.proceedToCheckout')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  {t('cart.secureCheckout')}
                </p>
              </div>

              {/* Estimated delivery info */}
              <div className="mt-6 p-3 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">
                  {t('cart.deliveryInfo')}
                </h4>
                <p className="text-xs text-gray-400">
                  {t('cart.deliveryEstimate')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartPage.displayName = 'CartPage';

export default CartPage;