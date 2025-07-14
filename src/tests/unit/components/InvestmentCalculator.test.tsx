import { describe, it, expect, vi } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InvestmentCalculator } from '@/components/investment/InvestmentCalculator';

const mockProperty = {
  id: '1',
  price_per_token: 100,
  min_investment: 100,
  max_investment: 50000,
  total_tokens: 10000,
  tokens_issued: 5000
};

describe('InvestmentCalculator Component', () => {
  it('calculates token amount correctly', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('token-amount')).toHaveTextContent('10');
    });
  });

  it('calculates fees correctly', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    await waitFor(() => {
      // Assuming 2.5% fee
      expect(screen.getByTestId('fees-amount')).toHaveTextContent('25');
    });
  });

  it('calculates total amount including fees', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('total-amount')).toHaveTextContent('1025');
    });
  });

  it('enforces minimum investment amount', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '50' } });
    
    await waitFor(() => {
      expect(screen.getByText('Minimum investment is $100')).toBeInTheDocument();
    });
  });

  it('enforces maximum investment amount', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '60000' } });
    
    await waitFor(() => {
      expect(screen.getByText('Maximum investment is $50,000')).toBeInTheDocument();
    });
  });

  it('shows estimated returns', async () => {
    const propertyWithReturns = {
      ...mockProperty,
      estimated_annual_return: 8.5
    };
    
    render(<InvestmentCalculator property={propertyWithReturns} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('estimated-return')).toHaveTextContent('85'); // 8.5% of 1000
    });
  });

  it('handles investment submission', async () => {
    const onInvestMock = vi.fn();
    render(<InvestmentCalculator property={mockProperty} onInvest={onInvestMock} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    const investButton = screen.getByTestId('invest-button');
    fireEvent.click(investButton);
    
    await waitFor(() => {
      expect(onInvestMock).toHaveBeenCalledWith({
        amount: 1000,
        tokens: 10,
        fees: 25,
        total: 1025
      });
    });
  });

  it('validates input format', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: 'invalid' } });
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
    });
  });

  it('updates calculations in real-time', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    
    // First calculation
    fireEvent.change(amountInput, { target: { value: '500' } });
    await waitFor(() => {
      expect(screen.getByTestId('token-amount')).toHaveTextContent('5');
    });
    
    // Second calculation
    fireEvent.change(amountInput, { target: { value: '2000' } });
    await waitFor(() => {
      expect(screen.getByTestId('token-amount')).toHaveTextContent('20');
    });
  });

  it('disables invest button for invalid amounts', async () => {
    render(<InvestmentCalculator property={mockProperty} />);
    
    const amountInput = screen.getByTestId('investment-amount');
    fireEvent.change(amountInput, { target: { value: '50' } }); // Below minimum
    
    await waitFor(() => {
      const investButton = screen.getByTestId('invest-button');
      expect(investButton).toBeDisabled();
    });
  });
});