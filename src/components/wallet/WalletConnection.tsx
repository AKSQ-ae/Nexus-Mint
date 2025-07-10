import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, ExternalLink, Copy, TrendingUp } from 'lucide-react';
import { useMetaMaskConnection } from '@/lib/services/web3-service';
import { toast } from 'sonner';

interface WalletConnectionProps {
  className?: string;
}

export function WalletConnection({ className }: WalletConnectionProps) {
  const {
    account,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToEthereum,
    switchToPolygon,
    isMetaMaskInstalled
  } = useMetaMaskConnection();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard');
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 11155111: return 'Sepolia Testnet';
      default: return `Chain ${chainId}`;
    }
  };

  const getChainColor = (chainId: number) => {
    switch (chainId) {
      case 1: return 'bg-blue-500';
      case 137: return 'bg-purple-500';
      case 11155111: return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Web3 Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Install MetaMask to connect your Web3 wallet and access crypto features.
          </p>
          
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Connect your MetaMask wallet to access crypto payments and receive property tokens.
            </p>
          </div>
          
          <Button onClick={handleConnect} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Connect MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </code>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <Badge 
              variant="outline" 
              className={`${chainId ? getChainColor(chainId) : 'bg-gray-500'} text-white border-none`}
            >
              {chainId ? getChainName(chainId) : 'Unknown'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Network Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Network Switch</p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchToEthereum}
              disabled={chainId === 1}
            >
              Ethereum
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={switchToPolygon}
              disabled={chainId === 137}
            >
              Polygon
            </Button>
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Web3 Features Available
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Pay with cryptocurrency (ETH, MATIC)</li>
            <li>• Receive property tokens in your wallet</li>
            <li>• Track investments on-chain</li>
            <li>• Transfer tokens between wallets</li>
          </ul>
        </div>

        <Button 
          variant="outline" 
          onClick={disconnectWallet}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}