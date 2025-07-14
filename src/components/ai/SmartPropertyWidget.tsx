import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Calendar, Users } from 'lucide-react';

interface SmartPropertyWidgetProps {
  property: {
    id: string;
    title: string;
    location: string;
    city: string;
    price_per_token: number;
    min_investment: number;
    images: string[];
    property_type: string;
    funding_percentage?: number;
    expected_yield?: number;
  };
  investment: {
    amount: number;
    currency: string;
    estimatedTokens: number;
    estimatedFees: number;
  };
  onQuickInvest: (propertyId: string, amount: number) => void;
  onViewDetails: (propertyId: string) => void;
}

export function SmartPropertyWidget({ 
  property, 
  investment, 
  onQuickInvest, 
  onViewDetails 
}: SmartPropertyWidgetProps) {
  const handleQuickInvest = () => {
    onQuickInvest(property.id, investment.amount);
  };

  const handleViewDetails = () => {
    onViewDetails(property.id);
  };

  return (
    <Card className="w-full max-w-sm bg-gradient-to-br from-background to-muted/20 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2">
            {property.property_type}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {property.expected_yield || 8.5}% Yield
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{property.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {property.location}, {property.city}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment Preview */}
        <div className="bg-primary/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Investment Amount</span>
            <span className="font-semibold">{investment.amount.toLocaleString()} {investment.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tokens You'll Get</span>
            <span className="font-semibold">{investment.estimatedTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee</span>
            <span className="font-semibold">{investment.estimatedFees.toLocaleString()} {investment.currency}</span>
          </div>
          <hr className="border-primary/20" />
          <div className="flex justify-between text-sm font-bold">
            <span>Total Cost</span>
            <span>{(investment.amount + investment.estimatedFees).toLocaleString()} {investment.currency}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-muted-foreground">Min Investment</span>
          </div>
          <div className="text-right font-medium">
            {property.min_investment.toLocaleString()} {investment.currency}
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-600" />
            <span className="text-muted-foreground">Funding</span>
          </div>
          <div className="text-right font-medium">
            {property.funding_percentage || 67}% Complete
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            onClick={handleQuickInvest}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold"
            size="sm"
          >
            🚀 Invest Now - 1 Click
          </Button>
          <Button 
            onClick={handleViewDetails}
            variant="outline" 
            className="w-full" 
            size="sm"
          >
            View Full Details
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Verified Property</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Instant Settlement</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}