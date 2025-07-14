import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: string[];
  nextSteps?: string[];
  contextualHelp?: string;
}

interface ChatInteraction {
  text: string;
  response: Message;
  intent?: string;
  actions?: string[];
  timestamp: Date;
}

export function useApi() {
  const { toast } = useToast();

  const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on auth errors or client errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            throw error;
          }
        }
        
        if (attempt === maxRetries) {
          console.error(`API call failed after ${maxRetries} attempts:`, error);
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  const sendToAi = async (messages: Message[]): Promise<Message> => {
    return withRetry(async () => {
      console.log('API: Sending to AI chat function', { messageCount: messages.length });
      
      const { data, error } = await supabase.functions.invoke('ai-buddy-chat', {
        body: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) {
        console.error('API: AI chat function error:', error);
        throw new Error(`AI chat failed: ${error.message}`);
      }

      if (!data?.content) {
        throw new Error('Invalid response from AI service');
      }

      return {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: data.content,
        timestamp: new Date(),
        actions: data.actions || [],
        nextSteps: data.nextSteps || [],
        contextualHelp: data.contextualHelp
      };
    });
  };

  const logInteraction = async (interaction: ChatInteraction): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('ai_interactions').insert({
          user_id: user.id,
          session_id: `chat_${Date.now()}`,
          user_message: interaction.text,
          ai_response: interaction.response.content,
          intent_detected: interaction.intent,
          suggestions_provided: interaction.actions,
          response_time_ms: Date.now() - interaction.timestamp.getTime(),
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('API: Failed to log interaction:', error);
      // Don't throw - logging failures shouldn't break the chat
    }
  };

  const handleError = (error: Error, context: string) => {
    console.error(`API Error (${context}):`, error);
    
    // Show user-friendly error messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      toast({
        title: "Connection Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      toast({
        title: "Authentication Error", 
        description: "Please sign in to continue chatting.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    }
  };

  return {
    sendToAi,
    logInteraction,
    handleError,
    withRetry
  };
}