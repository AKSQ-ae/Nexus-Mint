import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { ChatPerformanceMonitor } from './ChatPerformanceMonitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  retryCount: number;
}

export class ChatErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `chat_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error Boundary caught an error:', error, errorInfo);
    
    // Log error for monitoring
    this.logError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await ChatPerformanceMonitor.logInteraction({
        userMessage: 'SYSTEM_ERROR',
        aiResponse: `Error: ${error.message}`,
        intentDetected: 'error_boundary',
        responseTime: 0,
        success: false
      });

      // Also log to console for development
      console.error('Chat Error Details:', {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorId: '',
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Force reload if max retries exceeded
      window.location.reload();
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-md mx-auto mt-8 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              AI Chat Temporarily Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                We're experiencing a temporary issue with the AI chat system.
              </p>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Message:</strong> {this.state.error?.message}</p>
                  <p><strong>Retry Count:</strong> {this.state.retryCount}/{this.maxRetries}</p>
                </div>
              </details>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= this.maxRetries}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.state.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Try Again'}
              </Button>
              
              <Button 
                onClick={this.handleReset}
                className="flex-1"
                variant="default"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Reset Chat
              </Button>
            </div>

            {this.state.retryCount >= this.maxRetries && (
              <div className="text-center">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="destructive"
                  size="sm"
                >
                  Force Reload Page
                </Button>
              </div>
            )}

            {/* Fallback Actions */}
            <div className="border-t pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Alternative Actions:
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('/portfolio', '_blank')}
                >
                  View Portfolio
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('/properties', '_blank')}
                >
                  Browse Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}