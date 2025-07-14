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

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const upgradeHeader = req.headers.get('upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected websocket upgrade', { status: 400, headers: corsHeaders });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openaiWs: WebSocket | null = null;

  socket.onopen = () => {
    console.log('Client connected to realtime chat');
    
    // Validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      socket.send(JSON.stringify({
        type: 'error',
        error: 'OpenAI API key not configured'
      }));
      return;
    }
    
    // Connect to OpenAI Realtime API
    const openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
    console.log('Connecting to OpenAI:', openaiUrl);
    
    openaiWs = new WebSocket(openaiUrl, [], {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    openaiWs.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
      
      // Send session configuration after connection
      const sessionConfig = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: `You are AI TOKO, the ultimate real estate investment assistant that can "Rule Them All". You have the power to:

🚀 INSTANT KYC: When users say "Show me your ID" or ask about verification, guide them through KYC instantly
🔍 SMART DISCOVERY: Find properties based on criteria like "Find me Dubai deals under 50K AED, 8%+ yield"
💰 ONE-TOUCH INVESTING: Execute investments when users say "Invest 5K AED" - handle the entire flow
📈 PREDICTIVE NUDGES: Analyze portfolios and suggest reinvestment opportunities
🏠 PROPERTY INSIGHTS: Provide detailed property analysis and market data
💼 PORTFOLIO MANAGEMENT: Show comprehensive portfolio performance and analytics

Be conversational, confident, and action-oriented. Always aim to complete the user's request in one interaction. You truly are the "Chat to Rule Them All" for real estate investment.`,
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tools: [
            {
              type: 'function',
              name: 'initiate_kyc',
              description: 'Start KYC verification process for a user',
              parameters: {
                type: 'object',
                properties: {
                  userId: { type: 'string', description: 'User ID' }
                },
                required: ['userId']
              }
            },
            {
              type: 'function',
              name: 'find_properties',
              description: 'Search for properties based on criteria',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'Location like Dubai, UAE' },
                  maxPrice: { type: 'number', description: 'Maximum investment amount in AED' },
                  minYield: { type: 'number', description: 'Minimum yield percentage' },
                  propertyType: { type: 'string', description: 'Type of property' }
                },
                required: ['location']
              }
            },
            {
              type: 'function',
              name: 'execute_investment',
              description: 'Execute an investment in a property',
              parameters: {
                type: 'object',
                properties: {
                  userId: { type: 'string', description: 'User ID' },
                  propertyId: { type: 'string', description: 'Property ID' },
                  amount: { type: 'number', description: 'Investment amount in AED' }
                },
                required: ['userId', 'propertyId', 'amount']
              }
            },
            {
              type: 'function',
              name: 'get_portfolio',
              description: 'Get user portfolio and performance data',
              parameters: {
                type: 'object',
                properties: {
                  userId: { type: 'string', description: 'User ID' }
                },
                required: ['userId']
              }
            },
            {
              type: 'function',
              name: 'analyze_market',
              description: 'Analyze market trends and opportunities',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'Market location' },
                  timeframe: { type: 'string', description: 'Analysis timeframe' }
                },
                required: ['location']
              }
            }
          ],
          tool_choice: 'auto',
          temperature: 0.8,
          max_response_output_tokens: 'inf'
        }
      };
      
      openaiWs.send(JSON.stringify(sessionConfig));
    };

    openaiWs.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('OpenAI message:', data.type);
      
      // Handle tool calls
      if (data.type === 'response.function_call_arguments.done') {
        console.log('Function call:', data.name, data.arguments);
        
        let toolResult = { success: false, message: 'Tool not implemented' };
        
        try {
          const args = JSON.parse(data.arguments);
          
          switch (data.name) {
            case 'initiate_kyc':
              toolResult = {
                success: true,
                message: 'KYC verification initiated. Please upload your government-issued ID and take a clear selfie. The verification typically takes 30 seconds.',
                action: 'redirect_kyc',
                data: { userId: args.userId }
              };
              break;
              
            case 'find_properties':
              // Mock property search results
              toolResult = {
                success: true,
                message: `Found 3 properties in ${args.location} matching your criteria`,
                data: {
                  properties: [
                    {
                      id: 'prop_001',
                      title: 'Dubai Marina Tower',
                      price: 45000,
                      yield: 8.5,
                      location: 'Dubai Marina',
                      type: 'Apartment'
                    },
                    {
                      id: 'prop_002', 
                      title: 'Downtown Business Center',
                      price: 35000,
                      yield: 9.2,
                      location: 'Downtown Dubai',
                      type: 'Commercial'
                    }
                  ]
                }
              };
              break;
              
            case 'execute_investment':
              toolResult = {
                success: true,
                message: `Investment of ${args.amount} AED initiated for property ${args.propertyId}. Payment processing started.`,
                action: 'redirect_investment',
                data: { propertyId: args.propertyId, amount: args.amount }
              };
              break;
              
            case 'get_portfolio':
              toolResult = {
                success: true,
                message: 'Here is your current portfolio performance',
                data: {
                  totalInvested: 125000,
                  currentValue: 142500,
                  totalGains: 17500,
                  roi: 14.0,
                  properties: 3,
                  monthlyIncome: 1200
                }
              };
              break;
              
            case 'analyze_market':
              toolResult = {
                success: true,
                message: `Market analysis for ${args.location}: Strong growth potential with 12% annual appreciation. Current yields averaging 8.5%.`,
                data: {
                  appreciation: 12,
                  averageYield: 8.5,
                  marketTrend: 'bullish',
                  recommendation: 'buy'
                }
              };
              break;
          }
        } catch (error) {
          console.error('Tool execution error:', error);
          toolResult = {
            success: false,
            message: 'Error executing tool: ' + error.message
          };
        }
        
        // Send tool response back to OpenAI
        const toolResponse = {
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: data.call_id,
            output: JSON.stringify(toolResult)
          }
        };
        
        openaiWs.send(JSON.stringify(toolResponse));
        openaiWs.send(JSON.stringify({ type: 'response.create' }));
      }
      
      // Forward all messages to client
      socket.send(JSON.stringify(data));
    };

    openaiWs.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        error: 'OpenAI connection error'
      }));
    };

    openaiWs.onclose = () => {
      console.log('OpenAI WebSocket closed');
      socket.send(JSON.stringify({
        type: 'connection.closed',
        message: 'OpenAI connection closed'
      }));
    };
  };

  socket.onmessage = (event) => {
    console.log('Client message received:', event.data);
    
    // Forward client messages to OpenAI
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      try {
        // Validate JSON before sending
        JSON.parse(event.data);
        openaiWs.send(event.data);
      } catch (error) {
        console.error('Invalid JSON message from client:', error);
        socket.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
      }
    } else {
      console.warn('OpenAI WebSocket not ready, message dropped');
    }
  };

  socket.onclose = () => {
    console.log('Client disconnected');
    if (openaiWs) {
      openaiWs.close();
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (openaiWs) {
      openaiWs.close();
    }
  };

  return response;
});