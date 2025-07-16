import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Building, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { QuickInvestFlow } from '@/components/investment/QuickInvestFlow';
import { currencyService } from '@/lib/services/currency-service';
import { Property } from '@/types';

// ✅ Using proper Property type from /types/index.ts

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
    <Card className="h-full group hover:scale-105 transition-all duration-300 overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={firstImage}
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm font-medium">
            {property.property_type}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="bg-success text-white font-semibold shadow-lg">
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
            <div className="space-y-1">
              <p className="text-lg font-bold">
                AED {currencyService.convertToAED(property.price_per_token || 100).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">
                ${property.price_per_token?.toFixed(2) || '100.00'} USD
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expected Yield</p>
            <p className="text-lg font-bold text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {currencyService.getRealisticYield()}%
            </p>
            <p className="text-xs text-muted-foreground">Per annum</p>
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
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link to={`/properties/${property.id}`}>
              View Details
            </Link>
          </Button>
          <Button 
            asChild 
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <Link to={`/trading/${property.id}`}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Trade
            </Link>
          </Button>
          <Button 
            onClick={() => setShowQuickInvest(true)}
            variant="cta"
            size="sm"
            className="flex-1"
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