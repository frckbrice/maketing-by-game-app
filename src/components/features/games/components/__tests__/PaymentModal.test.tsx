jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('PaymentModal', () => {
    const mockGame = {
        id: 'game1',
        title: 'iPhone 15 Pro Max Giveaway',
        description: 'Win the latest iPhone!',
        type: 'special' as const,
        categoryId: 'phones',
        category: {
            id: 'phones',
            name: 'Phones',
            description: 'Mobile devices',
            icon: '📱',
            color: '#FF5722',
            isActive: true,
            sortOrder: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        ticketPrice: 5,
        currency: 'USD',
        maxParticipants: 200,
        currentParticipants: 150,
        totalTickets: 200,
        totalTicketsSold: 150,
        videoUrl: undefined,
        totalPrizePool: 1000,
        prizes: [
            {
                id: 'prize1',
                name: 'iPhone 15 Pro Max',
                description: 'Latest iPhone model',
                type: 'product' as const,
                value: 1000,
                currency: 'USD',
                image: undefined,
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        ],
        rules: [
            {
                id: 'rule1',
                title: 'Basic Rules',
                description: 'Follow the basic rules',
                order: 1,
                isRequired: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        ],
        images: [
            { 
                id: 'img1',
                url: '/images/iphone.jpg', 
                alt: 'iPhone',
                order: 1,
                isPrimary: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        ],
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000, // 8 days from now
        status: 'ACTIVE' as const,
        isActive: true,
        createdBy: 'user1',
        createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
        updatedAt: Date.now(),
    };

    const mockUser = {
        id: 'user1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        phoneNumber: '+1234567890',
        avatar: undefined,
        preferences: {
            language: 'en',
            theme: 'light' as const,
            notifications: true,
            emailUpdates: true,
            smsUpdates: false,
            timezone: 'UTC',
            currency: 'USD',
        },
        twoFactorEnabled: false,
        notificationSettings: {
            email: true,
            sms: false,
            push: true,
            inApp: true,
            marketing: false,
            gameUpdates: true,
            winnerAnnouncements: true,
        },
        privacySettings: {
            profileVisibility: 'public' as const,
            showEmail: false,
            showPhone: false,
            allowContact: true,
            dataSharing: false,
        },
        emailVerified: true,
        phoneVerified: false,
        socialMedia: {},
    };

    const defaultProps = {
        game: mockGame,
        isOpen: true,
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: mockUser,
        });
        mockSecurePaymentService.processPayment.mockResolvedValue({
            success: true,
            transactionId: 'txn123',
        });
        mockSecurePaymentService.generateTicket.mockResolvedValue({
            id: 'ticket1',
            ticketNumber: '123-456',
            qrCode: 'data:image/png;base64,test',
        });
    });

    it('renders payment method selection when open', () => {
        render(<PaymentModal {...defaultProps} />);

        expect(screen.getByText('Select Payment Method')).toBeInTheDocument();
        expect(screen.getByText('Orange Money')).toBeInTheDocument();
        expect(screen.getByText('MTN Mobile Money')).toBeInTheDocument();
    });

    it('shows phone number input when payment method is selected', () => {
        render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        expect(screen.getByText('Enter Phone Number')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument();
    });

    it('processes payment when phone number is submitted', async () => {
        render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        // Enter phone number
        const phoneInput = screen.getByPlaceholderText('Enter phone number');
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

        // Submit
        const submitButton = screen.getByText('Continue');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSecurePaymentService.processPayment).toHaveBeenCalled();
        });
    });

    it('shows processing state during payment', async () => {
        render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        // Enter phone number
        const phoneInput = screen.getByPlaceholderText('Enter phone number');
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

        // Submit
        const submitButton = screen.getByText('Continue');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Processing Payment')).toBeInTheDocument();
            expect(screen.getByText('Please wait...')).toBeInTheDocument();
        });
    });

    it('shows success state after successful payment', async () => {
        render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        // Enter phone number
        const phoneInput = screen.getByPlaceholderText('Enter phone number');
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

        // Submit
        const submitButton = screen.getByText('Continue');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Payment Successful')).toBeInTheDocument();
            expect(screen.getByText('Your ticket has been purchased!')).toBeInTheDocument();
        });
    });

    it('closes modal when close button is clicked', () => {
        const onClose = jest.fn();
        render(<PaymentModal {...defaultProps} onClose={onClose} />);

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalled();
    });

    it('converts currency when game currency is different from user currency', async () => {
        const gameWithDifferentCurrency = {
            ...mockGame,
            currency: 'EUR',
            ticketPrice: 10,
        };

        render(<PaymentModal {...defaultProps} game={gameWithDifferentCurrency} />);

        await waitFor(() => {
            expect(mockSecurePaymentService.processPayment).toHaveBeenCalled();
        });
    });

    it('handles payment errors gracefully', async () => {
        mockSecurePaymentService.processPayment.mockRejectedValue(new Error('Payment failed'));

        render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        // Enter phone number
        const phoneInput = screen.getByPlaceholderText('Enter phone number');
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

        // Submit
        const submitButton = screen.getByText('Continue');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSecurePaymentService.processPayment).toHaveBeenCalled();
        });
    });

    it('generates ticket after successful payment', async () => {
        render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        // Enter phone number
        const phoneInput = screen.getByPlaceholderText('Enter phone number');
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

        // Submit
        const submitButton = screen.getByText('Continue');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSecurePaymentService.generateTicket).toHaveBeenCalled();
        });
    });

    it('shows download and print options for ticket', async () => {
        render(<PaymentModal {...defaultProps} />);

        // Complete payment flow
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        const phoneInput = screen.getByPlaceholderText('Enter phone number');
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

        const submitButton = screen.getByText('Continue');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Download Ticket')).toBeInTheDocument();
            expect(screen.getByText('Print Ticket')).toBeInTheDocument();
        });
    });

    it('resets form state when modal is reopened', () => {
        const { rerender } = render(<PaymentModal {...defaultProps} />);

        // Select Orange Money
        const orangeMoneyButton = screen.getByText('Orange Money');
        fireEvent.click(orangeMoneyButton);

        // Close modal
        rerender(<PaymentModal {...defaultProps} isOpen={false} />);

        // Reopen modal
        rerender(<PaymentModal {...defaultProps} isOpen={true} />);

        // Should show payment method selection again
        expect(screen.getByText('Select Payment Method')).toBeInTheDocument();
    });
});
