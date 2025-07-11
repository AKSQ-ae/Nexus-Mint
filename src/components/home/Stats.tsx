import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, Users, Shield, DollarSign } from 'lucide-react';
import { currencyService } from "@/lib/services/currency-service";
import { useEffect, useState } from "react";

export function Stats() {
  const [exchangeRate, setExchangeRate] = useState(3.67);

  useEffect(() => {
    const updateRate = async () => {
      await currencyService.updateExchangeRate();
      const rates = currencyService.getCurrentRates();
      setExchangeRate(rates.USD_TO_AED);
    };
    updateRate();
  }, []);

  const stats = [
    {
      name: 'Total Properties',
      value: '250+',
      icon: Building,
      description: 'Premium properties available',
    },
    {
      name: 'Average Returns',
      value: '10.5%',
      icon: TrendingUp,
      description: 'Annual return for investors',
    },
    {
      name: 'Active Investors',
      value: '15,000+',
      icon: Users,
      description: 'Growing community',
    },
    {
      name: 'Total Value',
      value: '$500M+',
      icon: Shield,
      description: 'Assets under management',
    },
  ];

  return (
    <div className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Platform Statistics</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of investors building wealth through real estate
          </p>
          {/* Live Exchange Rate Indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary">
            <DollarSign className="h-4 w-4" />
            <span>Live AED/USD: {exchangeRate.toFixed(3)} • Default Currency: AED</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <CardTitle className="text-lg mt-2">{stat.name}</CardTitle>
                <CardDescription className="mt-1">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}