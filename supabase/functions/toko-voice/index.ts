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

// Enhanced logging function
function log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data ? JSON.stringify(data) : undefined
  };
  console.log(JSON.stringify(logEntry));
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  log('info', `TOKO Voice request started`, { requestId, method: req.method });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      log('error', 'ELEVENLABS_API_KEY is not configured', { requestId });
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Validate API key format (basic check)
    if (ELEVENLABS_API_KEY.length < 20) {
      log('error', 'ELEVENLABS_API_KEY format appears invalid', { requestId });
      throw new Error('ELEVENLABS_API_KEY format appears invalid');
    }

    // Parse and validate request
    let requestBody: VoiceRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      log('error', 'Failed to parse request body', { requestId, error: parseError.message });
      throw new Error('Invalid request body');
    }

    const { text, voice = 'Sarah' } = requestBody;

    if (!text?.trim()) {
      log('error', 'Text is required for voice synthesis', { requestId });
      throw new Error('Text is required for voice synthesis');
    }

    // Validate text length (ElevenLabs has limits)
    if (text.length > 5000) {
      log('error', 'Text too long for voice synthesis', { requestId, textLength: text.length });
      throw new Error('Text too long for voice synthesis (max 5000 characters)');
    }

    log('info', 'TOKO Voice request validated', { 
      requestId, 
      textLength: text.length, 
      voice,
      textPreview: text.substring(0, 50) 
    });

    // Voice ID mapping
    const voiceIds = {
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Rachel': '21m00Tcm4TlvDq8ikWAM',
      'Domi': 'AZnzlk1XvdvUeBnXmlld',
      'Bella': 'EXAVITQu4vr4xnSDxMaL',
      'Antoni': 'ErXwobaYiN019PkySvjV',
      'Elli': 'MF3mGyEYCl7XYWbV9V6O',
      'Josh': 'TxGEqnHWrfWFTfGW9XjX',
      'Arnold': 'VR6AewLTigWG4xSOukaG',
      'Adam': 'pNInz6obpgDQGcFmaJgB',
      'Sam': 'yoZ06aMxZJJ28mfd3POQ'
    };

    const voiceId = voiceIds[voice] || voiceIds['Sarah'];
    
    log('info', 'Calling ElevenLabs API', { 
      requestId, 
      voiceId,
      textLength: text.length,
      model: 'eleven_multilingual_v2'
    });

    // Call ElevenLabs Text-to-Speech API with timeout
    const elevenlabsResponse = await fetchWithTimeout(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
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
      },
      30000 // 30 second timeout
    );

    if (!elevenlabsResponse.ok) {
      let errorData;
      try {
        errorData = await elevenlabsResponse.json();
      } catch {
        errorData = await elevenlabsResponse.text();
      }
      
      log('error', 'ElevenLabs API error', { 
        requestId, 
        status: elevenlabsResponse.status, 
        statusText: elevenlabsResponse.statusText,
        error: errorData 
      });
      
      // Provide specific error messages based on status codes
      if (elevenlabsResponse.status === 401) {
        throw new Error('ElevenLabs API key is invalid or expired');
      } else if (elevenlabsResponse.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded. Please try again in a moment.');
      } else if (elevenlabsResponse.status === 422) {
        throw new Error('Invalid text or voice settings for ElevenLabs API');
      } else if (elevenlabsResponse.status === 500) {
        throw new Error('ElevenLabs service is temporarily unavailable. Please try again.');
      } else {
        throw new Error(`ElevenLabs API error: ${elevenlabsResponse.status} ${elevenlabsResponse.statusText}`);
      }
    }

    // Get audio buffer and convert to base64
    let audioBuffer;
    try {
      audioBuffer = await elevenlabsResponse.arrayBuffer();
    } catch (bufferError) {
      log('error', 'Failed to read audio buffer', { requestId, error: bufferError.message });
      throw new Error('Failed to process audio response');
    }

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      log('error', 'Empty audio buffer received', { requestId });
      throw new Error('No audio content received from ElevenLabs');
    }

    // Convert to base64
    let base64Audio;
    try {
      base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(audioBuffer))
      );
    } catch (base64Error) {
      log('error', 'Failed to convert audio to base64', { requestId, error: base64Error.message });
      throw new Error('Failed to process audio data');
    }

    log('info', 'TOKO Voice response generated successfully', { 
      requestId, 
      audioSize: audioBuffer.byteLength,
      base64Length: base64Audio.length 
    });

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      contentType: 'audio/mpeg',
      audioSize: audioBuffer.byteLength
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'TOKO Voice error', { 
      requestId, 
      error: error.message,
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to add timeout to fetch requests
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}