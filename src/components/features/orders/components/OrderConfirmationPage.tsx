import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Package, Truck, MapPin, CreditCard, Calendar, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';

interface OrderConfirmationPageProps {
  order?: Order;
  orderNumber?: string;
}

const OrderConfirmationPage = React.memo<OrderConfirmationPageProps>(({ 
  order,
  orderNumber = 'ORD-2024-001'
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Mock data if no order provided
  const mockOrder: Order = {
    id: 'order-confirmation',
    userId: 'user-1',
    shopId: 'electronics-world',
    shopName: 'Electronics World',
    status: 'PENDING',
    items: [
      {
        productId: 'product-1',
        productName: 'iPhone 15 Pro Max 256GB',
        productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        price: 599000,
      }
    ],
    subtotal: 599000,
    deliveryFee: 2500,
    tax: 59900,
    total: 661400,
    currency: 'XAF',
    deliveryMethod: {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivery within 3-5 business days',
      price: 2500,
      currency: 'XAF',
      estimatedDays: 4,
      isAvailable: true,
      type: 'HOME_DELIVERY'
    },
    deliveryAddress: {
      id: 'addr-1',
      userId: 'user-1',
      type: 'HOME',
      isDefault: true,
      fullName: 'John Doe',
      phoneNumber: '+237123456789',
      streetAddress: '123 Main Street',
      city: 'Yaoundé',
      state: 'Centre',
      postalCode: '1000',
      country: 'Cameroon',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    paymentMethod: 'MOBILE_MONEY',
    paymentStatus: 'COMPLETED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    estimatedDeliveryDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
    orderNumber
  };

  const displayOrder = order || mockOrder;
  const estimatedDeliveryDate = displayOrder.estimatedDeliveryDate 
    ? new Date(displayOrder.estimatedDeliveryDate).toLocaleDateString()
    : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'PROCESSING': return 'text-blue-400';
      case 'SHIPPED': return 'text-purple-400';
      case 'DELIVERED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY': return '📱';
      case 'CREDIT_CARD': return '💳';
      case 'PAYPAL': return '🅿️';
      default: return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('orderConfirmation.title')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('orderConfirmation.subtitle')}
          </p>
          <div className="mt-4 p-4 bg-green-900/20 border border-green-600 rounded-lg inline-block">
            <p className="text-green-400 font-semibold">
              {t('orderConfirmation.orderNumber')}: {displayOrder.orderNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  {t('orderConfirmation.orderItems')}
                </h3>
              </div>
              
              <div className="space-y-4">
                {displayOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                    <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">
                        {item.productName}
                      </h4>
                      {item.size && (
                        <p className="text-sm text-gray-400">
                          {t('orderConfirmation.size')}: {item.size}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-sm">
                          {t('orderConfirmation.quantity')}: {item.quantity}
                        </span>
                        <span className="text-orange-400 font-semibold">
                          {(item.price * item.quantity).toLocaleString()} {displayOrder.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>{t('orderConfirmation.subtotal')}</span>
                    <span>{displayOrder.subtotal.toLocaleString()} {displayOrder.currency}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('orderConfirmation.delivery')}</span>
                    <span>
                      {displayOrder.deliveryFee === 0 
                        ? t('orderConfirmation.free')
                        : `${displayOrder.deliveryFee.toLocaleString()} ${displayOrder.currency}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('orderConfirmation.tax')}</span>
                    <span>{displayOrder.tax.toLocaleString()} {displayOrder.currency}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-gray-700">
                    <span>{t('orderConfirmation.total')}</span>
                    <span>{displayOrder.total.toLocaleString()} {displayOrder.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Truck className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  {t('orderConfirmation.orderStatus')}
                </h3>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${displayOrder.status === 'PENDING' ? 'bg-yellow-400' : 'bg-gray-500'}`}></div>
                <div className="flex-1">
                  <p className={`font-medium ${getStatusColor(displayOrder.status)}`}>
                    {t(`orderConfirmation.status.${displayOrder.status.toLowerCase()}`)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {t('orderConfirmation.statusDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  {t('orderConfirmation.deliveryInfo')}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-white font-medium mb-1">
                    {displayOrder.deliveryMethod.name}
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    {displayOrder.deliveryMethod.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-300">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {t('orderConfirmation.estimatedDelivery')}: {estimatedDeliveryDate}
                    </span>
                  </div>
                </div>

                {displayOrder.deliveryAddress && (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-white font-medium">
                      {displayOrder.deliveryAddress.fullName}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {displayOrder.deliveryAddress.streetAddress}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {displayOrder.deliveryAddress.city}, {displayOrder.deliveryAddress.state} {displayOrder.deliveryAddress.postalCode}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {displayOrder.deliveryAddress.phoneNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  {t('orderConfirmation.paymentInfo')}
                </h3>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {getPaymentMethodIcon(displayOrder.paymentMethod)}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {t(`checkout.${displayOrder.paymentMethod.toLowerCase().replace('_', '')}`)}
                      </p>
                      <p className={`text-sm ${
                        displayOrder.paymentStatus === 'COMPLETED' 
                          ? 'text-green-400' 
                          : displayOrder.paymentStatus === 'PENDING'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {t(`orderConfirmation.paymentStatus.${displayOrder.paymentStatus.toLowerCase()}`)}
                      </p>
                    </div>
                  </div>
                  <p className="text-white font-semibold">
                    {displayOrder.total.toLocaleString()} {displayOrder.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                {t('orderConfirmation.nextSteps.title')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('orderConfirmation.nextSteps.step1')}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('orderConfirmation.nextSteps.step2')}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('orderConfirmation.nextSteps.step3')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/profile/orders')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {t('orderConfirmation.viewAllOrders')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/games')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {t('orderConfirmation.continueShopping')}
          </Button>
          
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('orderConfirmation.downloadReceipt')}
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            {t('orderConfirmation.needHelp')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/support')}
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
            >
              {t('orderConfirmation.contactSupport')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push(`/shops/${displayOrder.shopId}`)}
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
            >
              {t('orderConfirmation.visitShop')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderConfirmationPage.displayName = 'OrderConfirmationPage';

export default OrderConfirmationPage;