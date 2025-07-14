import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { createInvestment, calculateFees, validateInvestment } from '@/lib/services/investment-service';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ 
        data: [{ id: '123', status: 'pending' }], 
        error: null 
      })),
      select: vi.fn(() => ({ 
        data: [{ percentage: 2.5, fixed_amount: 0, min_fee: 10 }], 
        error: null 
      })),
      eq: vi.fn(() => ({ 
        single: vi.fn(() => ({ 
          data: { price_per_token: 100, min_investment: 100 }, 
          error: null 
        }))
      }))
    })),
    functions: {
      invoke: vi.fn(() => ({ 
        data: { success: true, transaction_id: 'txn_123' }, 
        error: null 
      }))
    }
  }
}));

describe('Investment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateFees', () => {
    it('calculates percentage fees correctly', () => {
      const fees = calculateFees(1000, { percentage: 2.5, fixed_amount: 0, min_fee: 10 });
      expect(fees).toBe(25); // 2.5% of 1000
    });

    it('applies minimum fee when percentage is too low', () => {
      const fees = calculateFees(100, { percentage: 2.5, fixed_amount: 0, min_fee: 10 });
      expect(fees).toBe(10); // min_fee is higher than 2.5% of 100
    });

    it('adds fixed amount to percentage', () => {
      const fees = calculateFees(1000, { percentage: 2.5, fixed_amount: 5, min_fee: 0 });
      expect(fees).toBe(30); // 2.5% of 1000 + 5
    });

    it('handles zero amounts', () => {
      const fees = calculateFees(0, { percentage: 2.5, fixed_amount: 5, min_fee: 10 });
      expect(fees).toBe(10); // min_fee applies
    });
  });

  describe('validateInvestment', () => {
    const mockProperty = {
      id: '1',
      price_per_token: 100,
      min_investment: 100,
      max_investment: 50000,
      total_tokens: 10000,
      tokens_issued: 5000
    };

    it('validates correct investment amounts', () => {
      const result = validateInvestment(1000, mockProperty);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects amounts below minimum', () => {
      const result = validateInvestment(50, mockProperty);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Investment amount must be at least $100');
    });

    it('rejects amounts above maximum', () => {
      const result = validateInvestment(60000, mockProperty);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Investment amount cannot exceed $50,000');
    });

    it('rejects non-numeric amounts', () => {
      const result = validateInvestment('invalid' as any, mockProperty);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Investment amount must be a valid number');
    });

    it('rejects negative amounts', () => {
      const result = validateInvestment(-100, mockProperty);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Investment amount must be positive');
    });

    it('validates token divisibility', () => {
      // Amount that doesn't divide evenly by token price
      const result = validateInvestment(150, mockProperty); // 150/100 = 1.5 tokens
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Investment amount must result in whole tokens');
    });
  });

  describe('createInvestment', () => {
    it('creates investment successfully', async () => {
      const investmentData = {
        user_id: 'user123',
        property_id: 'prop123',
        amount: 1000,
        payment_method: 'stripe'
      };

      const result = await createInvestment(investmentData);
      
      expect(result.success).toBe(true);
      expect(result.investment_id).toBe('123');
      expect(result.status).toBe('pending');
    });

    it('handles validation errors', async () => {
      const invalidData = {
        user_id: 'user123',
        property_id: 'prop123',
        amount: 50, // Below minimum
        payment_method: 'stripe'
      };

      const result = await createInvestment(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Investment amount must be at least $100');
    });

    it('handles database errors', async () => {
      // Mock database error
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn(() => ({ data: null, error: { message: 'Database error' } }))
      } as any);

      const investmentData = {
        user_id: 'user123',
        property_id: 'prop123',
        amount: 1000,
        payment_method: 'stripe'
      };

      const result = await createInvestment(investmentData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('calculates token amounts correctly', async () => {
      const investmentData = {
        user_id: 'user123',
        property_id: 'prop123',
        amount: 1000,
        payment_method: 'stripe'
      };

      const result = await createInvestment(investmentData);
      
      expect(result.token_amount).toBe(10); // 1000 / 100 = 10 tokens
      expect(result.fees_amount).toBe(25); // 2.5% of 1000
      expect(result.total_amount).toBe(1025); // 1000 + 25
    });

    it('processes payment through edge function', async () => {
      const investmentData = {
        user_id: 'user123',
        property_id: 'prop123',
        amount: 1000,
        payment_method: 'stripe'
      };

      await createInvestment(investmentData);
      
      const { supabase } = await import('@/integrations/supabase/client');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-investment-payment', {
        body: expect.objectContaining({
          investment_id: '123',
          amount: 1025,
          payment_method: 'stripe'
        })
      });
    });
  });

  describe('edge cases', () => {
    it('handles property not found', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: { message: 'Not found' } }))
          }))
        }))
      } as any);

      const investmentData = {
        user_id: 'user123',
        property_id: 'nonexistent',
        amount: 1000,
        payment_method: 'stripe'
      };

      const result = await createInvestment(investmentData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Property not found');
    });

    it('handles insufficient tokens available', async () => {
      const soldOutProperty = {
        id: '1',
        price_per_token: 100,
        min_investment: 100,
        total_tokens: 10000,
        tokens_issued: 9990 // Only 10 tokens left
      };

      const result = validateInvestment(2000, soldOutProperty); // Wants 20 tokens
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Not enough tokens available');
    });
  });
});