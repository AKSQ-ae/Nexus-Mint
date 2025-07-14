import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useConversation } from '@11labs/react';
import { ConsentModal } from './ConsentModal';
import { Shield } from 'lucide-react';
import { 
  Mic, 
  MicOff, 
  MessageCircle, 
  Send,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Brain,
  ChevronDown,
  ChevronUp
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
  reasoning?: string[];
  dataSources?: string[];
  confidence?: number;
  recommendationType?: string;
  feedback?: number; // 1 for positive, -1 for negative
}

const AIBuddy: React.FC<AIBuddyProps> = ({ userId, className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioInsight | null>(null);
  const [conversationMode, setConversationMode] = useState<'text' | 'voice'>('text');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [expandedReasons, setExpandedReasons] = useState<Set<string>>(new Set());
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

  // Check consent and load user data
  useEffect(() => {
    const checkConsent = async () => {
      if (!userId) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_profiles')
          .select('consent_given')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.consent_given) {
          setHasConsent(true);
          loadPortfolioData();
        } else {
          setShowConsentModal(true);
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        setShowConsentModal(true);
      }
    };

    const loadPortfolioData = async () => {
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

    checkConsent();
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

  const addMessage = (type: 'user' | 'ai', content: string, suggestions?: string[], reasoning?: string[], dataSources?: string[], confidence?: number, recommendationType?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      suggestions: type === 'ai' ? suggestions : undefined,
      reasoning: reasoning,
      dataSources: dataSources,
      confidence: confidence,
      recommendationType: recommendationType
    };
    setMessages(prev => [...prev, newMessage]);
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

      // Add AI response with all explainability data
      addMessage('ai', data.response, data.suggestions, data.reasoning, data.dataSources, data.confidence, data.recommendationType);
      
      // Store interaction in database for analytics and learning
      if (data.response) {
        await storeInteractionInDB(userMessage, data);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      
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

  // Fallback response generator for offline/error scenarios
  const generateFallbackResponse = (message: string, portfolio: PortfolioInsight | null) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('performance')) {
      return {
        response: portfolio 
          ? `Your portfolio currently shows ${portfolio.totalTokens} tokens across ${portfolio.propertyCount} properties with ${portfolio.growth > 0 ? '+' : ''}${portfolio.growth.toFixed(1)}% growth. I'll provide more detailed analysis once I'm fully connected.`
          : "I'll analyze your portfolio performance once your data loads. Please try again in a moment.",
        suggestions: ["Show my investments", "Market overview", "Investment opportunities"]
      };
    }
    
    if (lowerMessage.includes('invest') || lowerMessage.includes('property')) {
      return {
        response: "I'm currently updating market data. Based on your profile, I typically recommend diversified real estate investments in Dubai Marina and Downtown areas. Full recommendations coming shortly.",
        suggestions: ["Dubai properties", "Investment calculator", "Risk assessment"]
      };
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('safety')) {
      return {
        response: "⚠️ Risk assessment is important! While I reconnect, remember that all investments carry risk. Consider diversifying across property types and locations.",
        suggestions: ["Risk tolerance", "Diversification tips", "Safety guidelines"]
      };
    }
    
    return {
      response: "I'm experiencing a brief connection issue but I'm still here to help! While I reconnect, feel free to explore your portfolio data below or ask about general investment topics.",
      suggestions: ["Portfolio overview", "Help & Support", "Investment basics"]
    };
  };

  // Store interaction in database for analytics and learning
  const storeInteractionInDB = async (userMessage: string, aiData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          session_id: `session_${Date.now()}`,
          user_message: userMessage,
          ai_response: aiData.response,
          intent_detected: aiData.intent,
          reasoning_factors: aiData.reasoning || [],
          data_sources_used: aiData.dataSources || [],
          confidence_score: aiData.confidence,
          recommendation_type: aiData.recommendationType,
          suggestions_provided: aiData.suggestions || [],
          portfolio_context: portfolioData ? JSON.parse(JSON.stringify(portfolioData)) : null,
          response_time_ms: aiData.responseTime || null
        });

      if (error) {
        console.error('Error storing interaction:', error);
      }
    } catch (error) {
      console.error('Failed to store interaction in DB:', error);
    }
  };

  // Handle feedback on AI messages
  const handleMessageFeedback = async (messageId: string, feedback: number) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ));

      // Find the original interaction and update feedback
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ai_interactions')
        .update({ user_feedback: feedback })
        .eq('user_id', user.id)
        .eq('ai_response', message.content);

      if (error) {
        console.error('Error updating feedback:', error);
      } else {
        toast({
          title: feedback > 0 ? "Thanks for the feedback!" : "Feedback recorded",
          description: "This helps me learn and improve.",
        });
      }
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  const toggleReasonExpansion = (messageId: string) => {
    setExpandedReasons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleConsentGiven = () => {
    setHasConsent(true);
    setShowConsentModal(false);
    
    // Now load portfolio data
    const loadPortfolioData = async () => {
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
        {!hasConsent ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please provide consent to start chatting with your AI Investment Buddy
            </p>
          </div>
        ) : (
          messages.map((message) => (
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
                
                {/* AI message explainability */}
                {message.type === 'ai' && (message.reasoning || message.confidence) && (
                  <Collapsible className="mt-2">
                    <CollapsibleTrigger
                      className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                      onClick={() => toggleReasonExpansion(message.id)}
                    >
                      <Brain className="h-3 w-3" />
                      Why this response?
                      {message.confidence && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {Math.round(message.confidence * 100)}% confident
                        </Badge>
                      )}
                      {expandedReasons.has(message.id) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {message.reasoning && message.reasoning.length > 0 && (
                        <div>
                          <p className="text-xs font-medium opacity-70">Key Factors:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reasoning.map((factor, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {message.dataSources && message.dataSources.length > 0 && (
                        <div>
                          <p className="text-xs font-medium opacity-70">Data Sources:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.dataSources.map((source, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}

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

                {/* Feedback buttons for AI messages */}
                {message.type === 'ai' && message.feedback === undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMessageFeedback(message.id, 1)}
                      className="h-6 px-2 text-xs opacity-70 hover:opacity-100"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMessageFeedback(message.id, -1)}
                      className="h-6 px-2 text-xs opacity-70 hover:opacity-100"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Show feedback if given */}
                {message.feedback !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    {message.feedback > 0 ? (
                      <ThumbsUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className="text-xs opacity-70">Thanks for the feedback!</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  {message.recommendationType && (
                    <Badge variant="outline" className="text-xs">
                      {message.recommendationType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
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
      {conversationMode === 'text' && hasConsent && (
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

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsent={handleConsentGiven}
      />

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