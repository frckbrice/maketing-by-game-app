import { AdminScanEvents } from '@/components/features/admin/components/admin-scan-events';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Scan Events - Admin Dashboard',
  description: 'Monitor and manage QR code scanning activities',
};

export default function ScanEventsPage() {
  return <AdminScanEvents />;
}
