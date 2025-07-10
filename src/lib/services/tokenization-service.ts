import { supabase } from '@/integrations/supabase/client';

export interface TokenSupply {
  id: string;
  property_id: string;
  total_supply: number;
  available_supply: number;
  reserved_supply: number;
  token_price: number;
  minimum_investment: number;
  maximum_investment?: number;
  last_price_update: string;
}

export interface InvestmentTransaction {
  id: string;
  user_id: string;
  property_id: string;
  transaction_type: 'purchase' | 'sale' | 'dividend' | 'fee';
  token_amount: number;
  token_price: number;
  total_amount: number;
  fees_amount: number;
  net_amount: number;
  payment_method?: string;
  payment_currency: string;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  processed_at?: string;
}

export interface FeeSchedule {
  id: string;
  fee_type: 'onboarding' | 'management' | 'secondary_market' | 'withdrawal';
  percentage: number;
  fixed_amount: number;
  min_fee: number;
  max_fee?: number;
  currency: string;
  is_active: boolean;
}

export async function getTokenSupply(propertyId: string): Promise<TokenSupply | null> {
  const { data, error } = await supabase
    .from('token_supply')
    .select('*')
    .eq('property_id', propertyId)
    .single();

  if (error) throw error;
  return data;
}

export async function getFeeSchedules(): Promise<FeeSchedule[]> {
  const { data, error } = await supabase
    .from('fee_schedules')
    .select('*')
    .eq('is_active', true)
    .gte('effective_from', new Date().toISOString())
    .or('effective_until.is.null,effective_until.gt.' + new Date().toISOString());

  if (error) throw error;
  return (data || []) as FeeSchedule[];
}

export async function calculateInvestmentFees(amount: number, feeType: string = 'onboarding'): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_investment_fees', {
      investment_amount: amount,
      fee_type: feeType
    });

  if (error) throw error;
  return data || 0;
}

export async function createInvestment(propertyId: string, tokenAmount: number, paymentMethodId?: string) {
  const { data, error } = await supabase.functions.invoke('create-investment', {
    body: {
      propertyId,
      tokenAmount,
      paymentMethodId
    }
  });

  if (error) throw error;
  return data;
}

export async function getUserInvestmentTransactions(userId: string): Promise<InvestmentTransaction[]> {
  const { data, error } = await supabase
    .from('investment_transactions')
    .select(`
      *,
      properties!inner(title, city, country, images)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as InvestmentTransaction[];
}

export async function getPropertyInvestmentStats(propertyId: string) {
  const { data: tokenSupply } = await supabase
    .from('token_supply')
    .select('*')
    .eq('property_id', propertyId)
    .single();

  const { data: transactions } = await supabase
    .from('investment_transactions')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'completed');

  const totalInvested = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
  const totalInvestors = new Set(transactions?.map(t => t.user_id)).size;
  const fundingPercentage = tokenSupply ? 
    ((tokenSupply.total_supply - tokenSupply.available_supply) / tokenSupply.total_supply) * 100 : 0;

  return {
    totalInvested,
    totalInvestors,
    fundingPercentage,
    tokensIssued: tokenSupply ? tokenSupply.total_supply - tokenSupply.available_supply : 0,
    tokenPrice: tokenSupply?.token_price || 0,
    availableTokens: tokenSupply?.available_supply || 0
  };
}

export async function initializePropertyTokenization(
  propertyId: string, 
  totalSupply: number, 
  tokenPrice: number,
  minInvestment: number = 100
) {
  const { data, error } = await supabase
    .from('token_supply')
    .insert({
      property_id: propertyId,
      total_supply: totalSupply,
      available_supply: totalSupply,
      reserved_supply: 0,
      token_price: tokenPrice,
      minimum_investment: minInvestment
    })
    .select()
    .single();

  if (error) throw error;

  // Update property to mark as tokenization active
  await supabase
    .from('properties')
    .update({
      tokenization_active: true,
      price_per_token: tokenPrice,
      total_tokens: totalSupply
    })
    .eq('id', propertyId);

  return data;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatTokenAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}