import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderBook } from '@/components/trading/OrderBook';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  price_per_token: number;
  property_type: string;
  images: string[];
}

interface TokenSupply {
  token_price: number;
  total_supply: number;
  available_supply: number;
}

export default function Trading() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [tokenSupply, setTokenSupply] = useState<TokenSupply | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock market data
  const [marketData] = useState({
    volume24h: 15420,
    priceChange24h: 2.45,
    marketCap: 2850000,
    holders: 247
  });

  useEffect(() => {
    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      setProperty({
        ...propertyData,
        images: Array.isArray(propertyData.images) 
          ? (propertyData.images as string[])
          : []
      });

      // Fetch token supply
      const { data: supplyData, error: supplyError } = await supabase
        .from('token_supply')
        .select('*')
        .eq('property_id', id)
        .single();

      if (supplyError) throw supplyError;
      setTokenSupply(supplyData);

    } catch (error) {
      console.error('Error fetching property data:', error);
      toast.error('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!property || !tokenSupply) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Property not found</h1>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{property.city}, {property.country}</span>
              <Badge variant="outline" className="ml-2">
                {property.property_type}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Token Price</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">${tokenSupply.token_price.toFixed(2)}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{marketData.priceChange24h}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Market Cap</span>
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              ${marketData.marketCap.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {tokenSupply.total_supply.toLocaleString()} total supply
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Volume</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {marketData.volume24h.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">tokens traded</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Holders</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{marketData.holders}</div>
            <div className="text-sm text-muted-foreground">unique investors</div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface */}
      <OrderBook
        propertyId={property.id}
        propertyTitle={property.title}
        currentPrice={tokenSupply.token_price}
        volume24h={marketData.volume24h}
        priceChange24h={marketData.priceChange24h}
      />
    </div>
  );
}