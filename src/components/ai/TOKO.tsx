import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Calendar,
  Eye,
  Play,
  BookOpen
} from 'lucide-react';

interface TOKOProps {
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
  validationResult?: 'success' | 'error' | null;
}

const TOKO: React.FC<TOKOProps> = ({ userId, className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioInsight | null>(null);
  const [conversationMode, setConversationMode] = useState<'text' | 'voice'>('text');
  const [isIconPulsing, setIsIconPulsing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      emitAnalytics('toko.opened');
      toast({
        title: "TOKO activated",
        description: "Your AI assistant is ready to help!",
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

  // Analytics helper function
  const emitAnalytics = (eventName: string, data?: any) => {
    try {
      // Simple analytics emission - could be enhanced with proper analytics service
      console.log(`[ANALYTICS] ${eventName}`, data);
      
      // Store analytics events locally for now
      const analyticsEvents = JSON.parse(localStorage.getItem('tokoAnalytics') || '[]');
      analyticsEvents.push({
        event: eventName,
        timestamp: new Date().toISOString(),
        userId,
        data
      });
      
      // Keep only last 100 events
      if (analyticsEvents.length > 100) {
        analyticsEvents.splice(0, analyticsEvents.length - 100);
      }
      
      localStorage.setItem('tokoAnalytics', JSON.stringify(analyticsEvents));
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

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
  }, [portfolioData, generatePersonalizedGreeting]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generatePersonalizedGreeting = useCallback((): string => {
    if (!portfolioData) {
      return "Hey! I'm TOKO, your investment assistant. What's on your mind today?";
    }

    const { totalInvested, propertyCount, growth } = portfolioData;
    
    if (growth > 0) {
      return `Hey there! Looking good - your portfolio is up ${growth.toFixed(1)}% with $${totalInvested.toLocaleString()} across ${propertyCount} properties. How are you feeling about your investments today?`;
    } else if (growth < 0) {
      return `Hi! Markets have been a bit bumpy lately - your portfolio is down ${Math.abs(growth).toFixed(1)}%, but remember that's normal in real estate. How can I help you today?`;
    } else {
      return `Hello! Your portfolio is holding steady at $${totalInvested.toLocaleString()} across ${propertyCount} properties. What would you like to explore today?`;
    }
  }, [portfolioData]);

  const generateInitialSuggestions = (): string[] => {
    return [
      "View Portfolio",
      "Start Tokenisation",
      "Learn More"
    ];
  };

  const addMessage = (type: 'user' | 'ai', content: string, suggestions?: string[], validationResult?: 'success' | 'error' | null) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      suggestions: type === 'ai' ? suggestions : undefined,
      validationResult
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Pulse the icon when a new AI message arrives
    if (type === 'ai') {
      setIsIconPulsing(true);
      setTimeout(() => setIsIconPulsing(false), 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

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
          conversationHistory: messages.slice(-10) // Keep last 10 messages for context
        }
      });

      if (error) {
        throw error;
      }

      // Add AI response with suggestions and rationale
      addMessage('ai', data.response, data.suggestions);
      
      // Store interaction for learning (if successful)
      if (data.response) {
        storeInteractionFeedback(userMessage, data.response, data.intent);
      }
    } catch (error) {
      console.error('TOKO Chat Error:', error);
      
      // Graceful fallback with cached insights
      const fallbackResponse = generateFallbackResponse(userMessage, portfolioData);
      addMessage('ai', fallbackResponse.response, fallbackResponse.suggestions);
      
      toast({
        title: "Connection Issue",
        description: "Using cached insights. Full AI features will return shortly.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tokenization validation
  const handleTokenizationValidation = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // Call tokenization validation API
      const { data, error } = await supabase.functions.invoke('validate-tokenization', {
        body: {
          formData,
          userId
        }
      });

      if (error) throw error;

      if (data.valid) {
        emitAnalytics('toko.validation_passed', { formData });
        addMessage('ai', '✅ Validation passed! Your tokenization request has been approved.', 
          ["View Portfolio", "Start Tokenisation", "Learn More"], 'success');
      } else {
        emitAnalytics('toko.validation_failed', { formData, errors: data.errors });
        addMessage('ai', `❌ Validation failed: ${data.errors.join(', ')}`, 
          ["View Portfolio", "Start Tokenisation", "Learn More"], 'error');
      }
    } catch (error) {
      console.error('Tokenization validation error:', error);
      emitAnalytics('toko.validation_failed', { formData, error: error.message });
      addMessage('ai', '❌ Validation error occurred. Please try again.', 
        ["View Portfolio", "Start Tokenisation", "Learn More"], 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback response generator for offline/error scenarios
  const generateFallbackResponse = (message: string, portfolio: PortfolioInsight | null) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('performance')) {
      return {
        response: portfolio 
          ? `Your portfolio currently shows ${portfolio.totalTokens} tokens across ${portfolio.propertyCount} properties with ${portfolio.growth > 0 ? '+' : ''}${portfolio.growth.toFixed(1)}% growth. I'll provide more detailed analysis once I'm fully connected.`
          : "I'll analyze your portfolio performance once your data loads. Please try again in a moment.",
        suggestions: ["View Portfolio", "Start Tokenisation", "Learn More"]
      };
    }
    
    if (lowerMessage.includes('invest') || lowerMessage.includes('property')) {
      return {
        response: "I'm currently updating market data. Based on your profile, I typically recommend diversified real estate investments in Dubai Marina and Downtown areas. Full recommendations coming shortly.",
        suggestions: ["View Portfolio", "Start Tokenisation", "Learn More"]
      };
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('safety')) {
      return {
        response: "⚠️ Risk assessment is important! While I reconnect, remember that all investments carry risk. Consider diversifying across property types and locations.",
        suggestions: ["View Portfolio", "Start Tokenisation", "Learn More"]
      };
    }
    
    return {
      response: "I'm experiencing a brief connection issue but I'm still here to help! While I reconnect, feel free to explore your portfolio data below or ask about general investment topics.",
      suggestions: ["View Portfolio", "Start Tokenisation", "Learn More"]
    };
  };

  // Store interaction feedback for learning
  const storeInteractionFeedback = async (userMessage: string, aiResponse: string, intent: string) => {
    try {
      // This could be expanded to store in a database for learning
      const interaction = {
        timestamp: new Date().toISOString(),
        userMessage,
        aiResponse,
        intent,
        userId
      };
      
      // For now, store locally - could be enhanced to sync with backend
      const existingInteractions = JSON.parse(localStorage.getItem('tokoInteractions') || '[]');
      existingInteractions.push(interaction);
      
      // Keep only last 50 interactions to manage storage
      if (existingInteractions.length > 50) {
        existingInteractions.splice(0, existingInteractions.length - 50);
      }
      
      localStorage.setItem('tokoInteractions', JSON.stringify(existingInteractions));
    } catch (error) {
      console.error('Failed to store interaction feedback:', error);
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
              prompt: `You are TOKO, a friendly, knowledgeable investment advisor and assistant. The user has a portfolio worth $${portfolioData?.totalInvested || 0} across ${portfolioData?.propertyCount || 0} properties. Be conversational, helpful, and personalized. Start conversations naturally and suggest opportunities when appropriate.`
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
            <span className={`toko-icon ${isIconPulsing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="font-semibold">TOKO</h3>
            <p className="text-sm text-muted-foreground">
              {conversationMode === 'voice' ? 'Voice chat active' : 'Your AI investment assistant'}
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
                  : message.validationResult === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : message.validationResult === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.suggestions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer hover:bg-secondary/80 text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion === "View Portfolio" && <Eye className="w-3 h-3 mr-1" />}
                      {suggestion === "Start Tokenisation" && <Play className="w-3 h-3 mr-1" />}
                      {suggestion === "Learn More" && <BookOpen className="w-3 h-3 mr-1" />}
                      {suggestion}
                    </Button>
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
              placeholder="Ask TOKO about your investments..."
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
              {conversation.isSpeaking ? 'TOKO is speaking...' : 'Listening...'}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TOKO;