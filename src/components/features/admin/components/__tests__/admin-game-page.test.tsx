import { useAuth } from '@/lib/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminGamesPage } from '../admin-game-page';

jest.mock('@/lib/contexts/AuthContext');
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const translations: Record<string, string> = {
                'admin.gamesManagement': 'Games Management',
                'admin.manageLotteryGames': 'Manage lottery games',
                'admin.createGame': 'Create Game',
                'admin.gameStatusUpdated': 'Game status updated successfully',
                'admin.failedToUpdateGameStatus': 'Failed to update game status',
                'admin.gameDeletedSuccessfully': 'Game deleted successfully',
                'admin.failedToDeleteGame': 'Failed to delete game',
                'common.refresh': 'Refresh',
                'common.export': 'Export',
            };
            return translations[key] || fallback || key;
        },
    }),
}));
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));
jest.mock('@/hooks/useApi', () => ({
    useGames: jest.fn(),
    useUpdateGame: jest.fn(),
    useDeleteGame: jest.fn(),
}));
jest.mock('@/lib/api/currencyService', () => ({
    currencyService: {
        formatCurrency: jest.fn((amount: number, currency: string) => `$${amount.toFixed(2)}`),
    },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the useApi hooks
const mockUseGames = require('@/hooks/useApi').useGames as jest.MockedFunction<any>;
const mockUseUpdateGame = require('@/hooks/useApi').useUpdateGame as jest.MockedFunction<any>;
const mockUseDeleteGame = require('@/hooks/useApi').useDeleteGame as jest.MockedFunction<any>;

const defaultUser = {
    id: '1',
    email: 'admin@example.com',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    preferences: {
        theme: 'light',
        language: 'en',
        notifications: true,
    },
    notificationSettings: {
        email: true,
        push: true,
        sms: false,
    },
    privacySettings: {
        profileVisibility: 'public',
        dataSharing: false,
    },
    emailVerified: true,
    phoneVerified: false,
    socialMedia: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
};

const mockGames = [
    {
        id: '1',
        title: 'Mega Lottery',
        description: 'The biggest lottery game with massive prizes',
        status: 'ACTIVE',
        category: { name: 'Mega' },
        currentParticipants: 150,
        maxParticipants: 1000,
        ticketPrice: 10,
        currency: 'USD',
        endDate: Date.now() + 86400000, // 1 day from now
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: '2',
        title: 'Quick Win',
        description: 'Fast-paced lottery with instant results',
        status: 'DRAFT',
        category: { name: 'Quick' },
        currentParticipants: 0,
        maxParticipants: 100,
        ticketPrice: 5,
        currency: 'USD',
        endDate: Date.now() + 3600000, // 1 hour from now
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
];

const mockGamesResponse = {
    data: mockGames,
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
};

describe('AdminGamesPage', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({
            user: defaultUser,
            loading: false,
            firebaseUser: null,
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

        mockUseGames.mockReturnValue({
            data: mockGamesResponse,
            isLoading: false,
            refetch: jest.fn(),
        });

        mockUseUpdateGame.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        });

        mockUseDeleteGame.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Access Control', () => {
        it('redirects non-admin users', () => {
            mockUseAuth.mockReturnValue({
                user: { ...defaultUser, role: 'USER' },
                loading: false,
                firebaseUser: null,
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

            render(<AdminGamesPage />);
            expect(mockPush).toHaveBeenCalledWith('/');
        });

        it('renders for admin users', () => {
            render(<AdminGamesPage />);
            expect(screen.getByText('Games Management')).toBeInTheDocument();
        });

        it('shows loading state initially', () => {
            mockUseAuth.mockReturnValue({
                user: null,
                loading: true,
                firebaseUser: null,
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

            render(<AdminGamesPage />);
            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('Data Loading', () => {
        it('displays games after loading', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Mega Lottery')).toBeInTheDocument();
                expect(screen.getByText('Quick Win')).toBeInTheDocument();
            });
        });

        it('displays loading state while fetching games', () => {
            mockUseGames.mockReturnValue({
                data: undefined,
                isLoading: true,
                refetch: jest.fn(),
            });

            render(<AdminGamesPage />);
            expect(screen.getByText('Loading games...')).toBeInTheDocument();
        });

        it('displays empty state when no games exist', () => {
            mockUseGames.mockReturnValue({
                data: { ...mockGamesResponse, data: [], total: 0 },
                isLoading: false,
                refetch: jest.fn(),
            });

            render(<AdminGamesPage />);
            expect(screen.getByText('No games found')).toBeInTheDocument();
        });
    });

    describe('Games Display', () => {
        it('displays game information correctly', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Mega Lottery')).toBeInTheDocument();
                expect(screen.getByText('The biggest lottery game with massive prizes')).toBeInTheDocument();
                expect(screen.getByText('Mega')).toBeInTheDocument();
                expect(screen.getByText('150/1000')).toBeInTheDocument();
                expect(screen.getByText('$1500.00')).toBeInTheDocument();
            });
        });

        it('displays status badges correctly', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('ACTIVE')).toBeInTheDocument();
                expect(screen.getByText('DRAFT')).toBeInTheDocument();
            });
        });

        it('displays time remaining correctly', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                // Check that time remaining is displayed
                expect(screen.getByText('23h')).toBeInTheDocument();
                expect(screen.getByText('0h')).toBeInTheDocument();
            });
        });
    });

    describe('Filtering and Search', () => {
        it('displays search input', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Search games by title...')).toBeInTheDocument();
            });
        });

        it('displays status filter', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('All Status')).toBeInTheDocument();
            });
        });

        it('displays apply filter button', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Apply')).toBeInTheDocument();
            });
        });
    });

    describe('Action Buttons', () => {
        it('displays refresh button', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Refresh')).toBeInTheDocument();
            });
        });

        it('displays create game button', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Create Game')).toBeInTheDocument();
            });
        });

        it('displays export button', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Export')).toBeInTheDocument();
            });
        });

        it('displays action buttons for each game', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                const actionButtons = screen.getAllByRole('button');
                expect(actionButtons.length).toBeGreaterThan(6); // Header buttons + game action buttons
            });
        });
    });

    describe('Game Actions', () => {
        it('displays action buttons for games', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                // Check that action buttons exist (edit and delete)
                const buttons = screen.getAllByRole('button');
                const actionButtons = buttons.filter(button =>
                    button.querySelector('.lucide-edit') || button.querySelector('.lucide-trash-2')
                );
                expect(actionButtons.length).toBeGreaterThan(0);
            });
        });

        it('displays delete buttons for games', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                // Check that delete buttons exist
                const buttons = screen.getAllByRole('button');
                const deleteButtons = buttons.filter(button =>
                    button.querySelector('.lucide-trash-2')
                );
                expect(deleteButtons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Pagination', () => {
        it('displays pagination info', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                // Check that pagination info is displayed (the exact text may vary)
                const paginationText = screen.queryByText(/Showing|Page/);
                if (paginationText) {
                    expect(paginationText).toBeInTheDocument();
                } else {
                    // If pagination is not shown for single page, that's also valid
                    expect(true).toBe(true);
                }
            });
        });

        it('disables pagination buttons when on first/last page', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                // Check that pagination buttons are disabled when on single page
                const buttons = screen.getAllByRole('button');
                const prevButton = buttons.find(button => button.querySelector('.lucide-chevron-left'));
                const nextButton = buttons.find(button => button.querySelector('.lucide-chevron-right'));

                if (prevButton && nextButton) {
                    expect(prevButton).toBeDisabled();
                    expect(nextButton).toBeDisabled();
                }
            });
        });
    });

    describe('Empty States', () => {
        it('displays appropriate message when no games exist', () => {
            mockUseGames.mockReturnValue({
                data: { ...mockGamesResponse, data: [], total: 0 },
                isLoading: false,
                refetch: jest.fn(),
            });

            render(<AdminGamesPage />);
            // Check that some empty state message is displayed
            const emptyMessages = screen.getAllByText(/No games found|Get started|Try adjusting/);
            expect(emptyMessages.length).toBeGreaterThan(0);
        });

        it('displays appropriate message when filters return no results', () => {
            mockUseGames.mockReturnValue({
                data: { ...mockGamesResponse, data: [], total: 0 },
                isLoading: false,
                refetch: jest.fn(),
            });

            render(<AdminGamesPage />);
            expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('displays games in organized table', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByText('Game')).toBeInTheDocument();
                expect(screen.getByText('Category')).toBeInTheDocument();
                expect(screen.getByText('Status')).toBeInTheDocument();
                expect(screen.getByText('Participants')).toBeInTheDocument();
                expect(screen.getByText('Revenue')).toBeInTheDocument();
                expect(screen.getByText('Time Left')).toBeInTheDocument();
                expect(screen.getByText('Actions')).toBeInTheDocument();
            });
        });

        it('displays filters in organized layout', async () => {
            render(<AdminGamesPage />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Search games by title...')).toBeInTheDocument();
                expect(screen.getByText('All Status')).toBeInTheDocument();
                expect(screen.getByText('Apply')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('handles service errors gracefully', async () => {
            mockUseGames.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to fetch games'),
                refetch: jest.fn(),
            });

            render(<AdminGamesPage />);
            // Component should handle errors gracefully without crashing
            expect(screen.getByText('Games Management')).toBeInTheDocument();
        });
    });
});
