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

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] TOKO Chat request started`);

    // Validate environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error(`[${requestId}] OPENAI_API_KEY is not configured`);
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Validate request body
    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message?.trim()) {
      console.error(`[${requestId}] Message is required`);
      throw new Error('Message is required');
    }

    console.log(`[${requestId}] TOKO Chat request:`, { 
      message: message.substring(0, 100), 
      historyLength: conversationHistory.length,
      timestamp: new Date().toISOString()
    });

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

    console.log(`[${requestId}] Calling OpenAI API...`);

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[${requestId}] OpenAI API response status:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error(`[${requestId}] OpenAI API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error(`[${requestId}] No response from AI`);
      throw new Error('No response from AI');
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] TOKO Chat response generated successfully in ${duration}ms`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      requestId: requestId,
      duration: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] TOKO Chat error after ${duration}ms:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Provide user-friendly error message
    let userMessage = "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists.";
    
    if (error.message.includes('timeout') || error.message.includes('abort')) {
      userMessage = "The request is taking longer than expected. Please try again.";
    } else if (error.message.includes('OPENAI_API_KEY')) {
      userMessage = "Service configuration error. Please contact support.";
    } else if (error.message.includes('401') || error.message.includes('403')) {
      userMessage = "Authentication error. Please contact support.";
    } else if (error.message.includes('429')) {
      userMessage = "Service is busy. Please try again in a moment.";
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: userMessage,
      requestId: requestId,
      duration: duration
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});