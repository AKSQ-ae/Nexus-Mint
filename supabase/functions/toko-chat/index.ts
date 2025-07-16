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
  log('info', `TOKO Chat request started`, { requestId, method: req.method });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      log('error', 'OPENAI_API_KEY is not configured', { requestId });
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Validate API key format (basic check)
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      log('error', 'OPENAI_API_KEY format appears invalid', { requestId });
      throw new Error('OPENAI_API_KEY format appears invalid');
    }

    // Parse and validate request
    let requestBody: ChatRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      log('error', 'Failed to parse request body', { requestId, error: parseError.message });
      throw new Error('Invalid request body');
    }

    const { message, conversationHistory = [] } = requestBody;

    if (!message?.trim()) {
      log('error', 'Message is required', { requestId });
      throw new Error('Message is required');
    }

    log('info', 'TOKO Chat request validated', { 
      requestId, 
      messageLength: message.length, 
      historyLength: conversationHistory.length 
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

    log('info', 'Calling OpenAI API', { 
      requestId, 
      model: 'gpt-4o-mini',
      messageCount: messages.length,
      maxTokens: 500
    });

    // Call OpenAI API with timeout and retry logic
    const openaiResponse = await fetchWithTimeout(
      'https://api.openai.com/v1/chat/completions',
      {
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
      },
      25000 // 25 second timeout
    );

    if (!openaiResponse.ok) {
      let errorData;
      try {
        errorData = await openaiResponse.json();
      } catch {
        errorData = await openaiResponse.text();
      }
      
      log('error', 'OpenAI API error', { 
        requestId, 
        status: openaiResponse.status, 
        statusText: openaiResponse.statusText,
        error: errorData 
      });
      
      // Provide specific error messages based on status codes
      if (openaiResponse.status === 401) {
        throw new Error('OpenAI API key is invalid or expired');
      } else if (openaiResponse.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      } else if (openaiResponse.status === 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again.');
      } else {
        throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
      }
    }

    let data;
    try {
      data = await openaiResponse.json();
    } catch (parseError) {
      log('error', 'Failed to parse OpenAI response', { requestId, error: parseError.message });
      throw new Error('Invalid response from OpenAI API');
    }

    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      log('error', 'No response content from OpenAI', { requestId, data });
      throw new Error('No response from AI');
    }

    log('info', 'TOKO Chat response generated successfully', { 
      requestId, 
      responseLength: aiResponse.length 
    });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: requestId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'TOKO Chat error', { 
      requestId, 
      error: error.message,
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists."
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