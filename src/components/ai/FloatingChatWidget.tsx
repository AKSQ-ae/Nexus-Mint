import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles, Zap } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { cn } from '@/lib/utils';

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="relative animate-scale-in">
          <ChatInterface
            isMinimized={isMinimized}
            onToggleMinimize={toggleMinimize}
            className="shadow-2xl border-0"
          />
          {!isMinimized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 bg-background border shadow-lg hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative group">
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse z-10"></div>
          
          {/* Floating preview tooltip */}
          <div className="absolute bottom-16 right-0 bg-background border rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Real Estate Assistant</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Get instant investment advice & insights
            </p>
          </div>
          
          <Button
            onClick={toggleChat}
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70",
              "ring-4 ring-primary/20 hover:ring-primary/30"
            )}
            size="lg"
          >
            <div className="relative">
              <MessageCircle className="h-7 w-7 animate-pulse" />
              <Zap className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}