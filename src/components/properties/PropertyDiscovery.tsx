import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Property } from '@/types';
import { 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Star,
  Building,
  Home,
  Factory,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { currencyService } from '@/lib/services/currency-service';

// ✅ Using proper Property type from /types/index.ts

interface FilterState {
  search: string;
  priceRange: [number, number];
  propertyTypes: string[];
  yieldRange: [number, number];
  location: string;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: Home },
  { value: 'villa', label: 'Villa', icon: Home },
  { value: 'penthouse', label: 'Penthouse', icon: Home },
  { value: 'townhouse', label: 'Townhouse', icon: Home },
  { value: 'office', label: 'Office', icon: Building },
];

const MOCK_YIELDS = {
  apartment: { min: 6, max: 10 },
  villa: { min: 7, max: 11 },
  penthouse: { min: 8, max: 12 },
  townhouse: { min: 6, max: 9 },
  office: { min: 8, max: 14 },
  retail: { min: 9, max: 15 },
  warehouse: { min: 7, max: 12 },
};

export function PropertyDiscovery() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priceRange: [0, 1000],
    propertyTypes: [],
    yieldRange: [0, 20],
    location: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock featured status and enhance data
      const enhancedProperties = (data || []).map((property, index) => ({
        ...property,
        is_featured: index < 3, // First 3 are featured
        status: 'active' as const,
        roi_estimate: 8.5,
        rental_yield: 6.2,
        images: Array.isArray(property.images) ? property.images as string[] : [],
        amenities: Array.isArray(property.amenities) ? property.amenities as string[] : []
      }));
      
      setProperties(enhancedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.country.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = 
      filters.propertyTypes.length === 0 || 
      filters.propertyTypes.includes(property.property_type);
    
    const tokenPrice = property.price_per_token || 100;
    const matchesPrice = 
      tokenPrice >= filters.priceRange[0] && 
      tokenPrice <= filters.priceRange[1];

    const location = `${property.city}, ${property.country}`.toLowerCase();
    const matchesLocation = 
      !filters.location || 
      location.includes(filters.location.toLowerCase());

    return matchesSearch && matchesType && matchesPrice && matchesLocation;
  });

  const getYieldRange = (propertyType: string) => {
    return MOCK_YIELDS[propertyType as keyof typeof MOCK_YIELDS] || { min: 8, max: 12 };
  };

  const getFundingProgress = (property: Property) => {
    // Mock funding progress based on property age and type
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(85, Math.max(15, 25 + (daysSinceCreated * 2)));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      priceRange: [0, 1000],
      propertyTypes: [],
      yieldRange: [0, 20],
      location: '',
    });
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    (filters.propertyTypes.length > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    (filters.location ? 1 : 0);

  const PropertyQuickPreview = ({ property }: { property: Property }) => {
    const yieldRange = getYieldRange(property.property_type);
    const fundingProgress = getFundingProgress(property);
    const tokensAvailable = Math.floor((property.total_tokens || 1000) * (100 - fundingProgress) / 100);

    return (
      <div className="space-y-6">
        {/* Property Image */}
        <div className="relative h-48 w-full rounded-lg overflow-hidden">
          {property.images && Array.isArray(property.images) && property.images[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <Building className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {property.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Token Price</p>
            <p className="text-xl font-bold">
              AED {currencyService.convertToAED(property.price_per_token || 100).toFixed(0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Expected Yield</p>
            <p className="text-xl font-bold text-green-600">
              {yieldRange.min}-{yieldRange.max}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Funding Progress</p>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{fundingProgress}%</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fundingProgress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Available Tokens</p>
            <p className="text-lg font-semibold">
              {tokensAvailable.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Investment Preview */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold">Quick Investment Preview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Min. Investment (3 tokens):</span>
              <span className="font-medium">
                AED {currencyService.convertToAED((property.price_per_token || 100) * 3).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Est. Annual Returns:</span>
              <span className="font-medium text-green-600">
                AED {Math.round(currencyService.convertToAED((property.price_per_token || 100) * 3) * yieldRange.min / 100).toLocaleString()} - 
                AED {Math.round(currencyService.convertToAED((property.price_per_token || 100) * 3) * yieldRange.max / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Property Valuation:</span>
              <span className="font-medium">
                AED {currencyService.convertToAED(property.price || 2500000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/properties/${property.id}`} className="flex-1">
            <Button className="w-full">View Full Details</Button>
          </Link>
          <Link to={`/properties/${property.id}?invest=true`} className="flex-1">
            <Button variant="outline" className="w-full">Start Investing</Button>
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search - 60% width */}
          <div className="md:w-3/5 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, type, or price…"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
              aria-label="Search properties"
            />
          </div>

          {/* Filter Buttons */}
          <div className="md:w-auto flex gap-2">
            {/* Desktop Filter Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="relative hidden md:flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Properties</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter city or country..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  {/* Property Types */}
                  <div className="space-y-3">
                    <Label>Property Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROPERTY_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = filters.propertyTypes.includes(type.value);
                        return (
                          <Button
                            key={type.value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                propertyTypes: isSelected
                                  ? prev.propertyTypes.filter(t => t !== type.value)
                                  : [...prev.propertyTypes, type.value]
                              }));
                            }}
                            className="justify-start"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Token Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                        defaultValue={[0, 1000]}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Mobile Search & Filter Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Search & Filter
                  {activeFiltersCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Search & Filter Properties</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Mobile Search */}
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      placeholder="Search by location, type, or price…"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter city or country..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  {/* Property Types */}
                  <div className="space-y-3">
                    <Label>Property Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROPERTY_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = filters.propertyTypes.includes(type.value);
                        return (
                          <Button
                            key={type.value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                propertyTypes: isSelected
                                  ? prev.propertyTypes.filter(t => t !== type.value)
                                  : [...prev.propertyTypes, type.value]
                              }));
                            }}
                            className="justify-start"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Token Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                        defaultValue={[0, 1000]}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.propertyTypes.map(type => (
              <Badge key={type} variant="secondary" className="gap-1">
                {PROPERTY_TYPES.find(t => t.value === type)?.label}
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    propertyTypes: prev.propertyTypes.filter(t => t !== type)
                  }))}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results Count - right aligned below toolbar */}
      <div className="flex justify-end">
        <p className="text-sm text-gray-600">
          {filteredProperties.length} of {properties.length} properties found
        </p>
      </div>

      {/* Properties Grid or Empty State */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No properties match your filters</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          role="list" 
          aria-label="Investment properties"
        >
          {filteredProperties.map((property) => {
            const yieldRange = getYieldRange(property.property_type);
            const fundingProgress = getFundingProgress(property);
            const tokensAvailable = Math.floor((property.total_tokens || 1000) * (100 - fundingProgress) / 100);

            return (
              <Card 
                key={property.id} 
                className="group hover:shadow-lg hover:border-2 hover:border-primary transition-all duration-300 rounded-xl"
                role="listitem"
              >
                <div className="relative">
                  {/* Property Image - 180px height */}
                  <div className="relative h-[180px] w-full overflow-hidden rounded-t-xl">
                    {property.images && Array.isArray(property.images) && property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Building className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between">
                      {property.is_featured && (
                        <Badge className="bg-yellow-500 text-yellow-900 font-medium">
                          Featured
                        </Badge>
                      )}
                      <Badge className="bg-primary text-white font-medium capitalize">
                        {property.property_type}
                      </Badge>
                    </div>

                    {/* Quick Preview Button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-white text-black hover:bg-white/90">
                            <Eye className="h-4 w-4 mr-2" />
                            Quick Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {property.title}
                            </DialogTitle>
                          </DialogHeader>
                          <PropertyQuickPreview property={property} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Title and Location */}
                  <div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.city}, {property.country}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Token Price</p>
                        <p className="font-bold text-lg">${property.price_per_token?.toLocaleString() || '100'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Yield</p>
                        <p className="font-bold text-lg text-green-600">{yieldRange.min}-{yieldRange.max}%</p>
                      </div>
                    </div>

                    {/* Funding Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Funding Progress</span>
                        <div className="w-[200px] bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fundingProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{fundingProgress}% funded</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Details
                      </Button>
                    </Link>
                    <Link to={`/properties/${property.id}?invest=true`} className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                        Invest Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}