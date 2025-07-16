import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin';
import crypto from 'crypto';

// How long before the token expires (in ms)
const TOKEN_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

// Send email helper (simple SendGrid fallback, otherwise console.log)
async function sendResetEmail(email: string, resetLink: string) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@nexus-mint.com';

  const subject = 'Reset your Nexus Mint password';
  const html = /*html*/`
    <p>Hello,</p>
    <p>We received a request to reset your Nexus Mint password. Click the link below to set a new password. This link will expire in 1 hour.</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>— The Nexus Mint Team</p>
  `;

  if (sendgridApiKey) {
    const sgModule = await import('@sendgrid/mail');
    const sgMail = (sgModule as any).default || sgModule;
    sgMail.setApiKey(sendgridApiKey);
    await sgMail.send({ to: email, from: fromEmail, subject, html });
  } else {
    console.log(`[Email DEBUG] Would send to ${email}: ${resetLink}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { email } = req.body as { email?: string };

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ message: 'Valid email is required' });
    return;
  }

  try {
    // Look up the user by email
    const { data: user, error: getUserErr } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    // Always respond with 200 even if user not found to avoid enumeration
    if (getUserErr || !user) {
      console.warn('Password reset requested for non-existent email', email);
      res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
      return;
    }

    // Generate secure random token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString();

    // Store token in DB
    const { error: insertErr } = await supabaseAdmin.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    if (insertErr) {
      console.error('Failed to store reset token', insertErr);
      res.status(500).json({ message: 'Could not create reset token' });
      return;
    }

    const origin = process.env.FRONTEND_URL || (req.headers['origin'] as string) || 'https://nexus-mint.com';
    const resetLink = `${origin}/auth/reset?token=${token}`;

    await sendResetEmail(email, resetLink);

    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot-password error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}