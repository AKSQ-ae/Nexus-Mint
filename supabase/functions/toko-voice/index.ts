import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceRequest {
  text: string;
  voice?: string;
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

    const { text, voice = 'Sarah' }: VoiceRequest = await req.json();

    // Determine which ElevenLabs voice ID to use
    // Priority: explicit voice param -> ELEVENLABS_VOICE_ID env -> default constant
    const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL';
    const envVoiceId = Deno.env.get('ELEVENLABS_VOICE_ID');
    const voiceId = voice || envVoiceId || defaultVoiceId;

    if (!text?.trim()) {
      throw new Error('Text is required for voice synthesis');
    }

    console.log('TOKO Voice request:', { text: text.substring(0, 50), voiceId });

    // Call ElevenLabs Text-to-Speech API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    let response: Response;
    try {
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
        console.error('ElevenLabs request timed out after 30s');
        throw new Error('ElevenLabs request timed out');
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    // Get audio buffer and convert to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log('TOKO Voice response generated successfully');

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      contentType: 'audio/mpeg'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('TOKO Voice error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});