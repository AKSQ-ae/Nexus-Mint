import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, Coins, TrendingUp } from 'lucide-react';
import { formatCurrency, formatTokenAmount, calculateInvestmentFees, type TokenSupply } from '@/lib/services/tokenization-service';
import { toast } from 'sonner';

interface InvestmentCalculatorProps {
  tokenSupply: TokenSupply;
  onInvest: (tokenAmount: number, totalAmount: number) => void;
  disabled?: boolean;
}

export function InvestmentCalculator({ tokenSupply, onInvest, disabled }: InvestmentCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const amount = parseFloat(investmentAmount) || 0;
    const tokens = Math.floor(amount / tokenSupply.token_price);
    setTokenAmount(tokens);
    
    if (amount > 0) {
      calculateFees(amount);
    } else {
      setFees(0);
      setNetAmount(0);
    }
  }, [investmentAmount, tokenSupply.token_price]);

  const calculateFees = async (amount: number) => {
    try {
      const feeAmount = await calculateInvestmentFees(amount);
      setFees(feeAmount);
      setNetAmount(amount - feeAmount);
    } catch (error) {
      console.error('Failed to calculate fees:', error);
      setFees(0);
      setNetAmount(amount);
    }
  };

  const handleInvest = async () => {
    const amount = parseFloat(investmentAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    if (tokenAmount < tokenSupply.minimum_investment) {
      toast.error(`Minimum investment is ${formatTokenAmount(tokenSupply.minimum_investment)} tokens (${formatCurrency(tokenSupply.minimum_investment * tokenSupply.token_price)})`);
      return;
    }

    if (tokenAmount > tokenSupply.available_supply) {
      toast.error('Not enough tokens available');
      return;
    }

    if (tokenSupply.maximum_investment && tokenAmount > tokenSupply.maximum_investment) {
      toast.error(`Maximum investment is ${formatTokenAmount(tokenSupply.maximum_investment)} tokens`);
      return;
    }

    setLoading(true);
    try {
      await onInvest(tokenAmount, amount);
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = tokenAmount >= tokenSupply.minimum_investment && 
                  tokenAmount <= tokenSupply.available_supply &&
                  (!tokenSupply.maximum_investment || tokenAmount <= tokenSupply.maximum_investment);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Investment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Token Price</p>
            <p className="text-lg font-semibold">{formatCurrency(tokenSupply.token_price)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-lg font-semibold">{formatTokenAmount(tokenSupply.available_supply)} tokens</p>
          </div>
        </div>

        {/* Investment Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="investment-amount">Investment Amount (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="investment-amount"
              type="number"
              placeholder="Enter amount"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              className="pl-10"
              min={tokenSupply.minimum_investment * tokenSupply.token_price}
              max={tokenSupply.available_supply * tokenSupply.token_price}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Min: {formatCurrency(tokenSupply.minimum_investment * tokenSupply.token_price)}</span>
            <span>Max: {formatCurrency(tokenSupply.available_supply * tokenSupply.token_price)}</span>
          </div>
        </div>

        {/* Calculation Results */}
        {investmentAmount && parseFloat(investmentAmount) > 0 && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4" />
                Tokens to receive:
              </span>
              <span className="font-semibold">{formatTokenAmount(tokenAmount)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Gross amount:</span>
              <span>{formatCurrency(parseFloat(investmentAmount))}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Platform fee (2%):</span>
              <span className="text-destructive">-{formatCurrency(fees)}</span>
            </div>
            
            <hr />
            
            <div className="flex items-center justify-between font-semibold">
              <span>Net investment:</span>
              <span>{formatCurrency(netAmount)}</span>
            </div>

            {/* Validation Messages */}
            {tokenAmount < tokenSupply.minimum_investment && (
              <Badge variant="destructive" className="w-full justify-center">
                Below minimum investment
              </Badge>
            )}
            
            {tokenAmount > tokenSupply.available_supply && (
              <Badge variant="destructive" className="w-full justify-center">
                Exceeds available supply
              </Badge>
            )}
            
            {tokenSupply.maximum_investment && tokenAmount > tokenSupply.maximum_investment && (
              <Badge variant="destructive" className="w-full justify-center">
                Exceeds maximum investment
              </Badge>
            )}
            
            {isValid && (
              <Badge variant="default" className="w-full justify-center bg-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                Ready to invest
              </Badge>
            )}
          </div>
        )}

        {/* Investment Button */}
        <Button
          onClick={handleInvest}
          disabled={!isValid || disabled || loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Processing...' : `Invest ${formatCurrency(parseFloat(investmentAmount) || 0)}`}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          * Investment amounts are subject to platform fees. All investments carry risk.
        </p>
      </CardContent>
    </Card>
  );
}