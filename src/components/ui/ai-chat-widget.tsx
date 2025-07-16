import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIBuddy from '@/components/ai/AIBuddy';

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function AIChatWidget({ isOpen, onClose, userId }: AIChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when widget is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      {/* Widget */}
      <div
        ref={widgetRef}
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          isMinimized 
            ? "bottom-4 right-4 w-80 h-16" 
            : "bottom-4 right-4 w-96 h-[600px]"
        )}
      >
        <Card className={cn(
          "h-full shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-lg",
          isMinimized ? "overflow-hidden" : "overflow-hidden"
        )}>
          {/* Header */}
          <CardHeader className={cn(
            "p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5",
            isMinimized ? "pb-2" : ""
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    TOKO AI Assistant
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </CardTitle>
                  {!isMinimized && (
                    <p className="text-xs text-muted-foreground">
                      Your personal investment advisor
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          {!isMinimized && (
            <CardContent className="p-0 h-full">
              <AIBuddy userId={userId} className="h-full border-0 shadow-none" />
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}