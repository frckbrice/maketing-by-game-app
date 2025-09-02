import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase/services';
import { requireRole } from '@/lib/utils/auth-helpers';
import { Shop, Product, Order } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and vendor role
    const user = await requireRole(request, 'VENDOR');

    // Find the vendor's shop
    const shops = await firestoreService.getShops({ limit: 1000 });
    const vendorShop = shops.find((shop: Shop) => shop.ownerId === user.id);

    if (!vendorShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Fetch shop data
    const [products, orders] = await Promise.all([
      firestoreService.getProducts({ shopId: vendorShop.id, limit: 1000 }),
      firestoreService.getOrders({ shopId: vendorShop.id, limit: 1000 })
    ]);

    // Generate analytics data for the specified period
    const analytics = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      // Filter data for the specific day
      const dayOrders = orders.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
      
      const dayProducts = products.filter((product: Product) => {
        const productDate = new Date(product.createdAt);
        return productDate >= startOfDay && productDate <= endOfDay;
      });
      
      const revenue = dayOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
      const views = dayProducts.reduce((sum: number, product: Product) => sum + (product.viewsCount || 0), 0);
      const likes = dayProducts.reduce((sum: number, product: Product) => sum + (product.likesCount || 0), 0);
      
      analytics.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue,
        newProducts: dayProducts.length,
        views,
        likes,
        conversionRate: views > 0 ? (dayOrders.length / views) * 100 : 0,
      });
    }

    // Product performance data
    const productPerformance = products.map((product: Product) => {
      const productOrders = orders.filter((order: Order) => 
        order.items && order.items.some(item => item.productId === product.id)
      );
      
      const sales = productOrders.reduce((sum: number, order: Order) => {
        const productItem = order.items?.find(item => item.productId === product.id);
        return sum + (productItem?.quantity || 0);
      }, 0);

      const revenue = productOrders.reduce((sum: number, order: Order) => {
        const productItem = order.items?.find(item => item.productId === product.id);
        return sum + ((productItem?.quantity || 0) * (productItem?.price || 0));
      }, 0);

      return {
        productId: product.id,
        productName: product.name,
        sales,
        revenue,
        likes: product.likesCount || 0,
        views: product.viewsCount || 0,
        rating: product.rating || 0,
        conversionRate: (product.viewsCount || 0) > 0 
          ? (sales / (product.viewsCount || 1)) * 100 
          : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    return NextResponse.json({
      analytics,
      productPerformance,
      summary: {
        totalRevenue: orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalViews: products.reduce((sum: number, product: Product) => sum + (product.viewsCount || 0), 0),
        totalLikes: products.reduce((sum: number, product: Product) => sum + (product.likesCount || 0), 0),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0) / orders.length 
          : 0,
      }
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}