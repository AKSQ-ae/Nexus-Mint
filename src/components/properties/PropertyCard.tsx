import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Building, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { QuickInvestFlow } from '@/components/investment/QuickInvestFlow';

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
  const [showQuickInvest, setShowQuickInvest] = useState(false);
  
  const firstImage = Array.isArray(property.images) && property.images.length > 0 
    ? property.images[0] 
    : '/placeholder.svg';

  // Mock funding progress for demo
  const fundedPercentage = Math.random() * 40 + 10; // 10-50%
  const availableTokens = Math.floor((property.total_tokens || 10000) * (1 - fundedPercentage / 100));

  return (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <img
          src={firstImage}
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            {property.property_type}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="bg-green-600 text-white">
            {fundedPercentage.toFixed(0)}% Funded
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{property.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            {property.city}, {property.country}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Token Price</p>
            <p className="text-lg font-bold">
              ${property.price_per_token?.toFixed(2) || '100.00'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expected Yield</p>
            <p className="text-lg font-bold text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              8-12%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-medium">{fundedPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={fundedPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {availableTokens.toLocaleString()} tokens available
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4">
        <div className="flex w-full gap-2">
          <Button 
            asChild 
            className="flex-1"
            variant="outline"
          >
            <Link to={`/properties/${property.id}`}>
              View Details
            </Link>
          </Button>
          <Button 
            asChild 
            className="flex-1"
            variant="outline"
          >
            <Link to={`/trading/${property.id}`}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Trade
            </Link>
          </Button>
          <Button 
            onClick={() => setShowQuickInvest(true)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4 mr-1" />
            Invest
          </Button>
        </div>
        
        {showQuickInvest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowQuickInvest(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                Close
              </Button>
              <QuickInvestFlow
                propertyId={property.id}
                propertyTitle={property.title}
                tokenPrice={property.price_per_token || 100}
                availableTokens={availableTokens}
                onComplete={() => setShowQuickInvest(false)}
              />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}