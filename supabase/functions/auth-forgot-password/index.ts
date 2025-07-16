import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ForgotPasswordRequest {
  email: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email }: ForgotPasswordRequest = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseClient
      .from("auth.users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists, but return success for security
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate reset token (secure random string)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    const { error: tokenError } = await supabaseClient
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        email,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error storing reset token:", tokenError);
      return new Response(JSON.stringify({ error: "Failed to generate reset token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email with reset link
    const resetUrl = `${Deno.env.get("SITE_URL") || "https://nexus-mint.com"}/auth/reset?token=${token}`;
    
    const { error: emailError } = await resend.emails.send({
      from: "Nexus Mint <noreply@nexusmint.com>",
      to: [email],
      subject: "Reset Your Password - Nexus Mint",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Nexus Mint</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to choose a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.
            </p>
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send reset email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});