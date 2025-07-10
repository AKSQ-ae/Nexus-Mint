import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, Building, Wallet } from 'lucide-react';

interface Investment {
  id: string;
  total_amount: number;
  token_amount: number;
  status: string;
  created_at: string;
  properties: {
    title: string;
    price_per_token: number;
  };
}

interface DashboardStats {
  totalInvested: number;
  totalTokens: number;
  portfolioValue: number;
  estimatedYield: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvested: 0,
    totalTokens: 0,
    portfolioValue: 0,
    estimatedYield: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          properties!inner(
            title,
            price_per_token
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setInvestments(data || []);

      // Calculate stats
      const totalInvested = data?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const totalTokens = data?.reduce((sum, inv) => sum + inv.token_amount, 0) || 0;
      const portfolioValue = data?.reduce((sum, inv) => sum + (inv.token_amount * (inv.properties.price_per_token || 100)), 0) || 0;
      const estimatedYield = data?.reduce((sum, inv) => sum + (inv.total_amount * 0.10), 0) || 0;

      setStats({
        totalInvested,
        totalTokens,
        portfolioValue,
        estimatedYield,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {user?.user_metadata?.name || user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.portfolioValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Annual Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.estimatedYield.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investments</CardTitle>
          <CardDescription>
            Your latest investment activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No investments yet</p>
              <button
                onClick={() => navigate('/properties')}
                className="text-primary hover:underline"
              >
                Browse Properties
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                <div>
                  <h4 className="font-semibold">{investment.properties.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {investment.token_amount.toLocaleString()} tokens • ${investment.total_amount.toLocaleString()}
                  </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(investment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(investment.status)}>
                    {investment.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}