import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
  placeholder?: string;
}

export function MessageInput({ 
  disabled = false, 
  onSend, 
  placeholder = "Ask AI TOKO anything..." 
}: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageTime = useRef<number>(0);

  // Focus input on mount and when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Focus after each message sent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [disabled]);

  const handleSend = () => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled) return;

    // Rate limiting - max 1 message per second
    const now = Date.now();
    if (now - lastMessageTime.current < 1000) {
      return;
    }
    lastMessageTime.current = now;

    onSend(trimmedText);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t bg-background">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
          aria-label="Message input"
          maxLength={1000}
        />
        {text.length > 800 && (
          <div className="absolute -top-6 right-2 text-xs text-muted-foreground">
            {text.length}/1000
          </div>
        )}
      </div>
      <Button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        size="sm"
        aria-label="Send message"
        className="shrink-0"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}