// TODO: Unify layout primitives (MobileContainer, MobileGrid) for consistent UI/UX across all portfolio sections.
// TODO: Add route guards/context to prevent unauthorized access to this page.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

interface Investment {
  id: string;
  total_amount: number;
  token_amount: number;
  status: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
    price_per_token: number;
    city: string;
    country: string;
    property_type: string;
  };
}

export default function Portfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    fetchInvestments();
  }, [user, navigate]);

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          properties!inner(
            id,
            title,
            price_per_token,
            city,
            country,
            property_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'TOKENS_ISSUED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const calculateTotals = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalTokens = investments.reduce((sum, inv) => sum + inv.token_amount, 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.token_amount * (inv.properties.price_per_token || 100)), 0);
    const estimatedAnnualReturn = investments.reduce((sum, inv) => sum + (inv.total_amount * 0.10), 0);
    
    return {
      totalInvested,
      totalTokens,
      currentValue,
      estimatedAnnualReturn,
      totalReturn: currentValue - totalInvested,
      returnPercentage: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0
    };
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading portfolio...</div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
        <p className="text-lg text-muted-foreground">
          Track your real estate investments and returns
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.currentValue.toLocaleString()}</div>
            <p className={`text-xs ${totals.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.returnPercentage >= 0 ? '+' : ''}{totals.returnPercentage.toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Annual Return</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.estimatedAnnualReturn.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>
            All your property investments and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't made any investments yet</p>
              <Button onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => {
                const currentValue = investment.token_amount * (investment.properties.price_per_token || 100);
                const returnAmount = currentValue - investment.total_amount;
                const returnPercentage = (returnAmount / investment.total_amount) * 100;
                const annualReturn = investment.total_amount * 0.10;

                return (
                  <Card key={investment.id} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-semibold text-lg">{investment.properties.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {investment.properties.city}, {investment.properties.country}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {investment.properties.property_type}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Investment</p>
                        <p className="font-semibold">${investment.total_amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {investment.token_amount.toLocaleString()} tokens @ ${investment.properties.price_per_token || 100}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="font-semibold">${currentValue.toLocaleString()}</p>
                        <p className={`text-xs ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returnPercentage >= 0 ? '+' : ''}${returnAmount.toLocaleString()} ({returnPercentage.toFixed(1)}%)
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Annual Yield</p>
                        <p className="font-semibold text-green-600">
                          ${annualReturn.toLocaleString()} (10%)
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(investment.status)}>
                            {investment.status.replace('_', ' ')}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/properties/${investment.properties.id}`)}
                          >
                            View Property
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}