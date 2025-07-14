import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatProvider } from '../ChatContext';
import ChatInterface from '../ChatInterface';

// Mock the navigation engine
jest.mock('@/components/ai/TOKONavigationEngine', () => ({
  TOKONavigationEngine: jest.fn().mockImplementation(() => ({
    processUserIntent: jest.fn().mockResolvedValue({
      message: "Test response",
      actions: [],
      nextSteps: ["Test step"],
      contextualHelp: "Test help"
    }),
    updateContext: jest.fn()
  }))
}));

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: [] })
        }))
      }))
    }))
  }
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

const renderChatInterface = () => {
  return render(
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
};

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message', async () => {
    renderChatInterface();
    
    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm AI TOKO/)).toBeInTheDocument();
    });
  });

  test('can send a message', async () => {
    renderChatInterface();
    
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  test('shows loading state when processing message', async () => {
    renderChatInterface();
    
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should show loading state briefly
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  test('clears messages when clear button is clicked', async () => {
    renderChatInterface();
    
    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm AI TOKO/)).toBeInTheDocument();
    });

    // Send a message first
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    // Click clear button twice (confirmation required)
    const clearButton = screen.getByLabelText(/clear chat/i);
    fireEvent.click(clearButton);
    fireEvent.click(clearButton);

    // Should only show welcome message
    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm AI TOKO/)).toBeInTheDocument();
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });
});