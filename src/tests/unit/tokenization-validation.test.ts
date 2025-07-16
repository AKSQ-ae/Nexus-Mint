import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TokenizationFlow } from '@/components/tokenization/TokenizationFlow';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
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

const mockProperty = {
  id: 'test-property-id',
  title: 'Test Property',
  location: 'Dubai Marina',
  price: 1000000,
  price_per_token: 100,
  min_investment: 1000,
  funding_target: 500000,
  funding_deadline: '2024-12-31',
  total_tokens: 10000,
  tokens_issued: 0,
  tokenization_status: 'available',
  description: 'A beautiful property in Dubai Marina with stunning views and modern amenities.',
  images: []
};

describe('Tokenization Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock property data fetch
    const { supabase } = require('@/integrations/supabase/client');
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProperty,
            error: null
          })
        })
      })
    });
  });

  describe('TOKO Validation Integration', () => {
    it('calls TOKO validation before launching tokenization', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      // Mock successful validation
      supabase.functions.invoke
        .mockResolvedValueOnce({
          data: {
            valid: true,
            errors: [],
            warnings: []
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: { success: true },
          error: null
        });

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Check that validation was called
        expect(supabase.functions.invoke).toHaveBeenCalledWith('validate-tokenization', {
          body: {
            formData: {
              propertyId: 'test-property-id',
              propertyValue: 1000000,
              tokenPrice: 100,
              totalTokens: 10000,
              minInvestment: 1000,
              fundingTarget: 500000,
              fundingDeadline: '2024-12-31',
              propertyType: 'residential',
              location: 'Dubai Marina',
              description: 'A beautiful property in Dubai Marina with stunning views and modern amenities.',
              documents: []
            },
            userId: 'test-user-id'
          }
        });

        // Check success message
        expect(toast.success).toHaveBeenCalledWith('TOKO validation passed! Proceeding with tokenization...');
      });
    });

    it('shows error when TOKO validation fails', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      // Mock failed validation
      supabase.functions.invoke.mockResolvedValueOnce({
        data: {
          valid: false,
          errors: ['Property value must be greater than 0'],
          warnings: []
        },
        error: null
      });

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Check error message
        expect(toast.error).toHaveBeenCalledWith('Validation failed: Property value must be greater than 0');
      });
    });

    it('handles validation API errors gracefully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      // Mock API error
      supabase.functions.invoke.mockRejectedValueOnce(new Error('API Error'));

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Check error message
        expect(toast.error).toHaveBeenCalledWith('Failed to launch tokenization');
      });
    });

    it('validates required form fields', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      // Mock validation with missing required fields
      supabase.functions.invoke.mockResolvedValueOnce({
        data: {
          valid: false,
          errors: [
            'Property ID is required',
            'Property value must be greater than 0',
            'Token price must be greater than 0',
            'Total tokens must be greater than 0',
            'Minimum investment must be greater than 0',
            'Funding target must be greater than 0',
            'Funding deadline is required',
            'Property type is required',
            'Location is required',
            'Description must be at least 50 characters'
          ],
          warnings: []
        },
        error: null
      });

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Check that validation was called with correct form data
        expect(supabase.functions.invoke).toHaveBeenCalledWith('validate-tokenization', {
          body: expect.objectContaining({
            formData: expect.objectContaining({
              propertyId: 'test-property-id',
              propertyValue: 1000000,
              tokenPrice: 100,
              totalTokens: 10000,
              minInvestment: 1000,
              fundingTarget: 500000,
              fundingDeadline: '2024-12-31',
              propertyType: 'residential',
              location: 'Dubai Marina',
              description: expect.stringMatching(/A beautiful property/)
            })
          })
        });
      });
    });

    it('validates business logic rules', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      // Mock validation with business logic errors
      supabase.functions.invoke.mockResolvedValueOnce({
        data: {
          valid: false,
          errors: [
            'Token price × total tokens must equal property value',
            'Minimum investment cannot exceed funding target',
            'Funding target cannot exceed property value',
            'Funding deadline must be in the future'
          ],
          warnings: []
        },
        error: null
      });

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Check that business logic validation was performed
        expect(supabase.functions.invoke).toHaveBeenCalledWith('validate-tokenization', {
          body: expect.objectContaining({
            formData: expect.objectContaining({
              propertyValue: 1000000,
              tokenPrice: 100,
              totalTokens: 10000
            })
          })
        });
      });
    });

    it('handles warnings without blocking validation', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      // Mock validation with warnings but valid
      supabase.functions.invoke
        .mockResolvedValueOnce({
          data: {
            valid: true,
            errors: [],
            warnings: [
              'No supporting documents provided',
              'Property value is below recommended minimum',
              'Token price is very low'
            ]
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: { success: true },
          error: null
        });

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Check that validation passed despite warnings
        expect(toast.success).toHaveBeenCalledWith('TOKO validation passed! Proceeding with tokenization...');
      });
    });
  });

  describe('Validation Data Structure', () => {
    it('sends correct form data structure to validation API', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      supabase.functions.invoke.mockResolvedValueOnce({
        data: { valid: true, errors: [], warnings: [] },
        error: null
      });

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        // Verify the exact structure of the form data
        const callArgs = supabase.functions.invoke.mock.calls[0];
        expect(callArgs[0]).toBe('validate-tokenization');
        expect(callArgs[1]).toEqual({
          body: {
            formData: {
              propertyId: 'test-property-id',
              propertyValue: 1000000,
              tokenPrice: 100,
              totalTokens: 10000,
              minInvestment: 1000,
              fundingTarget: 500000,
              fundingDeadline: '2024-12-31',
              propertyType: 'residential',
              location: 'Dubai Marina',
              description: 'A beautiful property in Dubai Marina with stunning views and modern amenities.',
              documents: []
            },
            userId: 'test-user-id'
          }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors during validation', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      // Mock network error
      supabase.functions.invoke.mockRejectedValueOnce(new Error('Network Error'));

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to launch tokenization');
      });
    });

    it('handles validation timeout gracefully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      // Mock timeout
      supabase.functions.invoke.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      renderWithProviders(<TokenizationFlow propertyId="test-property-id" />);

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the launch button
      const launchButton = screen.getByText(/Launch Tokenization/);
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to launch tokenization');
      }, { timeout: 2000 });
    });
  });
});