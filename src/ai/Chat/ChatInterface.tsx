import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { HeaderControls } from './HeaderControls';
import { useChat } from './ChatContext';
import { useApi, Message } from './useApi';
import performanceMonitor from './ChatPerformanceMonitor';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  onClose?: () => void;
}

// Welcome message
const createWelcomeMessage = (): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: "👋 Hi! I'm AI TOKO, your smart investment assistant. I can help you navigate the platform, start your KYC verification, find investment opportunities, and manage your portfolio.\n\nTry saying something like:\n• \"Start my KYC verification\"\n• \"Show me properties in Dubai\"\n• \"I want to invest 5000 AED\"\n• \"Check my portfolio\"",
  timestamp: new Date(),
  nextSteps: [
    "Sign up for an account if you haven't already",
    "Complete your KYC verification to unlock all features",
    "Browse investment opportunities",
    "Make your first investment"
  ]
});

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { userContext, tokoEngine, isInitialized } = useChat();
  const api = useApi();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);

  // Update welcome message based on user context
  useEffect(() => {
    if (isInitialized && userContext) {
      const welcomeMsg = createWelcomeMessage();
      
      // Customize welcome message based on user progress
      if (userContext.isAuthenticated) {
        if (!userContext.hasKyc) {
          welcomeMsg.content = "Welcome back! I notice you haven't completed your KYC verification yet. This is required to make investments.\n\nShall I help you start the KYC process?";
          welcomeMsg.nextSteps = ["Complete KYC verification", "Browse investment opportunities"];
        } else if (!userContext.hasInvestments) {
          welcomeMsg.content = "Great! Your KYC is complete. Now you can start investing in real estate properties.\n\nWould you like me to show you some investment opportunities?";
          welcomeMsg.nextSteps = ["Browse properties", "Make your first investment", "Learn about investment strategies"];
        } else {
          welcomeMsg.content = "Welcome back! I can help you manage your portfolio, find new investment opportunities, or answer any questions about your investments.";
          welcomeMsg.nextSteps = ["Check portfolio performance", "Find new opportunities", "Review investment strategy"];
        }
      }
      
      setMessages([welcomeMsg]);
    }
  }, [isInitialized, userContext]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !isInitialized) return;

    setIsLoading(true);
    const startTime = performanceMonitor.startTimer();
    let errorCount = 0;

    try {
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);

      let response: Message;

      try {
        // Try TOKO engine first
        if (tokoEngine) {
          console.log('ChatInterface: Processing with TOKO engine');
          const tokoResponse = await tokoEngine.processUserIntent(text);
          
          response = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: tokoResponse.message,
            timestamp: new Date(),
            actions: tokoResponse.actions.map(a => 
              `${a.type}: ${a.target}${a.value ? ` (${a.value})` : ''}`
            ),
            nextSteps: tokoResponse.nextSteps,
            contextualHelp: tokoResponse.contextualHelp
          };

          console.log('ChatInterface: TOKO response generated', response);
        } else {
          throw new Error('TOKO engine not available');
        }
      } catch (tokoError) {
        console.warn('ChatInterface: TOKO engine failed, falling back to AI chat', tokoError);
        errorCount++;
        
        // Fallback to AI chat
        try {
          const allMessages = [...messages, userMessage];
          response = await api.sendToAi(allMessages);
          console.log('ChatInterface: AI fallback response generated');
        } catch (aiError) {
          console.error('ChatInterface: AI fallback also failed', aiError);
          errorCount++;
          
          // Ultimate fallback - helpful error message
          response = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "I'm having trouble processing your request right now. Please try again in a moment, or refresh the page if the issue persists.\n\nIn the meantime, you can:\n• Navigate to different sections using the menu\n• Browse properties directly\n• Contact support if you need immediate assistance",
            timestamp: new Date(),
            nextSteps: [
              "Try your request again",
              "Check your internet connection",
              "Refresh the page if issues persist"
            ]
          };
        }
      }

      // Add AI response
      setMessages(prev => [...prev, response]);

      // Log interaction for analytics
      try {
        await api.logInteraction({
          text,
          response,
          intent: tokoEngine ? 'toko_processed' : 'ai_fallback',
          actions: response.actions,
          timestamp: userMessage.timestamp
        });
      } catch (logError) {
        console.warn('ChatInterface: Failed to log interaction', logError);
      }

      // Show success toast for successful TOKO actions
      if (response.actions && response.actions.length > 0) {
        toast({
          title: "Action Completed",
          description: "I've helped navigate to the right section for you!",
        });
      }

    } catch (error) {
      console.error('ChatInterface: Critical error in message handling', error);
      errorCount++;
      
      api.handleError(error as Error, 'message_sending');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again or contact support if the problem persists.",
        timestamp: new Date(),
        contextualHelp: "Try refreshing the page or checking your internet connection."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      const responseTime = performanceMonitor.endTimer(startTime);
      performanceMonitor.recordMetrics(responseTime, messages.length + 1, errorCount);
      setIsLoading(false);
    }
  };

  const handleClearMessages = () => {
    setMessages([createWelcomeMessage()]);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been cleared.",
    });
  };

  if (!isInitialized) {
    return (
      <Card className="w-80 h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">
            Initializing AI TOKO...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-[500px] flex flex-col overflow-hidden">
      <HeaderControls 
        onClear={handleClearMessages}
        onClose={onClose}
        showClose={!!onClose}
      />
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
      />
      
      <MessageInput
        disabled={isLoading}
        onSend={handleSendMessage}
        placeholder={
          userContext.isAuthenticated 
            ? "How can I help you today?" 
            : "Ask me about investing or getting started..."
        }
      />
    </Card>
  );
}