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

    // Fetch shop-specific data
    const [products, orders, games] = await Promise.all([
      firestoreService.getProducts({ shopId: vendorShop.id, limit: 1000 }),
      firestoreService.getOrders({ shopId: vendorShop.id, limit: 1000 }),
      firestoreService.getGamesByVendor(user.id) // Assuming this exists for lottery games
    ]);

    // Calculate shop statistics
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalGames = games?.length || 0;
    
    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
    const totalLikes = products.reduce((sum: number, product: Product) => sum + (product.likesCount || 0), 0);
    const totalViews = products.reduce((sum: number, product: Product) => sum + (product.viewsCount || 0), 0);
    
    // Calculate recent period data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = orders.filter((order: Order) => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );
    
    const monthlyRevenue = recentOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
    const monthlyOrders = recentOrders.length;
    
    // Calculate conversion rate (orders / views)
    const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
    
    // Active products (available for sale)
    const activeProducts = products.filter((product: Product) => product.status === 'active').length;
    
    const stats = {
      // Shop metrics
      totalProducts,
      activeProducts,
      totalOrders,
      monthlyOrders,
      totalRevenue,
      monthlyRevenue,
      totalLikes,
      totalViews,
      conversionRate: Math.round(conversionRate * 100) / 100,
      
      // Shop info
      shopName: vendorShop.name,
      shopRating: vendorShop.rating || 0,
      followersCount: vendorShop.followersCount || 0,
      reviewsCount: vendorShop.reviewsCount || 0,
      
      // Games (lottery) metrics - maintaining existing functionality
      totalGames,
      activeGames: games?.filter((game: any) => game.status === 'ACTIVE').length || 0,
      
      // Combined metrics
      totalEarnings: totalRevenue, // Total from both shop and games
      pendingApprovals: 0, // TODO: Implement pending game approvals
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching vendor shop stats:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}