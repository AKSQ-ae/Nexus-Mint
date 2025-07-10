import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: 'bank_transfer' | 'crypto' | 'credit_card';
  details: {
    account_number?: string;
    routing_number?: string;
    bank_name?: string;
    wallet_address?: string;
    wallet_type?: string;
    card_last_four?: string;
    card_brand?: string;
  };
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPaymentMethods(userId: string) {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) {
  // If this is set as default, unset others
  if (paymentMethod.is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', paymentMethod.user_id);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert(paymentMethod)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>) {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePaymentMethod(id: string) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function processInvestmentPayment(investmentId: string, paymentMethodId: string) {
  // This would integrate with payment processors like Stripe, bank APIs, or crypto payment systems
  // For now, we'll simulate the payment process
  
  const { data: investment, error: invError } = await supabase
    .from('investments')
    .select('*, payment_methods(*)')
    .eq('id', investmentId)
    .single();

  if (invError) throw invError;

  // Simulate payment processing
  const paymentResult = {
    success: true,
    transaction_id: `txn_${Date.now()}`,
    amount: investment.total_amount,
    currency: 'USD'
  };

  if (paymentResult.success) {
    // Update investment status
    const { error: updateError } = await supabase
      .from('investments')
      .update({
        status: 'PAID',
        payment_tx_hash: paymentResult.transaction_id,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', investmentId);

    if (updateError) throw updateError;
  }

  return paymentResult;
}