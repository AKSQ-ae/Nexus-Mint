import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StripePaymentProps {
  propertyId: string;
  tokenAmount: number;
  investmentAmount: number;
  onPaymentComplete?: () => void;
  disabled?: boolean;
}

export function StripePayment({ propertyId, tokenAmount, investmentAmount, onPaymentComplete, disabled }: StripePaymentProps) {
  const [processing, setProcessing] = useState(false);

  // Calculate platform fee (2%)
  const platformFee = Math.round(investmentAmount * 0.02);
  const totalAmount = investmentAmount + platformFee;

  const handleStripeCheckout = async () => {
    if (!propertyId || !tokenAmount || !investmentAmount) {
      toast.error('Missing payment information');
      return;
    }

    setProcessing(true);
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to continue');
        return;
      }

      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-investment-payment', {
        body: {
          propertyId,
          tokenAmount,
          investmentAmount,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Failed to start payment process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <Lock className="h-4 w-4 text-blue-600" />
          <span>Secured by Stripe • Your payment information is encrypted and secure</span>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleStripeCheckout}
          className="w-full" 
          size="lg"
          disabled={disabled || processing}
        >
          {processing ? 'Redirecting to Stripe...' : `Pay $${totalAmount.toLocaleString()} with Stripe`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You will be redirected to Stripe's secure checkout page
        </p>
      </CardContent>
    </Card>
  );
}