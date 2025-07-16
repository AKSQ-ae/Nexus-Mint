import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  DollarSign,
  Bell,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartAlert {
  id: string;
  type: 'opportunity' | 'performance' | 'rebalance' | 'market' | 'achievement';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  priority: 'low' | 'medium' | 'high';
  data?: any;
  dismissed?: boolean;
}

interface PortfolioPerformance {
  user_id: string;
  total_investments: number;
  total_invested: number;
  current_value: number;
  total_tokens: number;
  avg_roi: number;
  portfolio_growth_percentage: number;
  property_type_diversity: number;
  geographic_diversity: number;
  roi_volatility: number;
}

export function SmartAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioPerformance | null>(null);

  useEffect(() => {
    if (user) {
      generateSmartAlerts();
    }
  }, [user]);

  const generateSmartAlerts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch portfolio performance data
      const { data: portfolio } = await supabase
        .from('user_portfolio_performance')
        .select('*')
        .single();

      setPortfolioData(portfolio);

      // Fetch top investment opportunities
      const { data: opportunities } = await supabase
        .from('public_investment_opportunities')
        .select('*')
        .limit(5);

      // Fetch user's recent investments for performance analysis
      const { data: investments } = await supabase
        .from('investments')
        .select(`
          *,
          properties (
            title,
            city,
            property_type,
            price_per_token
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const generatedAlerts: SmartAlert[] = [];

      // Performance-based alerts
      if (portfolio) {
        // High performance celebration
        if (portfolio.portfolio_growth_percentage > 15) {
          generatedAlerts.push({
            id: 'perf-high',
            type: 'achievement',
            title: '🎉 Excellent Performance!',
            message: `Your portfolio is up ${portfolio.portfolio_growth_percentage.toFixed(1)}% - significantly outperforming the market average of 8.5%.`,
            priority: 'medium',
            data: { growth: portfolio.portfolio_growth_percentage }
          });
        }

        // Low diversification warning
        if (portfolio.property_type_diversity < 3 && portfolio.total_investments > 3) {
          generatedAlerts.push({
            id: 'diversify-type',
            type: 'rebalance',
            title: 'Consider Diversification',
            message: `Your portfolio focuses on ${portfolio.property_type_diversity} property type${portfolio.property_type_diversity === 1 ? '' : 's'}. Diversifying could reduce risk.`,
            action: {
              label: 'Browse Different Types',
              url: '/properties?filter=type'
            },
            priority: 'medium',
            data: { diversity: portfolio.property_type_diversity }
          });
        }

        // Geographic concentration alert
        if (portfolio.geographic_diversity < 2 && portfolio.total_investments > 2) {
          generatedAlerts.push({
            id: 'diversify-geo',
            type: 'rebalance',
            title: 'Geographic Concentration',
            message: `All your investments are in ${portfolio.geographic_diversity} location${portfolio.geographic_diversity === 1 ? '' : 's'}. Consider global diversification.`,
            action: {
              label: 'Explore Global Properties',
              url: '/properties?filter=location'
            },
            priority: 'low',
            data: { geo_diversity: portfolio.geographic_diversity }
          });
        }

        // High volatility warning
        if (portfolio.roi_volatility > 5) {
          generatedAlerts.push({
            id: 'volatility-high',
            type: 'performance',
            title: 'Portfolio Volatility Alert',
            message: `Your investments show high volatility (${portfolio.roi_volatility.toFixed(1)}%). Consider adding stable properties.`,
            action: {
              label: 'Find Stable Investments',
              url: '/properties?sort=stability'
            },
            priority: 'medium',
            data: { volatility: portfolio.roi_volatility }
          });
        }
      }

      // Opportunity-based alerts
      if (opportunities && opportunities.length > 0) {
        const topOpportunity = opportunities[0];
        if (topOpportunity.opportunity_score > 80) {
          generatedAlerts.push({
            id: `opp-${topOpportunity.property_id}`,
            type: 'opportunity',
            title: '🔥 High-Scoring Opportunity',
            message: `${topOpportunity.title} in ${topOpportunity.city} scored ${topOpportunity.opportunity_score}/100 with ${topOpportunity.avg_investor_roi.toFixed(1)}% average ROI.`,
            action: {
              label: 'View Property',
              url: `/properties/${topOpportunity.property_id}`
            },
            priority: 'high',
            data: topOpportunity
          });
        }

        // New to platform opportunities
        const newOpportunities = opportunities.filter(opp => 
          opp.recommendation_reasons.includes('New to Platform')
        );
        if (newOpportunities.length > 0) {
          generatedAlerts.push({
            id: 'new-listings',
            type: 'opportunity',
            title: 'Fresh Investment Opportunities',
            message: `${newOpportunities.length} new properties just launched. Early investors often get the best returns.`,
            action: {
              label: 'View New Listings',
              url: '/properties?filter=new'
            },
            priority: 'medium',
            data: { count: newOpportunities.length }
          });
        }
      }

      // Investment milestone alerts
      if (investments && investments.length > 0) {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.total_amount, 0);
        
        if (totalInvested >= 50000 && totalInvested < 51000) {
          generatedAlerts.push({
            id: 'milestone-50k',
            type: 'achievement',
            title: '🏆 Investment Milestone!',
            message: `Congratulations! You've invested over $50,000 and are now eligible for premium investor benefits.`,
            action: {
              label: 'View Benefits',
              url: '/profile?tab=benefits'
            },
            priority: 'high',
            data: { amount: totalInvested }
          });
        }

        // Market outperformance alert
        const avgROI = investments.reduce((sum, inv) => sum + (inv.roi_percentage || 0), 0) / investments.length;
        if (avgROI > 12) {
          generatedAlerts.push({
            id: 'outperform',
            type: 'achievement',
            title: '📈 Outperforming the Market',
            message: `Your average ROI of ${avgROI.toFixed(1)}% beats the market benchmark of 8.5%. Great job!`,
            priority: 'medium',
            data: { roi: avgROI }
          });
        }
      }

      // Market trend alerts (simulated based on current data)
      const marketTrends = [
        {
          id: 'market-dubai',
          type: 'market' as const,
          title: 'Dubai Market Surge',
          message: 'Dubai properties are showing 15% above-average growth this quarter. Consider increasing allocation.',
          action: {
            label: 'Browse Dubai Properties',
            url: '/properties?city=Dubai'
          },
          priority: 'medium' as const
        },
        {
          id: 'market-commercial',
          type: 'market' as const,
          title: 'Commercial Real Estate Trend',
          message: 'Commercial properties are trending up 22% this month. Strong fundamentals suggest continued growth.',
          action: {
            label: 'View Commercial Properties',
            url: '/properties?type=commercial'
          },
          priority: 'low' as const
        }
      ];

      // Add market alerts randomly (simulate real market data)
      if (Math.random() > 0.5) {
        generatedAlerts.push(marketTrends[Math.floor(Math.random() * marketTrends.length)]);
      }

      setAlerts(generatedAlerts);

    } catch (error) {
      console.error('Error generating smart alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert dismissed",
      description: "This alert has been removed from your dashboard.",
    });
  };

  const handleAlertAction = (alert: SmartAlert) => {
    if (alert.action) {
      navigate(alert.action.url);
    }
  };

  const getAlertIcon = (type: string, priority: string) => {
    switch (type) {
      case 'opportunity':
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'rebalance':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'market':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case 'achievement':
        return <Lightbulb className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No alerts at the moment. Your portfolio looks good!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-all hover:shadow-sm ${getPriorityColor(alert.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getAlertIcon(alert.type, alert.priority)}
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                
                {alert.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAlertAction(alert)}
                    className="h-8"
                  >
                    {alert.action.label}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissAlert(alert.id)}
                className="h-8 w-8 p-0 hover:bg-background/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSmartAlerts}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Refresh Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}