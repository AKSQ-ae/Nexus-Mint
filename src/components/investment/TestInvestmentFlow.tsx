import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, DollarSign, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestInvestmentFlowProps {
  propertyId: string;
  propertyTitle: string;
  pricePerToken: number;
  onInvestmentComplete: () => void;
}

export function TestInvestmentFlow({ 
  propertyId, 
  propertyTitle, 
  pricePerToken,
  onInvestmentComplete 
}: TestInvestmentFlowProps) {
  const [tokenAmount, setTokenAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [investmentComplete, setInvestmentComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const totalAmount = tokenAmount * pricePerToken;
  const feeAmount = totalAmount * 0.03; // 3% fee
  const netAmount = totalAmount - feeAmount;

  const handleTestInvestment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make an investment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create investment transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from("investment_transactions")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          token_amount: tokenAmount,
          token_price: pricePerToken,
          total_amount: totalAmount,
          fees_amount: feeAmount,
          net_amount: netAmount,
          payment_method: "test",
          transaction_type: "purchase",
          status: "completed",
          payment_currency: "USD"
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create investment record
      const { data: investment, error: investmentError } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          token_amount: tokenAmount,
          price_per_token: pricePerToken,
          total_amount: totalAmount,
          fee_amount: feeAmount,
          net_amount: netAmount,
          payment_method: "test",
          status: "confirmed",
          payment_currency: "USD",
          investment_transaction_id: transaction.id
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Update token supply (simple approach without RPC)
      const { data: currentSupply, error: fetchError } = await supabase
        .from("token_supply")
        .select("available_supply, reserved_supply")
        .eq("property_id", propertyId)
        .single();

      if (!fetchError && currentSupply) {
        const { error: supplyError } = await supabase
          .from("token_supply")
          .update({
            available_supply: currentSupply.available_supply - tokenAmount,
            reserved_supply: currentSupply.reserved_supply + tokenAmount,
            updated_at: new Date().toISOString()
          })
          .eq("property_id", propertyId);

        if (supplyError) {
          console.warn("Token supply update failed:", supplyError);
        }
      }

      // Update user profile (simple upsert)
      const { data: currentProfile } = await supabase
        .from("user_profiles")
        .select("total_invested, properties_owned")
        .eq("id", user.id)
        .single();

      const newTotalInvested = (currentProfile?.total_invested || 0) + totalAmount;
      const newPropertiesOwned = (currentProfile?.properties_owned || 0) + 1;

      await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          email: user.email,
          total_invested: newTotalInvested,
          properties_owned: newPropertiesOwned,
          updated_at: new Date().toISOString()
        });

      toast({
        title: "Investment Successful! 🎉",
        description: `You've successfully invested $${totalAmount.toLocaleString()} in ${propertyTitle}`,
      });

      setInvestmentComplete(true);
      onInvestmentComplete();
      
    } catch (error: any) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (investmentComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Investment Complete!</CardTitle>
          <CardDescription>
            Your investment in {propertyTitle} has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Tokens Purchased:</span>
              <span className="font-semibold">{tokenAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Investment:</span>
              <span className="font-semibold">${totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee (3%):</span>
              <span>${feeAmount.toLocaleString()}</span>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            className="w-full"
          >
            View Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Test Investment
        </CardTitle>
        <CardDescription>
          Make a test investment in {propertyTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <Alert>
            <AlertDescription>
              Please sign in to make an investment.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="tokenAmount">Number of Tokens</Label>
          <Input
            id="tokenAmount"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(Number(e.target.value))}
            min="1"
            max="10000"
          />
          <p className="text-sm text-muted-foreground">
            ${pricePerToken} per token
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Tokens:</span>
            <span>{tokenAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Price per Token:</span>
            <span>${pricePerToken}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform Fee (3%):</span>
            <span>${feeAmount.toLocaleString()}</span>
          </div>
          <hr />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <Button 
          onClick={handleTestInvestment}
          disabled={!user || isLoading || tokenAmount <= 0}
          className="w-full"
        >
          {isLoading ? (
            "Processing Investment..."
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Invest ${totalAmount.toLocaleString()}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This is a test investment flow for demonstration purposes.
        </p>
      </CardContent>
    </Card>
  );
}