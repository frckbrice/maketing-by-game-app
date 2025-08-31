import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import { notificationService } from '@/lib/services/notificationService';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminVendorApplicationsPage } from '../admin-vendor';

jest.mock('@/lib/contexts/AuthContext');
jest.mock('@/lib/firebase/services');
jest.mock('@/lib/services/notificationService');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));
jest.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: jest.fn(),
    }),
}));
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('AdminVendorApplicationsPage', () => {
    const defaultUser = {
        id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'ADMIN' as const,
        createdAt: Date.now(), updatedAt: Date.now(), status: 'ACTIVE' as const, emailVerified: true,
        phoneVerified: false, socialMedia: {}, phoneNumber: undefined, avatar: undefined,
        preferences: { language: 'en', theme: 'light' as const, notifications: true, emailUpdates: true, smsUpdates: false, timezone: 'UTC', currency: 'USD', },
        twoFactorEnabled: false,
        notificationSettings: { email: true, sms: false, push: true, inApp: true, marketing: false, gameUpdates: true, winnerAnnouncements: true, },
        privacySettings: { profileVisibility: 'public' as const, showEmail: false, showPhone: false, allowContact: true, dataSharing: false, },
    };

    const mockApplications = [
        {
            id: '1',
            userId: 'user1',
            userEmail: 'john@company.com',
            userName: 'John Doe',
            companyName: 'Tech Solutions Inc',
            businessRegistrationNumber: 'BR001',
            companyWebsite: 'https://techsolutions.com',
            contactEmail: 'contact@techsolutions.com',
            contactPhone: '+1234567890',
            productCategory: 'Technology',
            description: 'Leading technology solutions provider',
            companyLogoUrl: 'https://example.com/logo1.png',
            businessCertificateUrl: 'https://example.com/cert1.pdf',
            status: 'PENDING' as const,
            submittedAt: Date.now() - 86400000,
        },
        {
            id: '2',
            userId: 'user2',
            userEmail: 'jane@retail.com',
            userName: 'Jane Smith',
            companyName: 'Retail Plus',
            businessRegistrationNumber: 'BR002',
            companyWebsite: undefined,
            contactEmail: 'info@retailplus.com',
            contactPhone: '+1987654321',
            productCategory: 'Retail',
            description: 'Premium retail solutions',
            companyLogoUrl: undefined,
            businessCertificateUrl: 'https://example.com/cert2.pdf',
            status: 'APPROVED' as const,
            submittedAt: Date.now() - 172800000,
            reviewedAt: Date.now() - 86400000,
            reviewedBy: 'admin1',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: defaultUser,
            firebaseUser: null,
            loading: false,
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            signInWithGoogle: jest.fn(),
            sendPhoneVerificationCode: jest.fn(),
            verifyPhoneCode: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
            updatePassword: jest.fn(),
            updateProfile: jest.fn(),
            deleteAccount: jest.fn(),
        });
        mockFirestoreService.getAllVendorApplications = jest.fn().mockResolvedValue(mockApplications);
        mockFirestoreService.approveVendorApplication = jest.fn().mockResolvedValue(undefined);
        mockFirestoreService.rejectVendorApplication = jest.fn().mockResolvedValue(undefined);
        mockNotificationService.sendVendorApplicationNotification = jest.fn().mockResolvedValue(undefined);
        global.prompt = jest.fn(() => 'Test rejection reason');
    });

    describe('Access Control', () => {
        it('renders loading state initially', () => {
                    mockUseAuth.mockReturnValue({
            user: null,
            firebaseUser: null,
            loading: true,
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            signInWithGoogle: jest.fn(),
            sendPhoneVerificationCode: jest.fn(),
            verifyPhoneCode: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
            updatePassword: jest.fn(),
            updateProfile: jest.fn(),
            deleteAccount: jest.fn(),
        });

            render(<AdminVendorApplicationsPage />);
            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('renders vendor applications page for admin users', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Vendor Applications')).toBeInTheDocument();
            });
        });
    });

    describe('Data Loading', () => {
        it('loads vendor applications from firestore service', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(mockFirestoreService.getAllVendorApplications).toHaveBeenCalled();
            });
        });

        it('displays applications after loading', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
                expect(screen.getByText('Retail Plus')).toBeInTheDocument();
            });
        });
    });

    describe('Statistics Display', () => {
        it('displays total applications count', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument();
                expect(screen.getByText('Total Applications')).toBeInTheDocument();
            });
        });

        it('displays pending applications count', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                const pendingCard = screen.getByText('Pending Review').closest('[class*="rounded-xl"]');
                expect(pendingCard).toBeInTheDocument();
                expect(pendingCard?.textContent).toContain('1');
            });
        });
    });

    describe('Filtering', () => {
        it('filters applications by status', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
            });

            const pendingButton = screen.getByText('Pending');
            fireEvent.click(pendingButton);

            await waitFor(() => {
                expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
                expect(screen.queryByText('Retail Plus')).not.toBeInTheDocument();
            });
        });
    });

    describe('Application Information Display', () => {
        it('displays company information', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
                expect(screen.getByText('john@company.com')).toBeInTheDocument();
                expect(screen.getByText('Technology')).toBeInTheDocument();
            });
        });

        it('displays contact information', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('contact@techsolutions.com')).toBeInTheDocument();
                expect(screen.getByText('+1234567890')).toBeInTheDocument();
            });
        });
    });

    describe('Status Badges', () => {
        it('displays pending status badge', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Pending Review')).toBeInTheDocument();
            });
        });

        it('displays approved status badge', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Approved')).toBeInTheDocument();
            });
        });
    });

    describe('Action Buttons', () => {
        it('displays view details button for all applications', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                const viewButtons = screen.getAllByText('View Details');
                expect(viewButtons).toHaveLength(2);
            });
        });

        it('displays approve and reject buttons for pending applications', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Approve')).toBeInTheDocument();
                expect(screen.getByText('Reject')).toBeInTheDocument();
            });
        });
    });

    describe('Application Approval', () => {
        it('handles application approval', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('Approve')).toBeInTheDocument();
            });

            const approveButton = screen.getByText('Approve');
            fireEvent.click(approveButton);

            await waitFor(() => {
                expect(mockFirestoreService.approveVendorApplication).toHaveBeenCalledWith('1', '1');
            });
        });
    });

    describe('Details Modal', () => {
        it('opens details modal when view details button is clicked', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('View Details')).toBeInTheDocument();
            });

            const viewButton = screen.getAllByText('View Details')[0];
            fireEvent.click(viewButton);

            expect(screen.getByText('Application Details')).toBeInTheDocument();
        });

        it('displays company information in modal', async () => {
            render(<AdminVendorApplicationsPage />);

            await waitFor(() => {
                expect(screen.getByText('View Details')).toBeInTheDocument();
            });

            const viewButton = screen.getAllByText('View Details')[0];
            fireEvent.click(viewButton);

            expect(screen.getByText('Company Information')).toBeInTheDocument();
            expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
        });
    });
});
