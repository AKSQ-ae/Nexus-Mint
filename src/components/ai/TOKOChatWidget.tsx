import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        title: "Connection Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm experiencing technical difficulties. Please try again in a moment or contact support if the issue persists.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window) {
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

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: "Unable to process voice input. Please try typing instead.",
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        toast({
          title: "Voice Not Supported",
          description: "Voice input is not supported in this browser.",
          variant: "destructive",
        });
      }
    } else {
      setIsListening(false);
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      // Track analytics event
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'toko_voice_request', {
          event_category: 'TOKO_Advisor',
          event_label: 'Voice_Synthesis'
        });
      }

      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: { text, voice: 'Sarah' }
      });

      if (error) throw error;

      if (data.audioContent) {
        // Convert base64 to audio and play
        const audioData = atob(data.audioContent);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < audioData.length; i++) {
          uint8Array[i] = audioData.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        audio.play();
        
        // Clean up URL after playing
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      toast({
        title: "Voice Synthesis Error",
        description: "Unable to generate audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    // Track analytics event
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'toko_chat_close', {
        event_category: 'TOKO_Advisor',
        event_label: 'Chat_Close',
        value: messages.length
      });
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 w-[360px] h-[520px] bg-white rounded-xl overflow-hidden flex flex-col z-50 md:w-full md:h-[50vh] md:bottom-0 md:left-0 md:right-0 md:rounded-t-xl md:rounded-b-none"
      style={{ 
        fontFamily: 'system-ui',
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#374151',
        boxShadow: '0 0 10px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="h-[62px] md:h-11 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0070F3] rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-6 text-[#111827]">TOKO AI Advisor</h3>
            <p className="text-sm leading-5 text-[#6B7280]">Your AI investment partner</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </Button>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full px-3 py-2 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-[#E5E7EB] text-[#374151]'
                  : 'bg-[#F3F4F6] text-[#374151]'
              }`}
            >
              <p className="leading-relaxed">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(message.content)}
                    className="h-5 px-1 text-xs opacity-60 hover:opacity-100 ml-2"
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speak
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0070F3]" />
              <p className="text-sm text-[#333]">TOKO is thinking...</p>
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="mt-4">
            <p className="text-xs text-[#6B7280] mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl hover:bg-gray-100 text-[#374151] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="h-[52px] md:h-11 bg-[#F9FAFB] border-t border-[#E5E7EB] px-4 py-2 flex items-center gap-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask TOKO about your portfolio..."
            className="flex-1 h-9 px-3 border-none bg-transparent text-sm text-[#374151] placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB]">
            <Button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={`h-6 w-6 p-0 ${
                isListening 
                  ? "bg-red-100 border-red-300 hover:bg-red-200" 
                  : "bg-transparent hover:bg-gray-100"
              } border-none rounded-none`}
              variant="ghost"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-600" />
              ) : (
                <Mic className="w-4 h-4 text-gray-600" />
              )}
            </Button>
          </div>
          <div className="w-10 h-10 bg-[#0070F3] rounded-full flex items-center justify-center">
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              className="h-6 w-6 p-0 bg-transparent hover:bg-transparent text-white border-none disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}