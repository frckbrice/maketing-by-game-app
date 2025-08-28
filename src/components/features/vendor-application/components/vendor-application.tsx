'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function VendorApplicationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    businessRegistrationNumber: '',
    companyWebsite: '',
    contactEmail: '',
    contactPhone: '',
    productCategory: '',
    description: '',
  });

  // File uploads
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [businessCertificate, setBusinessCertificate] = useState<File | null>(
    null
  );

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for existing application
  useEffect(() => {
    if (user) {
      checkExistingApplication();
    }
  }, [user]);

  const checkExistingApplication = async () => {
    try {
      const application = await firestoreService.getVendorApplication(user!.id);
      if (application) {
        setExistingApplication(application);
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  // Redirect if not logged in or already a vendor/admin
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (user.role === 'VENDOR' || user.role === 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    field: 'logo' | 'certificate',
    file: File | null
  ) => {
    if (field === 'logo') {
      setCompanyLogo(file);
    } else {
      setBusinessCertificate(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.companyName ||
        !formData.businessRegistrationNumber ||
        !formData.contactEmail ||
        !formData.contactPhone ||
        !formData.productCategory ||
        !formData.description
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare application data
      const applicationData = {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        ...formData,
        companyLogoUrl: companyLogo
          ? URL.createObjectURL(companyLogo)
          : undefined,
        businessCertificateUrl: businessCertificate
          ? URL.createObjectURL(businessCertificate)
          : undefined,
      };

      // Submit application
      await firestoreService.submitVendorApplication(applicationData);

      toast.success('Vendor application submitted successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If there's an existing application, show status
  if (existingApplication) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900'>
        <DesktopHeader
          isDark={isDark}
          onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
        />
        <MobileNavigation
          isDark={isDark}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
        />

        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
              <Building2 className='w-10 h-10 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
              Vendor Application Status
            </h1>

            <div className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-center mb-6'>
                {existingApplication.status === 'PENDING' && (
                  <div className='w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center'>
                    <AlertCircle className='w-8 h-8 text-white' />
                  </div>
                )}
                {existingApplication.status === 'APPROVED' && (
                  <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center'>
                    <CheckCircle className='w-8 h-8 text-white' />
                  </div>
                )}
                {existingApplication.status === 'REJECTED' && (
                  <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center'>
                    <AlertCircle className='w-8 h-8 text-white' />
                  </div>
                )}
              </div>

              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                {existingApplication.status === 'PENDING' &&
                  'Application Under Review'}
                {existingApplication.status === 'APPROVED' &&
                  'Application Approved!'}
                {existingApplication.status === 'REJECTED' &&
                  'Application Rejected'}
              </h2>

              <div className='space-y-4 mb-6'>
                <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
                  <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
                    Company Details
                  </h3>
                  <p>
                    <strong>Company:</strong> {existingApplication.companyName}
                  </p>
                  <p>
                    <strong>Category:</strong>{' '}
                    {existingApplication.productCategory}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{' '}
                    {new Date(
                      existingApplication.submittedAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                {existingApplication.status === 'REJECTED' &&
                  existingApplication.rejectionReason && (
                    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                      <h3 className='font-semibold text-red-900 dark:text-red-100 mb-2'>
                        Rejection Reason
                      </h3>
                      <p className='text-red-700 dark:text-red-200'>
                        {existingApplication.rejectionReason}
                      </p>
                    </div>
                  )}

                {existingApplication.status === 'APPROVED' && (
                  <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
                    <h3 className='font-semibold text-green-900 dark:text-green-100 mb-2'>
                      Congratulations!
                    </h3>
                    <p className='text-green-700 dark:text-green-200'>
                      Your vendor application has been approved. You can now
                      create and manage games!
                    </p>
                  </div>
                )}
              </div>

              <div className='flex justify-center space-x-4'>
                <Button
                  onClick={() => router.push('/profile')}
                  variant='outline'
                  className='px-6'
                >
                  Back to Profile
                </Button>
                {existingApplication.status === 'REJECTED' && (
                  <Button
                    onClick={() => setExistingApplication(null)}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6'
                  >
                    Submit New Application
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <DesktopHeader
        isDark={isDark}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <MobileNavigation
        isDark={isDark}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center'>
            <Building2 className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            🏢 Become a Vendor
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage your own lottery games to promote your products
            and engage customers
          </p>
        </div>

        {/* Application Form */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Company Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2'>
                Company Information
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Company Name *
                  </label>
                  <Input
                    type='text'
                    value={formData.companyName}
                    onChange={e =>
                      handleInputChange('companyName', e.target.value)
                    }
                    placeholder='Enter your company name'
                    className='w-full'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Business Registration Number *
                  </label>
                  <Input
                    type='text'
                    value={formData.businessRegistrationNumber}
                    onChange={e =>
                      handleInputChange(
                        'businessRegistrationNumber',
                        e.target.value
                      )
                    }
                    placeholder='Enter registration number'
                    className='w-full'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Company Website
                </label>
                <Input
                  type='url'
                  value={formData.companyWebsite}
                  onChange={e =>
                    handleInputChange('companyWebsite', e.target.value)
                  }
                  placeholder='https://yourcompany.com'
                  className='w-full'
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2'>
                Contact Information
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Contact Email *
                  </label>
                  <Input
                    type='email'
                    value={formData.contactEmail}
                    onChange={e =>
                      handleInputChange('contactEmail', e.target.value)
                    }
                    placeholder='contact@yourcompany.com'
                    className='w-full'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Contact Phone *
                  </label>
                  <Input
                    type='tel'
                    value={formData.contactPhone}
                    onChange={e =>
                      handleInputChange('contactPhone', e.target.value)
                    }
                    placeholder='+1234567890'
                    className='w-full'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2'>
                Business Details
              </h3>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Product Category *
                </label>
                <Select
                  value={formData.productCategory}
                  onValueChange={value =>
                    handleInputChange('productCategory', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select your product category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='electronics'>
                      Electronics & Technology
                    </SelectItem>
                    <SelectItem value='fashion'>Fashion & Apparel</SelectItem>
                    <SelectItem value='home'>Home & Living</SelectItem>
                    <SelectItem value='sports'>Sports & Fitness</SelectItem>
                    <SelectItem value='beauty'>
                      Beauty & Personal Care
                    </SelectItem>
                    <SelectItem value='food'>Food & Beverages</SelectItem>
                    <SelectItem value='automotive'>Automotive</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Business Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='Describe your business, products, and why you want to create lottery games...'
                  className='w-full min-h-[120px]'
                  required
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2'>
                Supporting Documents
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Company Logo
                  </label>
                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-orange-500 transition-colors'>
                    <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                    <input
                      type='file'
                      accept='image/*'
                      onChange={e =>
                        handleFileUpload('logo', e.target.files?.[0] || null)
                      }
                      className='hidden'
                      id='logo-upload'
                    />
                    <label
                      htmlFor='logo-upload'
                      className='cursor-pointer text-sm text-gray-600 dark:text-gray-400'
                    >
                      {companyLogo ? companyLogo.name : 'Click to upload logo'}
                    </label>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Business Certificate
                  </label>
                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-orange-500 transition-colors'>
                    <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                    <input
                      type='file'
                      accept='.pdf,.doc,.docx,image/*'
                      onChange={e =>
                        handleFileUpload(
                          'certificate',
                          e.target.files?.[0] || null
                        )
                      }
                      className='hidden'
                      id='certificate-upload'
                    />
                    <label
                      htmlFor='certificate-upload'
                      className='cursor-pointer text-sm text-gray-600 dark:text-gray-400'
                    >
                      {businessCertificate
                        ? businessCertificate.name
                        : 'Click to upload certificate'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-center space-x-4 pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                className='px-8'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Cancel
              </Button>

              <Button
                type='submit'
                disabled={submitting}
                className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8'
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
