import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, TrendingUp, Timer, Users, Calculator } from 'lucide-react';
import { getFeaturedProperties } from '@/lib/services/property-service';
import { currencyService } from '@/lib/services/currency-service';

interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  property_type: string;
  price_per_token: number;
  total_tokens: number;
  images: any;
}

// Enhanced Dubai properties data to compete with PRYPCO
const premiumProperties = [
  {
    id: '1',
    title: 'Business Bay Tower - Two Bedroom',
    location: 'Business Bay, Dubai',
    type: 'Apartment',
    totalValue: 2650000, // AED
    usdValue: 720000,
    minInvestment: 100, // USD
    projectedROI: 12.5,
    grossYield: 8.2,
    fundedPercentage: 87,
    investorCount: 324,
    timeLeft: '2 days',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    status: 'Active',
    features: ['Burj Khalifa Views', 'Pool & Gym', 'Metro Access']
  },
  {
    id: '2', 
    title: 'MBR City - Premium One Bedroom',
    location: 'Mohammed Bin Rashid City, Dubai',
    type: 'Apartment',
    totalValue: 1850000, // AED
    usdValue: 500000,
    minInvestment: 100, // USD
    projectedROI: 15.8,
    grossYield: 9.1,
    fundedPercentage: 100,
    investorCount: 187,
    timeLeft: 'Fully Funded',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    status: 'Funded',
    features: ['Lagoon Views', 'Private Beach', 'Golf Course Access']
  },
  {
    id: '3',
    title: 'Dubai Marina - Studio Premium',
    location: 'Dubai Marina, Dubai', 
    type: 'Studio',
    totalValue: 1200000, // AED
    usdValue: 325000,
    minInvestment: 100, // USD
    projectedROI: 11.2,
    grossYield: 7.8,
    fundedPercentage: 34,
    investorCount: 89,
    timeLeft: '12 days',
    image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop',
    status: 'Active',
    features: ['Marina Views', 'JBR Beach', 'Metro Link']
  }
];

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'AED' | 'USD'>('AED');

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getFeaturedProperties();
        setProperties(data || []);
      } catch (error) {
        console.error('Error loading featured properties:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const formatCurrency = (aedAmount: number, usdAmount: number) => {
    return selectedCurrency === 'AED' 
      ? `AED ${aedAmount.toLocaleString()}`
      : `$${usdAmount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading premium Dubai properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            🔥 Trending Properties in Dubai
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Premium Dubai <span className="gradient-text">Properties</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Own premium Dubai real estate for just $100. Higher yields than PRYPCO with global accessibility.
          </p>
          
          {/* Currency Selector */}
          <div className="flex justify-center gap-2 mb-8">
            <Button 
              variant={selectedCurrency === 'AED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCurrency('AED')}
            >
              AED
            </Button>
            <Button 
              variant={selectedCurrency === 'USD' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCurrency('USD')}
            >
              USD
            </Button>
          </div>
        </div>
        
        {/* Enhanced Property Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {premiumProperties.map((property) => (
            <Card key={property.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={property.status === 'Funded' ? 'default' : 'secondary'}
                    className="bg-white/90 text-gray-900"
                  >
                    {property.status === 'Funded' ? '✅ 100% FUNDED' : '🔥 ACTIVE'}
                  </Badge>
                </div>

                {/* Time Left */}
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white/90 text-gray-900">
                    <Timer className="h-3 w-3 mr-1" />
                    {property.timeLeft}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {property.title}
                </h3>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {property.projectedROI}%
                    </div>
                    <div className="text-xs text-muted-foreground">Projected ROI</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {property.grossYield}%
                    </div>
                    <div className="text-xs text-muted-foreground">Gross Yield</div>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Funding Progress</span>
                    <span className="font-medium">{property.fundedPercentage}%</span>
                  </div>
                  <Progress value={property.fundedPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{property.investorCount} investors</span>
                    <span>{formatCurrency(property.totalValue, property.usdValue)}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {property.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Investment Info */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="text-xl font-bold text-foreground">
                      ${property.minInvestment}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Value</div>
                    <div className="text-lg font-bold text-foreground">
                      {formatCurrency(property.totalValue, property.usdValue)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/properties/${property.id}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={property.status === 'Funded'}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </Link>
                  <Link to={`/properties/${property.id}`} className="flex-1">
                    <Button 
                      className="w-full"
                      disabled={property.status === 'Funded'}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {property.status === 'Funded' ? 'Sold Out' : 'Invest Now'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced CTA */}
        <div className="text-center mt-16">
          <div className="mb-6">
            <Badge variant="secondary" className="px-4 py-2 mb-4">
              🚀 More Properties Coming Soon
            </Badge>
            <p className="text-muted-foreground">
              Join 6,000+ international investors waiting for exclusive access
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <Button size="lg" className="px-8 py-3">
                <Users className="h-5 w-5 mr-2" />
                View All Properties
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}