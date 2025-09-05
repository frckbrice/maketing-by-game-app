import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase/services';
import { requireRole } from '@/lib/utils/auth-helpers';
import { Shop, Order } from '@/types';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    // Fetch vendor's orders
    let orders = await firestoreService.getOrders({
      shopId: vendorShop.id,
      limit,
    });

    // Filter by status if provided
    if (status && status !== 'all') {
      orders = orders.filter((order: Order) => order.status === status);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication and vendor role
    const user = await requireRole(request, 'VENDOR');

    // Find the vendor's shop
    const shops = await firestoreService.getShops({ limit: 1000 });
    const vendorShop = shops.find((shop: Shop) => shop.ownerId === user.id);

    if (!vendorShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const { orderId, status } = await request.json();

    // Verify the order belongs to this vendor's shop
    const orders = await firestoreService.getOrders({
      shopId: vendorShop.id,
      limit: 1000,
    });
    const order = orders.find((o: Order) => o.id === orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    await firestoreService.updateOrder(orderId, {
      status,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true, orderId, status });
  } catch (error) {
    console.error('Error updating order status:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
