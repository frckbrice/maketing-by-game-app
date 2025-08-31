import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateGame } from '../create-game';

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock useAuth
const mockUser = { id: 'user123', email: 'vendor@example.com' };

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock react-i18next
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    'vendor.createGame': 'Create Game',
  };
  return translations[key] || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock adminService
jest.mock('@/lib/api/adminService', () => ({
  adminService: {
    getCategories: jest.fn(),
  },
}));

// Mock vendorService
jest.mock('@/lib/api/vendorService', () => ({
  vendorService: {
    createGame: jest.fn(),
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('CreateGame', () => {
  const mockCategories = [
    { id: 'phones', name: 'Phones', icon: '📱' },
    { id: 'computers', name: 'Computers', icon: '💻' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const adminService = require('@/lib/api/adminService').adminService;
    adminService.getCategories.mockResolvedValue(mockCategories);
  });

  describe('Rendering', () => {
    it('renders the create game form', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Game')).toBeInTheDocument();
        expect(screen.getByText('Design your lottery game and submit for admin approval')).toBeInTheDocument();
      });
    });

    it('displays form sections', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument();
        expect(screen.getByText('Game Title *')).toBeInTheDocument();
        expect(screen.getByText('Game Description *')).toBeInTheDocument();
      });
    });

    it('shows action buttons', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit for review/i })).toBeInTheDocument();
      });
    });

    it('displays back button', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Form Initialization', () => {
    it('loads categories on mount', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const adminService = require('@/lib/api/adminService').adminService;
        expect(adminService.getCategories).toHaveBeenCalled();
      });
    });

    it('sets default form values', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Game Title *');
        const ticketPriceInput = screen.getByLabelText('Ticket Price *');
        const maxParticipantsInput = screen.getByLabelText('Max Participants *');
        
        expect(titleInput).toHaveValue('');
        expect(ticketPriceInput).toHaveValue('5');
        expect(maxParticipantsInput).toHaveValue('100');
      });
    });

    it('initializes with default prize', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        expect(screen.getByText('Prize 1')).toBeInTheDocument();
      });
    });

    it('initializes with default rule', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        expect(screen.getByText('Rule 1')).toBeInTheDocument();
      });
    });
  });

  describe('Form Input Handling', () => {
    it('updates title input', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Game Title *');
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        expect(titleInput).toHaveValue('Test Game');
      });
    });

    it('updates description input', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const descriptionInput = screen.getByLabelText('Game Description *');
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        expect(descriptionInput).toHaveValue('Test Description');
      });
    });

    it('updates ticket price', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const ticketPriceInput = screen.getByLabelText('Ticket Price *');
        fireEvent.change(ticketPriceInput, { target: { value: '10' } });
        expect(ticketPriceInput).toHaveValue('10');
      });
    });

    it('updates max participants', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const maxParticipantsInput = screen.getByLabelText('Max Participants *');
        fireEvent.change(maxParticipantsInput, { target: { value: '200' } });
        expect(maxParticipantsInput).toHaveValue('200');
      });
    });
  });

  describe('Prize Management', () => {
    it('adds new prize', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const addPrizeButton = screen.getByRole('button', { name: /add prize/i });
        fireEvent.click(addPrizeButton);
        
        expect(screen.getByText('Prize 2')).toBeInTheDocument();
      });
    });

    it('removes prize when more than one exists', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        // Add a prize first
        const addPrizeButton = screen.getByRole('button', { name: /add prize/i });
        fireEvent.click(addPrizeButton);
        
        // Remove the second prize
        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeButtons[1]);
        
        expect(screen.queryByText('Prize 2')).not.toBeInTheDocument();
      });
    });

    it('updates prize fields', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const prizeNameInput = screen.getByPlaceholderText('Prize name');
        const prizeValueInput = screen.getByPlaceholderText('Prize value');
        
        fireEvent.change(prizeNameInput, { target: { value: 'iPhone 15' } });
        fireEvent.change(prizeValueInput, { target: { value: '999' } });
        
        expect(prizeNameInput).toHaveValue('iPhone 15');
        expect(prizeValueInput).toHaveValue('999');
      });
    });
  });

  describe('Rule Management', () => {
    it('adds new rule', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const addRuleButton = screen.getByRole('button', { name: /add rule/i });
        fireEvent.click(addRuleButton);
        
        expect(screen.getByText('Rule 2')).toBeInTheDocument();
      });
    });

    it('removes rule when more than one exists', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        // Add a rule first
        const addRuleButton = screen.getByRole('button', { name: /add rule/i });
        fireEvent.click(addRuleButton);
        
        // Remove the second rule
        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeButtons[1]);
        
        expect(screen.queryByText('Rule 2')).not.toBeInTheDocument();
      });
    });

    it('updates rule content', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const ruleInput = screen.getByPlaceholderText('Enter rule');
        fireEvent.change(ruleInput, { target: { value: 'Must be 18 or older' } });
        expect(ruleInput).toHaveValue('Must be 18 or older');
      });
    });
  });

  describe('Image Management', () => {
    it('handles image upload', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText(/upload image/i);
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        // Wait for upload to complete
        waitFor(() => {
          expect(require('sonner').toast.success).toHaveBeenCalledWith('Image uploaded successfully');
        });
      });
    });

    it('removes uploaded image', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText(/upload image/i);
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        // Wait for upload to complete, then remove
        waitFor(() => {
          const removeButton = screen.getByRole('button', { name: /remove image/i });
          fireEvent.click(removeButton);
          
          expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty title', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
        
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Game title is required');
      });
    });

    it('shows error for empty description', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Game Title *');
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
        
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Game description is required');
      });
    });

    it('shows error for invalid ticket price', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Game Title *');
        const descriptionInput = screen.getByLabelText('Game Description *');
        
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        
        const ticketPriceInput = screen.getByLabelText('Ticket Price *');
        fireEvent.change(ticketPriceInput, { target: { value: '0' } });
        
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
        
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Ticket price must be greater than 0');
      });
    });

    it('shows error for invalid max participants', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Game Title *');
        const descriptionInput = screen.getByLabelText('Game Description *');
        
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        
        const maxParticipantsInput = screen.getByLabelText('Max Participants *');
        fireEvent.change(maxParticipantsInput, { target: { value: '0' } });
        
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
        
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Max participants must be greater than 0');
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully', async () => {
      const vendorService = require('@/lib/api/vendorService').vendorService;
      vendorService.createGame.mockResolvedValue('game123');
      
      render(<CreateGame />);
      
      await waitFor(() => {
        // Fill required fields
        const titleInput = screen.getByLabelText('Game Title *');
        const descriptionInput = screen.getByLabelText('Game Description *');
        const categorySelect = screen.getByLabelText('Category *');
        
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        fireEvent.change(categorySelect, { target: { value: 'phones' } });
        
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(vendorService.createGame).toHaveBeenCalledWith('user123', expect.objectContaining({
          title: 'Test Game',
          description: 'Test Description',
          categoryId: 'phones',
        }));
        expect(require('sonner').toast.success).toHaveBeenCalledWith(
          'Game created successfully! It will be reviewed by admin before going live.'
        );
        expect(mockPush).toHaveBeenCalledWith('/vendor-dashboard/games');
      });
    });

    it('handles submission error', async () => {
      const vendorService = require('@/lib/api/vendorService').vendorService;
      vendorService.createGame.mockRejectedValue(new Error('Network error'));
      
      render(<CreateGame />);
      
      await waitFor(() => {
        // Fill required fields
        const titleInput = screen.getByLabelText('Game Title *');
        const descriptionInput = screen.getByLabelText('Game Description *');
        const categorySelect = screen.getByLabelText('Category *');
        
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        fireEvent.change(categorySelect, { target: { value: 'phones' } });
        
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(require('sonner').toast.error).toHaveBeenCalledWith('Failed to create game');
      });
    });
  });

  describe('Draft Saving', () => {
    it('saves draft successfully', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
        fireEvent.click(saveDraftButton);
        
        expect(require('sonner').toast.success).toHaveBeenCalledWith('Game saved as draft');
      });
    });
  });

  describe('Navigation', () => {
    it('goes back when back button is clicked', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);
        
        expect(mockBack).toHaveBeenCalled();
      });
    });
  });

  describe('Calculations', () => {
    it('calculates total prize value', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const prizeValueInput = screen.getByPlaceholderText('Prize value');
        fireEvent.change(prizeValueInput, { target: { value: '100' } });
        
        // The component should display the total prize value
        expect(screen.getByText('Total Prize Value: $100')).toBeInTheDocument();
      });
    });

    it('calculates estimated revenue', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const ticketPriceInput = screen.getByLabelText('Ticket Price *');
        const maxParticipantsInput = screen.getByLabelText('Max Participants *');
        
        fireEvent.change(ticketPriceInput, { target: { value: '10' } });
        fireEvent.change(maxParticipantsInput, { target: { value: '50' } });
        
        // The component should display the estimated revenue
        expect(screen.getByText('Estimated Revenue: $500')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during submission', async () => {
      const vendorService = require('@/lib/api/vendorService').vendorService;
      vendorService.createGame.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<CreateGame />);
      
      await waitFor(() => {
        // Fill required fields
        const titleInput = screen.getByLabelText('Game Title *');
        const descriptionInput = screen.getByLabelText('Game Description *');
        const categorySelect = screen.getByLabelText('Category *');
        
        fireEvent.change(titleInput, { target: { value: 'Test Game' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        fireEvent.change(categorySelect, { target: { value: 'phones' } });
        
        const submitButton = screen.getByRole('button', { name: /submit for review/i });
        fireEvent.click(submitButton);
        
        expect(submitButton).toHaveTextContent('Creating...');
        expect(submitButton).toBeDisabled();
      });
    });

    it('shows loading state during image upload', async () => {
      render(<CreateGame />);
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText(/upload image/i);
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        // Should show upload loading state
        expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      });
    });
  });
});
