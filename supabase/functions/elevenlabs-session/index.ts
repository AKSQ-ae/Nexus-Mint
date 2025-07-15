import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: SessionRequest = await req.json();
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      console.warn('ElevenLabs API key not configured - voice features disabled');
      return new Response(JSON.stringify({
        error: 'Voice features not configured',
        message: 'Voice chat is not available in this environment'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a conversational AI agent session with ElevenLabs
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=your-agent-id",
      {
        method: "GET",
        headers: {
          "xi-api-key": elevenlabsApiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ElevenLabs API error: ${error.detail || 'Unknown error'}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      signed_url: data.signed_url,
      session_id: data.session_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in elevenlabs-session:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);