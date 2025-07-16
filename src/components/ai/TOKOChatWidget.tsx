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

      // Show loading state for voice synthesis
      toast({
        title: "Generating Audio",
        description: "Converting text to speech...",
      });

      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: { text, voice: 'Sarah' }
      });

      if (error) {
        console.error('Voice synthesis error:', error);
        throw error;
      }

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
        
        // Add error handling for audio playback
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          toast({
            title: "Audio Playback Error",
            description: "Unable to play audio. Please try again.",
            variant: "destructive",
          });
        };

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };

        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Audio play error:', error);
            toast({
              title: "Audio Playback Error",
              description: "Unable to play audio. Please try again.",
              variant: "destructive",
            });
          });
        }

        // Show success message
        toast({
          title: "Audio Generated",
          description: `Successfully generated ${Math.round(data.duration || 0)}ms of audio`,
        });
      } else {
        throw new Error('No audio content received');
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Unable to generate audio. Please try again.";
      
      if (error.message?.includes('timeout') || error.message?.includes('abort')) {
        errorMessage = "Audio generation is taking too long. Please try again.";
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = "Authentication error. Please contact support.";
      } else if (error.message?.includes('429')) {
        errorMessage = "Service is busy. Please try again in a moment.";
      } else if (error.message?.includes('too long')) {
        errorMessage = "Text is too long. Please use a shorter message.";
      } else if (error.message?.includes('ELEVENLABS_API_KEY')) {
        errorMessage = "Service configuration error. Please contact support.";
      }

      toast({
        title: "Voice Synthesis Error",
        description: errorMessage,
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-orange-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-orange-accent/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">TOKO AI Advisor</DialogTitle>
                <p className="text-sm text-muted-foreground">Your AI investment partner</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(message.content)}
                      className="h-6 px-2 text-xs opacity-60 hover:opacity-100"
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
              <div className="bg-muted px-4 py-3 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">TOKO is thinking...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 text-xs px-3 py-1"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask TOKO about your portfolio..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={isListening ? "bg-red-100 border-red-300" : ""}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-600" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button type="submit" disabled={!inputMessage.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}