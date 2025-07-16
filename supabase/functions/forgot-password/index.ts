import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Generate a secure random token
async function generateToken(): Promise<string> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Parse request body
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    const user = userData.users.find(u => u.email === email)

    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If an account with that email exists, a reset link has been sent.' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a secure token
    const token = await generateToken()
    const resetUrl = `${Deno.env.get('FRONTEND_URL') || 'https://nexus-mint.com'}/auth/reset?token=${token}`

    // Store the token in the database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email: email,
        token: token,
        used: false,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error storing reset token:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email with reset link
    const { error: emailError } = await supabase
      .from('emails')
      .insert({
        to: email,
        subject: 'Reset Your Password - Nexus Mint',
        template: 'password-reset',
        data: {
          resetUrl: resetUrl,
          userEmail: email,
          expiryHours: 24
        }
      })

    if (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If an account with that email exists, a reset link has been sent.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing forgot password request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})