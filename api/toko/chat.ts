import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS configuration allowing any origin; adjust as needed for security
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  message: string;
  conversationHistory?: Message[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']).setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }

    const { message, conversationHistory = [] } = req.body as ChatRequestBody;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build messages array for OpenAI
    const systemPrompt = `You are TOKO AI Advisor, an expert real estate investment assistant for the Nexus Mint platform. You help investors make informed decisions about tokenized real estate investments.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openAiResponse.ok) {
      const err = await openAiResponse.json().catch(() => ({}));
      console.error('OpenAI error:', err);
      return res.status(openAiResponse.status).json({ error: err.error?.message || 'OpenAI API error' });
    }

    const data = await openAiResponse.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return res.status(500).json({ error: 'Invalid response from OpenAI' });
    }

    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
      response: aiMessage,
      conversationId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('TOKO Chat endpoint error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error',
      response: "I'm experiencing technical difficulties right now. Please try again later.",
    });
  }
}