import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from './useApi';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList = React.memo(function MessageList({ 
  messages, 
  isLoading = false 
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-auto p-4 space-y-4"
      aria-live="polite"
      aria-label="Chat messages"
      role="log"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">Start a conversation with AI TOKO...</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="bg-muted text-muted-foreground p-3 rounded-xl mr-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs opacity-70">AI TOKO is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={lastMessageRef} />
        </>
      )}
    </div>
  );
});