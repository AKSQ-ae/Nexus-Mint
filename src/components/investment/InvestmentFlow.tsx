import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Check, AlertCircle, CreditCard, Shield, TrendingUp } from 'lucide-react';
import { InvestmentCalculator } from './InvestmentCalculator';
import { StripePayment } from '@/components/payment/StripePayment';
import { MetaMaskPayment } from '@/components/payment/MetaMaskPayment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTokenSupply, 
  createInvestment, 
  getPropertyInvestmentStats,
  type TokenSupply 
} from '@/lib/services/tokenization-service';

interface InvestmentFlowProps {
  propertyId: string;
  propertyTitle: string;
  onInvestmentComplete: () => void;
}

type FlowStep = 'calculator' | 'kyc' | 'payment' | 'confirmation';

export function InvestmentFlow({ propertyId, propertyTitle, onInvestmentComplete }: InvestmentFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<FlowStep>('calculator');
  const [tokenSupply, setTokenSupply] = useState<TokenSupply | null>(null);
  const [investmentData, setInvestmentData] = useState<{
    tokenAmount: number;
    totalAmount: number;
  } | null>(null);
  const [propertyStats, setPropertyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    loadPropertyData();
  }, [propertyId]);

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      const [supply, stats] = await Promise.all([
        getTokenSupply(propertyId),
        getPropertyInvestmentStats(propertyId)
      ]);
      
      setTokenSupply(supply);
      setPropertyStats(stats);
    } catch (error) {
      console.error('Failed to load property data:', error);
      toast.error('Failed to load property investment data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentCalculation = (tokenAmount: number, totalAmount: number) => {
    setInvestmentData({ tokenAmount, totalAmount });
    
    // Check KYC status
    if (user?.user_metadata?.kyc_status !== 'approved') {
      setCurrentStep('kyc');
    } else {
      setCurrentStep('payment');
    }
  };

  const handleKYCComplete = () => {
    setCurrentStep('payment');
  };

  const handlePaymentComplete = async (paymentMethodId: string) => {
    if (!investmentData || !tokenSupply) return;

    setInvesting(true);
    try {
      const result = await createInvestment(
        propertyId,
        investmentData.tokenAmount,
        paymentMethodId
      );

      if (result.success) {
        setCurrentStep('confirmation');
        toast.success('Investment completed successfully!');
        onInvestmentComplete();
      } else {
        throw new Error(result.error || 'Investment failed');
      }
    } catch (error) {
      console.error('Investment failed:', error);
      toast.error('Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  const handleCryptoPayment = async (txHash: string) => {
    if (!investmentData || !tokenSupply) return;

    setInvesting(true);
    try {
      // Create investment record with crypto payment
      const result = await createInvestment(
        propertyId,
        investmentData.tokenAmount,
        `crypto_${txHash}`
      );

      if (result.success) {
        setCurrentStep('confirmation');
        toast.success('Crypto payment confirmed! Tokens will be distributed to your wallet.');
        onInvestmentComplete();
      } else {
        throw new Error(result.error || 'Investment failed');
      }
    } catch (error) {
      console.error('Crypto investment failed:', error);
      toast.error('Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  const getStepNumber = (step: FlowStep): number => {
    const steps = ['calculator', 'kyc', 'payment', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  const isStepComplete = (step: FlowStep): boolean => {
    const currentStepNumber = getStepNumber(currentStep);
    const stepNumber = getStepNumber(step);
    return stepNumber < currentStepNumber;
  };

  if (loading || !tokenSupply) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Investment in {propertyTitle}</CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {isStepComplete('calculator') ? <Check className="h-4 w-4 text-green-500" /> : 
               currentStep === 'calculator' ? <div className="h-4 w-4 rounded-full bg-primary" /> :
               <div className="h-4 w-4 rounded-full bg-muted" />}
              <span>Calculate</span>
            </div>
            <div className="flex items-center gap-2">
              {isStepComplete('kyc') ? <Check className="h-4 w-4 text-green-500" /> : 
               currentStep === 'kyc' ? <div className="h-4 w-4 rounded-full bg-primary" /> :
               <div className="h-4 w-4 rounded-full bg-muted" />}
              <span>Verify Identity</span>
            </div>
            <div className="flex items-center gap-2">
              {isStepComplete('payment') ? <Check className="h-4 w-4 text-green-500" /> : 
               currentStep === 'payment' ? <div className="h-4 w-4 rounded-full bg-primary" /> :
               <div className="h-4 w-4 rounded-full bg-muted" />}
              <span>Payment</span>
            </div>
            <div className="flex items-center gap-2">
              {currentStep === 'confirmation' ? <Check className="h-4 w-4 text-green-500" /> :
               <div className="h-4 w-4 rounded-full bg-muted" />}
              <span>Complete</span>
            </div>
          </div>
          <Progress value={getStepNumber(currentStep) * 25} className="w-full" />
        </CardHeader>
      </Card>

      {/* Property Stats */}
      {propertyStats && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Funding Progress</p>
                <p className="text-lg font-semibold">{propertyStats.fundingPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investors</p>
                <p className="text-lg font-semibold">{propertyStats.totalInvestors}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg font-semibold">${propertyStats.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Tokens</p>
                <p className="text-lg font-semibold">{propertyStats.availableTokens.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === 'calculator' && (
        <InvestmentCalculator
          tokenSupply={tokenSupply}
          onInvest={handleInvestmentCalculation}
          disabled={investing}
        />
      )}

      {currentStep === 'kyc' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identity Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">KYC Verification Required</p>
                <p className="text-sm text-yellow-700">
                  To comply with regulations, we need to verify your identity before you can invest.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline">Status: {user?.user_metadata?.kyc_status || 'Not Started'}</Badge>
              <p className="text-sm text-muted-foreground">
                This process typically takes 1-2 minutes and uses industry-standard security.
              </p>
            </div>

            <Button onClick={handleKYCComplete} className="w-full">
              Complete Identity Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'payment' && investmentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Investment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Investment Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span className="font-medium">{investmentData.tokenAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Token Price:</span>
                <span>${tokenSupply.token_price}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>${investmentData.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Tabs defaultValue="fiat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fiat">Credit Card</TabsTrigger>
                <TabsTrigger value="crypto">MetaMask</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fiat" className="mt-4">
                <StripePayment
                  amount={investmentData.totalAmount}
                  onPaymentComplete={(methodId) => handlePaymentComplete(methodId)}
                  disabled={investing}
                />
              </TabsContent>
              
              <TabsContent value="crypto" className="mt-4">
                <MetaMaskPayment
                  amount={investmentData.totalAmount}
                  tokenAmount={investmentData.tokenAmount}
                  propertyId={propertyId}
                  onPaymentComplete={(txHash) => handleCryptoPayment(txHash)}
                  disabled={investing}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {currentStep === 'confirmation' && (
        <Card>
          <CardContent className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Investment Successful!</h3>
              <p className="text-muted-foreground">
                Your investment has been processed successfully. You now own {investmentData?.tokenAmount} tokens.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Track your investment in your portfolio</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}