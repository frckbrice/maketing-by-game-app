import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase/services';
import { requireRole } from '@/lib/utils/auth-helpers';
import { Shop, Product, Order, User, MarketplaceTrends } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    await requireRole(request, 'ADMIN');

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Fetch historical data for trends calculation
    const [shops, products, orders, users] = await Promise.all([
      firestoreService.getShops({ limit: 1000 }),
      firestoreService.getProducts({ limit: 1000 }),
      firestoreService.getOrders({ limit: 1000 }),
      firestoreService.getUsers()
    ]);

    const trends: MarketplaceTrends[] = [];
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
      
      const newShops = shops.filter((shop: Shop) => {
        const shopDate = new Date(shop.createdAt);
        return shopDate >= startOfDay && shopDate <= endOfDay;
      });
      
      const newProducts = products.filter((product: Product) => {
        const productDate = new Date(product.createdAt);
        return productDate >= startOfDay && productDate <= endOfDay;
      });
      
      const activeUsers = users.filter((user: User) => {
        // Consider users active if they have activity in the last day
        const lastActivity = new Date((user as any).lastActivity || user.updatedAt);
        return lastActivity >= startOfDay && lastActivity <= endOfDay;
      });
      
      const revenue = dayOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
      
      trends.push({
        period: dateStr,
        orders: dayOrders.length,
        revenue,
        newShops: newShops.length,
        newProducts: newProducts.length,
        activeUsers: activeUsers.length,
      });
    }

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching marketplace trends:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}