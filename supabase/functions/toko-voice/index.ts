import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceRequest {
  text: string;
  voiceId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' }: VoiceRequest = await req.json();

    if (!text?.trim()) {
      throw new Error('Text is required');
    }

    console.log('TOKO Voice request:', { textLength: text.length, voiceId });

    // Call ElevenLabs API for text-to-speech
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs API error:', errorData);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer();

    console.log('TOKO Voice response generated successfully');

    return new Response(audioBuffer, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      },
    });

  } catch (error) {
    console.error('TOKO Voice error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm experiencing technical difficulties with voice synthesis right now. Please try again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});