import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ExternalLink, 
  Coins, 
  TrendingUp, 
  Users,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useMetaMaskConnection } from '@/lib/services/web3-service';
import { deployPropertyContract } from '@/lib/services/tokenization-service';

interface ContractInteractionProps {
  propertyId: string;
  propertyTitle: string;
  tokenData?: any;
}

export function ContractInteraction({ 
  propertyId, 
  propertyTitle, 
  tokenData 
}: ContractInteractionProps) {
  const { isConnected, account, connectWallet } = useMetaMaskConnection();
  const [isDeploying, setIsDeploying] = useState(false);
  const [contractInfo, setContractInfo] = useState<any>(null);

  useEffect(() => {
    if (tokenData) {
      setContractInfo(tokenData);
    }
  }, [tokenData]);

  const handleDeployContract = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsDeploying(true);
    try {
      const result = await deployPropertyContract(propertyId);
      
      if (result.success) {
        toast.success('Smart contract deployed successfully!');
        setContractInfo({
          contract_address: result.contractAddress,
          token_name: `${propertyTitle} Token`,
          total_supply: 1000000,
          available_supply: 1000000,
          status: 'active'
        });
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('Contract deployment error:', error);
      toast.error('Failed to deploy contract');
    } finally {
      setIsDeploying(false);
    }
  };

  const openEtherscan = () => {
    if (contractInfo?.contract_address) {
      window.open(`https://polygonscan.com/address/${contractInfo.contract_address}`, '_blank');
    }
  };

  if (!contractInfo) {
    return (
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Smart Contract
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Smart Contract Deployed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deploy an ERC-20 token contract for this property to enable real blockchain tokenization.
            </p>
            
            {!isConnected ? (
              <Button onClick={connectWallet} variant="outline">
                Connect Wallet to Deploy
              </Button>
            ) : (
              <Button 
                onClick={handleDeployContract}
                disabled={isDeploying}
                className="min-w-[200px]"
              >
                {isDeploying ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Deploying Contract...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Deploy Smart Contract
                  </>
                )}
              </Button>
            )}
          </div>
          
          {isConnected && (
            <div className="text-xs text-muted-foreground text-center">
              Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
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
          <FileText className="h-5 w-5" />
          Smart Contract
          <Badge variant="default" className="ml-auto">
            {contractInfo.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Address */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Contract Address</p>
            <p className="text-xs text-muted-foreground font-mono">
              {contractInfo.contract_address}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={openEtherscan}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Token Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Total Supply</p>
            <p className="text-lg font-bold">{contractInfo.total_supply?.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Available</p>
            <p className="text-lg font-bold">{contractInfo.available_supply?.toLocaleString()}</p>
          </div>
        </div>

        <Separator />

        {/* Contract Features */}
        <div className="space-y-2">
          <h4 className="font-medium">Contract Features</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>ERC-20 Token Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Automated Token Distribution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Income Distribution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Investor Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Pausable & Secure</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEtherscan} className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
          {isConnected && (
            <Button variant="outline" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Add to Wallet
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="text-xs text-muted-foreground text-center">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}