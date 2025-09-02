import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/utils/auth-helpers';
import { ScanEvent } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify admin role
    await requireRole(request, 'ADMIN');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const device = searchParams.get('device') || 'all';
    const scannedBy = searchParams.get('scannedBy') || 'all';
    const days = parseInt(searchParams.get('days') || '7');

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

    const snapshot = await query.limit(100).get();
    
    let scanEvents: ScanEvent[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ScanEvent[];

    // Apply search filter (client-side due to Firestore limitations)
    if (search) {
      const searchLower = search.toLowerCase();
      scanEvents = scanEvents.filter(event => 
        event.ticketId.toLowerCase().includes(searchLower) ||
        event.vendorId?.toLowerCase().includes(searchLower) ||
        event.userId?.toLowerCase().includes(searchLower) ||
        event.ip?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(scanEvents);
  } catch (error) {
    console.error('Error fetching scan events:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}