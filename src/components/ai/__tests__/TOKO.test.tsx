import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TOKO from '../TOKO';
import { supabase } from '@/integrations/supabase/client';

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

// Mock window.analytics
const mockAnalytics = {
  track: jest.fn()
};
(window as any).analytics = mockAnalytics;

describe('TOKO Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders TOKO chat interface with correct title', () => {
    render(<TOKO userId="test-user" />);
    
    expect(screen.getByText('TOKO - Your AI Investment Assistant')).toBeInTheDocument();
    expect(screen.getByText('Chat with TOKO about your investments')).toBeInTheDocument();
  });

  it('displays spinning TOKO icon', () => {
    render(<TOKO userId="test-user" />);
    
    const tokoIcon = document.querySelector('.toko-icon');
    expect(tokoIcon).toBeInTheDocument();
  });

  it('shows portfolio data when loaded', async () => {
    const mockPortfolioData = {
      totalInvested: 100000,
      totalValue: 120000,
      propertyCount: 3,
      totalTokens: 1000,
      growth: 20
    };

    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { insights: mockPortfolioData },
      error: null
    });

    render(<TOKO userId="test-user" />);

    await waitFor(() => {
      expect(screen.getByText('$100,000')).toBeInTheDocument();
      expect(screen.getByText('$120,000')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('+20.0%')).toBeInTheDocument();
    });
  });

  it('sends message when user types and clicks send', async () => {
    render(<TOKO userId="test-user" />);

    const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'What is tokenisation?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('What is tokenisation?')).toBeInTheDocument();
    });
  });

  it('displays quick reply buttons and handles clicks', async () => {
    render(<TOKO userId="test-user" />);

    await waitFor(() => {
      const quickReplies = screen.getAllByRole('button', { name: /View Portfolio|Start Tokenisation|Learn More/i });
      expect(quickReplies.length).toBeGreaterThan(0);
    });
  });

  it('shows validation message when validation event is triggered', async () => {
    render(<TOKO userId="test-user" />);

    // Trigger validation event
    const validationEvent = new CustomEvent('tokenization-validation', {
      detail: {
        success: true,
        message: '✅ Validation passed! Property meets all tokenisation requirements.'
      }
    });
    window.dispatchEvent(validationEvent);

    await waitFor(() => {
      expect(screen.getByText('✅ Validation passed! Property meets all tokenisation requirements.')).toBeInTheDocument();
    });

    // Check analytics event was tracked
    expect(mockAnalytics.track).toHaveBeenCalledWith('toko.validation_passed', {
      userId: 'test-user',
      message: '✅ Validation passed! Property meets all tokenisation requirements.'
    });
  });

  it('shows error validation message with appropriate styling', async () => {
    render(<TOKO userId="test-user" />);

    const validationEvent = new CustomEvent('tokenization-validation', {
      detail: {
        success: false,
        message: '❌ Validation error. Unable to complete property audit.'
      }
    });
    window.dispatchEvent(validationEvent);

    await waitFor(() => {
      expect(screen.getByText('❌ Validation error. Unable to complete property audit.')).toBeInTheDocument();
    });

    expect(mockAnalytics.track).toHaveBeenCalledWith('toko.validation_failed', {
      userId: 'test-user',
      message: '❌ Validation error. Unable to complete property audit.'
    });
  });

  it('switches between text and voice modes', () => {
    render(<TOKO userId="test-user" />);

    const voiceButton = screen.getByText('Voice');
    fireEvent.click(voiceButton);

    expect(screen.getByText('End Call')).toBeInTheDocument();
    expect(screen.getByText('Voice chat active')).toBeInTheDocument();
  });

  it('shows loading animation when sending message', async () => {
    (supabase.functions.invoke as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<TOKO userId="test-user" />);

    const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const loadingDots = document.querySelectorAll('.animate-bounce');
      expect(loadingDots.length).toBe(3);
    });
  });

  it('calls onValidation callback when provided', async () => {
    const mockOnValidation = jest.fn();
    render(<TOKO userId="test-user" onValidation={mockOnValidation} />);

    const validationEvent = new CustomEvent('tokenization-validation', {
      detail: {
        success: true,
        message: 'Test validation message'
      }
    });
    window.dispatchEvent(validationEvent);

    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith({
        success: true,
        message: 'Test validation message'
      });
    });
  });

  it('shows fallback response when API fails', async () => {
    (supabase.functions.invoke as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<TOKO userId="test-user" />);

    const input = screen.getByPlaceholderText('Ask TOKO about your investments...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'What about tokenisation?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/I can help you with tokenisation!/i)).toBeInTheDocument();
    });
  });
});