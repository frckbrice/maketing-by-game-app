import { NextRequest, NextResponse } from 'next/server';
import { Shop, ShopPerformanceData } from '../../../../../../components/features/shops/api/types';
import { firestoreService } from '../../../../../../lib/firebase/services';
import { requireRole } from '../../../../../../lib/utils/auth-helpers';
import { Order, Product } from '../../../../../../types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    await requireRole(request, 'ADMIN');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch shops and related data
    const [shops, orders, products] = await Promise.all([
      firestoreService.getShops({ limit: 1000 }),
      firestoreService.getOrders({ limit: 1000 }),
      firestoreService.getProducts({ limit: 1000 })
    ]);

    // Validate that we received data
    if (!shops || !orders || !products) {
      throw new Error('Failed to fetch required data from database');
    }

    // Calculate performance metrics for each shop
    const shopPerformance: ShopPerformanceData[] = shops.map((shop: Shop) => {
      const shopOrders = orders.filter((order: Order) => order.shopId === shop.id);
      const shopProducts = products.filter((product: Product) => product.shop.shopId === shop.id);
      
      const revenue = shopOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
      const orderCount = shopOrders.length;
      const productCount = shopProducts.length;
      
      // Use correct property names from Product type
      const likes = shopProducts.reduce((sum: number, product: Product) => sum + (product.likeCount || 0), 0);
      
      // Since viewsCount doesn't exist, we'll use a different metric for conversion rate
      // We can use likes + reviews as a proxy for engagement
      const engagement = likes + (shop.reviewCount || 0);
      const conversionRate = engagement > 0 ? (orderCount / engagement) * 100 : 0;

      return {
        shopId: shop.id,
        shopName: shop.name,
        revenue,
        orders: orderCount,
        products: productCount,
        likes,
        follows: shop.followerCount || 0,
        reviews: shop.reviewCount || 0,
        rating: shop.rating || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    });

    // Sort by revenue (descending) and limit results
    const topShops = shopPerformance
      .sort((a: ShopPerformanceData, b: ShopPerformanceData) => b.revenue - a.revenue)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: topShops,
      total: shopPerformance.length,
      limit,
      message: `Successfully retrieved performance data for ${topShops.length} shops`
    });
  } catch (error) {
    console.error('Error fetching shop performance:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin role required' 
      }, { status: 401 });
    }
    
    // Handle data validation errors
    if (error instanceof Error && error.message.includes('Failed to fetch required data')) {
      return NextResponse.json({ 
        success: false,
        error: 'Database connection error - unable to fetch shop data' 
      }, { status: 503 });
    }
    
    // Handle other errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
