import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ResetPasswordRequest {
  token: string;
  password: string;
}

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
    const { token, password }: ResetPasswordRequest = await req.json();

    if (!token || !password) {
      return new Response(JSON.stringify({ error: "Token and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate token
    const { data: resetToken, error: tokenError } = await supabaseClient
      .from("password_reset_tokens")
      .select("id, user_id, email, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !resetToken) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if token has been used
    if (resetToken.used_at) {
      return new Response(JSON.stringify({ error: "Token has already been used" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);
    
    if (now > expiresAt) {
      return new Response(JSON.stringify({ error: "Token has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update user password using Supabase Auth Admin
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      resetToken.user_id,
      { password }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update password" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark token as used
    const { error: markUsedError } = await supabaseClient
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    if (markUsedError) {
      console.error("Error marking token as used:", markUsedError);
      // Don't fail the request if we can't mark the token as used
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});