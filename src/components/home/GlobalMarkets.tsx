import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  TrendingUp, 
  MapPin,
  Clock,
  Star,
  DollarSign
} from 'lucide-react';

export function GlobalMarkets() {
  const markets = [
    {
      country: "United Arab Emirates",
      city: "Dubai",
      properties: 89,
      avgYield: "8.2%",
      growth: "+34%",
      minInvestment: "$100",
      featured: true,
      timeZone: "GMT+4",
      status: "Live",
      marketCap: "$234M"
    },
    {
      country: "United Kingdom", 
      city: "London",
      properties: 156,
      avgYield: "6.8%",
      growth: "+12%",
      minInvestment: "$100",
      featured: true,
      timeZone: "GMT+0",
      status: "Live",
      marketCap: "$567M"
    },
    {
      country: "Singapore",
      city: "Singapore",
      properties: 67,
      avgYield: "7.9%",
      growth: "+28%",
      minInvestment: "$100",
      featured: true,
      timeZone: "GMT+8",
      status: "Live",
      marketCap: "$189M"
    },
    {
      country: "United States",
      city: "New York",
      properties: 234,
      avgYield: "7.1%",
      growth: "+19%",
      minInvestment: "$100",
      featured: false,
      timeZone: "GMT-5",
      status: "Live",
      marketCap: "$823M"
    },
    {
      country: "Germany",
      city: "Berlin",
      properties: 45,
      avgYield: "5.9%",
      growth: "+8%",
      minInvestment: "$100",
      featured: false,
      timeZone: "GMT+1",
      status: "Live",
      marketCap: "$156M"
    },
    {
      country: "Japan",
      city: "Tokyo",
      properties: 23,
      avgYield: "6.3%",
      growth: "+15%",
      minInvestment: "$100",
      featured: false,
      timeZone: "GMT+9",
      status: "Coming Soon",
      marketCap: "$0M"
    }
  ];

  const competitiveAdvantages = [
    "Global access to premium properties worldwide",
    "Accessible $100 minimum investment threshold", 
    "24/7 trading across time zones",
    "Diversified international portfolio",
    "No geographical restrictions"
  ];

  return (
    <div className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Global Property Markets</h2>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {markets.map((market, index) => (
            <Card key={index} className={`hover:shadow-lg transition-shadow ${market.featured ? 'ring-2 ring-primary/20' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{market.city}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {market.featured && (
                      <Badge variant="default">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant={market.status === 'Live' ? 'default' : 'secondary'}>
                      {market.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{market.country}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Properties</span>
                    <span className="font-medium">{market.properties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Yield</span>
                    <span className="font-bold text-green-600">{market.avgYield}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">12M Growth</span>
                    <span className="font-medium text-primary">{market.growth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Min Investment</span>
                    <span className="font-medium">{market.minInvestment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <span className="font-medium">{market.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Zone</span>
                    <span className="text-sm">{market.timeZone}</span>
                  </div>
                </div>
                {market.status === 'Live' ? (
                  <Link to="/properties" className="w-full mt-4 block">
                    <Button 
                      className="w-full" 
                      variant={market.featured ? 'default' : 'outline'}
                    >
                      Explore Properties
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full mt-4" 
                    disabled
                    variant="outline"
                  >
                    Notify Me
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">614</div>
              <div className="text-sm text-muted-foreground">Total Properties</div>
              <div className="text-xs text-green-600">Growing Portfolio</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">6</div>
              <div className="text-sm text-muted-foreground">Countries</div>
              <div className="text-xs text-green-600">vs 1 UAE only</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">$1.97B</div>
              <div className="text-sm text-muted-foreground">Total Market Cap</div>
              <div className="text-xs text-green-600">Global portfolio</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Trading Hours</div>
              <div className="text-xs text-green-600">vs business hours</div>
            </CardContent>
          </Card>
        </div>

        {/* Competitive Advantages */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Global Investment Platform Advantages
            </CardTitle>
            <CardDescription>
              Access worldwide opportunities with our comprehensive investment platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {competitiveAdvantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{advantage}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-center p-6 bg-white/50 dark:bg-black/20 rounded-lg">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">$100</div>
                  <div className="text-sm text-muted-foreground">Start investing globally</div>
                  <Link to="/properties" className="mt-3 w-full block">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}