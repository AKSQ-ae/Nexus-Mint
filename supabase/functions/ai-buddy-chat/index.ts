import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RequestBody {
  message: string;
  userId: string;
  portfolioData?: any;
  conversationHistory?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { message, userId, portfolioData, conversationHistory }: RequestBody = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user preferences and safety rules
    const { data: userPrefs } = await supabase
      .from('ai_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: safetyRules } = await supabase
      .from('ai_safety_rules')
      .select('*')
      .eq('is_active', true);

    // Check for safety violations
    const lowerMessage = message.toLowerCase();
    const violatedRules = safetyRules?.filter(rule => 
      rule.trigger_keywords?.some((keyword: string) => lowerMessage.includes(keyword.toLowerCase()))
    ) || [];

    if (violatedRules.length > 0) {
      const rule = violatedRules[0];
      return new Response(JSON.stringify({
        response: rule.action_message || "I can't help with that request. Let's focus on your investment goals instead.",
        suggestions: ["Portfolio analysis", "Investment opportunities", "Risk assessment"],
        confidence: 1.0,
        reasoning: ["Safety guidelines"],
        dataSources: ["AI Safety Rules"],
        recommendationType: "safety_warning"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build enhanced prompt with explainability requirements
    const systemPrompt = `You are an expert investment advisor AI buddy. Always provide your response as a JSON object with these fields:

{
  "response": "your main answer",
  "reasoning": ["key factor 1", "key factor 2", "key factor 3"],
  "dataSources": ["data source 1", "data source 2"],
  "confidence": 0.85,
  "recommendationType": "portfolio_analysis",
  "suggestions": ["follow-up 1", "follow-up 2", "follow-up 3"]
}

User Context:
- Portfolio: ${portfolioData ? `$${portfolioData.totalInvested?.toLocaleString()} across ${portfolioData.propertyCount} properties, ${portfolioData.growth >= 0 ? '+' : ''}${portfolioData.growth?.toFixed(1)}% growth` : 'No portfolio data'}
- Communication style: ${userPrefs?.communication_style || 'balanced'}
- Risk warnings enabled: ${userPrefs?.risk_warnings_enabled !== false}
- Preferred markets: ${userPrefs?.preferred_markets?.join(', ') || 'Dubai, UAE'}

Always be helpful, personalized, and explain your reasoning clearly.`;

    const conversationContext = conversationHistory?.slice(-6).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    let parsedResponse;
    try {
      // Try to parse as JSON first
      parsedResponse = JSON.parse(aiContent);
    } catch {
      // Fallback to text response with basic structure
      parsedResponse = {
        response: aiContent,
        reasoning: ["AI analysis", "Market data", "Portfolio context"],
        dataSources: ["Portfolio data", "Market trends"],
        confidence: 0.8,
        recommendationType: "general_advice",
        suggestions: ["Tell me more", "Portfolio overview", "Market opportunities"]
      };
    }

    const responseTime = Date.now() - startTime;

    // Enhanced response with all explainability data
    const enhancedResponse = {
      ...parsedResponse,
      intent: determineIntent(message),
      responseTime,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(enhancedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Graceful fallback response
    return new Response(JSON.stringify({
      response: "I'm experiencing a brief connection issue, but I'm still here to help! Let me provide some general guidance while I reconnect.",
      suggestions: ["Portfolio overview", "Investment opportunities", "Help & Support"],
      reasoning: ["System recovery"],
      dataSources: ["Cached insights"],
      confidence: 0.6,
      recommendationType: "system_message",
      intent: "system_error"
    }), {
      status: 200, // Return 200 to allow graceful handling
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function determineIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('performance')) {
    return 'portfolio_inquiry';
  }
  if (lowerMessage.includes('invest') || lowerMessage.includes('buy') || lowerMessage.includes('opportunity')) {
    return 'investment_opportunity';
  }
  if (lowerMessage.includes('risk') || lowerMessage.includes('safe') || lowerMessage.includes('danger')) {
    return 'risk_assessment';
  }
  if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('price')) {
    return 'market_inquiry';
  }
  if (lowerMessage.includes('sell') || lowerMessage.includes('exit') || lowerMessage.includes('liquidate')) {
    return 'exit_strategy';
  }
  
  return 'general_inquiry';
}