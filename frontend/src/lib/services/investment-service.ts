import { supabase } from '@/integrations/supabase/client';

export async function getUserInvestments(userId: string) {
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      properties!inner(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getInvestmentById(id: string, userId: string) {
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      properties!inner(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPortfolioStats(userId: string) {
  const { data: investments, error } = await supabase
    .from('investments')
    .select(`
      *,
      properties!inner(*)
    `)
    .eq('user_id', userId)
    .in('status', ['PAID', 'TOKENS_ISSUED']);

  if (error) throw error;

  if (!investments || investments.length === 0) {
    return {
      totalInvested: 0,
      totalValue: 0,
      propertyCount: 0,
      totalTokens: 0,
      investments: 0,
    };
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + (inv.total_amount || 0),
    0
  );

  const totalValue = investments.reduce((sum, inv) => {
    const currentValue = inv.token_amount * (inv.properties.price_per_token || 100);
    return sum + currentValue;
  }, 0);

  const propertyCount = new Set(investments.map((inv) => inv.property_id)).size;

  const totalTokens = investments.reduce(
    (sum, inv) => sum + inv.token_amount,
    0
  );

  return {
    totalInvested,
    totalValue,
    propertyCount,
    totalTokens,
    investments: investments.length,
  };
}