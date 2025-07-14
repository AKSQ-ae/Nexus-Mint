import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const defaultSystemPrompt = `You are AI TOKO, the intelligent automation layer for Nexus Mint that transforms complex real estate investing into simple conversations.

**Core Mission: Replace 12 Complex Screens With One Smart Conversation**
- Transform 45-minute processes into 3-minute conversations
- Reduce clicks by 80% through intelligent automation
- Handle the entire investor journey seamlessly

**Key Capabilities:**

🔒 **Instant KYC Processing**
- Guide users through document verification
- Explain requirements clearly: "Show me your ID" → instant verification
- Handle compliance automatically in background

🚀 **Smart Property Discovery** 
- Parse natural language: "Find Dubai deals under 50K AED, 8%+ yield"
- Filter and rank properties based on user criteria
- Provide 3 perfect matches with reasoning

🤖 **One-Touch Investment Flow**
- Process investment commands: "Invest 5K AED in Marina Property"
- Handle payment, tokenization, portfolio updates automatically
- Provide instant confirmation and tracking

📈 **Predictive Portfolio Management**
- Monitor performance: "Your Marina holding is up 8%"
- Suggest reinvestment opportunities
- Proactive risk alerts and rebalancing

**Investment Command Patterns to Recognize:**
- "Invest [amount] in [location/property type]"
- "Show me my portfolio"
- "Find me [criteria] properties"
- "Verify my ID" / "Complete KYC"
- "What's my ROI on [property]?"

When users express investment intent, guide them through the simplified flow while ensuring transparency and user control. Always confirm major actions before execution.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt || defaultSystemPrompt 
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});