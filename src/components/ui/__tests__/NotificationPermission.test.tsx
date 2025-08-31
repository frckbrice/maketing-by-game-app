import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NotificationPermission } from '../NotificationPermission';

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'notifications.setup': 'Setup Notifications',
                'notifications.initializing': 'Initializing...',
                'notifications.enabled': 'Notifications Enabled',
                'notifications.enabledDescription': 'You will receive notifications',
                'notifications.pushActive': 'Push notifications are active',
                'notifications.emailEnabled': 'Email notifications enabled',
                'notifications.fcmConfigured': 'FCM is configured',
                'notifications.setupFailed': 'Setup Failed',
                'notifications.tryAgain': 'Try Again',
                'notifications.enableNotifications': 'Enable Notifications',
                'notifications.enableDescription': 'Get notified about important updates',
                'notifications.pushNotifications': 'Push notifications for real-time updates',
                'notifications.emailNotifications': 'Email notifications for summaries',
                'notifications.personalized': 'Personalized content recommendations',
                'notifications.requestingPermission': 'Requesting Permission...',
                'notifications.enableNotificationsButton': 'Enable Notifications',
                'notifications.changeLater': 'You can change this later',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock the useFCM hook
const mockRequestPermission = jest.fn();
const mockUseFCM = jest.fn();

jest.mock('@/hooks/useFCM', () => ({
    useFCM: () => mockUseFCM(),
}));

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
    Button: ({ children, onClick, disabled, className, size }: any) => (
        <button onClick={onClick} disabled={disabled} className={className} data-size={size}>
            {children}
        </button>
    ),
}));

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => (
        <div className={className} data-testid="card">
            {children}
        </div>
    ),
    CardHeader: ({ children }: any) => (
        <div data-testid="card-header">
            {children}
        </div>
    ),
    CardTitle: ({ children, className }: any) => (
        <h3 className={className} data-testid="card-title">
            {children}
        </h3>
    ),
    CardDescription: ({ children, className }: any) => (
        <p className={className} data-testid="card-description">
            {children}
        </p>
    ),
    CardContent: ({ children, className }: any) => (
        <div className={className} data-testid="card-content">
            {children}
        </div>
    ),
}));

describe('NotificationPermission', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequestPermission.mockResolvedValue(undefined);
    });

    it('renders loading state when not initialized', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: false,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        expect(screen.getByText('Setup Notifications')).toBeInTheDocument();
        expect(screen.getByText('Initializing...')).toBeInTheDocument();
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders enabled state when FCM token exists', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: 'mock-fcm-token',
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        expect(screen.getByText('Notifications Enabled')).toBeInTheDocument();
        expect(screen.getByText('You will receive notifications')).toBeInTheDocument();
        expect(screen.getByText('Push notifications are active')).toBeInTheDocument();
        expect(screen.getByText('Email notifications enabled')).toBeInTheDocument();
        expect(screen.getByText('FCM is configured')).toBeInTheDocument();
    });

    it('renders error state when setup fails', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: 'Permission denied',
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        expect(screen.getByText('Setup Failed')).toBeInTheDocument();
        expect(screen.getByText('Permission denied')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('renders default state when no token and no error', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        expect(screen.getByTestId('card-title').textContent).toContain('Enable Notifications');
        expect(screen.getByText('Get notified about important updates')).toBeInTheDocument();
        expect(screen.getByText('Push notifications for real-time updates')).toBeInTheDocument();
        expect(screen.getByText('Email notifications for summaries')).toBeInTheDocument();
        expect(screen.getByText('Personalized content recommendations')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Enable Notifications' })).toBeInTheDocument();
        expect(screen.getByText('You can change this later')).toBeInTheDocument();
    });

    it('calls requestPermission when enable button is clicked', async () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const enableButton = screen.getByRole('button', { name: 'Enable Notifications' });
        fireEvent.click(enableButton);

        await waitFor(() => {
            expect(mockRequestPermission).toHaveBeenCalledTimes(1);
        });
    });

    it('calls requestPermission when try again button is clicked', async () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: 'Permission denied',
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const tryAgainButton = screen.getByText('Try Again');
        fireEvent.click(tryAgainButton);

        await waitFor(() => {
            expect(mockRequestPermission).toHaveBeenCalledTimes(1);
        });
    });

    it('shows loading state when requesting permission', async () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const enableButton = screen.getByRole('button', { name: 'Enable Notifications' });
        fireEvent.click(enableButton);

        await waitFor(() => {
            expect(screen.getByText('Requesting Permission...')).toBeInTheDocument();
        });
    });

    it('disables button when requesting permission', async () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const enableButton = screen.getByRole('button', { name: 'Enable Notifications' });
        fireEvent.click(enableButton);

        await waitFor(() => {
            expect(enableButton.closest('button')).toHaveAttribute('disabled');
        });
    });

    it('has correct card styling for enabled state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: 'mock-fcm-token',
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const card = screen.getByTestId('card');
        expect(card).toHaveClass('border-green-200', 'bg-green-50');
    });

    it('has correct card styling for error state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: 'Permission denied',
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const card = screen.getByTestId('card');
        expect(card).toHaveClass('border-red-200', 'bg-red-50');
    });

    it('has correct icon for enabled state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: 'mock-fcm-token',
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const checkIcon = document.querySelector('.h-5.w-5');
        expect(checkIcon).toBeInTheDocument();
    });

    it('has correct icon for error state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: 'Permission denied',
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const alertIcon = document.querySelector('.h-5.w-5');
        expect(alertIcon).toBeInTheDocument();
    });

    it('has correct icon for default state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const bellOffIcon = document.querySelector('.h-5.w-5');
        expect(bellOffIcon).toBeInTheDocument();
    });

    it('has correct button size for default state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const enableButton = screen.getByRole('button', { name: 'Enable Notifications' });
        expect(enableButton.closest('button')).toHaveAttribute('data-size', 'lg');
    });

    it('has correct button styling for default state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const enableButton = screen.getByRole('button', { name: 'Enable Notifications' });
        expect(enableButton.closest('button')).toHaveClass('w-full');
    });

    it('has correct button styling for error state', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: 'Permission denied',
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const tryAgainButton = screen.getByText('Try Again');
        expect(tryAgainButton.closest('button')).toHaveClass('w-full');
    });

    it('has proper accessibility structure', () => {
        mockUseFCM.mockReturnValue({
            fcmToken: null,
            isInitialized: true,
            error: null,
            requestPermission: mockRequestPermission,
        });

        render(<NotificationPermission />);

        const title = screen.getByTestId('card-title');
        const description = screen.getByTestId('card-description');
        const content = screen.getByTestId('card-content');

        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
        expect(content).toBeInTheDocument();
    });

      it('handles requestPermission errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockUseFCM.mockReturnValue({
      fcmToken: null,
      isInitialized: true,
      error: null,
      requestPermission: mockRequestPermission,
    });

    render(<NotificationPermission />);
    
    const enableButton = screen.getByRole('button', { name: 'Enable Notifications' });
    fireEvent.click(enableButton);
    
    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });
    
    consoleSpy.mockRestore();
  });
});
