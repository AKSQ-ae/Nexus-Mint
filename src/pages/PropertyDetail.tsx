import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedInvestmentFlow } from '@/components/investment/EnhancedInvestmentFlow';
import { MapPin, TrendingUp, DollarSign, Building, Users } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  property_type: string;
  price: number;
  price_per_token: number;
  total_tokens: number;
  tokenization_status: string;
  images: any;
  created_at: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Property not found.</div>
      </div>
    );
  }

  // Mock data for demo - this would come from property token sales
  const fundedPercentage = 25;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {property.images && Array.isArray(property.images) && property.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}, {property.country}
                </div>
              </div>
              <Badge variant="secondary">{property.property_type}</Badge>
            </div>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold">${property.price?.toLocaleString() || 'TBD'}</div>
                  <div className="text-sm text-muted-foreground">Property Value</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">8-12%</div>
                  <div className="text-sm text-muted-foreground">Expected Yield</div>
                </div>
                <div className="text-center">
                  <Building className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{property.total_tokens?.toLocaleString() || 'TBD'}</div>
                  <div className="text-sm text-muted-foreground">Total Tokens</div>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">25%</div>
                  <div className="text-sm text-muted-foreground">Funded</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <EnhancedInvestmentFlow
              propertyId={property.id}
              propertyTitle={property.title}
              onInvestmentComplete={() => navigate('/portfolio')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}