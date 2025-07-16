import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowlist any origin; tighten for production as needed
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceRequestBody {
  text: string;
  voice_id?: string; // Optional custom voice
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res
      .status(200)
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured in environment variables');
    }

    const { text, voice_id = '21m00Tcm4TlvDq8ikWAM' } = req.body as VoiceRequestBody; // Default voice if none provided

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Build ElevenLabs TTS request
    const ttsEndpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`;

    const ttsResponse = await fetch(ttsEndpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!ttsResponse.ok) {
      const err = await ttsResponse.json().catch(() => ({}));
      console.error('ElevenLabs error:', err);
      return res.status(ttsResponse.status).json({ error: err.error || 'ElevenLabs API error' });
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Content-Type', 'audio/mpeg');

    return res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error('TOKO Voice endpoint error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}