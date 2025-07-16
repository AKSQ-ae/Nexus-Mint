import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { InvestmentCalculator } from './InvestmentCalculator';
import { StripePayment } from '../payment/StripePayment';
import { MetaMaskPayment } from '../payment/MetaMaskPayment';
import { EnhancedWalletConnection } from '../wallet/EnhancedWalletConnection';
import { KYCUpload } from '../kyc/KYCUpload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedInvestmentFlowProps {
  propertyId: string;
  propertyTitle: string;
  onInvestmentComplete: () => void;
}

type FlowStep = 'calculator' | 'kyc' | 'payment' | 'confirmation';
type PaymentMethod = 'traditional' | 'blockchain';

export function EnhancedInvestmentFlow({ 
  propertyId, 
  propertyTitle, 
  onInvestmentComplete 
}: EnhancedInvestmentFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('calculator');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('traditional');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tokenSupply, setTokenSupply] = useState<any>(null);
  
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
    loadPropertyData();
  }, [user, propertyId]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPropertyData = async () => {
    try {
      const { data, error } = await supabase
        .from('token_supply')
        .select('*')
        .eq('property_id', propertyId)
        .single();
      
      if (!error) {
        setTokenSupply(data);
      }
    } catch (error) {
      console.error('Error loading property data:', error);
    }
  };

  const getStepNumber = (step: FlowStep): number => {
    const steps = ['calculator', 'kyc', 'payment', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  const getStepTitle = (step: FlowStep): string => {
    switch (step) {
      case 'calculator': return 'Investment Amount';
      case 'kyc': return 'Identity Verification';
      case 'payment': return 'Payment Method';
      case 'confirmation': return 'Confirmation';
      default: return '';
    }
  };

  const isStepComplete = (step: FlowStep): boolean => {
    const steps = ['calculator', 'kyc', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  };

  const handleInvestmentCalculation = (amount: number, total: number) => {
    setTokenAmount(amount);
    setTotalAmount(total);
    
    // Check if KYC is required
    if (userProfile?.kyc_status === 'approved') {
      setCurrentStep('payment');
    } else {
      setCurrentStep('kyc');
    }
  };

  const handleKYCComplete = () => {
    setCurrentStep('payment');
  };

  const handleTraditionalPayment = async (paymentMethodId: string) => {
    setIsLoading(true);
    try {
      // Create investment via Stripe payment
      const { data, error } = await supabase.functions.invoke('create-investment', {
        body: {
          property_id: propertyId,
          token_amount: tokenAmount,
          payment_method: 'stripe',
          payment_method_id: paymentMethodId,
          total_amount: totalAmount
        }
      });

      if (error) throw error;

      setCurrentStep('confirmation');
      toast({
        title: "Investment successful!",
        description: `You have successfully invested in ${propertyTitle}`,
      });
    } catch (error) {
      console.error('Error processing traditional payment:', error);
      toast({
        title: "Payment failed",
        description: "Failed to process your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockchainPayment = async (txHash: string) => {
    setIsLoading(true);
    try {
      // Create investment via blockchain transaction
      const { data, error } = await supabase.functions.invoke('create-investment', {
        body: {
          property_id: propertyId,
          token_amount: tokenAmount,
          payment_method: 'crypto',
          blockchain_tx_hash: txHash,
          total_amount: totalAmount
        }
      });

      if (error) throw error;

      setCurrentStep('confirmation');
      toast({
        title: "Investment successful!",
        description: `Your blockchain investment in ${propertyTitle} is being processed`,
      });
    } catch (error) {
      console.error('Error processing blockchain payment:', error);
      toast({
        title: "Transaction failed",
        description: "Failed to process your blockchain transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = () => {
    const stepProgress = {
      calculator: 25,
      kyc: 50,
      payment: 75,
      confirmation: 100
    };
    return stepProgress[currentStep];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p>Processing your investment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Process</CardTitle>
          <CardDescription>
            Complete the steps below to invest in {propertyTitle}
          </CardDescription>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {getStepNumber(currentStep)} of 4: {getStepTitle(currentStep)}</span>
              <span>{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} />
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      {currentStep === 'calculator' && tokenSupply && (
        <InvestmentCalculator
          tokenSupply={tokenSupply}
          onInvest={handleInvestmentCalculation}
        />
      )}

      {currentStep === 'kyc' && (
        <Card>
          <CardHeader>
            <CardTitle>Identity Verification Required</CardTitle>
            <CardDescription>
              Please complete KYC verification to proceed with your investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KYCUpload />
            <div className="mt-4">
              <Button onClick={handleKYCComplete} className="w-full">
                Continue (KYC Documents Uploaded)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
            <CardDescription>
              Select how you'd like to complete your investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="traditional" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Traditional Payment
                </TabsTrigger>
                <TabsTrigger 
                  value="blockchain" 
                  className="flex items-center gap-2"
                  disabled={!isConnected}
                >
                  <Wallet className="h-4 w-4" />
                  Blockchain Payment
                  {!isConnected && <Badge variant="outline" className="ml-2">Wallet Required</Badge>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="traditional" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Investment Amount:</span>
                    <span className="font-semibold">{tokenAmount} tokens</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Cost:</span>
                    <span className="font-semibold">${totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <StripePayment
                  propertyId={propertyId}
                  tokenAmount={tokenAmount}
                  investmentAmount={totalAmount}
                  onPaymentComplete={() => setCurrentStep('confirmation')}
                />
              </TabsContent>

              <TabsContent value="blockchain" className="space-y-4">
                {!isConnected ? (
                  <EnhancedWalletConnection />
                ) : (
                  <>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Investment Amount:</span>
                        <span className="font-semibold">{tokenAmount} tokens</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Wallet Address:</span>
                        <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Estimated Gas:</span>
                        <span className="font-semibold">~$15-25</span>
                      </div>
                    </div>
                    
                    <MetaMaskPayment
                      amount={totalAmount}
                      tokenAmount={tokenAmount}
                      propertyId={propertyId}
                      onPaymentComplete={handleBlockchainPayment}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {currentStep === 'confirmation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Investment Successful!
            </CardTitle>
            <CardDescription>
              Your investment in {propertyTitle} has been processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-success/10 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Property:</span>
                <span className="font-semibold">{propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Purchased:</span>
                <span className="font-semibold">{tokenAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Investment:</span>
                <span className="font-semibold">${totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold capitalize">{paymentMethod}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button onClick={onInvestmentComplete} className="w-full">
                View My Portfolio
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep('calculator')} className="w-full">
                Make Another Investment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}