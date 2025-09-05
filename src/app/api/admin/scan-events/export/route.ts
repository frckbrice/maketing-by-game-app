import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/utils/auth-helpers';
import { ScanEvent } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Verify admin role
    await requireRole(request, 'ADMIN');

    const body = await request.json();
    const {
      search = '',
      status = 'all',
      device = 'all',
      scannedBy = 'all',
      days = 7,
    } = body;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    let query = adminFirestore
      .collection('scanEvents')
      .where('createdAt', '>=', startDate.getTime())
      .where('createdAt', '<=', endDate.getTime())
      .orderBy('createdAt', 'desc');

    // Apply filters
    if (status !== 'all') {
      query = query.where('result', '==', status) as any;
    }

    if (device !== 'all') {
      query = query.where('device', '==', device) as any;
    }

    if (scannedBy !== 'all') {
      query = query.where('scannedBy', '==', scannedBy) as any;
    }

    const snapshot = await query.limit(5000).get(); // Increased limit for export

    let scanEvents: ScanEvent[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ScanEvent[];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      scanEvents = scanEvents.filter(
        event =>
          event.ticketId.toLowerCase().includes(searchLower) ||
          event.vendorId?.toLowerCase().includes(searchLower) ||
          event.userId?.toLowerCase().includes(searchLower) ||
          event.ip?.toLowerCase().includes(searchLower)
      );
    }

    // Generate CSV content
    const headers = [
      'Timestamp',
      'Ticket ID',
      'Result',
      'Scanned By',
      'Vendor ID',
      'User ID',
      'Device',
      'App Version',
      'IP Address',
    ];

    const csvRows = [
      headers.join(','),
      ...scanEvents.map(event =>
        [
          new Date(event.createdAt).toISOString(),
          `"${event.ticketId}"`,
          `"${event.result}"`,
          `"${event.scannedBy}"`,
          `"${event.vendorId || ''}"`,
          `"${event.userId || ''}"`,
          `"${event.device}"`,
          `"${event.appVersion || ''}"`,
          `"${event.ip || ''}"`,
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scan-events-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting scan events:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
