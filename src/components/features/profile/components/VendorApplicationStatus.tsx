'use client';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/client-services';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function VendorApplicationStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking application status for user:', user!.id);
      const app = await (firestoreService as any).getVendorApplication(
        user!.id
      );
      console.log('Application result:', app);
      setApplication(app);

      // If application exists and status changed, show notification
      if (app && app.status !== 'PENDING') {
        if (app.status === 'APPROVED') {
          toast.success('🎉 Your vendor application has been approved!');
        } else if (app.status === 'REJECTED') {
          toast.error(
            'Your vendor application was rejected. Check details below.'
          );
        }
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check application status every 30 seconds for real-time updates
  useEffect(() => {
    if (user && application?.status === 'PENDING') {
      const interval = setInterval(checkApplicationStatus, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, application?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className='w-5 h-5 text-yellow-500' />;
      case 'APPROVED':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'REJECTED':
        return <XCircle className='w-5 h-5 text-red-500' />;
      default:
        return <AlertCircle className='w-5 h-5 text-yellow-500' />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className='bg-yellow-500 text-white'>Pending Review</Badge>
        );
      case 'APPROVED':
        return <Badge className='bg-green-500 text-white'>Approved</Badge>;
      case 'REJECTED':
        return <Badge className='bg-red-500 text-white'>Rejected</Badge>;
      default:
        return <Badge className='bg-gray-500 text-white'>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <Building2 className='w-6 h-6 text-blue-500 mr-2' />
          Vendor Application Status
        </h2>
        <div className='space-y-4'>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <Building2 className='w-6 h-6 text-blue-500 mr-2' />
          Vendor Application Status
        </h2>
        <div className='space-y-4'>
          <p className='text-gray-600 dark:text-gray-300'>
            You haven&apos;t applied to become a vendor yet.
          </p>
          <button
            onClick={() => router.push('/vendor-application')}
            className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors'
          >
            Apply Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
      <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
        <Building2 className='w-6 h-6 text-blue-500 mr-2' />
        Vendor Application Status
      </h2>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-gray-600 dark:text-gray-300'>Status:</span>
          <div className='flex items-center space-x-2'>
            {getStatusIcon(application.status)}
            {getStatusBadge(application.status)}
          </div>
        </div>

        {application.status === 'PENDING' && (
          <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
            <p className='text-yellow-800 dark:text-yellow-200 text-sm'>
              Your application is currently under review. We&apos;ll notify you
              once a decision has been made.
            </p>
          </div>
        )}

        {application.status === 'APPROVED' && (
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
            <p className='text-green-800 dark:text-green-200 text-sm'>
              🎉 Congratulations! Your vendor application has been approved. You
              can now create and manage lottery games.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className='mt-3 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors'
            >
              Access Vendor Dashboard
            </button>
          </div>
        )}

        {application.status === 'REJECTED' && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
            <p className='text-red-800 dark:text-red-200 text-sm'>
              Your vendor application was not approved at this time.
              {application.rejectionReason && (
                <span className='block mt-2 font-medium'>
                  Reason: {application.rejectionReason}
                </span>
              )}
            </p>
            <button
              onClick={() => router.push('/vendor-application')}
              className='mt-3 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors'
            >
              Reapply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
