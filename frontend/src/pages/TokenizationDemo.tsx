import React, { useState, useEffect } from 'react';
import { RealTokenizationFlow } from '@/components/tokenization/RealTokenizationFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Coins,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function TokenizationDemo() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProperties(data || []);
      
      // Auto-select first property if available
      if (data && data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoProperty = async () => {
    try {
      const demoProperty = {
        title: `Demo Property ${Date.now()}`,
        location: "Dubai Marina, UAE",
        city: "Dubai",
        country: "UAE",
        price: 2500000,
        description: "Luxury waterfront apartment with stunning marina views. Perfect for real estate tokenization demonstration.",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 2200,
        property_type: "apartment",
        amenities: ["Pool", "Gym", "Parking", "Security", "Marina View"],
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"
        ],
        is_featured: true,
        tokenization_active: false,
        tokenization_status: "available"
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(demoProperty)
        .select()
        .single();

      if (error) throw error;

      setProperties(prev => [data, ...prev]);
      setSelectedProperty(data);
      
      toast({
        title: "Demo Property Created",
        description: "Ready for tokenization demonstration",
      });
    } catch (error) {
      console.error('Error creating demo property:', error);
      toast({
        title: "Error",
        description: "Failed to create demo property",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access the tokenization demonstration.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Real Estate Tokenization</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the complete blockchain tokenization process from property audit to live trading.
          This demonstration shows how real estate assets are converted into tradeable digital tokens.
        </p>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This is a demonstration environment. All smart contracts are deployed to test networks.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Selection Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Property
              </CardTitle>
              <CardDescription>
                Choose a property to tokenize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No properties available for tokenization
                  </p>
                  <Button onClick={createDemoProperty} className="w-full">
                    Create Demo Property
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProperty?.id === property.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-muted-foreground'
                        }`}
                        onClick={() => setSelectedProperty(property)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{property.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {property.location}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <DollarSign className="h-3 w-3" />
                              ${property.price?.toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={property.tokenization_active ? "default" : "secondary"}>
                            {property.tokenization_status || 'Available'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <Button onClick={createDemoProperty} variant="outline" className="w-full">
                    Add Demo Property
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          {selectedProperty && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedProperty.title}</CardTitle>
                <CardDescription>Property Overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.images?.[0] || "/placeholder.svg"}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedProperty.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                      ${selectedProperty.price?.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Bedrooms: {selectedProperty.bedrooms}</div>
                    <div>Bathrooms: {selectedProperty.bathrooms}</div>
                    <div>Size: {selectedProperty.sqft} sqft</div>
                    <div>Type: {selectedProperty.property_type}</div>
                  </div>

                  {selectedProperty.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedProperty.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium">Tokenization Status:</span>
                    <Badge variant={selectedProperty.tokenization_active ? "default" : "secondary"}>
                      {selectedProperty.tokenization_status || 'Available'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Tokenization Flow */}
        <div className="lg:col-span-2">
          {selectedProperty ? (
            <RealTokenizationFlow
              propertyId={selectedProperty.id}
              property={selectedProperty}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Coins className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Select a Property</h2>
                <p className="text-muted-foreground">
                  Choose a property from the sidebar to begin the tokenization process.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Information Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About Real Estate Tokenization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">Security & Compliance</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Every property undergoes rigorous audit and compliance checks before tokenization.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Smart Contracts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                ERC-1155 tokens with automated dividend distribution and governance features.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold">Investment Opportunities</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Fractional ownership enables smaller investments in premium real estate.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="flex items-center gap-1 hover:text-primary">
              <FileText className="h-4 w-4" />
              Documentation
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-primary">
              <ExternalLink className="h-4 w-4" />
              Smart Contract Code
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-primary">
              <Shield className="h-4 w-4" />
              Security Audit
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}