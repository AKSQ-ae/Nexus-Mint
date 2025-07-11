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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI-Powered Analytics</h2>
          <p className="text-muted-foreground">Advanced market insights beyond PRYPCO's basic metrics</p>
        </div>
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="global">Global Markets</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiPredictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{prediction.metric}</CardTitle>
                    <Badge variant="secondary">
                      <Target className="h-3 w-3 mr-1" />
                      {prediction.accuracy}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current</span>
                      <span className="font-medium">{prediction.current}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Predicted</span>
                      <span className="font-bold text-primary">{prediction.predicted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">{prediction.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Regional Growth Predictions
              </CardTitle>
              <CardDescription>AI-powered 12-month market forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{insight.region}</h4>
                        <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                          {insight.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {insight.prediction}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Confidence</div>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.confidence} className="w-16" />
                        <span className="text-sm text-muted-foreground">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Property Markets
              </CardTitle>
              <CardDescription>Multi-region portfolio performance vs PRYPCO's UAE-only focus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalMetrics.map((metric, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{metric.region}</h4>
                        <Badge variant="outline">{metric.properties} properties</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Growth</span>
                          <span className="text-green-600 font-medium">{metric.growth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Yield</span>
                          <span className="font-medium">{metric.yield}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Undervalued Properties</span>
                    <Badge variant="default">47 available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High Growth Potential</span>
                    <Badge variant="default">23 markets</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pre-Launch Access</span>
                    <Badge variant="secondary">6 exclusive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Competitive Edge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Global Diversification</span>
                    <Badge variant="default">5x PRYPCO</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lower Min Investment</span>
                    <Badge variant="default">20x less</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI-Powered Insights</span>
                    <Badge variant="secondary">Exclusive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Platform Performance vs PRYPCO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">94.3%</div>
                  <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                  <div className="text-xs text-green-600">vs 78% industry avg</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Global Trading</div>
                  <div className="text-xs text-blue-600">vs business hours only</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$100</div>
                  <div className="text-sm text-muted-foreground">Minimum Investment</div>
                  <div className="text-xs text-purple-600">vs AED 2,000</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}