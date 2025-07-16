import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Brain, 
  Target,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdvancedPropertyAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');

  const marketInsights = [
    {
      region: "Dubai Marina",
      prediction: "+15.2%",
      confidence: 94,
      trend: "up",
      reason: "New metro line + luxury developments",
      timeframe: "12 months",
      priority: "high"
    },
    {
      region: "London Canary Wharf",
      prediction: "+8.7%",
      confidence: 87,
      trend: "up", 
      reason: "Post-Brexit recovery + fintech growth",
      timeframe: "18 months",
      priority: "medium"
    },
    {
      region: "Singapore CBD",
      prediction: "+12.1%",
      confidence: 91,
      trend: "up",
      reason: "Crypto hub status + limited supply",
      timeframe: "24 months",
      priority: "high"
    }
  ];

  const aiPredictions = [
    {
      metric: "Portfolio Value",
      current: "$127,450",
      predicted: "$156,890",
      change: "+23.1%",
      accuracy: "96.3%",
      trend: "up"
    },
    {
      metric: "Monthly Returns",
      current: "$1,245",
      predicted: "$1,890", 
      change: "+51.8%",
      accuracy: "89.7%",
      trend: "up"
    },
    {
      metric: "Risk Score",
      current: "Medium",
      predicted: "Low-Medium",
      change: "-15%",
      accuracy: "94.1%",
      trend: "down"
    }
  ];

  const globalMetrics = [
    { region: "UAE", properties: 89, growth: "+34%", yield: "8.2%", marketCap: "$12.4M", status: "active" },
    { region: "UK", properties: 156, growth: "+12%", yield: "6.8%", marketCap: "$28.7M", status: "active" },
    { region: "Singapore", properties: 67, growth: "+28%", yield: "7.9%", marketCap: "$18.3M", status: "active" },
    { region: "USA", properties: 234, growth: "+19%", yield: "7.1%", marketCap: "$45.6M", status: "active" },
    { region: "Germany", properties: 45, growth: "+8%", yield: "5.9%", marketCap: "$15.2M", status: "coming_soon" }
  ];

  const performanceData = [
    { metric: "Total Volume", value: "$2.4M", change: "+12.3%", period: "24h" },
    { metric: "Active Traders", value: "1,247", change: "+8.7%", period: "24h" },
    { metric: "Avg Trade Size", value: "$1,920", change: "-2.1%", period: "24h" },
    { metric: "Market Velocity", value: "0.85", change: "+15.2%", period: "24h" }
  ];

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'active': return 'default';
      case 'coming_soon': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'coming_soon': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-orange-accent/2">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Header Section with Enhanced Hierarchy */}
        <header className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-orange-accent/20 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-foreground tracking-tight">AI-Powered Analytics</h1>
              <p className="text-xl text-muted-foreground mt-2">Advanced market insights with superior predictive capabilities</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleRefreshData}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="rounded-xl border-primary/20 hover:border-primary/40"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Data
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Data
            </Badge>
          </div>
        </header>

        {/* Enhanced Tab System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList 
            className="grid w-full grid-cols-2 md:grid-cols-4 h-14 bg-background/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-border/50" 
            role="tablist"
            aria-label="Analytics dashboard sections"
          >
            <TabsTrigger 
              value="predictions" 
              className={cn(
                "rounded-xl transition-all duration-300 ease-out font-medium",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-md data-[state=active]:scale-105",
                "hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              aria-controls="predictions-panel"
            >
              <Target className="w-4 h-4 mr-2" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger 
              value="global" 
              className={cn(
                "rounded-xl transition-all duration-300 ease-out font-medium",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-md data-[state=active]:scale-105",
                "hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              aria-controls="global-panel"
            >
              <Globe className="w-4 h-4 mr-2" />
              Global Markets
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className={cn(
                "rounded-xl transition-all duration-300 ease-out font-medium",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-md data-[state=active]:scale-105",
                "hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              aria-controls="insights-panel"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Market Insights
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className={cn(
                "rounded-xl transition-all duration-300 ease-out font-medium",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-md data-[state=active]:scale-105",
                "hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              aria-controls="performance-panel"
            >
              <LineChart className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* AI Predictions Tab */}
          <TabsContent 
            value="predictions" 
            className="space-y-8 p-8 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/30"
            id="predictions-panel"
            role="tabpanel"
            aria-labelledby="predictions-tab"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">AI Market Predictions</h2>
              <p className="text-muted-foreground">Machine learning insights for your investment strategy</p>
            </div>

            {/* Prediction Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiPredictions.map((prediction, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 ease-out",
                    "hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10",
                    "rounded-2xl border-border/30 bg-gradient-to-br from-background to-muted/20",
                    isLoading && "animate-pulse"
                  )}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {prediction.metric}
                      </CardTitle>
                      <Badge className={cn(
                        "text-xs font-medium transition-all duration-200",
                        prediction.trend === 'up' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                      )}>
                        <Target className="h-3 w-3 mr-1" />
                        {prediction.accuracy}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-sm font-medium text-muted-foreground">Current</span>
                        <span className="text-lg font-semibold text-foreground">{prediction.current}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <span className="text-sm font-medium text-muted-foreground">Predicted</span>
                        <span className="text-xl font-bold text-primary">{prediction.predicted}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        {prediction.trend === 'up' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                        <span className={cn(
                          "font-bold text-lg",
                          prediction.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {prediction.change}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">Expected Growth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Regional Predictions Table */}
            <Card className="rounded-2xl border-border/30 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-orange-accent/5 border-b border-border/30">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <Activity className="h-6 w-6 text-primary" />
                  Regional Growth Predictions
                </CardTitle>
                <CardDescription className="text-base">
                  AI-powered 12-month market forecasts with confidence indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-border/30">
                        <TableHead className="font-semibold text-foreground p-6">Region</TableHead>
                        <TableHead className="font-semibold text-foreground">Prediction</TableHead>
                        <TableHead className="font-semibold text-foreground">Confidence</TableHead>
                        <TableHead className="font-semibold text-foreground">Priority</TableHead>
                        <TableHead className="font-semibold text-foreground">Reasoning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketInsights.map((insight, index) => (
                        <TableRow 
                          key={index} 
                          className={cn(
                            "border-border/20 hover:bg-muted/30 transition-colors",
                            index % 2 === 1 && "bg-muted/10"
                          )}
                        >
                          <TableCell className="font-semibold text-foreground p-6">
                            {insight.region}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {insight.prediction}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Progress value={insight.confidence} className="w-20 h-2" />
                              <span className="text-sm font-semibold text-primary">{insight.confidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(insight.priority)} className={getStatusColor(insight.priority)}>
                              {insight.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            {insight.reason}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Markets Tab */}
          <TabsContent 
            value="global" 
            className="space-y-8 p-8 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/30"
            id="global-panel"
            role="tabpanel"
            aria-labelledby="global-tab"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Global Property Markets</h2>
              <p className="text-muted-foreground">Multi-region portfolio performance across international markets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {globalMetrics.map((metric, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "group transition-all duration-300 ease-out rounded-2xl border-border/30",
                    "hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5",
                    "bg-gradient-to-br from-background to-muted/10"
                  )}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {metric.region}
                      </h4>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status === 'active' ? 'Live' : 'Coming Soon'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Properties</span>
                        <p className="text-lg font-bold text-foreground">{metric.properties}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Market Cap</span>
                        <p className="text-lg font-bold text-foreground">{metric.marketCap}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">12M Growth</span>
                        <p className="text-lg font-bold text-green-600">{metric.growth}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Yield</span>
                        <p className="text-lg font-bold text-foreground">{metric.yield}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent 
            value="insights" 
            className="space-y-8 p-8 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/30"
            id="insights-panel"
            role="tabpanel"
            aria-labelledby="insights-tab"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Market Intelligence</h2>
              <p className="text-muted-foreground">Competitive advantages and market opportunities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-2xl border-border/30 bg-gradient-to-br from-green-50/50 to-background">
                <CardHeader className="border-b border-green-200/30">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-green-800">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Market Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                      <span className="font-medium text-green-900">Undervalued Properties</span>
                      <Badge className="bg-green-600 text-white">47 available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="font-medium text-blue-900">High Growth Markets</span>
                      <Badge className="bg-blue-600 text-white">23 regions</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-200">
                      <span className="font-medium text-orange-900">Pre-Launch Access</span>
                      <Badge className="bg-orange-600 text-white">6 exclusive</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/30 bg-gradient-to-br from-purple-50/50 to-background">
                <CardHeader className="border-b border-purple-200/30">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-purple-800">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Competitive Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-200">
                      <span className="font-medium text-purple-900">Global Diversification</span>
                      <Badge className="bg-purple-600 text-white">5 Countries</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="font-medium text-blue-900">Lower Min Investment</span>
                      <Badge className="bg-blue-600 text-white">AED 500</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                      <span className="font-medium text-green-900">AI-Powered Insights</span>
                      <Badge className="bg-green-600 text-white">Exclusive</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent 
            value="performance" 
            className="space-y-8 p-8 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/30"
            id="performance-panel"
            role="tabpanel"
            aria-labelledby="performance-tab"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Platform Performance</h2>
              <p className="text-muted-foreground">Real-time metrics and system reliability indicators</p>
            </div>

            {/* Live Trading Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceData.map((item, index) => (
                <Card 
                  key={index}
                  className={cn(
                    "text-center p-6 rounded-2xl border-border/30 transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-lg",
                    "bg-gradient-to-br from-background to-muted/10"
                  )}
                >
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-primary">{item.value}</div>
                    <div className="font-medium text-foreground">{item.metric}</div>
                    <div className="flex items-center justify-center gap-2">
                      {item.change.startsWith('+') ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={cn(
                        "text-sm font-semibold",
                        item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      )}>
                        {item.change}
                      </span>
                      <span className="text-xs text-muted-foreground">({item.period})</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-8 rounded-2xl border-border/30 bg-gradient-to-br from-green-50 to-green-100/30">
                <div className="text-4xl font-bold text-green-600 mb-3">94.3%</div>
                <div className="text-lg font-semibold text-green-800 mb-2">Prediction Accuracy</div>
                <div className="text-sm text-green-600 font-medium uppercase tracking-wide">Industry Leading</div>
              </Card>
              
              <Card className="text-center p-8 rounded-2xl border-border/30 bg-gradient-to-br from-blue-50 to-blue-100/30">
                <div className="text-4xl font-bold text-blue-600 mb-3">24/7</div>
                <div className="text-lg font-semibold text-blue-800 mb-2">Global Trading</div>
                <div className="text-sm text-blue-600 font-medium uppercase tracking-wide">Never Closes</div>
              </Card>
              
              <Card className="text-center p-8 rounded-2xl border-border/30 bg-gradient-to-br from-purple-50 to-purple-100/30">
                <div className="text-4xl font-bold text-purple-600 mb-3">AED 500</div>
                <div className="text-lg font-semibold text-purple-800 mb-2">Minimum Investment</div>
                <div className="text-sm text-purple-600 font-medium uppercase tracking-wide">Low Barrier</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}