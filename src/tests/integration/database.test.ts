import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '@/integrations/supabase/client';

describe('Database Integration Tests', () => {
  let testUserId: string;
  let testPropertyId: string;

  beforeAll(async () => {
    // Set up test data
    const { data: userData } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    testUserId = userData.user?.id || 'test-user-id';

    // Create test property
    const { data: propertyData } = await supabase
      .from('properties')
      .insert({
        title: 'Test Property',
        location: 'Test Location',
        price: 500000,
        price_per_token: 100,
        total_tokens: 5000,
        tokenization_active: true
      })
      .select()
      .single();
    
    testPropertyId = propertyData?.id || 'test-property-id';
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('investments').delete().eq('user_id', testUserId);
    await supabase.from('properties').delete().eq('id', testPropertyId);
    await supabase.auth.admin.deleteUser(testUserId);
  });

  describe('Properties Table', () => {
    it('should fetch active properties', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter properties by tokenization status', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('tokenization_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        expect(data.every(p => p.tokenization_active)).toBe(true);
      }
    });

    it('should calculate funding percentage correctly', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('total_tokens, tokens_issued')
        .eq('id', testPropertyId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data) {
        const fundingPercentage = (data.tokens_issued / data.total_tokens) * 100;
        expect(fundingPercentage).toBeGreaterThanOrEqual(0);
        expect(fundingPercentage).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Investments Table', () => {
    it('should create investment record', async () => {
      const investmentData = {
        user_id: testUserId,
        property_id: testPropertyId,
        token_amount: 10,
        total_amount: 1000,
        price_per_token: 100,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('investments')
        .insert(investmentData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(testUserId);
      expect(data?.property_id).toBe(testPropertyId);
      expect(data?.token_amount).toBe(10);
    });

    it('should fetch user investments', async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should calculate portfolio value', async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('token_amount, total_amount')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data && data.length > 0) {
        const totalInvested = data.reduce((sum, inv) => sum + inv.total_amount, 0);
        expect(totalInvested).toBeGreaterThan(0);
      }
    });
  });

  describe('Fee Schedules', () => {
    it('should fetch active fee schedules', async () => {
      const { data, error } = await supabase
        .from('fee_schedules')
        .select('*')
        .eq('is_active', true)
        .lte('effective_from', new Date().toISOString());

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data && data.length > 0) {
        expect(data.every(fee => fee.is_active)).toBe(true);
        expect(data.every(fee => fee.percentage >= 0)).toBe(true);
      }
    });

    it('should calculate fees correctly', async () => {
      const { data } = await supabase.rpc('calculate_investment_fees', {
        investment_amount: 1000
      });

      expect(data).toBeGreaterThanOrEqual(0);
      expect(typeof data).toBe('number');
    });
  });

  describe('Token Holdings', () => {
    it('should track token ownership', async () => {
      const tokenData = {
        user_id: testUserId,
        property_id: testPropertyId,
        token_amount: 10,
        purchase_price: 100,
        wallet_address: '0x123456789'
      };

      const { data, error } = await supabase
        .from('token_holders')
        .insert(tokenData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.token_amount).toBe(10);
    });

    it('should aggregate token holdings by user', async () => {
      const { data, error } = await supabase
        .from('token_holders')
        .select('token_amount, purchase_price')
        .eq('user_id', testUserId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data && data.length > 0) {
        const totalTokens = data.reduce((sum, holding) => sum + holding.token_amount, 0);
        expect(totalTokens).toBeGreaterThan(0);
      }
    });
  });

  describe('Analytics Data', () => {
    it('should track investment analytics', async () => {
      const analyticsData = {
        user_id: testUserId,
        property_id: testPropertyId,
        metric_type: 'portfolio_value',
        metric_value: 1000
      };

      const { data, error } = await supabase
        .from('investment_analytics')
        .insert(analyticsData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.metric_type).toBe('portfolio_value');
    });

    it('should fetch property performance data', async () => {
      const { data, error } = await supabase
        .from('property_performance')
        .select('*')
        .eq('property_id', testPropertyId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('RLS Policies', () => {
    it('should enforce user isolation for investments', async () => {
      // Try to access another user's investments (should fail)
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', 'other-user-id');

      // With RLS, this should return empty array or error
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBe(0);
    });

    it('should allow public access to property data', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Database Functions', () => {
    it('should execute fee calculation function', async () => {
      const { data, error } = await supabase.rpc('calculate_investment_fees', {
        investment_amount: 1000,
        fee_type: 'onboarding'
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('number');
      expect(data).toBeGreaterThanOrEqual(0);
    });

    it('should check user roles', async () => {
      const { data, error } = await supabase.rpc('get_user_role', {
        user_id: testUserId
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });
});