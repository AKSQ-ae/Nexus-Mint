import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Building, 
  Wallet,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Investment {
  id: string;
  total_amount: number;
  token_amount: number;
  status: string;
  created_at: string;
  current_value?: number;
  roi_percentage?: number;
  properties: {
    id: string;
    title: string;
    price_per_token: number;
    city: string;
    country: string;
    property_type: string;
  };
}

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalTokens: number;
  totalGains: number;
  totalGainsPercentage: number;
  estimatedAnnualReturn: number;
  portfolioGrowth: number;
  activeInvestments: number;
}

interface PerformanceData {
  month: string;
  value: number;
  invested: number;
  returns: number;
}

interface PropertyAllocation {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const PROPERTY_TYPE_COLORS = {
  RESIDENTIAL: '#3b82f6',
  COMMERCIAL: '#10b981',
  INDUSTRIAL: '#f59e0b',
  MIXED_USE: '#8b5cf6',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    currentValue: 0,
    totalTokens: 0,
    totalGains: 0,
    totalGainsPercentage: 0,
    estimatedAnnualReturn: 0,
    portfolioGrowth: 0,
    activeInvestments: 0,
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [propertyAllocation, setPropertyAllocation] = useState<PropertyAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: investmentData, error } = await supabase
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

      // Enhance investment data with mock current values and ROI
      const enhancedInvestments = (investmentData || []).map((investment, index) => {
        const daysOld = Math.floor((Date.now() - new Date(investment.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const growthRate = 0.10 + (Math.random() * 0.05); // 10-15% annual growth
        const dailyGrowth = growthRate / 365;
        const currentValue = investment.total_amount * (1 + (dailyGrowth * daysOld));
        const roiPercentage = ((currentValue - investment.total_amount) / investment.total_amount) * 100;

        return {
          ...investment,
          current_value: currentValue,
          roi_percentage: roiPercentage,
        };
      });

      setInvestments(enhancedInvestments);

      // Calculate portfolio stats
      const totalInvested = enhancedInvestments.reduce((sum, inv) => sum + inv.total_amount, 0);
      const currentValue = enhancedInvestments.reduce((sum, inv) => sum + (inv.current_value || inv.total_amount), 0);
      const totalTokens = enhancedInvestments.reduce((sum, inv) => sum + inv.token_amount, 0);
      const totalGains = currentValue - totalInvested;
      const totalGainsPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;
      const estimatedAnnualReturn = totalInvested * 0.12; // 12% annual return
      const portfolioGrowth = Math.random() * 4 + 2; // 2-6% monthly growth
      const activeInvestments = enhancedInvestments.filter(inv => inv.status !== 'CANCELLED').length;

      setStats({
        totalInvested,
        currentValue,
        totalTokens,
        totalGains,
        totalGainsPercentage,
        estimatedAnnualReturn,
        portfolioGrowth,
        activeInvestments,
      });

      // Generate performance chart data (last 6 months)
      const performanceChartData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const baseValue = totalInvested * (0.8 + (i * 0.05)); // Growing trend
        const randomVariation = (Math.random() - 0.5) * 0.1 * baseValue;
        const value = baseValue + randomVariation;
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          value: Math.round(value),
          invested: Math.round(totalInvested * (0.6 + (i * 0.08))),
          returns: Math.round(value - (totalInvested * (0.6 + (i * 0.08)))),
        };
      });
      setPerformanceData(performanceChartData);

      // Calculate property allocation
      const allocationMap = enhancedInvestments.reduce((acc, inv) => {
        const type = inv.properties.property_type;
        if (!acc[type]) {
          acc[type] = { value: 0, count: 0 };
        }
        acc[type].value += inv.current_value || inv.total_amount;
        acc[type].count += 1;
        return acc;
      }, {} as Record<string, { value: number; count: number }>);

      const allocationData = Object.entries(allocationMap).map(([type, data]) => ({
        name: type.replace('_', ' '),
        value: data.value,
        percentage: (data.value / currentValue) * 100,
        color: PROPERTY_TYPE_COLORS[type as keyof typeof PROPERTY_TYPE_COLORS] || '#64748b',
      }));

      setPropertyAllocation(allocationData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'TOKENS_ISSUED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'TOKENS_ISSUED':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PWAInstallPrompt />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.currentValue.toLocaleString()}</div>
            <div className="flex items-center text-sm mt-1">
              {stats.totalGainsPercentage >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={stats.totalGainsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.totalGainsPercentage >= 0 ? '+' : ''}{stats.totalGainsPercentage.toFixed(2)}%
              </span>
              <span className="text-muted-foreground ml-1">
                (${stats.totalGains >= 0 ? '+' : ''}{stats.totalGains.toLocaleString()})
              </span>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.activeInvestments} active investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fractional ownership shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Annual Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.estimatedAnnualReturn.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on 12% average yield
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="allocation" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Portfolio Performance (Last 6 Months)
              </CardTitle>
              <CardDescription>
                Track your investment growth and returns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'value' ? 'Portfolio Value' : name === 'invested' ? 'Total Invested' : 'Returns']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Portfolio Value"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="invested" 
                    stroke="#64748b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Total Invested"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="returns" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Returns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Type Allocation</CardTitle>
                <CardDescription>
                  Distribution of your investments by property type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={propertyAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                    >
                      {propertyAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Breakdown</CardTitle>
                <CardDescription>
                  Detailed view of your portfolio distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {propertyAllocation.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      ${item.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Investment History</CardTitle>
                <CardDescription>
                  Your complete investment transaction history
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/portfolio')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your real estate portfolio today
                  </p>
                  <Button onClick={() => navigate('/properties')}>
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.slice(0, 5).map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(investment.status)}
                        <div>
                          <h4 className="font-semibold">{investment.properties.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {investment.properties.city}, {investment.properties.country}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(investment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(investment.status)}>
                            {investment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">
                          {investment.token_amount.toLocaleString()} tokens
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${investment.total_amount.toLocaleString()}
                        </p>
                        {investment.roi_percentage !== undefined && (
                          <p className={`text-xs ${investment.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.roi_percentage >= 0 ? '+' : ''}{investment.roi_percentage.toFixed(2)}% ROI
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your investments and explore new opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => navigate('/properties')}>
              <Building className="h-6 w-6" />
              <span>Browse Properties</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => navigate('/portfolio')}>
              <BarChart3 className="h-6 w-6" />
              <span>View Portfolio</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => navigate('/profile')}>
              <Wallet className="h-6 w-6" />
              <span>Account Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}