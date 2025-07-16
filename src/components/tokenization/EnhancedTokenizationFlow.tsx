import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Building2, 
  Coins, 
  CreditCard, 
  Wallet, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ExternalLink,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useMetaMaskConnection } from '@/lib/services/web3-service';
import { 
  AssetData, 
  TokenisationValidationRequest, 
  TokenisationValidationResponse,
  TokenisationInitiateRequest,
  TokenisationInitiateResponse,
  TokenisationExecuteRequest,
  TokenisationExecuteResponse,
  TokenisationStatus,
  UserToken,
  PaymentMethod,
  validateTokenisation,
  initiateTokenisation,
  executeTokenisation,
  getTokenisationStatus,
  getUserTokens,
  getAvailableAssets
} from '@/lib/services/tokenization-service';
import { AIBuddy } from '@/components/ai/AIBuddy';

interface EnhancedTokenizationFlowProps {
  userId: string;
  className?: string;
}

type FlowStep = 'asset-selection' | 'validation' | 'payment' | 'processing' | 'complete';

interface FlowState {
  currentStep: FlowStep;
  selectedAsset: AssetData | null;
  amount: number;
  paymentMethod: PaymentMethod | null;
  validation: TokenisationValidationResponse | null;
  session: TokenisationInitiateResponse | null;
  status: TokenisationStatus | null;
  userTokens: UserToken[];
  isLoading: boolean;
  error: string | null;
}

export const EnhancedTokenizationFlow: React.FC<EnhancedTokenizationFlowProps> = ({ 
  userId, 
  className 
}) => {
  const { account, isConnected, connectWallet, provider } = useMetaMaskConnection();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [flowState, setFlowState] = useState<FlowState>({
    currentStep: 'asset-selection',
    selectedAsset: null,
    amount: 0,
    paymentMethod: null,
    validation: null,
    session: null,
    status: null,
    userTokens: [],
    isLoading: false,
    error: null
  });

  // Load available assets on component mount
  useEffect(() => {
    loadAvailableAssets();
    loadUserTokens();
  }, [userId]);

  // Poll for status updates when processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (flowState.currentStep === 'processing' && flowState.session?.sessionId) {
      interval = setInterval(() => {
        pollStatus(flowState.session.sessionId);
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [flowState.currentStep, flowState.session?.sessionId]);

  const loadAvailableAssets = async () => {
    try {
      const availableAssets = await getAvailableAssets();
      setAssets(availableAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load available assets');
    }
  };

  const loadUserTokens = async () => {
    try {
      const tokens = await getUserTokens(userId);
      setFlowState(prev => ({ ...prev, userTokens: tokens }));
    } catch (error) {
      console.error('Error loading user tokens:', error);
    }
  };

  const handleAssetSelection = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setFlowState(prev => ({ 
        ...prev, 
        selectedAsset: asset,
        amount: asset.minimum_investment 
      }));
    }
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setFlowState(prev => ({ ...prev, amount }));
  };

  const validateSelection = async () => {
    if (!flowState.selectedAsset || flowState.amount <= 0) {
      toast.error('Please select an asset and enter a valid amount');
      return;
    }

    setFlowState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const validation: TokenisationValidationRequest = {
        assetId: flowState.selectedAsset.id,
        amount: flowState.amount,
        userId
      };

      const result = await validateTokenisation(validation);
      
      if (result.valid) {
        setFlowState(prev => ({ 
          ...prev, 
          validation: result,
          currentStep: 'payment',
          isLoading: false 
        }));
        
        // Emit analytics event
        emitAnalyticsEvent('toko.validation_passed', {
          assetId: flowState.selectedAsset.id,
          amount: flowState.amount,
          estimatedFees: result.estimatedFees
        });
      } else {
        setFlowState(prev => ({ 
          ...prev, 
          error: result.errors?.join(', '),
          isLoading: false 
        }));
        toast.error(result.errors?.join(', '));
      }
    } catch (error) {
      console.error('Validation error:', error);
      setFlowState(prev => ({ 
        ...prev, 
        error: 'Validation failed. Please try again.',
        isLoading: false 
      }));
      toast.error('Validation failed. Please try again.');
    }
  };

  const handlePaymentMethodSelection = async (method: PaymentMethod) => {
    setFlowState(prev => ({ ...prev, paymentMethod: method, isLoading: true }));

    try {
      if (method.type === 'web3' && !isConnected) {
        await connectWallet();
      }

      const initiateRequest: TokenisationInitiateRequest = {
        assetId: flowState.selectedAsset!.id,
        amount: flowState.amount,
        paymentMethod: method,
        userId
      };

      const session = await initiateTokenisation(initiateRequest);
      
      setFlowState(prev => ({ 
        ...prev, 
        session,
        currentStep: 'processing',
        isLoading: false 
      }));

      // Emit analytics event
      emitAnalyticsEvent('toko.payment_initiated', {
        assetId: flowState.selectedAsset!.id,
        amount: flowState.amount,
        paymentMethod: method.type,
        provider: method.provider
      });

      // Handle payment based on method
      if (method.type === 'web3') {
        await handleWeb3Payment(session);
      } else if (method.type === 'stripe') {
        await handleStripePayment(session);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setFlowState(prev => ({ 
        ...prev, 
        error: 'Payment initiation failed. Please try again.',
        isLoading: false 
      }));
      toast.error('Payment initiation failed. Please try again.');
    }
  };

  const handleWeb3Payment = async (session: TokenisationInitiateResponse) => {
    if (!provider || !session.web3Transaction) {
      throw new Error('Web3 provider or transaction data not available');
    }

    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: session.web3Transaction.to,
        data: session.web3Transaction.data,
        value: session.web3Transaction.value,
        gasLimit: session.web3Transaction.gasLimit
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Execute tokenisation on backend
      await executeTokenisation({
        sessionId: session.sessionId,
        transactionHash: receipt.hash,
        userId
      });

      // Emit analytics events
      emitAnalyticsEvent('toko.payment_success', {
        assetId: flowState.selectedAsset!.id,
        amount: flowState.amount,
        transactionHash: receipt.hash
      });

      emitAnalyticsEvent('toko.minting_started', {
        assetId: flowState.selectedAsset!.id,
        sessionId: session.sessionId
      });

      // Start polling for status
      pollStatus(session.sessionId);
    } catch (error) {
      console.error('Web3 payment error:', error);
      setFlowState(prev => ({ 
        ...prev, 
        error: 'Payment failed. Please try again.',
        isLoading: false 
      }));
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleStripePayment = async (session: TokenisationInitiateResponse) => {
    // This would integrate with Stripe Elements
    // For now, we'll simulate the payment flow
    toast.info('Stripe payment integration would be implemented here');
    
    // Simulate payment success after 3 seconds
    setTimeout(async () => {
      try {
        await executeTokenisation({
          sessionId: session.sessionId,
          stripePaymentIntentId: session.paymentSession?.paymentIntentId,
          userId
        });

        emitAnalyticsEvent('toko.payment_success', {
          assetId: flowState.selectedAsset!.id,
          amount: flowState.amount,
          paymentMethod: 'stripe'
        });

        emitAnalyticsEvent('toko.minting_started', {
          assetId: flowState.selectedAsset!.id,
          sessionId: session.sessionId
        });

        pollStatus(session.sessionId);
      } catch (error) {
        console.error('Stripe payment error:', error);
        setFlowState(prev => ({ 
          ...prev, 
          error: 'Payment failed. Please try again.',
          isLoading: false 
        }));
        toast.error('Payment failed. Please try again.');
      }
    }, 3000);
  };

  const pollStatus = async (sessionId: string) => {
    try {
      const status = await getTokenisationStatus(sessionId);
      setFlowState(prev => ({ ...prev, status }));

      if (status.status === 'completed') {
        emitAnalyticsEvent('toko.minting_success', {
          assetId: flowState.selectedAsset!.id,
          sessionId,
          transactionHash: status.transactionHash
        });

        setFlowState(prev => ({ 
          ...prev, 
          currentStep: 'complete',
          isLoading: false 
        }));

        // Reload user tokens
        await loadUserTokens();
        
        toast.success('Tokenisation completed successfully!');
      } else if (status.status === 'failed') {
        emitAnalyticsEvent('toko.minting_failed', {
          assetId: flowState.selectedAsset!.id,
          sessionId,
          error: status.error
        });

        setFlowState(prev => ({ 
          ...prev, 
          error: status.error,
          isLoading: false 
        }));
        toast.error(`Tokenisation failed: ${status.error}`);
      }
    } catch (error) {
      console.error('Status polling error:', error);
    }
  };

  const emitAnalyticsEvent = (eventName: string, properties: Record<string, any>) => {
    // This would integrate with your analytics service
    console.log('Analytics Event:', eventName, properties);
    
    // Example integration with Supabase analytics
    supabase.functions.invoke('analytics-track', {
      body: {
        event: eventName,
        properties,
        userId
      }
    }).catch(console.error);
  };

  const resetFlow = () => {
    setFlowState({
      currentStep: 'asset-selection',
      selectedAsset: null,
      amount: 0,
      paymentMethod: null,
      validation: null,
      session: null,
      status: null,
      userTokens: [],
      isLoading: false,
      error: null
    });
  };

  const renderAssetSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Select Asset
        </CardTitle>
        <CardDescription>
          Choose the property you want to invest in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset-select">Property</Label>
          <Select onValueChange={handleAssetSelection}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{asset.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.location} • ${asset.price.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline">
                      ${asset.price_per_token}/token
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {flowState.selectedAsset && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Price per Token</div>
                <div className="text-muted-foreground">${flowState.selectedAsset.price_per_token}</div>
              </div>
              <div>
                <div className="font-medium">Available Tokens</div>
                <div className="text-muted-foreground">{flowState.selectedAsset.available_tokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium">ROI Estimate</div>
                <div className="text-muted-foreground">{flowState.selectedAsset.roi_estimate}%</div>
              </div>
              <div>
                <div className="font-medium">Rental Yield</div>
                <div className="text-muted-foreground">{flowState.selectedAsset.rental_yield}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={flowState.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min={flowState.selectedAsset.minimum_investment}
                max={flowState.selectedAsset.maximum_investment}
                step={flowState.selectedAsset.price_per_token}
              />
              <div className="text-xs text-muted-foreground">
                Min: ${flowState.selectedAsset.minimum_investment.toLocaleString()}
                {flowState.selectedAsset.maximum_investment && 
                  ` • Max: $${flowState.selectedAsset.maximum_investment.toLocaleString()}`
                }
              </div>
            </div>

            <Button 
              onClick={validateSelection} 
              disabled={flowState.amount < flowState.selectedAsset.minimum_investment}
              className="w-full"
            >
              Validate Selection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPaymentSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
        <CardDescription>
          Choose how you want to pay for your tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {flowState.validation && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Investment Amount:</span>
              <span>${flowState.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Fees:</span>
              <span>${flowState.validation.estimatedFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Cost:</span>
              <span>${flowState.validation.totalCost.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => handlePaymentMethodSelection({ type: 'web3', provider: 'metamask' })}
            disabled={flowState.isLoading}
          >
            <Wallet className="h-6 w-6" />
            <div>
              <div className="font-medium">Pay with Ethereum</div>
              <div className="text-xs text-muted-foreground">MetaMask or WalletConnect</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => handlePaymentMethodSelection({ type: 'stripe', provider: 'stripe' })}
            disabled={flowState.isLoading}
          >
            <CreditCard className="h-6 w-6" />
            <div>
              <div className="font-medium">Pay with Card</div>
              <div className="text-xs text-muted-foreground">Credit or debit card</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessing = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing Tokenisation
        </CardTitle>
        <CardDescription>
          Your tokens are being minted on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{flowState.status?.progress || 0}%</span>
          </div>
          <Progress value={flowState.status?.progress || 0} className="h-2" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Validate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Payment</span>
            </div>
            <div className="flex items-center gap-2">
              {flowState.status?.status === 'minting' || flowState.status?.status === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span className="text-sm">Minting</span>
            </div>
            <div className="flex items-center gap-2">
              {flowState.status?.status === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20" />
              )}
              <span className="text-sm">Complete</span>
            </div>
          </div>
        </div>

        {flowState.status?.message && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">{flowState.status.message}</div>
          </div>
        )}

        {flowState.status?.transactionHash && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Transaction:</span>
            <a
              href={flowState.status.blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {flowState.status.transactionHash.slice(0, 10)}...{flowState.status.transactionHash.slice(-8)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Tokenisation Complete!
        </CardTitle>
        <CardDescription>
          Your tokens have been successfully minted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Congratulations!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            You now own {flowState.validation?.totalCost && flowState.selectedAsset ? 
              Math.floor(flowState.validation.totalCost / flowState.selectedAsset.price_per_token) : 0} tokens in {flowState.selectedAsset?.title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Tokens Purchased</div>
            <div className="text-muted-foreground">
              {flowState.validation?.totalCost && flowState.selectedAsset ? 
                Math.floor(flowState.validation.totalCost / flowState.selectedAsset.price_per_token) : 0}
            </div>
          </div>
          <div>
            <div className="font-medium">Total Value</div>
            <div className="text-muted-foreground">
              ${flowState.validation?.totalCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/portfolio'} className="flex-1">
            View Portfolio
          </Button>
          <Button variant="outline" onClick={resetFlow} className="flex-1">
            Start Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* TOKO AI Assistant */}
      <div className="fixed bottom-4 right-4 z-50">
        <AIBuddy userId={userId} />
      </div>

      {/* Flow Steps */}
      <div className="flex items-center justify-center space-x-4">
        {['asset-selection', 'validation', 'payment', 'processing', 'complete'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm
              ${flowState.currentStep === step ? 'bg-primary border-primary text-primary-foreground' :
                ['complete', 'processing'].includes(flowState.currentStep) && index < ['complete', 'processing'].indexOf(flowState.currentStep) ? 
                'bg-green-100 border-green-500 text-green-700' :
                'bg-muted border-muted-foreground/20 text-muted-foreground'}
            `}>
              {index + 1}
            </div>
            {index < 4 && (
              <div className={`
                w-16 h-0.5 mx-2
                ${['complete', 'processing'].includes(flowState.currentStep) && index < ['complete', 'processing'].indexOf(flowState.currentStep) ? 
                  'bg-green-500' : 'bg-muted-foreground/20'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {flowState.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{flowState.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {flowState.currentStep === 'asset-selection' && renderAssetSelection()}
      {flowState.currentStep === 'payment' && renderPaymentSelection()}
      {flowState.currentStep === 'processing' && renderProcessing()}
      {flowState.currentStep === 'complete' && renderComplete()}

      {/* User Portfolio Summary */}
      {flowState.userTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Portfolio
            </CardTitle>
            <CardDescription>
              Your current token holdings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flowState.userTokens.slice(0, 3).map((token) => (
                <div key={token.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{token.assetTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {token.tokenAmount} {token.tokenSymbol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${token.tokenValue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ${token.lastValuation.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {flowState.userTokens.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/portfolio'}>
                  View All {flowState.userTokens.length} Holdings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};