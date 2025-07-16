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

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] TOKO Voice request started`);

    // Validate environment variables
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error(`[${requestId}] ELEVENLABS_API_KEY is not configured`);
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Validate request body
    const { text, voice = 'Sarah' }: VoiceRequest = await req.json();

    if (!text?.trim()) {
      console.error(`[${requestId}] Text is required for voice synthesis`);
      throw new Error('Text is required for voice synthesis');
    }

    console.log(`[${requestId}] TOKO Voice request:`, { 
      text: text.substring(0, 50), 
      voice,
      timestamp: new Date().toISOString()
    });

    // Validate text length
    if (text.length > 5000) {
      console.error(`[${requestId}] Text too long: ${text.length} characters`);
      throw new Error('Text is too long. Maximum 5000 characters allowed.');
    }

    console.log(`[${requestId}] Calling ElevenLabs API...`);

    // Call ElevenLabs Text-to-Speech API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL`, {
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

    clearTimeout(timeoutId);

    console.log(`[${requestId}] ElevenLabs API response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to read error response');
      console.error(`[${requestId}] ElevenLabs API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio buffer and convert to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] TOKO Voice response generated successfully in ${duration}ms`);

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      contentType: 'audio/mpeg',
      requestId: requestId,
      duration: duration,
      textLength: text.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] TOKO Voice error after ${duration}ms:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Provide user-friendly error message
    let userMessage = "Unable to generate audio. Please try again.";
    
    if (error.message.includes('timeout') || error.message.includes('abort')) {
      userMessage = "Audio generation is taking longer than expected. Please try again.";
    } else if (error.message.includes('ELEVENLABS_API_KEY')) {
      userMessage = "Service configuration error. Please contact support.";
    } else if (error.message.includes('401') || error.message.includes('403')) {
      userMessage = "Authentication error. Please contact support.";
    } else if (error.message.includes('429')) {
      userMessage = "Service is busy. Please try again in a moment.";
    } else if (error.message.includes('too long')) {
      userMessage = "Text is too long. Please use a shorter message.";
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      userMessage: userMessage,
      requestId: requestId,
      duration: duration
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});