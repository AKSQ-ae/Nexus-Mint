import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'investment' | 'kyc' | 'payment' | 'return' | 'system';
  read: boolean;
  action_url?: string;
  created_at: string;
}

export async function getNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

// Helper functions for creating common notifications
export async function notifyInvestmentUpdate(userId: string, investmentId: string, status: string) {
  const titles = {
    PAID: 'Payment Confirmed',
    TOKENS_ISSUED: 'Tokens Issued',
    CANCELLED: 'Investment Cancelled'
  };

  const messages = {
    PAID: 'Your investment payment has been confirmed and is being processed.',
    TOKENS_ISSUED: 'Your property tokens have been issued to your account.',
    CANCELLED: 'Your investment has been cancelled and any payments will be refunded.'
  };

  return createNotification({
    user_id: userId,
    title: titles[status] || 'Investment Update',
    message: messages[status] || 'Your investment status has been updated.',
    type: 'investment',
    read: false,
    action_url: `/portfolio`
  });
}

export async function notifyKYCUpdate(userId: string, status: string) {
  const titles = {
    approved: 'KYC Approved',
    rejected: 'KYC Documents Required',
    in_review: 'KYC Under Review'
  };

  const messages = {
    approved: 'Your identity verification has been approved. You can now make investments.',
    rejected: 'Additional documentation is required for your KYC verification.',
    in_review: 'Your KYC documents are currently under review.'
  };

  return createNotification({
    user_id: userId,
    title: titles[status] || 'KYC Update',
    message: messages[status] || 'Your KYC status has been updated.',
    type: 'kyc',
    read: false,
    action_url: `/profile/kyc`
  });
}

export async function notifyPaymentReceived(userId: string, amount: number) {
  return createNotification({
    user_id: userId,
    title: 'Payment Received',
    message: `You've received a dividend payment of $${amount.toLocaleString()}.`,
    type: 'return',
    read: false,
    action_url: `/portfolio`
  });
}