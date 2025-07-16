import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedTokenizationFlow } from '@/components/tokenization/EnhancedTokenizationFlow';
import { 
  validateTokenisation, 
  initiateTokenisation, 
  executeTokenisation, 
  getTokenisationStatus, 
  getUserTokens, 
  getAvailableAssets 
} from '@/lib/services/tokenization-service';
import { useMetaMaskConnection } from '@/lib/services/web3-service';
import { toast } from 'sonner';

// Mock all dependencies
jest.mock('@/lib/services/tokenization-service');
jest.mock('@/lib/services/web3-service');
jest.mock('@/components/ai/AIBuddy', () => ({
  AIBuddy: () => <div data-testid="ai-buddy">AI Buddy</div>
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  }
}));

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    }
  }
}));

const mockAssets = [
  {
    id: 'asset-1',
    title: 'Luxury Villa Dubai',
    description: 'Beautiful villa in Dubai Marina',
    location: 'Dubai, UAE',
    price: 2500000,
    price_per_token: 100,
    total_tokens: 25000,
    available_tokens: 15000,
    minimum_investment: 1000,
    maximum_investment: 500000,
    contract_address: '0x1234567890123456789012345678901234567890',
    token_symbol: 'DUBAI',
    images: ['image1.jpg', 'image2.jpg'],
    status: 'available' as const,
    roi_estimate: 8.5,
    rental_yield: 6.2
  },
  {
    id: 'asset-2',
    title: 'Downtown Apartment',
    description: 'Modern apartment in city center',
    location: 'Abu Dhabi, UAE',
    price: 1500000,
    price_per_token: 75,
    total_tokens: 20000,
    available_tokens: 12000,
    minimum_investment: 750,
    maximum_investment: 300000,
    contract_address: '0x0987654321098765432109876543210987654321',
    token_symbol: 'ABUDHABI',
    images: ['image3.jpg'],
    status: 'available' as const,
    roi_estimate: 7.2,
    rental_yield: 5.8
  }
];

const mockUserTokens = [
  {
    id: 'token-1',
    assetId: 'asset-1',
    assetTitle: 'Luxury Villa Dubai',
    tokenAmount: 50,
    tokenValue: 5000,
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenSymbol: 'DUBAI',
    purchaseDate: '2024-01-15T10:30:00Z',
    lastValuation: 5200
  }
];

const mockValidationResponse = {
  valid: true,
  errors: [],
  warnings: [],
  estimatedFees: 50,
  totalCost: 1050,
  availableTokens: 15000,
  maxAllowed: 500000
};

const mockInitiateResponse = {
  sessionId: 'session-123',
  paymentSession: {
    clientSecret: 'pi_test_secret',
    paymentIntentId: 'pi_test_123'
  },
  web3Transaction: {
    to: '0x1234567890123456789012345678901234567890',
    data: '0x',
    value: '0x0',
    gasLimit: '0x186a0',
    estimatedGas: '0x186a0'
  },
  estimatedFees: 50,
  totalCost: 1050,
  expiresAt: '2024-01-15T11:30:00Z'
};

const mockStatusResponse = {
  sessionId: 'session-123',
  status: 'completed' as const,
  progress: 100,
  message: 'Tokenisation completed successfully',
  transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  blockExplorerUrl: 'https://polygonscan.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
};

describe('EnhancedTokenizationFlow', () => {
  const mockUserId = 'user-123';
  const mockAccount = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Web3 connection
    (useMetaMaskConnection as jest.Mock).mockReturnValue({
      account: mockAccount,
      isConnected: true,
      connectWallet: jest.fn(),
      provider: {
        getSigner: jest.fn().mockResolvedValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            })
          })
        })
      }
    });

    // Mock API calls
    (getAvailableAssets as jest.Mock).mockResolvedValue(mockAssets);
    (getUserTokens as jest.Mock).mockResolvedValue(mockUserTokens);
    (validateTokenisation as jest.Mock).mockResolvedValue(mockValidationResponse);
    (initiateTokenisation as jest.Mock).mockResolvedValue(mockInitiateResponse);
    (executeTokenisation as jest.Mock).mockResolvedValue({
      success: true,
      transactionId: 'tx-123',
      tokenAmount: 10,
      contractAddress: '0x1234567890123456789012345678901234567890',
      userTokens: mockUserTokens
    });
    (getTokenisationStatus as jest.Mock).mockResolvedValue(mockStatusResponse);
  });

  it('renders the component with asset selection step', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Select Asset')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Choose the property you want to invest in')).toBeInTheDocument();
    expect(screen.getByText('Select a property...')).toBeInTheDocument();
  });

  it('loads and displays available assets', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(getAvailableAssets).toHaveBeenCalled();
    });
    
    // Open the select dropdown
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      expect(screen.getByText('Luxury Villa Dubai')).toBeInTheDocument();
      expect(screen.getByText('Downtown Apartment')).toBeInTheDocument();
    });
  });

  it('allows asset selection and shows asset details', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    // Open select and choose an asset
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    // Check that asset details are displayed
    await waitFor(() => {
      expect(screen.getByText('$100')).toBeInTheDocument(); // Price per token
      expect(screen.getByText('15,000')).toBeInTheDocument(); // Available tokens
      expect(screen.getByText('8.5%')).toBeInTheDocument(); // ROI estimate
      expect(screen.getByText('6.2%')).toBeInTheDocument(); // Rental yield
    });
  });

  it('validates investment amount and proceeds to payment', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    // Select asset
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    // Enter investment amount
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2000');
    
    // Click validate button
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(validateTokenisation).toHaveBeenCalledWith({
        assetId: 'asset-1',
        amount: 2000,
        userId: mockUserId
      });
    });
    
    // Should proceed to payment step
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid amounts', async () => {
    const mockValidationError = {
      valid: false,
      errors: ['Investment amount is below minimum requirement'],
      warnings: [],
      estimatedFees: 0,
      totalCost: 0,
      availableTokens: 15000,
      maxAllowed: 500000
    };
    
    (validateTokenisation as jest.Mock).mockResolvedValue(mockValidationError);
    
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    // Select asset and enter low amount
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '500');
    
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Investment amount is below minimum requirement');
    });
  });

  it('handles Web3 payment method selection', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    // Navigate to payment step by selecting asset and validating
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2000');
    
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    // Click Web3 payment button
    const web3Button = screen.getByText('Pay with Ethereum');
    fireEvent.click(web3Button);
    
    await waitFor(() => {
      expect(initiateTokenisation).toHaveBeenCalledWith({
        assetId: 'asset-1',
        amount: 2000,
        paymentMethod: { type: 'web3', provider: 'metamask' },
        userId: mockUserId
      });
    });
    
    // Should proceed to processing step
    await waitFor(() => {
      expect(screen.getByText('Processing Tokenisation')).toBeInTheDocument();
    });
  });

  it('handles Stripe payment method selection', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    // Navigate to payment step
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2000');
    
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    // Click Stripe payment button
    const stripeButton = screen.getByText('Pay with Card');
    fireEvent.click(stripeButton);
    
    await waitFor(() => {
      expect(initiateTokenisation).toHaveBeenCalledWith({
        assetId: 'asset-1',
        amount: 2000,
        paymentMethod: { type: 'stripe', provider: 'stripe' },
        userId: mockUserId
      });
    });
    
    // Should show info toast about Stripe integration
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Stripe payment integration would be implemented here');
    });
  });

  it('shows processing progress and completes tokenisation', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    // Navigate to processing step
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2000');
    
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    const web3Button = screen.getByText('Pay with Ethereum');
    fireEvent.click(web3Button);
    
    await waitFor(() => {
      expect(screen.getByText('Processing Tokenisation')).toBeInTheDocument();
    });
    
    // Check progress indicators
    expect(screen.getByText('Validate')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Minting')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Tokenisation Complete!')).toBeInTheDocument();
    });
    
    expect(toast.success).toHaveBeenCalledWith('Tokenisation completed successfully!');
  });

  it('displays user portfolio summary', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Portfolio')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Luxury Villa Dubai')).toBeInTheDocument();
    expect(screen.getByText('50 DUBAI')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    (getAvailableAssets as jest.Mock).mockRejectedValue(new Error('Failed to load assets'));
    
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load available assets');
    });
  });

  it('shows AI buddy component', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-buddy')).toBeInTheDocument();
    });
  });

  it('resets flow when starting another', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    // Complete the flow first
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2000');
    
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    const web3Button = screen.getByText('Pay with Ethereum');
    fireEvent.click(web3Button);
    
    await waitFor(() => {
      expect(screen.getByText('Tokenisation Complete!')).toBeInTheDocument();
    });
    
    // Click "Start Another" button
    const startAnotherButton = screen.getByText('Start Another');
    fireEvent.click(startAnotherButton);
    
    // Should reset to asset selection
    await waitFor(() => {
      expect(screen.getByText('Select Asset')).toBeInTheDocument();
    });
  });

  it('disables validate button for invalid amounts', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    // Enter amount below minimum
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '500');
    
    const validateButton = screen.getByText('Validate Selection');
    expect(validateButton).toBeDisabled();
  });

  it('shows transaction hash and block explorer link', async () => {
    render(<EnhancedTokenizationFlow userId={mockUserId} />);
    
    // Navigate to processing step
    await waitFor(() => {
      expect(screen.getByText('Select a property...')).toBeInTheDocument();
    });
    
    const selectTrigger = screen.getByText('Select a property...');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const assetOption = screen.getByText('Luxury Villa Dubai');
      fireEvent.click(assetOption);
    });
    
    const amountInput = screen.getByLabelText('Investment Amount (USD)');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2000');
    
    const validateButton = screen.getByText('Validate Selection');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });
    
    const web3Button = screen.getByText('Pay with Ethereum');
    fireEvent.click(web3Button);
    
    await waitFor(() => {
      expect(screen.getByText('Processing Tokenisation')).toBeInTheDocument();
    });
    
    // Wait for completion to see transaction details
    await waitFor(() => {
      expect(screen.getByText('Tokenisation Complete!')).toBeInTheDocument();
    });
    
    // Check that transaction hash is displayed
    expect(screen.getByText(/0xabcdef/)).toBeInTheDocument();
  });
});