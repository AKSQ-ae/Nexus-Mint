import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Mock funding progress for demo
  const fundedPercentage = 25;

  return (
    <Link to={`/properties/${property.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full">
          {property.images && Array.isArray(property.images) && property.images[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="object-cover rounded-t-lg w-full h-full"
            />
          ) : (
            <div className="h-full w-full bg-muted rounded-t-lg flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">{property.property_type}</Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {property.city}, {property.country}
          </p>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Token Price</p>
              <p className="text-lg font-bold">
                ${property.price_per_token?.toLocaleString() || 'TBD'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Expected Yield</p>
              <p className="text-lg font-bold text-green-600">
                8-12%
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-medium">
                {fundedPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={fundedPercentage} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            {Math.floor((property.total_tokens || 1000) * 0.75).toLocaleString()} tokens available
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}