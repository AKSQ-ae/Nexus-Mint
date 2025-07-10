import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useMetaMaskConnection } from '@/lib/services/web3-service';
import { formatCurrency } from '@/lib/services/tokenization-service';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface MetaMaskPaymentProps {
  amount: number;
  tokenAmount: number;
  propertyId: string;
  onPaymentComplete: (txHash: string) => void;
  disabled?: boolean;
}

export function MetaMaskPayment({ 
  amount, 
  tokenAmount, 
  propertyId, 
  onPaymentComplete, 
  disabled 
}: MetaMaskPaymentProps) {
  const {
    account,
    isConnected,
    chainId,
    provider,
    connectWallet,
    disconnectWallet,
    switchToEthereum,
    isMetaMaskInstalled
  } = useMetaMaskConnection();

  const [processing, setProcessing] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('MetaMask connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect MetaMask');
    }
  };

  const handlePayment = async () => {
    if (!provider || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setProcessing(true);
    try {
      const signer = await provider.getSigner();
      
      // Convert USD amount to ETH (simplified conversion - in production use real exchange rates)
      const ethAmount = (amount / 3000).toFixed(6); // Assuming 1 ETH = $3000
      const valueInWei = ethers.parseEther(ethAmount);

      // Create transaction
      const tx = await signer.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D5c542e61BDd40d8', // Example treasury wallet
        value: valueInWei,
        data: ethers.hexlify(ethers.toUtf8Bytes(`PROP:${propertyId}:TOKENS:${tokenAmount}`))
      });

      toast.success('Transaction sent! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        onPaymentComplete(tx.hash);
        toast.success('Payment confirmed on blockchain!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon';
      case 11155111: return 'Sepolia Testnet';
      default: return `Chain ${chainId}`;
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MetaMask Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              MetaMask extension is required to pay with cryptocurrency.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect MetaMask
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your MetaMask wallet to pay with cryptocurrency.
          </p>
          
          <Button onClick={handleConnect} className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          MetaMask Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Wallet Connected</span>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>

        {/* Account Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Address:</span>
            <span className="font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Network:</span>
            <Badge variant="outline">{chainId ? getChainName(chainId) : 'Unknown'}</Badge>
          </div>
        </div>

        <Separator />

        {/* Payment Details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Investment Amount:</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tokens:</span>
            <span className="font-medium">{tokenAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated ETH:</span>
            <span className="font-medium">~{(amount / 3000).toFixed(6)} ETH</span>
          </div>
        </div>

        <Separator />

        {/* Network Warning */}
        {chainId && chainId !== 1 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Switch to Ethereum Mainnet for production</span>
              <Button variant="outline" size="sm" onClick={switchToEthereum}>
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled || processing || !account}
          className="w-full"
          size="lg"
        >
          {processing ? 'Processing Transaction...' : `Pay ${formatCurrency(amount)} with ETH`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          * Transaction will be confirmed on the blockchain. Gas fees apply.
        </p>
      </CardContent>
    </Card>
  );
}