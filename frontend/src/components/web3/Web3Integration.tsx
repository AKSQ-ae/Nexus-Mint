import { useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useContractWrite, useContractRead } from 'wagmi';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const PROPERTY_TOKEN_ABI = [
  "function mint(address to, uint256 id, uint256 amount, bytes memory data) public",
  "function balanceOf(address account, uint256 id) public view returns (uint256)",
  "function totalSupply(uint256 id) public view returns (uint256)",
  "function exists(uint256 id) public view returns (bool)"
];

interface Web3IntegrationProps {
  propertyId: string;
  contractAddress?: string;
  tokenPrice: number;
  minInvestment: number;
}

export const Web3Integration = ({ 
  propertyId, 
  contractAddress, 
  tokenPrice, 
  minInvestment 
}: Web3IntegrationProps) => {
  const [tokenAmount, setTokenAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // Read contract data  
  const { data: tokenExists } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'exists',
    args: [propertyId]
  });

  const { data: userBalance } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address, propertyId]
  });

  const { data: totalSupply } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalSupply',
    args: [propertyId]
  });

  // Write contract function
  const { writeContract: mintTokens } = useContractWrite();

  const handleConnect = useCallback((connector: any) => {
    connect({ connector });
  }, [connect]);

  const handleInvestment = useCallback(async () => {
    if (!address || !contractAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const totalAmount = tokenAmount * tokenPrice;
    if (totalAmount < minInvestment) {
      toast.error(`Minimum investment is $${minInvestment}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Convert token amount to proper format
      const tokenAmountBN = ethers.parseUnits(tokenAmount.toString(), 0);
      
      // Call mint function
      mintTokens({
        address: contractAddress as `0x${string}`,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'mint',
        args: [
          address,
          propertyId,
          tokenAmountBN,
          '0x' // empty bytes data
        ],
        account: address!,
        chain: undefined, // Will use current chain
      });

      toast.success('Investment transaction submitted!', {
        description: 'Your tokens will be minted once the transaction is confirmed.'
      });

      // Reset form
      setTokenAmount(1);
      
    } catch (error: any) {
      console.error('Investment failed:', error);
      toast.error('Investment failed', {
        description: error.message || 'Transaction was rejected or failed'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [address, contractAddress, tokenAmount, tokenPrice, minInvestment, mintTokens, propertyId]);

  const totalInvestment = tokenAmount * tokenPrice;

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Web3 wallet to invest in tokenized properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-3">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isConnecting}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect {connector.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              
              {userBalance !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Your tokens: </span>
                  <Badge variant="secondary">{userBalance.toString()}</Badge>
                </div>
              )}
              
              <Button 
                onClick={() => disconnect()} 
                variant="outline" 
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Status */}
      {contractAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tokenExists ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              Smart Contract Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contract Address:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://mumbai.polygonscan.com/address/${contractAddress}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {totalSupply !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Supply:</span>
                <Badge variant="outline">{totalSupply.toString()} tokens</Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Token Status:</span>
              <Badge variant={tokenExists ? "default" : "secondary"}>
                {tokenExists ? "Active" : "Not Minted"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Interface */}
      {isConnected && contractAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Make Investment</CardTitle>
            <CardDescription>
              Purchase property tokens directly on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Amount</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  placeholder="Number of tokens"
                />
                <div className="text-sm text-muted-foreground">
                  × ${tokenPrice} = ${totalInvestment.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Token Price:</span>
                <span>${tokenPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>{tokenAmount} tokens</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Total Investment:</span>
                <span>${totalInvestment.toLocaleString()}</span>
              </div>
            </div>
            
            {totalInvestment < minInvestment && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <AlertCircle className="h-4 w-4" />
                  Minimum investment is ${minInvestment.toLocaleString()}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleInvestment}
              disabled={isProcessing || totalInvestment < minInvestment || !tokenExists}
              className="w-full"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : `Invest $${totalInvestment.toLocaleString()}`}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              This transaction will be recorded on the Polygon testnet blockchain
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};