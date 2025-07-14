import React from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Message } from './useApi';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = React.memo(function MessageBubble({ message }: MessageBubbleProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully.",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`p-3 rounded-xl ${
            isUser 
              ? 'bg-primary text-primary-foreground ml-4' 
              : 'bg-muted text-muted-foreground mr-4'
          }`}
          role="region"
          aria-label={`${isUser ? 'Your' : 'AI TOKO'} message`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          
          {/* Enhanced TOKO Response Display */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1 flex items-center">
                🤖 TOKO Actions:
              </p>
              <div className="space-y-1" role="list" aria-label="Available actions">
                {message.actions.map((action, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground" role="listitem">
                    • {action}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {message.nextSteps && message.nextSteps.length > 0 && (
            <div className="mt-3 p-2 bg-secondary/5 rounded-lg border border-secondary/10">
              <p className="text-xs font-medium text-secondary-foreground mb-1 flex items-center">
                📋 Next Steps:
              </p>
              <div className="space-y-1" role="list" aria-label="Recommended next steps">
                {message.nextSteps.map((step, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground" role="listitem">
                    {idx + 1}. {step}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {message.contextualHelp && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center">
                💡 Pro Tip:
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {message.contextualHelp}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">
              {formatTime(message.timestamp)}
            </span>
            {!isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                aria-label="Copy message to clipboard"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});