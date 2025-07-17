import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Mic, MicOff, X, Loader2, Volume2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMediaQuery } from '@/hooks/use-media-query';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TOKOChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TOKOChatWidget({ isOpen, onClose }: TOKOChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Quick reply options
  const quickReplies = [
    "Show me 8–12% yields",
    "Explain fees",
    "Risk analysis",
    "Portfolio diversification",
    "Market trends"
  ];

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Welcome to TOKO AI—how can I help your real-estate portfolio today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Track analytics event
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'toko_message_sent', {
          event_category: 'TOKO_Advisor',
          event_label: 'Chat_Message',
          custom_parameter: content.substring(0, 50)
        });
      }

      // Call the TOKO chat API
      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Error",
        description: "Failed to recognize speech.",
        variant: "destructive"
      });
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-[200] ${
      isMobile 
        ? 'inset-x-0 bottom-0 h-[50vh] rounded-t-xl' 
        : 'bottom-4 right-4 w-[360px] h-[520px] rounded-xl'
    } bg-white shadow-[0_0_10px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden transition-all duration-300`}>
      
      {/* Header */}
      <div className={`${isMobile ? 'h-[44px]' : 'h-[62px]'} bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg leading-6 font-semibold text-[#111827]">TOKO AI Assistant</h3>
            <p className="text-sm leading-5 text-[#6B7280]">Your real estate advisor</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-[#E5E7EB] text-[#374151]'
                  : 'bg-[#F3F4F6] text-[#374151]'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#F3F4F6] p-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-[#6B7280]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => sendMessage(reply)}
                className="px-3 py-2 text-xs font-medium text-[#374151] bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl hover:bg-[#F3F4F6] transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Input */}
      <div className={`${isMobile ? 'h-[44px]' : 'h-[52px]'} bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center gap-2 px-4 py-2`}>
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
          placeholder="Type your message..."
          className="flex-1 h-9 border-0 bg-transparent text-sm text-[#374151] placeholder:text-[#6B7280] focus:outline-none focus:ring-0"
          disabled={isLoading}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceInput}
            className="h-10 w-10 rounded-full hover:bg-gray-200"
            disabled={isLoading}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4 text-[#6B7280]" />
            )}
          </Button>
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="h-10 w-10 rounded-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}