import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase/services';
import { requireRole } from '@/lib/utils/auth-helpers';
import { Shop, Product, Order, VendorApplication, MarketplaceStats } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    await requireRole(request, 'ADMIN');

    // Fetch marketplace statistics from Firestore
    const [shops, products, orders, vendorApplications] = await Promise.all([
      firestoreService.getShops({ limit: 1000 }),
      firestoreService.getProducts({ limit: 1000 }),
      firestoreService.getOrders({ limit: 1000 }),
      firestoreService.getVendorApplications({ status: 'pending' })
    ]);

    // Calculate statistics
    const totalShops = shops.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    
    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
    const totalLikes = products.reduce((sum: number, product: Product) => sum + (product.likesCount || 0), 0);
    const totalFollows = shops.reduce((sum: number, shop: Shop) => sum + (shop.followersCount || 0), 0);
    const totalReviews = shops.reduce((sum: number, shop: Shop) => sum + (shop.reviewsCount || 0), 0);
    
    const averageShopRating = shops.length > 0 
      ? shops.reduce((sum: number, shop: Shop) => sum + (shop.rating || 0), 0) / shops.length 
      : 0;
    
    const activeShops = shops.filter((shop: Shop) => shop.status === 'active').length;
    const pendingShopApplications = vendorApplications.length;

    const stats = {
      totalShops,
      totalProducts,
      totalOrders,
      totalMarketplaceRevenue: totalRevenue,
      totalLikes,
      totalFollows,
      totalReviews,
      averageShopRating: Math.round(averageShopRating * 10) / 10,
      activeShops,
      pendingShopApplications,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}