import React, { Suspense, lazy, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';

// Lazy load the chat interface for better performance
const ChatInterface = lazy(() => import('./ChatInterface'));

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasError(false); // Reset error state when toggling
  };

  const handleError = () => {
    setHasError(true);
    console.error('FloatingChatWidget: Failed to load chat interface');
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40 hover:scale-105 transition-transform"
        aria-label={isOpen ? "Close AI TOKO chat" : "Open AI TOKO chat"}
        title={isOpen ? "Close AI TOKO chat" : "Open AI TOKO chat"}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 drop-shadow-2xl">
          <Suspense 
            fallback={
              <div className="w-80 h-[500px] bg-background border rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading AI TOKO...</p>
                </div>
              </div>
            }
          >
            {hasError ? (
              <div className="w-80 h-[500px] bg-background border rounded-lg flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-sm text-destructive mb-2">Failed to load chat</p>
                  <Button 
                    onClick={() => {
                      setHasError(false);
                      // Force re-render by closing and opening
                      setIsOpen(false);
                      setTimeout(() => setIsOpen(true), 100);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <ErrorBoundary onError={handleError}>
                <ChatInterface onClose={() => setIsOpen(false)} />
              </ErrorBoundary>
            )}
          </Suspense>
        </div>
      )}
    </>
  );
}

// Simple error boundary to catch chat loading errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChatInterface Error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}