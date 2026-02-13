'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import { notificationService } from '@/lib/services/notificationService';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Globe,
  Mail,
  Phone,
  XCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface VendorApplication {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyName: string;
  businessRegistrationNumber: string;
  companyWebsite?: string;
  contactEmail: string;
  contactPhone: string;
  productCategory: string;
  description: string;
  companyLogoUrl?: string;
  businessCertificateUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export function AdminVendorApplicationsPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<VendorApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('all');

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Load vendor applications
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadVendorApplications();
    }
  }, [user]);

  const loadVendorApplications = async () => {
    try {
      setLoadingApplications(true);
      // This would need to be implemented in the firestoreService
      const apps = await (firestoreService as any).getAllVendorApplications();
      setApplications(apps || []);
    } catch (error) {
      console.error('Error loading vendor applications:', error);
      toast.error('Failed to load vendor applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingAction(applicationId);

      // Get application details before approval
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        toast.error('Application not found');
        return;
      }

      await (firestoreService as any).approveVendorApplication(
        applicationId,
        user!.id
      );

      // Send notification to user
      await notificationService.sendVendorApplicationNotification(
        application.userId,
        application.userEmail,
        'APPROVED',
        application.companyName
      );

      toast.success('Vendor application approved successfully');
      loadVendorApplications(); // Reload the list
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      setProcessingAction(applicationId);

      // Get application details before rejection
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        toast.error('Application not found');
        return;
      }

      await (firestoreService as any).rejectVendorApplication(
        applicationId,
        user!.id,
        reason
      );

      // Send notification to user
      await notificationService.sendVendorApplicationNotification(
        application.userId,
        application.userEmail,
        'REJECTED',
        application.companyName,
        reason
      );

      toast.success('Vendor application rejected');
      loadVendorApplications(); // Reload the list
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessingAction(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className='w-5 h-5 text-yellow-500' />;
      case 'APPROVED':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'REJECTED':
        return <XCircle className='w-5 h-5 text-red-500' />;
      default:
        return <AlertCircle className='w-5 h-5 text-gray-500' />;
    }
  };

  const filteredApplications = applications.filter(
    app => filterStatus === 'all' || app.status === filterStatus
  );

  if (!mounted) {
    return null;
  }

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
              <Building2 className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                Vendor Applications
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                Review and manage vendor applications
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {applications.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total Applications
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {applications.filter(app => app.status === 'PENDING').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Pending Review
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {applications.filter(app => app.status === 'APPROVED').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Approved
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {applications.filter(app => app.status === 'REJECTED').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Rejected
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className='flex space-x-2 mb-6'>
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size='sm'
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('PENDING')}
              size='sm'
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('APPROVED')}
              size='sm'
            >
              Approved
            </Button>
            <Button
              variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('REJECTED')}
              size='sm'
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* Applications List */}
        {loadingApplications ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>
              Loading applications...
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className='p-8 text-center'>
            <Building2 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No applications found
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              {filterStatus === 'all'
                ? 'There are no vendor applications yet.'
                : `No ${filterStatus.toLowerCase()} applications found.`}
            </p>
          </Card>
        ) : (
          <div className='space-y-4'>
            {filteredApplications.map(application => (
              <Card key={application.id} className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
                      <Building2 className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {application.companyName}
                      </h3>
                      <p className='text-gray-600 dark:text-gray-400'>
                        {application.userName} • {application.userEmail}
                      </p>
                      <div className='flex items-center space-x-2 mt-1'>
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                        <span className='text-sm text-gray-500'>
                          Submitted{' '}
                          {new Date(
                            application.submittedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye className='w-4 h-4 mr-2' />
                      View Details
                    </Button>

                    {application.status === 'PENDING' && (
                      <>
                        <Button
                          size='sm'
                          onClick={() => handleApprove(application.id)}
                          disabled={processingAction === application.id}
                          className='bg-green-600 hover:bg-green-700'
                        >
                          {processingAction === application.id ? (
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                          ) : (
                            <>
                              <CheckCircle className='w-4 h-4 mr-2' />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            const reason = prompt(
                              'Please provide a reason for rejection:'
                            );
                            if (reason) {
                              handleReject(application.id, reason);
                            }
                          }}
                          disabled={processingAction === application.id}
                          className='border-red-500 text-red-600 hover:bg-red-50'
                        >
                          <XCircle className='w-4 h-4 mr-2' />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <Globe className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      {application.companyWebsite || 'No website'}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Mail className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      {application.contactEmail}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Phone className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      {application.contactPhone}
                    </span>
                  </div>
                </div>

                <div className='mt-4'>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    <strong>Category:</strong> {application.productCategory}
                  </p>
                  <p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
                    <strong>Description:</strong> {application.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
            {/* Modal Header */}
            <div className='sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>Application Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors'
                >
                  <span className='text-white text-xl'>×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='p-6 space-y-6'>
              {/* Company Information */}
              <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center'>
                  <Building2 className='w-6 h-6 text-orange-500 mr-2' />
                  Company Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p>
                      <strong>Company Name:</strong>{' '}
                      {selectedApplication.companyName}
                    </p>
                    <p>
                      <strong>Registration Number:</strong>{' '}
                      {selectedApplication.businessRegistrationNumber}
                    </p>
                    <p>
                      <strong>Website:</strong>{' '}
                      {selectedApplication.companyWebsite || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Category:</strong>{' '}
                      {selectedApplication.productCategory}
                    </p>
                    <p>
                      <strong>Contact Email:</strong>{' '}
                      {selectedApplication.contactEmail}
                    </p>
                    <p>
                      <strong>Contact Phone:</strong>{' '}
                      {selectedApplication.contactPhone}
                    </p>
                  </div>
                </div>
                <div className='mt-4'>
                  <p>
                    <strong>Description:</strong>
                  </p>
                  <p className='text-gray-600 dark:text-gray-400 mt-1'>
                    {selectedApplication.description}
                  </p>
                </div>
              </div>

              {/* Applicant Information */}
              <div className='bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                  Applicant Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p>
                      <strong>Name:</strong> {selectedApplication.userName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedApplication.userEmail}
                    </p>
                    <p>
                      <strong>User ID:</strong> {selectedApplication.userId}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Submitted:</strong>{' '}
                      {new Date(
                        selectedApplication.submittedAt
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {getStatusBadge(selectedApplication.status)}
                    </p>
                    {selectedApplication.reviewedAt && (
                      <p>
                        <strong>Reviewed:</strong>{' '}
                        {new Date(
                          selectedApplication.reviewedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className='bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center'>
                  <FileText className='w-6 h-6 text-blue-500 mr-2' />
                  Supporting Documents
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p>
                      <strong>Company Logo:</strong>
                    </p>
                    {selectedApplication.companyLogoUrl ? (
                      <img
                        src={selectedApplication.companyLogoUrl}
                        alt='Company Logo'
                        className='w-32 h-32 object-cover rounded-lg border mt-2'
                      />
                    ) : (
                      <p className='text-gray-500 text-sm'>Not provided</p>
                    )}
                  </div>
                  <div>
                    <p>
                      <strong>Business Certificate:</strong>
                    </p>
                    {selectedApplication.businessCertificateUrl ? (
                      <div className='mt-2'>
                        <a
                          href={selectedApplication.businessCertificateUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:text-blue-800 underline'
                        >
                          View Certificate
                        </a>
                      </div>
                    ) : (
                      <p className='text-gray-500 text-sm'>Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'PENDING' && (
                <div className='flex justify-center space-x-4 pt-6'>
                  <Button
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={processingAction === selectedApplication.id}
                    className='bg-green-600 hover:bg-green-700 px-8'
                  >
                    {processingAction === selectedApplication.id ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    ) : (
                      <>
                        <CheckCircle className='w-5 h-5 mr-2' />
                        Approve Application
                      </>
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      const reason = prompt(
                        'Please provide a reason for rejection:'
                      );
                      if (reason) {
                        handleReject(selectedApplication.id, reason);
                        setShowDetailsModal(false);
                      }
                    }}
                    disabled={processingAction === selectedApplication.id}
                    className='border-red-500 text-red-600 hover:bg-red-50 px-8'
                  >
                    <XCircle className='w-5 h-5 mr-2' />
                    Reject Application
                  </Button>
                </div>
              )}

              {/* Close Button */}
              <div className='text-center pt-6'>
                <Button
                  variant='outline'
                  onClick={() => setShowDetailsModal(false)}
                  className='px-8'
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
