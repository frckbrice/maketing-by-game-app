'use client';

import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCancelOrder } from '../api/mutations';
import { useOrderTracking } from '../api/queries';

interface OrderTrackingPageProps {
  orderId: string;
}

const OrderTrackingPage = React.memo<OrderTrackingPageProps>(({ orderId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const {
    data: trackingData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useOrderTracking(orderId);

  const cancelOrderMutation = useCancelOrder();

  const order = trackingData?.order;
  const events = trackingData?.trackingEvents || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
      case 'PAYMENT_CONFIRMED':
        return <CheckCircle className='w-5 h-5 text-green-400' />;
      case 'PROCESSING':
      case 'SHIPPED':
        return <Truck className='w-5 h-5 text-blue-400' />;
      case 'DELIVERED':
        return <Package className='w-5 h-5 text-green-400' />;
      case 'CANCELLED':
        return <XCircle className='w-5 h-5 text-red-400' />;
      default:
        return <Clock className='w-5 h-5 text-gray-400' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'PROCESSING':
        return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'SHIPPED':
        return 'text-purple-400 bg-purple-900/20 border-purple-600';
      case 'DELIVERED':
        return 'text-green-400 bg-green-900/20 border-green-600';
      case 'CANCELLED':
        return 'text-red-400 bg-red-900/20 border-red-600';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const canCancelOrder =
    order && !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status);

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      await cancelOrderMutation.mutateAsync(order.id);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-900 pt-20'>
        <div className='max-w-4xl mx-auto px-4 py-8'>
          <div className='flex items-center justify-center py-16'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400'></div>
            <span className='ml-3 text-gray-400'>
              {t('orderTracking.loading')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='min-h-screen bg-gray-900 pt-20'>
        <div className='max-w-4xl mx-auto px-4 py-8'>
          <div className='text-center py-16'>
            <AlertCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-white mb-2'>
              {t('orderTracking.error.title')}
            </h2>
            <p className='text-gray-400 mb-6'>
              {t('orderTracking.error.message')}
            </p>
            <Button
              onClick={() => router.back()}
              className='bg-orange-600 hover:bg-orange-700'
            >
              {t('orderTracking.goBack')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 pt-20'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='text-white hover:bg-gray-800 p-2 mr-4'
            >
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-white'>
                {t('orderTracking.title')}
              </h1>
              <p className='text-gray-400'>
                {t('orderTracking.orderNumber')}: {order.orderNumber}
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={isRefetching}
            className='border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`}
            />
            {t('orderTracking.refresh')}
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Order Status & Timeline */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Current Status */}
            <div className='bg-gray-800 rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-white'>
                  {t('orderTracking.currentStatus')}
                </h2>
                <div
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}
                >
                  {t(`orderTracking.status.${order.status.toLowerCase()}`)}
                </div>
              </div>

              {order.status === 'SHIPPED' && order.estimatedDeliveryDate && (
                <div className='p-4 bg-blue-900/20 border border-blue-600 rounded-lg mb-4'>
                  <div className='flex items-center'>
                    <Truck className='w-5 h-5 text-blue-400 mr-2' />
                    <div>
                      <p className='text-blue-400 font-medium'>
                        {t('orderTracking.inTransit')}
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {t('orderTracking.estimatedArrival')}:{' '}
                        {new Date(
                          order.estimatedDeliveryDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.status === 'DELIVERED' && order.actualDeliveryDate && (
                <div className='p-4 bg-green-900/20 border border-green-600 rounded-lg mb-4'>
                  <div className='flex items-center'>
                    <CheckCircle className='w-5 h-5 text-green-400 mr-2' />
                    <div>
                      <p className='text-green-400 font-medium'>
                        {t('orderTracking.delivered')}
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {t('orderTracking.deliveredOn')}:{' '}
                        {new Date(
                          order.actualDeliveryDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className='flex items-start space-x-3'>
                  <MapPin className='w-5 h-5 text-orange-400 mt-1' />
                  <div>
                    <p className='text-white font-medium'>
                      {t('orderTracking.deliveryAddress')}
                    </p>
                    <p className='text-gray-300 text-sm'>
                      {order.deliveryAddress.fullName}
                    </p>
                    <p className='text-gray-300 text-sm'>
                      {order.deliveryAddress.streetAddress}
                    </p>
                    <p className='text-gray-300 text-sm'>
                      {order.deliveryAddress.city},{' '}
                      {order.deliveryAddress.state}
                    </p>
                  </div>
                </div>
              )}

              {order.deliveryMethod.type === 'PICKUP' && (
                <div className='flex items-start space-x-3'>
                  <MapPin className='w-5 h-5 text-orange-400 mt-1' />
                  <div>
                    <p className='text-white font-medium'>
                      {t('orderTracking.pickupLocation')}
                    </p>
                    <p className='text-gray-300 text-sm'>{order.shopName}</p>
                    <p className='text-gray-300 text-sm'>
                      {t('orderTracking.pickupInstructions')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            <div className='bg-gray-800 rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-white mb-6'>
                {t('orderTracking.timeline')}
              </h3>

              <div className='space-y-6'>
                {events.map((event, index) => (
                  <div key={event.id} className='flex items-start space-x-4'>
                    <div className='flex-shrink-0'>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-1'>
                        <p className='text-white font-medium'>
                          {event.description}
                        </p>
                        <span className='text-gray-400 text-sm'>
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.location && (
                        <p className='text-gray-400 text-sm'>
                          {event.location}
                        </p>
                      )}
                    </div>
                    {index < events.length - 1 && (
                      <div className='absolute left-6 mt-8 w-px h-6 bg-gray-700'></div>
                    )}
                  </div>
                ))}
              </div>

              {events.length === 0 && (
                <div className='text-center py-8'>
                  <Clock className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-400'>
                    {t('orderTracking.noUpdates')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-800 rounded-lg p-6 sticky top-24'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                {t('orderTracking.orderSummary')}
              </h3>

              {/* Items */}
              <div className='space-y-3 mb-6'>
                {order.items.map((item, index) => (
                  <div key={index} className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0'>
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-white text-sm truncate'>
                        {item.productName}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        {t('orderTracking.qty')}: {item.quantity}
                      </p>
                    </div>
                    <p className='text-white text-sm font-medium'>
                      {(item.price * item.quantity).toLocaleString()}{' '}
                      {order.currency}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className='pt-4 border-t border-gray-700 mb-6'>
                <div className='flex justify-between text-white font-semibold'>
                  <span>{t('orderTracking.total')}</span>
                  <span>
                    {order.total.toLocaleString()} {order.currency}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='space-y-3'>
                {canCancelOrder && (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelOrderMutation.isPending}
                    variant='outline'
                    className='w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                  >
                    {cancelOrderMutation.isPending ? (
                      <div className='flex items-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2'></div>
                        {t('orderTracking.cancelling')}
                      </div>
                    ) : (
                      t('orderTracking.cancelOrder')
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => router.push(`/shops/${order.shopId}`)}
                  variant='outline'
                  className='w-full border-gray-600 text-gray-300 hover:bg-gray-700'
                >
                  {t('orderTracking.visitShop')}
                </Button>

                <Button
                  onClick={() => router.push('/support')}
                  variant='ghost'
                  className='w-full text-orange-400 hover:text-orange-300 hover:bg-orange-900/20'
                >
                  {t('orderTracking.getHelp')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-gray-800 rounded-lg p-6 max-w-md w-full'>
              <div className='flex items-center mb-4'>
                <AlertCircle className='w-6 h-6 text-red-400 mr-2' />
                <h3 className='text-lg font-semibold text-white'>
                  {t('orderTracking.cancelConfirm.title')}
                </h3>
              </div>
              <p className='text-gray-300 mb-6'>
                {t('orderTracking.cancelConfirm.message')}
              </p>
              <div className='flex space-x-3'>
                <Button
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}
                  className='flex-1 bg-red-600 hover:bg-red-700'
                >
                  {t('orderTracking.cancelConfirm.confirm')}
                </Button>
                <Button
                  onClick={() => setShowCancelConfirm(false)}
                  variant='outline'
                  className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-700'
                >
                  {t('orderTracking.cancelConfirm.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OrderTrackingPage.displayName = 'OrderTrackingPage';

export default OrderTrackingPage;
