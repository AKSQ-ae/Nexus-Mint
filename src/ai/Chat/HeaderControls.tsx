import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Minimize2, Maximize2, X } from 'lucide-react';

interface HeaderControlsProps {
  onClear: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMinimized?: boolean;
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
}

export function HeaderControls({ 
  onClear, 
  onMinimize, 
  onMaximize,
  onClose,
  isMinimized = false,
  showMinimize = false,
  showMaximize = false,
  showClose = false
}: HeaderControlsProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    
    onClear();
    setConfirmClear(false);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-sm">
          AI TOKO
        </h3>
        <span className="text-xs text-muted-foreground">
          Your Smart Investment Assistant
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClear}
          className={`h-7 w-7 p-0 ${confirmClear ? 'bg-destructive/10 text-destructive' : ''}`}
          aria-label={confirmClear ? "Click again to confirm clear" : "Clear chat history"}
          title={confirmClear ? "Click again to clear chat" : "Clear chat history"}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        
        {showMinimize && onMinimize && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onMinimize}
            className="h-7 w-7 p-0"
            aria-label="Minimize chat"
            title="Minimize chat"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        )}
        
        {showMaximize && onMaximize && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onMaximize}
            className="h-7 w-7 p-0"
            aria-label={isMinimized ? "Restore chat" : "Maximize chat"}
            title={isMinimized ? "Restore chat" : "Maximize chat"}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        )}
        
        {showClose && onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0"
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}