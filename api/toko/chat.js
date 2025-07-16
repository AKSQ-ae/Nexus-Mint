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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('OPENAI_API_KEY is configured:', !!OPENAI_API_KEY);

    const { message, conversationHistory = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
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

    const messages = [
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
      return res.status(response.status).json({ error: `OpenAI API error: ${response.status}` });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    console.log('TOKO Chat response generated successfully');

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      response: aiResponse,
      conversationId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('TOKO Chat error:', error);
    
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return res.status(500).json({
      error: error.message || 'Unknown error',
      response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists."
    });
  }
}