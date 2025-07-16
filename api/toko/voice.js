const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify environment variables are properly configured
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not configured');
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    console.log('ELEVENLABS_API_KEY is configured:', !!ELEVENLABS_API_KEY);

    const { text, voice_id = '21m00Tcm4TlvDq8ikWAM' } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('TOKO Voice request:', { text: text.substring(0, 100), voice_id });

    // Call ElevenLabs API for text-to-speech
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
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
      return res.status(response.status).json({ error: `ElevenLabs API error: ${response.status}` });
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return res.status(500).json({ error: 'No audio generated' });
    }

    console.log('TOKO Voice response generated successfully, audio size:', audioBuffer.byteLength);

    // Convert ArrayBuffer to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      audio: base64Audio,
      format: 'mp3',
      size: audioBuffer.byteLength,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('TOKO Voice error:', error);
    
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return res.status(500).json({
      error: error.message || 'Unknown error',
      response: "I'm experiencing technical difficulties with voice generation. Please try again in a moment."
    });
  }
}