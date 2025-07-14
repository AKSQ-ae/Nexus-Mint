import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Minimize2, Maximize2, Copy, Trash2, Sparkles, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { IntelligentChatProcessor, InvestmentIntent } from './IntelligentChatProcessor';
import { ChatPerformanceMonitor } from './ChatPerformanceMonitor';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { cn } from '@/lib/utils';
import { ChatSounds } from './ChatSounds';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  className?: string;
  onInvestmentFlow?: (propertyId: string, amount: number) => void;
  onKycFlow?: () => void;
  onPortfolioView?: () => void;
}

const suggestions = [
  "Start my KYC verification",
  "Find Dubai properties under 50K",
  "Show me my portfolio dashboard",
  "Help me register an account",
  "Navigate to investment page"
];

export function ChatInterface({ 
  isMinimized = false, 
  onToggleMinimize, 
  className,
  onInvestmentFlow,
  onKycFlow,
  onPortfolioView 
}: ChatInterfaceProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🚀 **AI TOKO: Navigator to Rule Them All**\n\n**45 min → 3 min. 80% fewer clicks.**\n\n🎯 **I don\'t just chat - I guide you through the app!**\n\n✨ **Tell me what you want to do:**\n• *"Start my KYC"* → I\'ll open KYC page and guide you\n• *"Find Dubai properties"* → I\'ll search and show results\n• *"Invest 5000 AED"* → I\'ll navigate to investment flow\n• *"Check my portfolio"* → I\'ll open your dashboard\n• *"Register new account"* → I\'ll guide you through signup\n• *"Need help with..."* → I\'ll find the right page\n\n🚀 **Ready to navigate? Just tell me your next step!**',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
    ChatSounds.init();
  }, [messages]);

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
    setShowSuggestions(true);
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset",
    });
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    // Start performance monitoring
    const startTime = ChatPerformanceMonitor.startTimer();
    let success = false;
    let intent: InvestmentIntent | null = null;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    ChatSounds.playMessageSent();

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Analyze user intent for smart processing
      intent = IntelligentChatProcessor.analyzeIntent(textToSend);
      console.log('Detected intent:', intent);

      let aiResponse = '';
      let requiresFlowProcessing = false;

      // Handle high-confidence smart flows with navigation
      if (intent.confidence > 0.8) {
        const flowResult = await IntelligentChatProcessor.processInvestmentFlow(intent);
        aiResponse = IntelligentChatProcessor.generateSmartResponse(intent, flowResult, navigate);
        requiresFlowProcessing = true;

        // Track flow initiation
        await ChatPerformanceMonitor.trackFlowCompletion(intent.type, true);

        // Execute navigation and page interactions
        try {
          setTimeout(() => {
            if (intent.type === 'kyc') {
              toast({
                title: "🚀 Navigating to KYC",
                description: "Opening KYC verification page...",
              });
              navigate('/profile');
              if (onKycFlow) onKycFlow();
            } else if (intent.type === 'portfolio') {
              toast({
                title: "📈 Opening Portfolio",
                description: "Navigating to your dashboard...",
              });
              navigate('/portfolio');
              if (onPortfolioView) onPortfolioView();
            } else if (intent.type === 'discovery') {
              toast({
                title: "🔍 Property Search",
                description: "Opening properties with your criteria...",
              });
              const searchParams = new URLSearchParams();
              if (intent.location) searchParams.set('location', intent.location);
              if (intent.criteria) searchParams.set('search', intent.criteria);
              navigate(`/properties?${searchParams.toString()}`);
            } else if (intent.type === 'investment') {
              if (flowResult?.requiresKyc) {
                if (flowResult.actionRequired === 'authentication') {
                  toast({
                    title: "🔐 Authentication Required",
                    description: "Redirecting to sign in...",
                  });
                  navigate('/auth/signin');
                } else {
                  toast({
                    title: "🔒 KYC Required",
                    description: "Opening KYC verification...",
                  });
                  navigate('/profile');
                }
              } else if (flowResult?.suggestedProperties) {
                toast({
                  title: "🚀 Investment Ready",
                  description: "Opening investment page with matches...",
                });
                navigate('/properties');
                if (onInvestmentFlow && flowResult.suggestedProperties.length > 0) {
                  const firstProperty = flowResult.suggestedProperties[0];
                  setTimeout(() => onInvestmentFlow(firstProperty.id, intent.amount || 0), 1000);
                }
              }
            } else if (intent.type === 'register') {
              toast({
                title: "🎯 Account Registration",
                description: "Opening sign up page...",
              });
              navigate('/auth/signup');
            } else if (intent.type === 'dashboard') {
              toast({
                title: "📊 Dashboard Navigation",
                description: "Opening your overview dashboard...",
              });
              navigate('/dashboard');
            } else if (intent.type === 'help') {
              toast({
                title: "🆘 Help & Resources",
                description: "Finding relevant help resources...",
              });
              // Navigate to most relevant help section based on criteria
              if (intent.criteria?.includes('invest') || intent.criteria?.includes('property')) {
                navigate('/properties');
              } else if (intent.criteria?.includes('kyc') || intent.criteria?.includes('verif')) {
                navigate('/profile');
              } else if (intent.criteria?.includes('portfolio') || intent.criteria?.includes('dashboard')) {
                navigate('/portfolio');
              } else {
                navigate('/dashboard'); // Default help location
              }
            }
          }, 1000);
        } catch (flowError) {
          console.error('Error triggering navigation:', flowError);
          await ChatPerformanceMonitor.trackFlowCompletion(intent.type, false);
        }
      }

      if (requiresFlowProcessing && aiResponse) {
        // Use smart response instead of calling AI
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'typing');
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            role: 'assistant',
            timestamp: new Date(),
          };
          return [...filtered, assistantMessage];
        });
        success = true;
      } else {
        // Fall back to AI chat for general queries with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), 30000)
        );

        const aiPromise = supabase.functions.invoke('ai-buddy-chat', {
          body: {
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            intent: intent // Pass intent to AI for context
          }
        });

        const { data, error } = await Promise.race([aiPromise, timeoutPromise]) as any;

        if (error) throw error;

        aiResponse = data.message;

        // Remove typing indicator and add real response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'typing');
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            role: 'assistant',
            timestamp: new Date(),
          };
          return [...filtered, assistantMessage];
        });
        success = true;
      }

      // Log successful interaction
      const responseTime = ChatPerformanceMonitor.endTimer(startTime);
      await ChatPerformanceMonitor.logInteraction({
        userMessage: textToSend,
        aiResponse,
        intentDetected: intent?.type || 'unknown',
        responseTime,
        success: true,
        userId: (await supabase.auth.getUser()).data.user?.id
      });

      ChatSounds.playMessageReceived();

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and show error message
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'typing');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '🚫 **Temporary Connection Issue**\n\nI\'m having trouble connecting right now. While I work on getting back online, you can:\n\n• Browse properties directly\n• Check your portfolio\n• Use the search function\n\nTry asking me again in a moment!',
          role: 'assistant',
          timestamp: new Date(),
        };
        return [...filtered, errorMessage];
      });

      // Log failed interaction
      const responseTime = ChatPerformanceMonitor.endTimer(startTime);
      await ChatPerformanceMonitor.logInteraction({
        userMessage: textToSend,
        aiResponse: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        intentDetected: intent?.type || 'error',
        responseTime,
        success: false,
        userId: (await supabase.auth.getUser()).data.user?.id
      });

      // User-friendly error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('timeout')) {
        toast({
          title: 'Response Timeout',
          description: 'AI is taking longer than usual. Please try a simpler question.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast({
          title: 'Network Issue',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'AI Temporarily Unavailable',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <Card className={cn("w-80 h-16 hover:shadow-lg transition-all duration-300", className)}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-5 w-5 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-medium">AI Assistant</span>
              <p className="text-xs text-muted-foreground">Ready to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-96 h-[600px] flex flex-col shadow-2xl border-0 bg-gradient-to-br from-background via-background to-muted/20", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-lg font-bold">AI Assistant</span>
              <p className="text-sm font-normal text-muted-foreground">Real Estate Expert</p>
            </div>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4 pt-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "group max-w-[80%] rounded-2xl p-3 transition-all duration-200 hover:shadow-md",
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                      : 'bg-gradient-to-br from-muted to-muted/50 border border-border/50'
                  )}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-1 items-center">
                      <span className="text-sm text-muted-foreground">AI is thinking</span>
                      <div className="flex space-x-1 ml-2">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-background/20"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {showSuggestions && (
          <div className="mb-4 animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 text-xs py-1"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about real estate, tokenization, investments..."
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 border-2 focus:border-primary transition-colors rounded-xl"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="px-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}