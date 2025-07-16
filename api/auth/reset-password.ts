import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || typeof token !== 'string' || token.length === 0) {
    res.status(400).json({ message: 'Token is required' });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters long' });
    return;
  }

  try {
    // Validate token
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at')
      .eq('token', token)
      .single();

    if (tokenErr || !tokenRow) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
      res.status(400).json({ message: 'Token has expired' });
      return;
    }

    // Update user password via admin API
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(tokenRow.user_id, {
      password,
    });

    if (updateErr) {
      console.error('Password update error', updateErr);
      res.status(500).json({ message: 'Unable to reset password' });
      return;
    }

    // Delete token after successful use
    await supabaseAdmin.from('password_reset_tokens').delete().eq('id', tokenRow.id);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset-password error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}