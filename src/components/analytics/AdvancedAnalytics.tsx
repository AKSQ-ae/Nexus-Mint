import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Download,
  Clock,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdvancedAnalyticsProps {
  portfolioValue: number;
  totalInvested: number;
  totalGains: number;
  totalGainsPercentage: number;
  activeInvestments: number;
}

interface Distribution {
  date: string;
  amount: number;
  type: 'rental' | 'appreciation' | 'dividend';
  status: 'pending' | 'completed';
}

interface YieldProjection {
  month: string;
  projected: number;
  actual: number;
  conservative: number;
  optimistic: number;
}

export function AdvancedAnalytics({
  portfolioValue,
  totalInvested,
  totalGains,
  totalGainsPercentage,
  activeInvestments
}: AdvancedAnalyticsProps) {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [yieldProjections, setYieldProjections] = useState<YieldProjection[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextDistributionDate, setNextDistributionDate] = useState<Date | null>(null);

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    // Generate mock distributions for next 6 months
    const mockDistributions: Distribution[] = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      return {
        date: date.toISOString().split('T')[0],
        amount: (portfolioValue * 0.01) + (Math.random() * portfolioValue * 0.005), // 1-1.5% monthly
        type: i % 3 === 0 ? 'rental' : i % 3 === 1 ? 'appreciation' : 'dividend',
        status: i === 0 ? 'pending' : 'completed'
      };
    });
    setDistributions(mockDistributions);

    // Set next distribution date (first day of next month)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    setNextDistributionDate(nextMonth);

    // Generate yield projections
    const projections: YieldProjection[] = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const baseYield = portfolioValue * 0.12 / 12; // 12% annual yield
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        projected: baseYield,
        actual: i < 3 ? baseYield * (0.9 + Math.random() * 0.2) : 0, // Past 3 months actual
        conservative: baseYield * 0.8,
        optimistic: baseYield * 1.3
      };
    });
    setYieldProjections(projections);
  };

  const generateTaxReport = async () => {
    setLoading(true);
    try {
      // Mock CSV generation
      const csvData = [
        ['Date', 'Property', 'Type', 'Amount', 'Status'],
        ...distributions.map(d => [
          d.date,
          'Property Investment',
          d.type,
          d.amount.toFixed(2),
          d.status
        ])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-report-${new Date().getFullYear()}.csv`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast.success('Tax report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const pendingDistributions = distributions.filter(d => d.status === 'pending');
  const totalPendingAmount = pendingDistributions.reduce((sum, d) => sum + d.amount, 0);
  const daysUntilNext = nextDistributionDate ? 
    Math.ceil((nextDistributionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const annualizedYield = (totalGains / totalInvested) * (365 / 90) * 100; // Assume 90 days of data

  return (
    <div className="space-y-6">
      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Live Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${portfolioValue.toLocaleString()}
            </div>
            <div className="flex items-center text-sm">
              {totalGainsPercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={totalGainsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                {totalGainsPercentage >= 0 ? '+' : ''}{totalGainsPercentage.toFixed(2)}%
              </span>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5" />
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysUntilNext} days
            </div>
            <div className="text-sm text-muted-foreground">
              Est. ${totalPendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Annualized Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {annualizedYield.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              vs 12% target
            </div>
            <Progress 
              value={Math.min((annualizedYield / 12) * 100, 100)} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Diversification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeInvestments}
            </div>
            <div className="text-sm text-muted-foreground">
              Active properties
            </div>
            <Badge variant="outline" className="mt-1 text-xs">
              Well diversified
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Yield Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              12-Month Yield Projections
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateTaxReport}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={yieldProjections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`, 
                  name === 'projected' ? 'Projected' : 
                  name === 'actual' ? 'Actual' :
                  name === 'conservative' ? 'Conservative' : 'Optimistic'
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="conservative" 
                stackId="1"
                stroke="#64748b" 
                fill="#64748b" 
                fillOpacity={0.2}
                name="Conservative"
              />
              <Area 
                type="monotone" 
                dataKey="projected" 
                stackId="2"
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Projected"
              />
              <Area 
                type="monotone" 
                dataKey="optimistic" 
                stackId="3"
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                name="Optimistic"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Actual"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distributions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Pending Distributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingDistributions.slice(0, 3).map((distribution, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    distribution.type === 'rental' ? 'bg-blue-500' :
                    distribution.type === 'appreciation' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div>
                    <p className="font-medium capitalize">{distribution.type} Payment</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(distribution.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +${distribution.amount.toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {distribution.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={generateTaxReport}
              disabled={loading}
              className="h-20 flex-col"
            >
              <Download className="h-6 w-6 mb-2" />
              Tax Report (CSV)
            </Button>
            <Button 
              variant="outline" 
              disabled={loading}
              className="h-20 flex-col"
            >
              <PieChart className="h-6 w-6 mb-2" />
              Portfolio Summary
            </Button>
            <Button 
              variant="outline" 
              disabled={loading}
              className="h-20 flex-col"
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Performance Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}