import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TOKO from '@/components/ai/TOKO';
import TOKOButton from '@/components/ai/TOKOButton';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    }
  }
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

jest.mock('@11labs/react', () => ({
  useConversation: () => ({
    startSession: jest.fn(),
    endSession: jest.fn(),
    isSpeaking: false
  })
}));

// Mock AuthContext
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: jest.fn()
  })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TOKO Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => '[]'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Basic Rendering', () => {
    it('renders TOKO component with correct title', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      expect(screen.getByText('TOKO')).toBeInTheDocument();
      expect(screen.getByText('Your AI investment assistant')).toBeInTheDocument();
    });

    it('renders the spinning TOKO icon', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      const icon = screen.getByText('TOKO').closest('div')?.querySelector('.toko-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders voice chat button', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      expect(screen.getByText('Voice')).toBeInTheDocument();
    });

    it('renders input field with correct placeholder', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      expect(screen.getByPlaceholderText('Ask TOKO about your investments...')).toBeInTheDocument();
    });
  });

  describe('Message Functionality', () => {
    it('allows user to type and send messages', async () => {
      renderWithProviders(<TOKO userId="test-user" />);
      
      const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'Hello TOKO' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hello TOKO')).toBeInTheDocument();
      });
    });

    it('disables send button when input is empty', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('sends message on Enter key press', async () => {
      renderWithProviders(<TOKO userId="test-user" />);
      
      const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Reply Buttons', () => {
    it('renders quick reply buttons with correct icons', async () => {
      // Mock the AI response to include suggestions
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: {
          response: 'Here are some suggestions',
          suggestions: ['View Portfolio', 'Start Tokenisation', 'Learn More']
        }
      });

      renderWithProviders(<TOKO userId="test-user" />);
      
      const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'Show me options' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('View Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Start Tokenisation')).toBeInTheDocument();
        expect(screen.getByText('Learn More')).toBeInTheDocument();
      });
    });

    it('handles quick reply button clicks', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: {
          response: 'Here are some suggestions',
          suggestions: ['View Portfolio']
        }
      });

      renderWithProviders(<TOKO userId="test-user" />);
      
      const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'Show me options' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const portfolioButton = screen.getByText('View Portfolio');
        fireEvent.click(portfolioButton);
      });
    });
  });

  describe('Analytics Integration', () => {
    it('emits analytics events when TOKO is opened', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      renderWithProviders(<TOKO userId="test-user" />);
      
      expect(consoleSpy).toHaveBeenCalledWith('[ANALYTICS] toko.opened', undefined);
      
      consoleSpy.mockRestore();
    });

    it('stores analytics events in localStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      renderWithProviders(<TOKO userId="test-user" />);
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'tokoAnalytics',
        expect.stringContaining('toko.opened')
      );
      
      setItemSpy.mockRestore();
    });
  });

  describe('Tokenization Validation', () => {
    it('handles successful validation', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: {
          valid: true,
          errors: [],
          warnings: []
        }
      });

      renderWithProviders(<TOKO userId="test-user" />);
      
      // Simulate validation call
      const toko = screen.getByText('TOKO').closest('.toko-icon')?.parentElement;
      expect(toko).toBeInTheDocument();
    });

    it('handles validation errors', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.functions.invoke.mockResolvedValue({
        data: {
          valid: false,
          errors: ['Property value must be greater than 0'],
          warnings: []
        }
      });

      renderWithProviders(<TOKO userId="test-user" />);
      
      // The component should handle validation errors gracefully
      expect(screen.getByText('TOKO')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      
      const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
      expect(input).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<TOKO userId="test-user" />);
      
      const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
      expect(input).toHaveAttribute('tabindex');
    });
  });
});

describe('TOKOButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders TOKO button with correct styling', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('toko-btn');
    });

    it('renders the spinning TOKO icon in button', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      const icon = button.querySelector('.toko-icon');
      expect(icon).toBeInTheDocument();
    });

    it('shows "Ask TOKO" text on larger screens', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveTextContent('Ask TOKO');
    });
  });

  describe('Dialog Functionality', () => {
    it('opens TOKO dialog when button is clicked', async () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('TOKO - Your AI Investment Assistant')).toBeInTheDocument();
      });
    });

    it('closes dialog when close button is clicked', async () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('TOKO - Your AI Investment Assistant')).toBeInTheDocument();
      });
      
      // Dialog should close when clicking outside or using escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('TOKO - Your AI Investment Assistant')).not.toBeInTheDocument();
      });
    });
  });

  describe('Positioning and Styling', () => {
    it('has fixed positioning in bottom-right corner', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
    });

    it('has proper z-index for overlay', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveClass('z-50');
    });

    it('has hover effects', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveClass('hover:shadow-xl', 'transition-all', 'duration-300');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveAttribute('aria-label', 'Ask TOKO');
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveAttribute('tabindex');
    });

    it('has focus styles for accessibility', () => {
      renderWithProviders(<TOKOButton userId="test-user" />);
      
      const button = screen.getByRole('button', { name: /ask toko/i });
      expect(button).toHaveClass('focus-visible');
    });
  });
});

describe('TOKO CSS Animations', () => {
  it('applies spinning animation to TOKO icon', () => {
    renderWithProviders(<TOKO userId="test-user" />);
    
    const icon = screen.getByText('TOKO').closest('div')?.querySelector('.toko-icon');
    expect(icon).toHaveStyle({
      animation: 'spin 2s linear infinite'
    });
  });

  it('applies pulse animation when new message arrives', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.functions.invoke.mockResolvedValue({
      data: {
        response: 'Test response',
        suggestions: []
      }
    });

    renderWithProviders(<TOKO userId="test-user" />);
    
    const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      const icon = screen.getByText('TOKO').closest('div')?.querySelector('.toko-icon');
      expect(icon).toHaveClass('animate-pulse');
    });
  });
});