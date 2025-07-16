import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Activity
} from 'lucide-react';

export function AdvancedPropertyAnalytics() {
  const marketInsights = [
    {
      region: "Dubai Marina",
      prediction: "+15.2%",
      confidence: 94,
      trend: "up",
      reason: "New metro line + luxury developments",
      timeframe: "12 months"
    },
    {
      region: "London Canary Wharf",
      prediction: "+8.7%",
      confidence: 87,
      trend: "up", 
      reason: "Post-Brexit recovery + fintech growth",
      timeframe: "18 months"
    },
    {
      region: "Singapore CBD",
      prediction: "+12.1%",
      confidence: 91,
      trend: "up",
      reason: "Crypto hub status + limited supply",
      timeframe: "24 months"
    }
  ];

  const aiPredictions = [
    {
      metric: "Portfolio Value",
      current: "$127,450",
      predicted: "$156,890",
      change: "+23.1%",
      accuracy: "96.3%"
    },
    {
      metric: "Monthly Returns",
      current: "$1,245",
      predicted: "$1,890", 
      change: "+51.8%",
      accuracy: "89.7%"
    },
    {
      metric: "Risk Score",
      current: "Medium",
      predicted: "Low-Medium",
      change: "-15%",
      accuracy: "94.1%"
    }
  ];

  const globalMetrics = [
    { region: "UAE", properties: 89, growth: "+34%", yield: "8.2%" },
    { region: "UK", properties: 156, growth: "+12%", yield: "6.8%" },
    { region: "Singapore", properties: 67, growth: "+28%", yield: "7.9%" },
    { region: "USA", properties: 234, growth: "+19%", yield: "7.1%" },
    { region: "Germany", properties: 45, growth: "+8%", yield: "5.9%" }
  ];

  return (
    <div className="space-y-10">
      {/* Header with improved spacing and hierarchy */}
      <div className="flex items-center gap-4 py-8">
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-primary/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">AI-Powered Analytics</h1>
          <p className="text-lg text-muted-foreground mt-1">Advanced market insights with superior predictive capabilities</p>
        </div>
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList 
          className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1 rounded-xl" 
          role="tablist"
          aria-label="Analytics sections"
        >
          <TabsTrigger 
            value="predictions" 
            className="rounded-lg transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border-2"
            aria-controls="predictions-panel"
          >
            AI Predictions
          </TabsTrigger>
          <TabsTrigger 
            value="global" 
            className="rounded-lg transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border-2"
            aria-controls="global-panel"
          >
            Global Markets
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="rounded-lg transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border-2"
            aria-controls="insights-panel"
          >
            Market Insights
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="rounded-lg transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border-2"
            aria-controls="performance-panel"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent 
          value="predictions" 
          className="space-y-8 mt-8 p-8 rounded-xl bg-background/50"
          id="predictions-panel"
          role="tabpanel"
          aria-labelledby="predictions-tab"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiPredictions.map((prediction, index) => (
              <Card 
                key={index} 
                className="group cursor-default transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 rounded-xl border-border/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {prediction.metric}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200">
                      <Target className="h-3 w-3 mr-1" />
                      {prediction.accuracy}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current</span>
                      <span className="font-medium text-foreground">{prediction.current}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Predicted</span>
                      <span className="text-xl font-bold text-primary">{prediction.predicted}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-semibold">{prediction.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="transition-all duration-200 hover:shadow-md rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Activity className="h-5 w-5 text-primary" />
                Regional Growth Predictions
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                AI-powered 12-month market forecasts with confidence indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketInsights.map((insight, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-6 bg-muted/30 rounded-xl transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">{insight.region}</h4>
                        <Badge 
                          variant={insight.trend === 'up' ? 'default' : 'secondary'}
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          {insight.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {insight.prediction}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.reason}</p>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <div className="text-sm font-medium text-foreground mb-2">Confidence</div>
                      <div className="flex items-center gap-3">
                        <Progress value={insight.confidence} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-primary">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent 
          value="global" 
          className="space-y-8 mt-8 p-8 rounded-xl bg-background/50"
          id="global-panel"
          role="tabpanel"
          aria-labelledby="global-tab"
        >
          <Card className="transition-all duration-200 hover:shadow-md rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Globe className="h-5 w-5 text-primary" />
                Global Property Markets
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Multi-region portfolio performance across global markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalMetrics.map((metric, index) => (
                  <Card 
                    key={index} 
                    className="group transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 rounded-xl border-border/30"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {metric.region}
                        </h4>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {metric.properties} properties
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">12M Growth</span>
                          <span className="text-green-600 font-semibold text-base">{metric.growth}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Yield</span>
                          <span className="font-semibold text-base text-foreground">{metric.yield}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent 
          value="insights" 
          className="space-y-8 mt-8 p-8 rounded-xl bg-background/50"
          id="insights-panel"
          role="tabpanel"
          aria-labelledby="insights-tab"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors">
                    <span className="font-medium text-foreground">Undervalued Properties</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">47 available</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors">
                    <span className="font-medium text-foreground">High Growth Potential</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">23 markets</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-orange-50/50 hover:bg-orange-50 transition-colors">
                    <span className="font-medium text-foreground">Pre-Launch Access</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">6 exclusive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Competitive Advantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-purple-50/50 hover:bg-purple-50 transition-colors">
                    <span className="font-medium text-foreground">Global Diversification</span>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">5 Countries</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors">
                    <span className="font-medium text-foreground">Lower Min Investment</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">AED 500</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors">
                    <span className="font-medium text-foreground">AI-Powered Insights</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Exclusive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent 
          value="performance" 
          className="space-y-8 mt-8 p-8 rounded-xl bg-background/50"
          id="performance-panel"
          role="tabpanel"
          aria-labelledby="performance-tab"
        >
          <Card className="transition-all duration-200 hover:shadow-md rounded-xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <LineChart className="h-5 w-5 text-primary" />
                Platform Performance Metrics
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Real-time performance indicators and system reliability stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                  <div className="text-3xl font-bold text-green-600 mb-2">94.3%</div>
                  <div className="font-medium text-foreground mb-1">Prediction Accuracy</div>
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Industry Leading</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="font-medium text-foreground mb-1">Global Trading</div>
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Never Closes</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                  <div className="text-3xl font-bold text-purple-600 mb-2">AED 500</div>
                  <div className="font-medium text-foreground mb-1">Minimum Investment</div>
                  <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Low Barrier</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}