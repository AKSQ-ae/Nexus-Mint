import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useWalletConnection } from '@/lib/services/web3-service';
import { Wallet, Check, AlertCircle, ExternalLink } from 'lucide-react';

export function WalletConnection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [linking, setLinking] = useState(false);
  
  const {
    address,
    isConnected,
    chainId,
    chainName,
    connect,
    disconnect,
    linkWallet,
    connectors
  } = useWalletConnection();

  const handleLinkWallet = async () => {
    if (!user || !address) return;

    setLinking(true);
    try {
      await linkWallet(user.id);
      toast({
        title: "Wallet linked",
        description: "Your wallet has been successfully linked to your account.",
      });
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast({
        title: "Link failed",
        description: "Failed to link wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Web3 Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your Web3 wallet to receive property tokens and participate in blockchain features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet to access blockchain features like receiving property tokens and viewing transaction history.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">Available Wallets:</h4>
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => connect(connector.id)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect with {connector.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Wallet Connected</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {formatAddress(address)}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <Badge variant="outline">{chainName} (ID: {chainId})</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleLinkWallet}
                disabled={linking}
                className="flex-1"
              >
                {linking ? 'Linking...' : 'Link to Account'}
              </Button>
              <Button
                variant="outline"
                onClick={() => disconnect()}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Features Available:</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Property Token Transfers</p>
                    <p className="text-sm text-muted-foreground">
                      Receive and transfer property tokens
                    </p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Transaction History</p>
                    <p className="text-sm text-muted-foreground">
                      View all blockchain transactions
                    </p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">DeFi Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Use tokens in DeFi protocols
                    </p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Supported Networks:</h4>
          <div className="grid grid-cols-2 gap-2">
            {['Ethereum', 'Polygon', 'Arbitrum', 'Base'].map((network) => (
              <div key={network} className="flex items-center gap-2 p-2 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{network}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}