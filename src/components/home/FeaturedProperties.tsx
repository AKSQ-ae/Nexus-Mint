import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/properties/PropertyCard';
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

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading featured properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Premium <span className="text-primary">Properties</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover exclusive real estate investment opportunities in prime locations worldwide
          </p>
        </div>
        
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No featured properties available at the moment.</p>
            <Link to="/properties">
              <Button size="lg">Browse All Properties</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 3).map((property) => (
                <div key={property.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl bg-muted/50 aspect-[4/3] mb-6">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                      <div className="text-muted-foreground text-lg font-medium">
                        {property.title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      {property.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {property.description || `Prime location with premium amenities in ${property.city}, ${property.country}`}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          ${property.price_per_token ? (property.price_per_token * (property.total_tokens || 1000)).toLocaleString() : '2.5M'}
                        </div>
                        <div className="text-sm text-primary font-medium">
                          AED {currencyService.convertToAED(
                            property.price_per_token ? 
                              (property.price_per_token * (property.total_tokens || 1000)) : 
                              2500000
                          ).toLocaleString()}
                        </div>
                      </div>
                      <Link to={`/properties/${property.id}`}>
                        <Button variant="default" className="bg-foreground text-background hover:bg-foreground/90">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link to="/properties">
                <Button size="lg" className="px-8 py-3">View All Properties</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}