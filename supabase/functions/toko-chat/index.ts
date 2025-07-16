import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    console.log('TOKO Chat request:', { message, historyLength: conversationHistory.length });

    // Build conversation context
    const systemPrompt = `You are TOKO AI Advisor, an expert real estate investment assistant for Nexus Mint platform. You help investors make informed decisions about tokenized real estate investments.

Key capabilities:
- Analyze portfolio performance and risk
- Recommend high-yield opportunities (8-12% target returns)
- Explain tokenized real estate concepts
- Provide market insights and trends
- Help with diversification strategies
- Explain fees and investment processes

Nexus Mint context:
- Minimum investment: $100 USD (≈ AED 367)
- Focus on UAE/Middle East real estate markets
- Tokenized fractional ownership model
- Monthly rental income distributions
- Smart contract-based investments
- KYC verification required

Response style:
- Professional yet conversational
- Use specific numbers and percentages when possible
- Provide actionable insights
- Be concise but comprehensive
- Always consider risk management
- Reference UAE/Middle East market knowledge

Current market context:
- UAE real estate showing strong growth
- Dubai property market up 15% YoY
- High rental yields in emerging areas
- Strong regulatory framework for tokenization`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('TOKO Chat response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('TOKO Chat error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});