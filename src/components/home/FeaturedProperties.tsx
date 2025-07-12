import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, TrendingUp, Timer, Users, Calculator, Heart, Eye, Filter, SortAsc, Star, Zap, Award } from 'lucide-react';
import { getFeaturedProperties } from '@/lib/services/property-service';
import { currencyService } from '@/lib/services/currency-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    features: ['Burj Khalifa Views', 'Pool & Gym', 'Metro Access'],
    rating: 4.8,
    likes: 156,
    views: 2847,
    category: 'luxury'
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
    features: ['Lagoon Views', 'Private Beach', 'Golf Course Access'],
    rating: 4.9,
    likes: 203,
    views: 3421,
    category: 'premium'
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
    features: ['Marina Views', 'JBR Beach', 'Metro Link'],
    rating: 4.6,
    likes: 98,
    views: 1654,
    category: 'affordable'
  },
  {
    id: '4',
    title: 'Downtown Dubai - Luxury Penthouse',
    location: 'Downtown Dubai, Dubai',
    type: 'Penthouse',
    totalValue: 5800000, // AED
    usdValue: 1580000,
    minInvestment: 250, // USD
    projectedROI: 18.3,
    grossYield: 11.5,
    fundedPercentage: 67,
    investorCount: 445,
    timeLeft: '5 days',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    status: 'Active',
    features: ['Burj Khalifa Views', 'Private Pool', 'Smart Home'],
    rating: 5.0,
    likes: 321,
    views: 5234,
    category: 'luxury'
  }
];

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'AED' | 'USD'>('AED');
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

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

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  const filteredProperties = premiumProperties.filter(property => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return property.status === 'Active';
    if (activeTab === 'funded') return property.status === 'Funded';
    return property.category === activeTab;
  });

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
    <div className="py-20 bg-gradient-to-b from-background via-accent/5 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Stats */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="h-8 w-8 text-primary animate-pulse" />
            <Badge variant="secondary" className="px-4 py-2 animate-bounce">
              🔥 Trending Properties in Dubai
            </Badge>
            <Star className="h-8 w-8 text-primary animate-pulse" />
          </div>
          
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Premium Dubai <span className="gradient-text">Properties</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            Own premium Dubai real estate for just $100. Higher yields than PRYPCO with global accessibility and zero geographical restrictions.
          </p>
          
          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-gradient-subtle rounded-lg p-4 border border-primary/20">
              <div className="text-2xl font-bold text-primary">18.3%</div>
              <div className="text-xs text-muted-foreground">Max ROI</div>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-4 border border-primary/20">
              <div className="text-2xl font-bold text-primary">$100</div>
              <div className="text-xs text-muted-foreground">Min Investment</div>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-4 border border-primary/20">
              <div className="text-2xl font-bold text-primary">1,045</div>
              <div className="text-xs text-muted-foreground">Total Investors</div>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-4 border border-primary/20">
              <div className="text-2xl font-bold text-primary">$3.1M</div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-2">
              <Button 
                variant={selectedCurrency === 'AED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCurrency('AED')}
                className="transition-all hover:scale-105"
              >
                AED
              </Button>
              <Button 
                variant={selectedCurrency === 'USD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCurrency('USD')}
                className="transition-all hover:scale-105"
              >
                USD
              </Button>
            </div>
          </div>
        </div>

        {/* Property Categories Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="all" className="text-xs">All Properties</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="funded" className="text-xs">Funded</TabsTrigger>
            <TabsTrigger value="luxury" className="text-xs">Luxury</TabsTrigger>
            <TabsTrigger value="premium" className="text-xs">Premium</TabsTrigger>
            <TabsTrigger value="affordable" className="text-xs">Affordable</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            {/* Enhanced Property Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-2">
              {filteredProperties.map((property, index) => (
                <Card 
                  key={property.id} 
                  className="group hover:shadow-premium transition-all duration-500 hover:-translate-y-2 overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary bg-gradient-to-br from-background to-accent/5"
                  onMouseEnter={() => setHoveredProperty(property.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Overlay with enhanced badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <Badge 
                        variant={property.status === 'Funded' ? 'default' : 'secondary'}
                        className="bg-white/90 text-gray-900 shadow-lg animate-fade-in"
                      >
                        {property.status === 'Funded' ? '✅ 100% FUNDED' : '🔥 ACTIVE'}
                      </Badge>
                      {property.rating >= 4.8 && (
                        <Badge className="bg-yellow-500/90 text-yellow-900 shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          {property.rating}
                        </Badge>
                      )}
                    </div>

                    {/* Top right controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Badge variant="outline" className="bg-white/90 text-gray-900 shadow-lg">
                        <Timer className="h-3 w-3 mr-1" />
                        {property.timeLeft}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(property.id);
                        }}
                        className="bg-white/90 hover:bg-white p-2 h-8 w-8 shadow-lg"
                      >
                        <Heart 
                          className={`h-4 w-4 ${favorites.has(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                      </Button>
                    </div>

                    {/* Bottom social proof */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Badge variant="outline" className="bg-white/90 text-gray-900 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {property.views}
                      </Badge>
                      <Badge variant="outline" className="bg-white/90 text-gray-900 text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        {property.likes}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-8">
                    {/* Location and Category */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {property.category}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>

                    {/* Enhanced Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="text-xl font-bold text-green-700">
                          {property.projectedROI}%
                        </div>
                        <div className="text-xs text-green-600">Projected ROI</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                        <div className="text-xl font-bold text-blue-700">
                          {property.grossYield}%
                        </div>
                        <div className="text-xs text-blue-600">Gross Yield</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
                        <div className="text-xl font-bold text-purple-700">
                          {property.investorCount}
                        </div>
                        <div className="text-xs text-purple-600">Investors</div>
                      </div>
                    </div>

                    {/* Enhanced Funding Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Funding Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-primary">{property.fundedPercentage}%</span>
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <Progress 
                        value={property.fundedPercentage} 
                        className="h-3 shadow-sm"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{property.investorCount} investors joined</span>
                        <span>{formatCurrency(property.totalValue, property.usdValue)} total</span>
                      </div>
                    </div>

                    {/* Enhanced Features */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature, featureIndex) => (
                          <Badge 
                            key={featureIndex} 
                            variant="secondary" 
                            className="text-xs bg-gradient-subtle hover:bg-accent transition-colors"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Investment Info */}
                    <div className="flex justify-between items-center mb-6 p-4 bg-gradient-subtle rounded-lg border">
                      <div>
                        <div className="text-sm text-muted-foreground">Minimum Investment</div>
                        <div className="text-2xl font-bold text-foreground">
                          ${property.minInvestment}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Property Value</div>
                        <div className="text-xl font-bold text-foreground">
                          {formatCurrency(property.totalValue, property.usdValue)}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-3">
                      <Link to={`/properties/${property.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full h-12 hover:shadow-elegant transition-all hover:scale-105"
                          disabled={property.status === 'Funded'}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Returns
                        </Button>
                      </Link>
                      <Link to={`/properties/${property.id}`} className="flex-1">
                        <Button 
                          className="w-full h-12 shadow-elegant hover:shadow-premium transition-all hover:scale-105"
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
          </TabsContent>
        </Tabs>

        {/* Enhanced CTA Section */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 shadow-premium">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Zap className="h-8 w-8 text-primary animate-pulse" />
                  <h3 className="text-3xl font-bold">Ready to Transform Your Portfolio?</h3>
                  <Star className="h-8 w-8 text-primary animate-pulse" />
                </div>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Join 15,000+ international investors building wealth through premium Dubai real estate. Start with just $100 and watch your investment grow.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="font-bold">Award Winning</div>
                    <div className="text-sm text-muted-foreground">Best PropTech Platform 2024</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="font-bold">15K+ Investors</div>
                    <div className="text-sm text-muted-foreground">Global Community</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="font-bold">18.3% Returns</div>
                    <div className="text-sm text-muted-foreground">Average Performance</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/properties">
                    <Button size="lg" className="px-12 py-4 text-lg shadow-premium hover:shadow-elegant transition-all hover:scale-105">
                      <Users className="h-5 w-5 mr-2" />
                      Explore All Properties
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button size="lg" variant="outline" className="px-12 py-4 text-lg hover:shadow-elegant transition-all hover:scale-105">
                      Get Exclusive Access
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}