import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentAttempt {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface PaymentResilienceProps {
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentFailure?: (paymentId: string, error: string) => void;
}

export const PaymentResilience: React.FC<PaymentResilienceProps> = ({
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [payments, setPayments] = useState<PaymentAttempt[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);

  // Circuit Breaker Pattern for Payment Gateway
  const [failureCount, setFailureCount] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState<Date | null>(null);
  const FAILURE_THRESHOLD = 3;
  const RECOVERY_TIMEOUT = 30000; // 30 seconds

  useEffect(() => {
    if (circuitBreakerOpen && lastFailureTime) {
      const timeout = setTimeout(() => {
        if (Date.now() - lastFailureTime.getTime() > RECOVERY_TIMEOUT) {
          setCircuitBreakerOpen(false);
          setFailureCount(0);
          toast.success('Payment system recovered - Circuit breaker closed');
        }
      }, RECOVERY_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [circuitBreakerOpen, lastFailureTime]);

  const executePaymentWithResilience = async (
    amount: number,
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<string | null> => {
    // Circuit Breaker Check
    if (circuitBreakerOpen) {
      throw new Error('Payment system temporarily unavailable - Circuit breaker open');
    }

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment: PaymentAttempt = {
      id: paymentId,
      amount,
      status: 'processing',
      attempts: retryCount + 1,
      maxAttempts: maxRetries + 1,
      createdAt: new Date()
    };

    setPayments(prev => [...prev, payment]);

    try {
      // Simulate payment processing with potential failures
      const { data, error } = await supabase.functions.invoke('create-investment-payment', {
        body: { 
          amount,
          paymentId,
          retryAttempt: retryCount,
          resilientMode: true
        }
      });

      if (error) throw error;

      // Success - Reset circuit breaker
      setFailureCount(0);
      setLastFailureTime(null);
      
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, status: 'completed', completedAt: new Date() }
          : p
      ));

      onPaymentSuccess?.(paymentId);
      toast.success(`Payment ${paymentId} completed successfully`);
      return paymentId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      // Update failure count for circuit breaker
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      setLastFailureTime(new Date());

      if (newFailureCount >= FAILURE_THRESHOLD) {
        setCircuitBreakerOpen(true);
        toast.error('Payment system circuit breaker opened - System protection activated');
      }

      // Exponential backoff retry logic
      if (retryCount < maxRetries && !circuitBreakerOpen) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        
        setPayments(prev => prev.map(p => 
          p.id === paymentId 
            ? { ...p, status: 'retrying', lastError: errorMessage }
            : p
        ));

        toast.warning(`Payment attempt ${retryCount + 1} failed. Retrying in ${backoffDelay}ms...`);
        
        setTimeout(() => {
          executePaymentWithResilience(amount, retryCount + 1, maxRetries);
        }, backoffDelay);
        
        return null;
      } else {
        // All retries exhausted
        setPayments(prev => prev.map(p => 
          p.id === paymentId 
            ? { ...p, status: 'failed', lastError: errorMessage }
            : p
        ));

        onPaymentFailure?.(paymentId, errorMessage);
        toast.error(`Payment ${paymentId} failed after ${maxRetries + 1} attempts`);
        return null;
      }
    }
  };

  const checkSystemHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('deployment-health-check');
      if (error) throw error;
      
      const healthScore = data.services?.filter((s: any) => s.status === 'healthy').length || 0;
      const totalServices = data.services?.length || 1;
      const healthPercentage = (healthScore / totalServices) * 100;

      if (healthPercentage >= 90) {
        setSystemHealth('healthy');
      } else if (healthPercentage >= 70) {
        setSystemHealth('degraded');
      } else {
        setSystemHealth('critical');
      }
    } catch (error) {
      setSystemHealth('critical');
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    const interval = setInterval(checkSystemHealth, 5000);
    return () => clearInterval(interval);
  };

  const getStatusColor = (status: PaymentAttempt['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'retrying': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSystemHealthColor = () => {
    switch (systemHealth) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Resilience System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System Health */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Health:</span>
            <Badge className={getSystemHealthColor()}>
              {systemHealth.toUpperCase()}
            </Badge>
          </div>

          {/* Circuit Breaker Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Circuit Breaker:</span>
            <Badge variant={circuitBreakerOpen ? "destructive" : "default"}>
              {circuitBreakerOpen ? "OPEN (Protected)" : "CLOSED (Active)"}
            </Badge>
          </div>

          {/* Failure Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recent Failures:</span>
            <span className="text-sm">{failureCount}/{FAILURE_THRESHOLD}</span>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => executePaymentWithResilience(1000)}
              disabled={circuitBreakerOpen}
              size="sm"
            >
              Test Payment ($10.00)
            </Button>
            <Button
              onClick={isMonitoring ? () => setIsMonitoring(false) : startMonitoring}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Attempts Log */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.slice(-5).map((payment) => (
              <div key={payment.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{payment.id}</span>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Amount: ${(payment.amount / 100).toFixed(2)}</span>
                  <span>Attempts: {payment.attempts}/{payment.maxAttempts}</span>
                </div>

                {payment.status === 'processing' || payment.status === 'retrying' ? (
                  <Progress value={75} className="mt-2 h-2" />
                ) : null}

                {payment.lastError && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    {payment.lastError}
                  </div>
                )}
              </div>
            ))}
            
            {payments.length === 0 && (
              <p className="text-center text-muted-foreground">No payment attempts yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};