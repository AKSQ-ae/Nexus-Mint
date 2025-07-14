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
          instructions: `You are AI TOKO, a helpful real estate tokenization assistant. You help users understand property tokenization, investment opportunities, and guide them through the platform. Be conversational, friendly, and knowledgeable about real estate and blockchain technology.`,
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
              name: 'get_property_info',
              description: 'Get information about a specific property by ID',
              parameters: {
                type: 'object',
                properties: {
                  propertyId: { type: 'string' }
                },
                required: ['propertyId']
              }
            },
            {
              type: 'function',
              name: 'get_investment_stats',
              description: 'Get user investment statistics and portfolio information',
              parameters: {
                type: 'object',
                properties: {
                  userId: { type: 'string' }
                },
                required: ['userId']
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

    openaiWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('OpenAI message:', data.type);
      
      // Handle tool calls
      if (data.type === 'response.function_call_arguments.done') {
        console.log('Function call:', data.name, data.arguments);
        
        // Send tool response back to OpenAI
        const toolResponse = {
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: data.call_id,
            output: JSON.stringify({
              success: true,
              message: `Tool ${data.name} executed successfully with arguments: ${data.arguments}`
            })
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