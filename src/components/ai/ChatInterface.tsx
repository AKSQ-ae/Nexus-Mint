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
import { useNavigate, useLocation } from 'react-router-dom';
import { IntelligentChatProcessor, InvestmentIntent } from './IntelligentChatProcessor';
import { TOKONavigationEngine, UserContext } from './TOKONavigationEngine';
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
  actions?: string[];
  nextSteps?: string[];
  contextualHelp?: string;
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
  "Invest 10000 AED in Marina"
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
  const location = useLocation();
  const [userContext, setUserContext] = useState<UserContext>({
    isAuthenticated: false,
    hasKyc: false,
    hasInvestments: false,
    currentPage: location.pathname
  });
  const [tokoEngine, setTokoEngine] = useState<TOKONavigationEngine | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🚀 **AI TOKO: One Chat to Rule Them All**\n\n**45 min → 3 min. 80% fewer clicks.**\n\n🎯 **I don\'t just chat - I navigate and guide you through everything!**\n\n✨ **Tell me what you want to do:**\n• *"Start my KYC"* → I\'ll navigate and guide you through verification\n• *"Find Dubai properties"* → I\'ll open search with filters applied\n• *"Invest 5000 AED"* → I\'ll find matches and start investment flow\n• *"Check my portfolio"* → I\'ll open dashboard and highlight key metrics\n• *"Register new account"* → I\'ll guide you through quick signup\n• *"Need help with..."* → I\'ll find the right page and provide context\n\n🚀 **Ready to navigate? Just tell me your next step!**',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize TOKO Engine and update user context
  useEffect(() => {
    const initializeContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let hasKyc = false;
        let hasInvestments = false;
        
        if (user) {
          // Check KYC status
          const { data: kycDocs } = await supabase
            .from('kyc_documents')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .limit(1);
          
          hasKyc = !!(kycDocs && kycDocs.length > 0);
          
          // Check if user has investments
          const { data: investments } = await supabase
            .from('investments')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          hasInvestments = !!(investments && investments.length > 0);
        }
        
        const context: UserContext = {
          isAuthenticated: !!user,
          hasKyc,
          hasInvestments,
          currentPage: location.pathname
        };
        
        setUserContext(context);
        setTokoEngine(new TOKONavigationEngine(navigate, context));
      } catch (error) {
        console.error('Error initializing context:', error);
        // Fallback to basic context
        const fallbackContext: UserContext = {
          isAuthenticated: false,
          hasKyc: false,
          hasInvestments: false,
          currentPage: location.pathname
        };
        setUserContext(fallbackContext);
        setTokoEngine(new TOKONavigationEngine(navigate, fallbackContext));
      }
    };

    initializeContext();
  }, [navigate, location.pathname]);

  // Update context when location changes
  useEffect(() => {
    if (tokoEngine) {
      tokoEngine.updateContext({ currentPage: location.pathname });
      setUserContext(prev => ({ ...prev, currentPage: location.pathname }));
    }
  }, [location.pathname, tokoEngine]);

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
    if (!textToSend || isLoading || !tokoEngine) return;

    // Start performance monitoring
    const startTime = ChatPerformanceMonitor.startTimer();
    let success = false;

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
      // Use TOKO Navigation Engine for comprehensive processing
      const tokoResponse = await tokoEngine.processUserIntent(textToSend);
      
      console.log('TOKO Response:', tokoResponse);

      // Create enhanced message with TOKO response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: tokoResponse.message,
        role: 'assistant',
        timestamp: new Date(),
        actions: tokoResponse.actions.map(action => `${action.type}: ${action.target}`),
        nextSteps: tokoResponse.nextSteps,
        contextualHelp: tokoResponse.contextualHelp
      };

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'typing');
        return [...filtered, assistantMessage];
      });

      // Show contextual toast based on actions
      if (tokoResponse.actions.length > 0) {
        const primaryAction = tokoResponse.actions[0];
        let toastMessage = '';
        
        switch (primaryAction.type) {
          case 'navigate':
            toastMessage = `🚀 Navigating to ${primaryAction.target}`;
            break;
          case 'scroll':
            toastMessage = `📍 Scrolling to ${primaryAction.target}`;
            break;
          case 'focus':
            toastMessage = `🎯 Focusing on ${primaryAction.target}`;
            break;
          case 'fill':
            toastMessage = `✍️ Filling form field`;
            break;
          case 'click':
            toastMessage = `👆 Clicking ${primaryAction.target}`;
            break;
        }
        
        if (toastMessage) {
          toast({
            title: "TOKO Navigation",
            description: toastMessage,
          });
        }
      }

      success = true;
      
      // Log successful interaction
      const responseTime = ChatPerformanceMonitor.endTimer(startTime);
      await ChatPerformanceMonitor.logInteraction({
        userMessage: textToSend,
        aiResponse: tokoResponse.message,
        intentDetected: 'toko_navigation',
        responseTime,
        success: true,
        userId: (await supabase.auth.getUser()).data.user?.id
      });

      ChatSounds.playMessageReceived();

    } catch (error) {
      console.error('Error with TOKO processing:', error);
      
      // Fallback to previous AI processing for complex queries
      try {
        // Analyze user intent for smart processing
        const intent = IntelligentChatProcessor.analyzeIntent(textToSend);
        console.log('Fallback to intent processing:', intent);

        let aiResponse = '';
        let requiresFlowProcessing = false;

        // Handle high-confidence smart flows with navigation
        if (intent.confidence > 0.8) {
          const flowResult = await IntelligentChatProcessor.processInvestmentFlow(intent);
          aiResponse = IntelligentChatProcessor.generateSmartResponse(intent, flowResult, navigate);
          requiresFlowProcessing = true;

          // Track flow initiation
          await ChatPerformanceMonitor.trackFlowCompletion(intent.type, true);
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

      } catch (fallbackError) {
        console.error('Both TOKO and fallback processing failed:', fallbackError);
        
        // Remove typing indicator and show error message
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'typing');
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: '🚫 **Temporary Connection Issue**\n\nI\'m having trouble connecting right now. While I work on getting back online, you can:\n\n• Navigate manually using the menu\n• Browse properties directly\n• Check your portfolio\n• Use the search function\n\nTry asking me again in a moment!',
            role: 'assistant',
            timestamp: new Date(),
          };
          return [...filtered, errorMessage];
        });

        // Log failed interaction
        const responseTime = ChatPerformanceMonitor.endTimer(startTime);
        await ChatPerformanceMonitor.logInteraction({
          userMessage: textToSend,
          aiResponse: `Error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
          intentDetected: 'error',
          responseTime,
          success: false,
          userId: (await supabase.auth.getUser()).data.user?.id
        });

        // User-friendly error handling
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
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