import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  userId?: string;
  portfolioData?: {
    totalInvested: number;
    totalValue: number;
    propertyCount: number;
    totalTokens: number;
    growth: number;
  };
  conversationHistory?: Array<{
    type: 'user' | 'ai';
    content: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId: bodyUserId, portfolioData, conversationHistory }: ChatRequest = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Create Supabase client to get user from auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Get user from auth context
    const { data: { user } } = await supabase.auth.getUser();
    
    // Derive userId from auth context if not provided in body
    const userId = bodyUserId || user?.id || "anonymous";

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build context for the AI
    const portfolioContext = portfolioData ? `
User Portfolio Overview:
- Total Invested: $${portfolioData.totalInvested.toLocaleString()}
- Current Value: $${portfolioData.totalValue.toLocaleString()}
- Properties: ${portfolioData.propertyCount}
- Tokens: ${portfolioData.totalTokens}
- Growth: ${portfolioData.growth > 0 ? '+' : ''}${portfolioData.growth.toFixed(1)}%
` : '';

    // Analyze message intent to provide personalized responses
    const messageIntent = analyzeMessageIntent(message);
    
    // Build conversation history
    const conversationContext = conversationHistory?.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    const systemPrompt = `You are a friendly, knowledgeable investment advisor and buddy for a real estate tokenization platform called Nexus Mint. You help users understand their investments, discover new opportunities, and make informed decisions.

Key Personality Traits:
- Conversational and friendly, like talking to a knowledgeable friend
- Start open-ended and listen to what the user wants
- Naturally suggest opportunities when appropriate
- Give specific impact numbers when suggesting investments
- Be encouraging and supportive
- Use casual, warm language

${portfolioContext}

Current Conversation Context:
${messageIntent.context}

Your responses should:
1. Address the user's specific question or concern
2. Provide personalized insights based on their portfolio
3. Suggest relevant actions or opportunities naturally
4. Use specific numbers and impacts when relevant
5. Keep the conversation flowing naturally

Always respond in a conversational, helpful tone. If suggesting investments, explain specifically how they would impact the user's portfolio (e.g., "Adding this Miami property would increase your real estate exposure to 40% and could boost your overall returns by about 12%").`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext.slice(-6), // Keep last 6 messages for context
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Generate contextual suggestions based on the response and user intent
    const suggestions = generateSuggestions(messageIntent, portfolioData);

    return new Response(JSON.stringify({
      response: aiResponse,
      suggestions,
      intent: messageIntent.type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-buddy-chat:', error);
    const fallbackResponse = "I'm having a bit of trouble right now, but I'm here to help! What would you like to know about your investments?";
    
    // Return 400 for validation errors, 500 for others
    const status = error.message === 'Message is required' ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: fallbackResponse
    }), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

function analyzeMessageIntent(message: string): { type: string; context: string } {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('performance') || lowerMessage.includes('how am i doing')) {
    return {
      type: 'portfolio_inquiry',
      context: 'User wants to know about their portfolio performance and current status.'
    };
  }
  
  if (lowerMessage.includes('new') || lowerMessage.includes('opportunities') || lowerMessage.includes('invest')) {
    return {
      type: 'opportunity_seeking',
      context: 'User is interested in new investment opportunities.'
    };
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('trends') || lowerMessage.includes('news')) {
    return {
      type: 'market_inquiry',
      context: 'User wants to know about market trends and news.'
    };
  }
  
  if (lowerMessage.includes('reward') || lowerMessage.includes('loyalty') || lowerMessage.includes('bonus')) {
    return {
      type: 'rewards_inquiry',
      context: 'User is asking about rewards, loyalty programs, or bonuses.'
    };
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return {
      type: 'help_seeking',
      context: 'User needs help or guidance.'
    };
  }
  
  return {
    type: 'general_conversation',
    context: 'General conversation - be supportive and guide naturally toward their investments.'
  };
}

function generateSuggestions(intent: { type: string }, portfolioData?: any): string[] {
  const baseSuggestions = [
    "Tell me about new opportunities",
    "How is my portfolio doing?",
    "What's new in the market?",
    "Any rewards available for me?"
  ];
  
  switch (intent.type) {
    case 'portfolio_inquiry':
      return [
        "Show me detailed analytics",
        "How can I improve my returns?",
        "What's my risk level?",
        "Compare my performance"
      ];
    
    case 'opportunity_seeking':
      return [
        "Show me high-yield properties",
        "Find properties in growing markets",
        "What fits my risk profile?",
        "Show me trending locations"
      ];
    
    case 'market_inquiry':
      return [
        "Show me market trends",
        "Which cities are performing best?",
        "What's the forecast?",
        "How do I position my portfolio?"
      ];
    
    case 'rewards_inquiry':
      return [
        "Check my referral rewards",
        "Show loyalty program benefits",
        "What bonuses can I earn?",
        "How to maximize rewards?"
      ];
    
    default:
      return baseSuggestions;
  }
}

serve(handler);