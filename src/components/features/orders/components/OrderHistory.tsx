import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Search, Filter, Calendar, ArrowRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useOrders } from '../api/queries';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Order } from '@/types';

const OrderHistory = React.memo(() => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  const { 
    data: ordersData, 
    isLoading, 
    error 
  } = useOrders({ 
    userId: user?.id,
    status: statusFilter || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  });

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'amount_high':
          return b.total - a.total;
        case 'amount_low':
          return a.total - b.total;
        default:
          return b.createdAt - a.createdAt;
      }
    });
  }, [orders, searchTerm, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4 text-purple-400" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400 bg-yellow-900/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-900/20';
      case 'SHIPPED': return 'text-purple-400 bg-purple-900/20';
      case 'DELIVERED': return 'text-green-400 bg-green-900/20';
      case 'CANCELLED': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/track/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-700 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {t('orderHistory.error.title')}
        </h3>
        <p className="text-gray-400 mb-6">
          {t('orderHistory.error.message')}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {t('orderHistory.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t('orderHistory.title')}
          </h2>
          <p className="text-gray-400">
            {t('orderHistory.subtitle', { count: totalOrders })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('orderHistory.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
            >
              <option value="">{t('orderHistory.allStatuses')}</option>
              <option value="PENDING">{t('orderHistory.status.pending')}</option>
              <option value="PROCESSING">{t('orderHistory.status.processing')}</option>
              <option value="SHIPPED">{t('orderHistory.status.shipped')}</option>
              <option value="DELIVERED">{t('orderHistory.status.delivered')}</option>
              <option value="CANCELLED">{t('orderHistory.status.cancelled')}</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
            >
              <option value="newest">{t('orderHistory.sort.newest')}</option>
              <option value="oldest">{t('orderHistory.sort.oldest')}</option>
              <option value="amount_high">{t('orderHistory.sort.amountHigh')}</option>
              <option value="amount_low">{t('orderHistory.sort.amountLow')}</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter) && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {t('orderHistory.clearFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || statusFilter 
              ? t('orderHistory.noResultsFound') 
              : t('orderHistory.noOrders')
            }
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || statusFilter 
              ? t('orderHistory.tryDifferentFilters')
              : t('orderHistory.startShopping')
            }
          </p>
          {!(searchTerm || statusFilter) && (
            <Button
              onClick={() => router.push('/games')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {t('orderHistory.browseProducts')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOrderClick(order.id)}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                      {t('orderHistory.orderNumber')}: {order.orderNumber}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.shopName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {t(`orderHistory.status.${order.status.toLowerCase()}`)}
                  </div>
                  <p className="text-white font-semibold mt-1">
                    {order.total.toLocaleString()} {order.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* First item image */}
                  <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={order.items[0]?.productImage}
                      alt={order.items[0]?.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm">
                      {order.items[0]?.productName}
                      {order.items.length > 1 && (
                        <span className="text-gray-400 ml-2">
                          {t('orderHistory.andMoreItems', { count: order.items.length - 1 })}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {t('orderHistory.itemCount', { count: order.items.length })} • {' '}
                      {order.deliveryMethod.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
                  <span className="text-sm mr-2">{t('orderHistory.viewDetails')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Progress indicator for active orders */}
              {!['DELIVERED', 'CANCELLED'].includes(order.status) && order.estimatedDeliveryDate && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {t('orderHistory.estimatedDelivery')}
                    </span>
                    <span className="text-white">
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-gray-400 text-sm">
            {t('orderHistory.showingResults', {
              start: (currentPage - 1) * itemsPerPage + 1,
              end: Math.min(currentPage * itemsPerPage, totalOrders),
              total: totalOrders
            })}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              {t('orderHistory.previous')}
            </Button>
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={
                      currentPage === page
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {page}
                  </Button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={page} className="text-gray-400 px-2">...</span>;
              }
              return null;
            })}
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              {t('orderHistory.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

OrderHistory.displayName = 'OrderHistory';

export default OrderHistory;