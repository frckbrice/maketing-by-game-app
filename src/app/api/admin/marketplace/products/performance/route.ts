import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase/services';
import { requireRole } from '@/lib/utils/auth-helpers';
import { Shop, Product, Order, ProductPerformanceData, OrderItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    await requireRole(request, 'ADMIN');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch products, orders, and shops
    const [products, orders, shops] = await Promise.all([
      firestoreService.getProducts({ limit: 1000 }),
      firestoreService.getOrders({ limit: 1000 }),
      firestoreService.getShops({ limit: 1000 })
    ]);

    // Create shop lookup map
    const shopMap = new Map(shops.map((shop: Shop) => [shop.id, shop.name]));

    // Calculate performance metrics for each product
    const productPerformance: ProductPerformanceData[] = products.map((product: Product) => {
      const productOrders = orders.filter((order: Order) => 
        order.items && order.items.some((item: OrderItem) => item.productId === product.id)
      );
      
      const sales = productOrders.reduce((sum: number, order: Order) => {
        const productItem = order.items?.find((item: OrderItem) => item.productId === product.id);
        return sum + (productItem?.quantity || 0);
      }, 0);

      const revenue = productOrders.reduce((sum: number, order: Order) => {
        const productItem = order.items?.find((item: OrderItem) => item.productId === product.id);
        return sum + ((productItem?.quantity || 0) * (productItem?.price || 0));
      }, 0);

      const views = product.viewsCount || 0;
      const conversionRate = views > 0 ? (sales / views) * 100 : 0;

      return {
        productId: product.id,
        productName: product.name,
        shopName: shopMap.get(product.shopId) || 'Unknown Shop',
        sales,
        revenue,
        likes: product.likesCount || 0,
        views,
        conversionRate: Math.round(conversionRate * 100) / 100,
        rating: product.rating || 0,
      };
    });

    // Sort by revenue (descending) and limit results
    const topProducts = productPerformance
      .sort((a: ProductPerformanceData, b: ProductPerformanceData) => b.revenue - a.revenue)
      .slice(0, limit);

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Error fetching product performance:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}