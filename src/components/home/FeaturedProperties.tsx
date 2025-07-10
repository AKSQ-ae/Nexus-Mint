import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { getFeaturedProperties } from '@/lib/services/property-service';

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
    <div className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Featured Properties</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover our top-performing investment opportunities
          </p>
        </div>
        
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No featured properties available at the moment.</p>
            <Link to="/properties">
              <Button>Browse All Properties</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/properties">
                <Button size="lg">View All Properties</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}