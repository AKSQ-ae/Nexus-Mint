import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building, 
  Users, 
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface PropertyInsight {
  property_id: string;
  title: string;
  city: string;
  country: string;
  property_type: string;
  price: number;
  price_per_token: number;
  total_investors: number;
  total_invested: number;
  tokens_issued: number;
  available_tokens: number;
  avg_investor_roi: number;
  popularity_rank: number;
  investment_volume_rank: number;
  funding_percentage: number;
  days_on_platform: number;
  estimated_current_price: number;
}

interface InvestmentOpportunity {
  property_id: string;
  title: string;
  city: string;
  property_type: string;
  price_per_token: number;
  opportunity_score: number;
  risk_level: string;
  funding_percentage: number;
  total_investors: number;
  avg_investor_roi: number;
  popularity_rank: number;
  recommendation_reasons: string[];
}

interface DrillDownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  investmentId?: string;
  type: 'property' | 'investment' | 'market' | null;
}

export function DrillDownPanel({ isOpen, onClose, propertyId, investmentId, type }: DrillDownPanelProps) {
  const navigate = useNavigate();
  const [propertyInsight, setPropertyInsight] = useState<PropertyInsight | null>(null);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketComparables, setMarketComparables] = useState<PropertyInsight[]>([]);

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchPropertyDetails();
    } else if (isOpen && type === 'market') {
      fetchMarketOpportunities();
    }
  }, [isOpen, propertyId, type]);

  const fetchPropertyDetails = async () => {
    if (!propertyId) return;
    
    setLoading(true);
    try {
      // Fetch property insights
      const { data: insight, error } = await supabase
        .from('public_property_insights')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error) throw error;
      setPropertyInsight(insight);

      // Fetch market comparables
      const { data: comparables } = await supabase
        .from('public_property_insights')
        .select('*')
        .eq('city', insight.city)
        .eq('property_type', insight.property_type)
        .neq('property_id', propertyId)
        .order('total_invested', { ascending: false })
        .limit(5);

      setMarketComparables(comparables || []);

    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_investment_opportunities')
        .select('*')
        .limit(10);

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'LOW-MEDIUM': return 'bg-green-400';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'MEDIUM-HIGH': return 'bg-orange-500';
      case 'HIGH': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOpportunityIcon = (score: number) => {
    if (score >= 70) return <Star className="h-4 w-4 text-yellow-500" />;
    if (score >= 50) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <Building className="h-4 w-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <Sheet open={isOpen} onOpenChange={() => onClose()}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => onClose()}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {type === 'property' ? 'Property Deep Dive' : 
             type === 'market' ? 'Market Opportunities' : 'Investment Analysis'}
          </SheetTitle>
          <SheetDescription>
            {type === 'property' ? 'Detailed analysis and market positioning' :
             type === 'market' ? 'AI-powered investment recommendations' : 'Performance metrics and insights'}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {propertyInsight && type === 'property' && (
              <>
                {/* Property Header */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {propertyInsight.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {propertyInsight.city}, {propertyInsight.country}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{propertyInsight.property_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Token Price</p>
                        <p className="text-2xl font-bold">${propertyInsight.price_per_token}</p>
                        <p className="text-xs text-green-600">
                          +{((propertyInsight.estimated_current_price - propertyInsight.price_per_token) / propertyInsight.price_per_token * 100).toFixed(1)}% estimated
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Funding Progress</p>
                        <Progress value={propertyInsight.funding_percentage} className="h-2 mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {propertyInsight.funding_percentage.toFixed(1)}% funded
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Investors</p>
                        <p className="text-xl font-semibold">{propertyInsight.total_investors}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Invested</p>
                        <p className="text-xl font-semibold">${propertyInsight.total_invested.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Avg ROI</p>
                        <p className="text-xl font-semibold text-green-600">{propertyInsight.avg_investor_roi.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Position */}
                <Card>
                  <CardHeader>
                    <CardTitle>Market Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Popularity Rank</p>
                        <p className="text-lg font-semibold">#{propertyInsight.popularity_rank}</p>
                        <p className="text-xs text-muted-foreground">in {propertyInsight.property_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Volume Rank</p>
                        <p className="text-lg font-semibold">#{propertyInsight.investment_volume_rank}</p>
                        <p className="text-xs text-muted-foreground">in {propertyInsight.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate(`/properties/${propertyId}`)}
                    className="flex-1"
                  >
                    View Property
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/investment?property=${propertyId}`)}
                    className="flex-1"
                  >
                    Invest Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {type === 'market' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Top Investment Opportunities</h3>
                {opportunities.slice(0, 5).map((opportunity) => (
                  <Card key={opportunity.property_id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{opportunity.title}</h4>
                          <p className="text-sm text-muted-foreground">{opportunity.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getOpportunityIcon(opportunity.opportunity_score)}
                          <span className="text-sm font-medium">{opportunity.opportunity_score}/100</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">${opportunity.price_per_token}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-medium text-green-600">{opportunity.avg_investor_roi.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getRiskColor(opportunity.risk_level)}`} />
                            <span className="text-xs">{opportunity.risk_level}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {opportunity.recommendation_reasons.slice(0, 2).map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {propertyInsight && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Days on Platform</p>
                          <p className="text-xl font-bold">{propertyInsight.days_on_platform}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Available Tokens</p>
                          <p className="text-xl font-bold">{propertyInsight.available_tokens.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {marketComparables.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Comparables</CardTitle>
                      <CardDescription>Similar properties in {propertyInsight.city}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {marketComparables.map((comp) => (
                          <div key={comp.property_id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{comp.title}</p>
                              <p className="text-sm text-muted-foreground">{comp.total_investors} investors</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${comp.price_per_token}</p>
                              <p className="text-sm text-green-600">{comp.avg_investor_roi.toFixed(1)}% ROI</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {propertyInsight && type === 'property' && (
                  <>
                    {propertyInsight.funding_percentage < 50 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Early Investment Opportunity</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          This property is only {propertyInsight.funding_percentage.toFixed(1)}% funded, offering early investor advantages.
                        </p>
                      </div>
                    )}

                    {propertyInsight.avg_investor_roi > 10 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">High Performance</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Average investor ROI of {propertyInsight.avg_investor_roi.toFixed(1)}% is significantly above market average.
                        </p>
                      </div>
                    )}

                    {propertyInsight.total_investors < 10 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Low Competition</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          With only {propertyInsight.total_investors} investors, there's limited competition for tokens.
                        </p>
                      </div>
                    )}

                    {propertyInsight.popularity_rank <= 3 && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-800">Trending Property</span>
                        </div>
                        <p className="text-sm text-purple-700">
                          Ranked #{propertyInsight.popularity_rank} in {propertyInsight.property_type} category.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {type === 'market' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Market Recommendation</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Based on current market data, properties in Dubai and commercial real estate show strong growth potential.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Diversification Tip</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Consider diversifying across different property types and geographical locations to optimize risk-adjusted returns.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}