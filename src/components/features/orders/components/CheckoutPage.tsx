import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ArrowLeft, Check, CreditCard, Edit, MapPin, Plus, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateOrder } from '../api/mutations';
import { useAddresses, useDeliveryMethods } from '../api/queries';
import { CheckoutPageProps } from '../api/types';


const CheckoutPage = React.memo<CheckoutPageProps>(({
  items,
  shopId,
  shopName,
  onBack
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'MOBILE_MONEY' | 'CREDIT_CARD' | 'PAYPAL'>('MOBILE_MONEY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { data: addresses = [] } = useAddresses(user?.id || '');
  const { data: deliveryMethods = [] } = useDeliveryMethods(shopId);
  const createOrderMutation = useCreateOrder();

  const selectedDeliveryMethodData = deliveryMethods.find(dm => dm.id === selectedDeliveryMethod);
  const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = selectedDeliveryMethodData?.price || 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;

  // Auto-select default address and first delivery method
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddress]);

  React.useEffect(() => {
    if (deliveryMethods.length > 0 && !selectedDeliveryMethod) {
      setSelectedDeliveryMethod(deliveryMethods[0].id);
    }
  }, [deliveryMethods, selectedDeliveryMethod]);

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      router.push('/auth/login');
      return;
    }

    if (!selectedDeliveryMethod) {
      return;
    }

    // For pickup orders, address is not required
    const needsAddress = selectedDeliveryMethodData?.type !== 'PICKUP';
    if (needsAddress && !selectedAddress) {
      return;
    }

    setIsProcessing(true);

    try {
      await createOrderMutation.mutateAsync({
        userId: user.id,
        shopId,
        shopName,
        items,
        deliveryMethodId: selectedDeliveryMethod,
        deliveryAddressId: needsAddress ? selectedAddress : undefined,
        paymentMethod: selectedPaymentMethod,
      });

      // Redirect to order confirmation
      router.push('/orders/success');
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack || (() => router.back())}
              className="text-white hover:bg-gray-800 p-2 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">
              {t('checkout.title')}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-orange-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('checkout.deliveryAddress')}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(true)}
                  className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('checkout.addAddress')}
                </Button>
              </div>

              {selectedDeliveryMethodData?.type === 'PICKUP' ? (
                <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                  <p className="text-blue-400 font-medium">
                    {t('checkout.pickupInfo')}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    {t('checkout.pickupDescription')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedAddress === address.id
                          ? 'border-orange-600 bg-orange-900/20'
                          : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-white font-medium">
                              {address.fullName}
                            </p>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-600 text-white rounded">
                                {t('checkout.default')}
                              </span>
                            )}
                            {selectedAddress === address.id && (
                              <Check className="w-4 h-4 text-orange-400 ml-2" />
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mt-1">
                            {address.streetAddress}
                          </p>
                          <p className="text-gray-300 text-sm">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {address.phoneNumber}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        {t('checkout.noAddresses')}
                      </p>
                      <Button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {t('checkout.addFirstAddress')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Truck className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  {t('checkout.deliveryMethod')}
                </h3>
              </div>

              <div className="space-y-3">
                {deliveryMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedDeliveryMethod(method.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedDeliveryMethod === method.id
                        ? 'border-orange-600 bg-orange-900/20'
                        : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-white font-medium">
                            {method.name}
                          </p>
                          {selectedDeliveryMethod === method.id && (
                            <Check className="w-4 h-4 text-orange-400 ml-2" />
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          {method.description}
                        </p>
                        {method.estimatedDays > 0 && (
                          <p className="text-gray-400 text-sm">
                            {t('checkout.deliveryTime', { days: method.estimatedDays })}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {method.price === 0
                            ? t('checkout.free')
                            : `${method.price.toLocaleString()} ${method.currency}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  {t('checkout.paymentMethod')}
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'MOBILE_MONEY', name: t('checkout.mobileMoney'), icon: '📱' },
                  { id: 'CREDIT_CARD', name: t('checkout.creditCard'), icon: '💳' },
                  { id: 'PAYPAL', name: 'PayPal', icon: '🅿️' },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPaymentMethod === method.id
                        ? 'border-orange-600 bg-orange-900/20'
                        : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <p className="text-white font-medium flex-1">
                        {method.name}
                      </p>
                      {selectedPaymentMethod === method.id && (
                        <Check className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('checkout.orderSummary')}
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {item.productName}
                      </p>
                      {item.size && (
                        <p className="text-gray-400 text-xs">
                          {t('checkout.size')}: {item.size}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs">
                        {t('checkout.qty')}: {item.quantity}
                      </p>
                    </div>
                    <p className="text-white text-sm font-medium">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{subtotal.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('checkout.delivery')}</span>
                  <span>
                    {deliveryFee === 0
                      ? t('checkout.free')
                      : `${deliveryFee.toLocaleString()} XAF`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('checkout.tax')}</span>
                  <span>{tax.toLocaleString()} XAF</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>{t('checkout.total')}</span>
                  <span>{total.toLocaleString()} XAF</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedDeliveryMethod ||
                  (selectedDeliveryMethodData?.type !== 'PICKUP' && !selectedAddress)}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('checkout.processing')}
                  </div>
                ) : (
                  t('checkout.placeOrder')
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-3">
                {t('checkout.securePayment')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CheckoutPage.displayName = 'CheckoutPage';

export default CheckoutPage;