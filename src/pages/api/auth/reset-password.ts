import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Missing token or newPassword' });
  }

  try {
    // Validate the token by exchanging it for a user session
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const userId = data.user.id;

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Optionally, you can revoke all refresh tokens for this user
    await supabaseAdmin.auth.admin.signOutUser(userId);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}