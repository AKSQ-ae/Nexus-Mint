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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Global Property Exchange</h2>
            <p className="text-muted-foreground">24/7 trading beyond PRYPCO's limitations</p>
          </div>
        </div>
        <Badge variant="default" className="bg-green-500 text-white">
          <Zap className="h-3 w-3 mr-1" />
          Live Trading
        </Badge>
      </div>

      {/* Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tradingStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex items-center text-sm ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change.startsWith('+') ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="orderbook" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orderbook">Order Book</TabsTrigger>
          <TabsTrigger value="performers">Top Performers</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="advantages">Advantages</TabsTrigger>
        </TabsList>

        <TabsContent value="orderbook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Live Order Book
              </CardTitle>
              <CardDescription>Real-time trading activity across global markets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>Property</div>
                  <div>Type</div>
                  <div>Tokens</div>
                  <div>Price</div>
                  <div>Total</div>
                  <div>Trader</div>
                  <div>Time</div>
                </div>
                {liveOrders.map((order, index) => (
                  <div key={index} className="grid grid-cols-7 gap-4 text-sm items-center">
                    <div className="font-medium">{order.property}</div>
                    <div>
                      <Badge variant={order.type === 'BUY' ? 'default' : 'secondary'}>
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
              <div className="mt-4 pt-4 border-t">
                <Button className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Start Trading Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Properties
              </CardTitle>
              <CardDescription>Best performing tokenized properties in the last 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{performer.property}</h4>
                      <p className="text-sm text-muted-foreground">{performer.region}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{performer.price}</div>
                      <div className="text-green-600 text-sm">{performer.change}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="font-medium">{performer.volume}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Tokens</div>
                      <div className="font-medium">{performer.tokens}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Liquidity Pools
              </CardTitle>
              <CardDescription>Earn additional yield by providing liquidity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {liquidityPools.map((pool, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">{pool.property}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">TVL</span>
                          <span className="font-medium">{pool.tvl}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">APY</span>
                          <span className="font-bold text-green-600">{pool.apy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Participants</span>
                          <span className="font-medium">{pool.participants}</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3">Join Pool</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advantages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Our Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span>Global 24/7 trading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>Liquidity pools with yield</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-green-500" />
                    <span>Advanced order types</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>Global investor base</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">PRYPCO Limitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Business hours only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <span>UAE market only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span>Limited liquidity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    <span>No yield optimization</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}