import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function EnhancedWalletConnection() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    if (user && address) {
      checkWalletLinkStatus();
    }
  }, [user, address]);

  const checkWalletLinkStatus = async () => {
    if (!user || !address) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .single();
      
      if (!error && data?.wallet_address === address) {
        setIsLinked(true);
      }
    } catch (error) {
      console.error('Error checking wallet link status:', error);
    }
  };

  const linkWalletToProfile = async () => {
    if (!user || !address) return;
    
    setIsLinking(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          wallet_address: address,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsLinked(true);
      toast({
        title: "Wallet linked successfully",
        description: "Your wallet is now connected to your profile.",
      });
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast({
        title: "Error linking wallet",
        description: "Failed to link wallet to your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getEtherscanUrl = (addr: string) => {
    return `https://etherscan.io/address/${addr}`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to invest in tokenized properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full"
              variant="outline"
            >
              {isPending ? (
                'Connecting...'
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect {connector.name}
                </>
              )}
            </Button>
          ))}
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error.message}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Wallet Connected
        </CardTitle>
        <CardDescription>
          Your wallet is connected and ready for blockchain transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="space-y-1">
            <div className="text-sm font-medium">Address</div>
            <div className="text-sm text-muted-foreground font-mono">
              {formatAddress(address!)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(getEtherscanUrl(address!), '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Profile Link Status</div>
            <Badge variant={isLinked ? "default" : "outline"}>
              {isLinked ? "Linked" : "Not Linked"}
            </Badge>
          </div>
          {!isLinked && user && (
            <Button 
              onClick={linkWalletToProfile}
              disabled={isLinking}
              size="sm"
            >
              {isLinking ? "Linking..." : "Link to Profile"}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Connector</div>
            <div className="text-sm text-muted-foreground">
              {connector?.name}
            </div>
          </div>
          <Button variant="outline" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}