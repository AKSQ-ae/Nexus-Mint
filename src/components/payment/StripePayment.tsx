import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentProps {
  amount: number;
  onPaymentComplete: (paymentMethodId: string) => void;
  disabled?: boolean;
}

export function StripePayment({ amount, onPaymentComplete, disabled }: StripePaymentProps) {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      toast.error('Please fill in all card details');
      return;
    }

    setProcessing(true);
    try {
      // In a real implementation, you would use Stripe Elements here
      // For demo purposes, we'll simulate the payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock payment method ID
      const paymentMethodId = `pm_${Math.random().toString(36).substr(2, 9)}`;
      
      onPaymentComplete(paymentMethodId);
      toast.success('Payment processed successfully!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').trim();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-name">Cardholder Name</Label>
            <Input
              id="card-name"
              placeholder="John Doe"
              value={cardData.name}
              onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
              disabled={disabled || processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({ 
                ...prev, 
                number: formatCardNumber(e.target.value) 
              }))}
              maxLength={19}
              disabled={disabled || processing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry Date</Label>
              <Input
                id="card-expiry"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  expiry: formatExpiry(e.target.value) 
                }))}
                maxLength={5}
                disabled={disabled || processing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                placeholder="123"
                value={cardData.cvc}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  cvc: e.target.value.replace(/\D/g, '') 
                }))}
                maxLength={4}
                disabled={disabled || processing}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={disabled || processing}
          >
            {processing ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}