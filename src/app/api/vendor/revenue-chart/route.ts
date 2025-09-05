import { adminFirestore } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get vendor ID from query params or auth
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // Get the last 12 months of revenue data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Query orders for the vendor in the last 12 months
    const ordersSnapshot = await adminFirestore
      .collection('orders')
      .where('vendorId', '==', vendorId)
      .where('createdAt', '>=', twelveMonthsAgo.getTime())
      .where('status', 'in', ['COMPLETED', 'DELIVERED'])
      .orderBy('createdAt', 'asc')
      .get();

    // Group revenue by month
    const monthlyRevenue: { [key: string]: number } = {};

    ordersSnapshot.docs.forEach((doc: any) => {
      const order = doc.data();
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += order.total || 0;
    });

    // Convert to chart data format
    const chartData = Object.entries(monthlyRevenue).map(
      ([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: Math.round(revenue * 100) / 100, // Round to 2 decimal places
      })
    );

    // Sort by date
    chartData.sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue chart data' },
      { status: 500 }
    );
  }
}
