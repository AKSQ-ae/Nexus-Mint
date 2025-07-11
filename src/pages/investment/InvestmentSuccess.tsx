import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, ArrowRight, Home } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function InvestmentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [investmentData, setInvestmentData] = useState<{
    propertyId: string;
    tokenAmount: number;
    investmentAmount: number;
    platformFee: number;
    totalAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && user) {
      verifyPayment();
    } else if (!sessionId) {
      setError('Missing payment session information');
      setLoading(false);
    }
  }, [sessionId, user]);

  const verifyPayment = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to view your investment');
        return;
      }

      // Verify payment with our edge function
      const { data, error } = await supabase.functions.invoke('verify-investment-payment', {
        body: { sessionId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.investment) {
        setInvestmentData(data.investment);
        toast.success('Investment confirmed successfully!');
      } else {
        setError(data?.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setError('Failed to verify payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/properties">Browse Properties</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/portfolio">View Portfolio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!investmentData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground">No investment data found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Investment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Your payment has been processed and your investment is confirmed
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Investment Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-green-800">Investment Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-green-700">Tokens Purchased:</span>
                <p className="font-semibold text-green-900">{investmentData.tokenAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-700">Investment Amount:</span>
                <p className="font-semibold text-green-900">${investmentData.investmentAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-700">Platform Fee:</span>
                <p className="font-semibold text-green-900">${investmentData.platformFee.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-700">Total Paid:</span>
                <p className="font-semibold text-green-900">${investmentData.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Badge variant="secondary" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Track Your Investment</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor your investment performance and returns in your portfolio
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Badge variant="secondary" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Receive Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about property updates, rental income, and value changes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Badge variant="secondary" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Earn Returns</p>
                  <p className="text-sm text-muted-foreground">
                    Start earning from rental income and property appreciation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button asChild className="w-full">
              <Link to="/portfolio" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                View Portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Have questions? <Link to="/support" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}