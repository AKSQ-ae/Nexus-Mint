import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpDown,
  Zap
} from 'lucide-react';

export function GlobalPropertyExchange() {
  const liveOrders = [
    {
      property: "Marina Heights, Dubai",
      type: "BUY",
      tokens: 50,
      price: "$45.20",
      total: "$2,260",
      user: "Anonymous",
      time: "2m ago"
    },
    {
      property: "Canary Wharf, London", 
      type: "SELL",
      tokens: 25,
      price: "$128.50",
      total: "$3,212",
      user: "investor_uk",
      time: "4m ago"
    },
    {
      property: "Marina Bay, Singapore",
      type: "BUY", 
      tokens: 15,
      price: "$89.75",
      total: "$1,346",
      user: "sg_trader",
      time: "7m ago"
    }
  ];

  const tradingStats = [
    { label: "24h Volume", value: "$2.4M", change: "+15.2%" },
    { label: "Active Traders", value: "1,847", change: "+8.7%" },
    { label: "Properties Listed", value: "591", change: "+12.1%" },
    { label: "Avg Spread", value: "0.3%", change: "-0.1%" }
  ];

  const topPerformers = [
    {
      property: "Downtown Dubai Tower",
      region: "UAE",
      price: "$52.30",
      change: "+23.4%",
      volume: "$145K",
      tokens: "2,847"
    },
    {
      property: "Thames View Apartments",
      region: "UK", 
      price: "$134.20",
      change: "+18.9%",
      volume: "$289K",
      tokens: "2,156"
    },
    {
      property: "Marina Bay Residences",
      region: "Singapore",
      price: "$91.80",
      change: "+16.7%",
      volume: "$198K",
      tokens: "2,159"
    }
  ];

  const liquidityPools = [
    { property: "Dubai Properties Pool", tvl: "$5.2M", apy: "12.8%", participants: 1247 },
    { property: "London Prime Pool", tvl: "$8.9M", apy: "9.4%", participants: 2156 },
    { property: "Singapore Elite Pool", tvl: "$3.1M", apy: "14.2%", participants: 891 }
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Global Property Exchange</h2>
            <p className="text-muted-foreground">24/7 trading with instant settlement</p>
          </div>
        </div>
        <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
          <Zap className="h-3 w-3 mr-1" />
          Live Trading
        </Badge>
      </div>

      {/* Trading Stats - 4 column equal width */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tradingStats.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 rounded-xl relative">
            <CardContent className="p-6 text-center">
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Live Trading
                </Badge>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
              <div className={`text-xs ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Order Book */}
      <Card className="bg-white rounded-xl shadow-sm" role="table" aria-label="Live order book">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <ArrowUpDown className="h-5 w-5" />
            Live Order Book
          </CardTitle>
          <CardDescription>Real-time trading activity across global markets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 text-sm font-bold text-gray-800 border-b pb-2">
              <div>Property</div>
              <div>Type</div>
              <div>Tokens</div>
              <div>Price</div>
              <div>Total</div>
              <div>Trader</div>
              <div>Time</div>
            </div>
            
            {/* Table Rows */}
            {liveOrders.map((order, index) => (
              <div key={index} className={`grid grid-cols-7 gap-4 text-sm items-center py-2 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <div className="font-medium">{order.property}</div>
                <div>
                  <Badge 
                    className={order.type === 'BUY' 
                      ? 'bg-blue-500 text-white text-xs px-2 py-1 rounded-full' 
                      : 'bg-purple-500 text-white text-xs px-2 py-1 rounded-full'
                    }
                  >
                    {order.type}
                  </Badge>
                </div>
                <div>{order.tokens}</div>
                <div className="font-medium">{order.price}</div>
                <div>{order.total}</div>
                <div className="text-muted-foreground">{order.user}</div>
                <div className="text-muted-foreground">{order.time}</div>
              </div>
            ))}
          </div>
          
          {/* Footer Button */}
          <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              aria-label="Start trading now"
            >
              <Clock className="h-4 w-4 mr-2" />
              Start Trading Now
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}