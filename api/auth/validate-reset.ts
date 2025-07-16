import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const token = (req.query.token as string) || '';

  if (!token) {
    res.status(400).json({ valid: false, message: 'Token is required' });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      res.status(200).json({ valid: false });
      return;
    }

    const isExpired = new Date(data.expires_at).getTime() < Date.now();

    res.status(200).json({ valid: !isExpired });
  } catch (err) {
    console.error('Validate-reset error', err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
}