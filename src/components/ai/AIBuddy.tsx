import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useConversation } from '@11labs/react';
import { 
  Mic, 
  MicOff, 
  MessageCircle, 
  Send,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react';

interface AIBuddyProps {
  userId?: string;
  className?: string;
}

interface PortfolioInsight {
  totalInvested: number;
  totalValue: number;
  propertyCount: number;
  totalTokens: number;
  growth: number;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIBuddy: React.FC<AIBuddyProps> = ({ userId, className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioInsight | null>(null);
  const [conversationMode, setConversationMode] = useState<'text' | 'voice'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      toast({
        title: "Voice activated",
        description: "Your AI buddy is ready to chat!",
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
    },
    onMessage: (message) => {
      console.log('Received message:', message);
      if (message.message) {
        addMessage('ai', message.message);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      toast({
        title: "Voice error",
        description: "Voice chat temporarily unavailable. Using text mode.",
        variant: "destructive",
      });
      setConversationMode('text');
    }
  });

  // Load user portfolio data
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase.functions.invoke('intelligent-analytics', {
          body: {
            userId,
            type: 'portfolio'
          }
        });

        if (error) throw error;
        setPortfolioData(data.insights);
      } catch (error) {
        console.error('Error loading portfolio:', error);
      }
    };

    loadPortfolioData();
  }, [userId]);

  // Initial greeting when component mounts
  useEffect(() => {
    if (portfolioData) {
      const greeting = generatePersonalizedGreeting();
      addMessage('ai', greeting, generateInitialSuggestions());
    }
  }, [portfolioData]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generatePersonalizedGreeting = (): string => {
    if (!portfolioData) {
      return "Hey! I'm your investment buddy. What's on your mind today?";
    }

    const { totalInvested, propertyCount, growth } = portfolioData;
    
    if (growth > 0) {
      return `Hey there! Looking good - your portfolio is up ${growth.toFixed(1)}% with $${totalInvested.toLocaleString()} across ${propertyCount} properties. How are you feeling about your investments today?`;
    } else if (growth < 0) {
      return `Hi! Markets have been a bit bumpy lately - your portfolio is down ${Math.abs(growth).toFixed(1)}%, but remember that's normal in real estate. How can I help you today?`;
    } else {
      return `Hello! Your portfolio is holding steady at $${totalInvested.toLocaleString()} across ${propertyCount} properties. What would you like to explore today?`;
    }
  };

  const generateInitialSuggestions = (): string[] => {
    return [
      "Show me new investment opportunities",
      "How is my portfolio performing?",
      "What's happening in the market?",
      "Any rewards or opportunities for me?"
    ];
  };

  const addMessage = (type: 'user' | 'ai', content: string, suggestions?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      suggestions: type === 'ai' ? suggestions : undefined
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-buddy-chat', {
        body: {
          message: userMessage,
          userId,
          portfolioData,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      addMessage('ai', data.response, data.suggestions);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('ai', "Sorry, I'm having trouble right now. Let me try to help you another way. What specific aspect of your investments would you like to discuss?");
      toast({
        title: "Chat error",
        description: "There was an issue processing your message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const startVoiceConversation = async () => {
    try {
      setConversationMode('voice');
      
      // Generate signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-session', {
        body: { userId }
      });

      if (error) throw error;

      await conversation.startSession({ 
        agentId: data.agentId,
        overrides: {
          agent: {
            prompt: {
              prompt: `You are a friendly, knowledgeable investment advisor and buddy. The user has a portfolio worth $${portfolioData?.totalInvested || 0} across ${portfolioData?.propertyCount || 0} properties. Be conversational, helpful, and personalized. Start conversations naturally and suggest opportunities when appropriate.`
            }
          }
        }
      });
    } catch (error) {
      console.error('Error starting voice conversation:', error);
      setConversationMode('text');
      toast({
        title: "Voice unavailable",
        description: "Switching to text mode.",
        variant: "destructive",
      });
    }
  };

  const endVoiceConversation = async () => {
    await conversation.endSession();
    setConversationMode('text');
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Your AI Investment Buddy</h3>
            <p className="text-sm text-muted-foreground">
              {conversationMode === 'voice' ? 'Voice chat active' : 'Chat with me about your investments'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {conversationMode === 'text' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={startVoiceConversation}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Voice
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={endVoiceConversation}
              className="gap-2"
            >
              <MicOff className="w-4 h-4" />
              End Call
            </Button>
          )}
        </div>
      </div>

      {/* Portfolio Overview */}
      {portfolioData && (
        <div className="p-4 bg-muted/30 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Invested</p>
                <p className="font-semibold">${portfolioData.totalInvested.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Current Value</p>
                <p className="font-semibold">${portfolioData.totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Properties</p>
                <p className="font-semibold">{portfolioData.propertyCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Growth</p>
                <p className={`font-semibold ${portfolioData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioData.growth >= 0 ? '+' : ''}{portfolioData.growth.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.suggestions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {conversationMode === 'text' && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about your investments..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {conversationMode === 'voice' && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full ${conversation.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <p className="text-sm text-muted-foreground">
              {conversation.isSpeaking ? 'AI is speaking...' : 'Listening...'}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIBuddy;