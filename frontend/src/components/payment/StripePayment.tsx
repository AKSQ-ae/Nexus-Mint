import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/enhanced-loading';
import { ErrorDisplay } from '@/components/ui/enhanced-error-handling';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface StripePaymentProps {
  propertyId: string;
  tokenAmount: number;
  investmentAmount: number;
  onPaymentComplete?: () => void;
  disabled?: boolean;
}

export function StripePayment({ propertyId, tokenAmount, investmentAmount, onPaymentComplete, disabled }: StripePaymentProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Calculate platform fee (2%)
  const platformFee = Math.round(investmentAmount * 0.02);
  const totalAmount = investmentAmount + platformFee;

  const handleStripeCheckout = async () => {
    if (!propertyId || !tokenAmount || !investmentAmount) {
      setError('Missing payment information');
      enhancedToast.error({
        title: 'Payment Error',
        description: 'Missing required payment information'
      });
      return;
    }

    setProcessing(true);
    setError(null);
    
    // Show loading toast
    const loadingToastId = enhancedToast.payment.processing();
    
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-investment-payment', {
        body: {
          propertyId,
          tokenAmount,
          investmentAmount,
          retryCount
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        enhancedToast.success({
          title: 'Redirecting to Payment',
          description: 'Taking you to secure Stripe checkout...'
        });
        
        // Small delay to show the toast before redirect
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        throw new Error('No checkout URL received from payment processor');
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      const errorMessage = err.message || 'Failed to start payment process';
      setError(errorMessage);
      
      enhancedToast.payment.failed(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    handleStripeCheckout();
  };

  return (
    <Card className="relative">
      <LoadingOverlay 
        isVisible={processing} 
        message="Preparing Payment"
        submessage="Setting up secure checkout..."
      />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <ErrorDisplay
            title="Payment Error"
            message={error}
            onRetry={handleRetry}
            retryLabel="Try Again"
            variant="inline"
          />
        )}

        {/* Investment Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Investment Amount:</span>
            <span className="font-medium">${investmentAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (2%):</span>
            <span className="font-medium">${platformFee.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span>${totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            You will receive {tokenAmount.toLocaleString()} property tokens
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm bg-green-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-green-700">256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">PCI DSS Compliant</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleStripeCheckout}
          className="w-full" 
          size="lg"
          disabled={disabled || processing || !!error}
        >
          {processing ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay ${totalAmount.toLocaleString()} Securely
            </>
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>Powered by Stripe • Bank-level security</p>
          <p>Your payment information is never stored on our servers</p>
        </div>
      </CardContent>
    </Card>
  );
}