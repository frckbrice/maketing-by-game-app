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

    // Get the last 12 months of participation data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Query tickets for the vendor's games in the last 12 months
    const ticketsSnapshot = await adminFirestore
      .collection('tickets')
      .where('createdAt', '>=', twelveMonthsAgo.getTime())
      .orderBy('createdAt', 'asc')
      .get();

    // Get vendor's games
    const gamesSnapshot = await adminFirestore
      .collection('games')
      .where('vendorId', '==', vendorId)
      .get();

    const vendorGameIds = gamesSnapshot.docs.map(doc => doc.id);

    // Group participation by month for vendor's games
    const monthlyParticipation: { [key: string]: number } = {};

    ticketsSnapshot.docs.forEach(doc => {
      const ticket = doc.data();
      if (vendorGameIds.includes(ticket.gameId)) {
        const ticketDate = new Date(ticket.createdAt);
        const monthKey = `${ticketDate.getFullYear()}-${String(ticketDate.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyParticipation[monthKey]) {
          monthlyParticipation[monthKey] = 0;
        }
        monthlyParticipation[monthKey] += 1;
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(monthlyParticipation).map(
      ([month, participants]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        participants,
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
    console.error('Error fetching participation chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participation chart data' },
      { status: 500 }
    );
  }
}
