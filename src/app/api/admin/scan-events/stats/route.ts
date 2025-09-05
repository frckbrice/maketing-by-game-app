import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { requireRole } from '@/lib/utils/auth-helpers';
import { ScanEvent } from '@/types';

interface ScanEventsStats {
  totalScans: number;
  validatedScans: number;
  invalidScans: number;
  suspiciousActivity: number;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    scanCount: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin role
    await requireRole(request, 'ADMIN');

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Fetch scan events for the period
    const scanEventsSnapshot = await adminFirestore
      .collection('scanEvents')
      .where('createdAt', '>=', startDate.getTime())
      .where('createdAt', '<=', endDate.getTime())
      .get();

    const scanEvents: ScanEvent[] = scanEventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ScanEvent[];

    // Calculate statistics
    const totalScans = scanEvents.length;
    const validatedScans = scanEvents.filter(
      event => event.result === 'VALIDATED' || event.result === 'VALID'
    ).length;
    const invalidScans = scanEvents.filter(
      event => event.result === 'INVALID' || event.result === 'EXPIRED'
    ).length;

    // Detect suspicious activity (multiple failed scans from same IP or user)
    const ipScanCounts = scanEvents.reduce(
      (acc, event) => {
        if (event.result === 'INVALID' && event.ip) {
          acc[event.ip] = (acc[event.ip] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const suspiciousActivity = Object.values(ipScanCounts).filter(
      count => count > 5
    ).length;

    // Get top vendors by scan count
    const vendorScanCounts = scanEvents
      .filter(event => event.scannedBy === 'vendor' && event.vendorId)
      .reduce(
        (acc, event) => {
          const vendorId = event.vendorId!;
          acc[vendorId] = (acc[vendorId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    // Fetch vendor details for top vendors
    const topVendorIds = Object.entries(vendorScanCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([vendorId]) => vendorId);

    const topVendors = await Promise.all(
      topVendorIds.map(async vendorId => {
        try {
          const vendorDoc = await adminFirestore
            .collection('users')
            .doc(vendorId)
            .get();
          const vendorData = vendorDoc.data();

          return {
            vendorId,
            vendorName: vendorData
              ? `${vendorData.firstName} ${vendorData.lastName}`.trim() ||
                vendorData.companyName ||
                'Unknown Vendor'
              : 'Unknown Vendor',
            scanCount: vendorScanCounts[vendorId],
          };
        } catch (error) {
          console.warn(`Failed to fetch vendor ${vendorId}:`, error);
          return {
            vendorId,
            vendorName: 'Unknown Vendor',
            scanCount: vendorScanCounts[vendorId],
          };
        }
      })
    );

    const stats: ScanEventsStats = {
      totalScans,
      validatedScans,
      invalidScans,
      suspiciousActivity,
      topVendors,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching scan event stats:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
