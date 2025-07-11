import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Network, TrendingUp, TrendingDown } from 'lucide-react';
import { useGasMonitoring, NETWORK_CONFIG, switchToOptimalNetwork } from '@/lib/services/web3-service';
import { ethers } from 'ethers';

interface GasMonitorProps {
  onNetworkChange?: (network: 'ethereum' | 'polygon') => void;
  provider?: ethers.BrowserProvider | null;
}

export function GasMonitor({ onNetworkChange, provider }: GasMonitorProps) {
  const { gasPrice, isHighGas, recommendedNetwork, checkGasPrice } = useGasMonitoring();
  const [isLoading, setIsLoading] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<'ethereum' | 'polygon'>('ethereum');

  useEffect(() => {
    if (provider) {
      checkGasPrices();
      // Check gas prices every 30 seconds
      const interval = setInterval(checkGasPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [provider]);

  const checkGasPrices = async () => {
    if (!provider) return;
    setIsLoading(true);
    await checkGasPrice(provider);
    setIsLoading(false);
  };

  const handleNetworkSwitch = async () => {
    if (!provider) return;
    
    setIsLoading(true);
    try {
      const newNetwork = await switchToOptimalNetwork(provider);
      setCurrentNetwork(newNetwork as 'ethereum' | 'polygon');
      onNetworkChange?.(newNetwork as 'ethereum' | 'polygon');
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatGasPrice = (price: bigint | null) => {
    if (!price) return 'Loading...';
    return `${(price / 1000000000n).toString()} gwei`;
  };

  const getGasStatus = (): { color: 'default' | 'destructive' | 'outline' | 'secondary', icon: any, text: string } => {
    if (!gasPrice) return { color: 'default', icon: Zap, text: 'Checking...' };
    
    if (isHighGas) {
      return { 
        color: 'destructive', 
        icon: TrendingUp, 
        text: 'High Gas Fees' 
      };
    }
    
    return { 
      color: 'default', 
      icon: TrendingDown, 
      text: 'Normal Gas Fees' 
    };
  };

  const gasStatus = getGasStatus();
  const StatusIcon = gasStatus.icon;

  if (!provider) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Gas Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Gas Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Current Gas Price</span>
          </div>
          <Badge variant={gasStatus.color}>
            {formatGasPrice(gasPrice)}
          </Badge>
        </div>

        {/* Network Recommendation */}
        {isHighGas && (
          <Alert>
            <Network className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>High gas fees detected. Consider using {recommendedNetwork} for lower costs.</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNetworkSwitch}
                  disabled={isLoading}
                  className="ml-2"
                >
                  Switch to {NETWORK_CONFIG[recommendedNetwork].name}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Network Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium">Ethereum</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Higher security, higher fees
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm font-medium">Polygon</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ~90% lower fees, fast transactions
            </p>
          </div>
        </div>

        {/* Manual Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={checkGasPrices}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Checking...' : 'Refresh Gas Prices'}
        </Button>
      </CardContent>
    </Card>
  );
}