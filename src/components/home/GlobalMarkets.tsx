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
    <div className="space-y-16">
      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">614</div>
            <div className="text-sm text-gray-700 font-medium">Total Properties</div>
            <div className="text-xs text-green-600">Growing Portfolio</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">6</div>
            <div className="text-sm text-gray-700 font-medium">Countries</div>
            <div className="text-xs text-green-600">vs 1 UAE only</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">$1.97B</div>
            <div className="text-sm text-gray-700 font-medium">Total Market Cap</div>
            <div className="text-xs text-green-600">Global portfolio</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-gray-700 font-medium">Trading Hours</div>
            <div className="text-xs text-green-600">vs business hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Markets Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        role="grid" 
        aria-label="Global property markets"
      >
        {markets.map((market, index) => (
          <Card 
            key={index} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md hover:border-2 hover:border-primary transition-all duration-300" 
            role="gridcell"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl font-bold">{market.city}</CardTitle>
                </div>
                <div className="flex gap-2">
                  {market.featured && (
                    <Badge className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full">
                      Featured
                    </Badge>
                  )}
                  {market.status === 'Live' && (
                    <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Live
                    </Badge>
                  )}
                  {market.status === 'Coming Soon' && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{market.country}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats in two-column layout */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Properties</span>
                  <span className="font-bold">{market.properties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Avg Yield</span>
                  <span className="font-bold text-green-600">{market.avgYield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">12M Growth</span>
                  <span className="font-bold text-blue-600">{market.growth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Min Investment</span>
                  <span className="font-bold">{market.minInvestment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Market Cap</span>
                  <span className="font-bold">{market.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Time Zone</span>
                  <span className="font-bold">{market.timeZone}</span>
                </div>
              </div>
              
              {/* Action Button */}
              {market.status === 'Live' ? (
                <Link to="/properties" className="w-full block">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    aria-label={`Explore properties in ${market.city}`}
                  >
                    Explore Properties
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled
                  aria-label={`Get notified when ${market.city} launches`}
                >
                  Notify Me
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advantages Highlight Panel */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {/* Left Icon */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          {/* Center Content - 3 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-foreground mb-2">Global Investment Platform Advantages</h3>
            <p className="text-gray-600 mb-6">Access worldwide opportunities with our comprehensive investment platform</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Global 24/7 trading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Diversified portfolio</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Premium properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">No restrictions</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Multiple time zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Global investor base</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Callout */}
          <div className="flex justify-center lg:justify-end">
            <div className="text-center p-6 bg-white rounded-xl border border-primary/20">
              <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">$100</div>
              <div className="text-sm text-gray-600">Start investing globally</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}