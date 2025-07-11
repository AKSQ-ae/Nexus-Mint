import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickInvestFlowProps {
  propertyId: string;
  propertyTitle: string;
  tokenPrice: number;
  availableTokens: number;
  onComplete: () => void;
}

type FlowStep = 'amount' | 'confirm' | 'processing';

interface UserProfile {
  kyc_status: string;
  wallet_address?: string;
}

export function QuickInvestFlow({ 
  propertyId, 
  propertyTitle, 
  tokenPrice, 
  availableTokens,
  onComplete 
}: QuickInvestFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<FlowStep>('amount');
  const [amount, setAmount] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(33);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    setProgress(step === 'amount' ? 33 : step === 'confirm' ? 66 : 100);
  }, [step]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_profiles')
      .select('kyc_status, wallet_address')
      .eq('id', user.id)
      .single();
    
    setUserProfile(data);
  };

  const handleAmountSubmit = () => {
    const investAmount = parseFloat(amount);
    if (!investAmount || investAmount < 100) {
      toast.error('Minimum investment is $100');
      return;
    }
    
    if (investAmount > availableTokens * tokenPrice) {
      toast.error('Amount exceeds available tokens');
      return;
    }
    
    setStep('confirm');
  };

  const handleConfirmInvestment = async () => {
    setLoading(true);
    setStep('processing');
    
    try {
      const investAmount = parseFloat(amount);
      const tokenAmount = Math.floor(investAmount / tokenPrice);
      const fee = investAmount * 0.02; // 2% fee
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-investment-payment', {
        body: {
          propertyId,
          tokenAmount,
          investmentAmount: investAmount
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab for quick completion
      window.open(data.url, '_blank');
      
      toast.success('Investment initiated! Complete payment in the new tab.');
      onComplete();
      
    } catch (error) {
      console.error('Investment failed:', error);
      toast.error('Investment failed. Please try again.');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const tokens = Math.floor(parseFloat(amount || '0') / tokenPrice);
  const fee = parseFloat(amount || '0') * 0.02;
  const netAmount = parseFloat(amount || '0') - fee;

  const isKycApproved = userProfile?.kyc_status === 'approved';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Quick Invest
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            3-Click Flow
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="font-medium text-sm">{propertyTitle}</p>
          <p className="text-xs text-muted-foreground">
            ${tokenPrice}/token • {availableTokens.toLocaleString()} available
          </p>
        </div>

        {step === 'amount' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Investment Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 text-lg"
                  min="100"
                  step="1"
                />
              </div>
              
              {amount && (
                <div className="text-sm space-y-1">
                  <p>Tokens: <span className="font-medium">{tokens.toLocaleString()}</span></p>
                  <p>Fee (2%): <span className="text-destructive">-${fee.toFixed(2)}</span></p>
                  <p>Net: <span className="font-medium">${netAmount.toFixed(2)}</span></p>
                </div>
              )}
            </div>

            {/* KYC Status */}
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              {isKycApproved ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">KYC Approved</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-700">KYC Pending</span>
                </>
              )}
            </div>

            <Button 
              onClick={handleAmountSubmit}
              disabled={!amount || parseFloat(amount) < 100}
              className="w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg space-y-3">
              <h3 className="font-medium">Investment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="font-medium">{tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="text-destructive">-${fee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Net Investment:</span>
                  <span>${netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">Secure payment via Stripe</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('amount')}
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmInvestment}
                disabled={loading || !isKycApproved}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Invest Now'}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <div>
              <h3 className="font-medium">Processing Investment</h3>
              <p className="text-sm text-muted-foreground">
                Complete payment in the new tab to finalize
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          By investing, you agree to our terms and conditions. All investments carry risk.
        </p>
      </CardContent>
    </Card>
  );
}