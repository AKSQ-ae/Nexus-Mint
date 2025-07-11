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
      name: 'Properties Available',
      value: '500+',
      icon: Building,
      description: 'Global premium properties',
      change: '+25% this month',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
    },
    {
      name: 'Average Returns',
      value: '12.8%',
      icon: TrendingUp,
      description: 'Annual return vs PRYPCO 8-12%',
      change: '+2.3% higher',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
    },
    {
      name: 'Global Investors',
      value: '25,000+',
      icon: Users,
      description: 'No Emirates ID required',
      change: '+6K waitlist',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
    },
    {
      name: 'Total Value',
      value: '$1.2B+',
      icon: Shield,
      description: 'Multi-currency support',
      change: 'AED 4.4B+',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
    },
  ];

  return (
    <div className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Global Platform Leadership</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Outperforming PRYPCO with global accessibility and superior returns
          </p>
          {/* Enhanced Live Exchange Rate with Comparison */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
              <DollarSign className="h-4 w-4" />
              <span>Live AED/USD: {exchangeRate.toFixed(3)}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>✅ No Emirates ID Required vs PRYPCO</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <CardTitle className="text-lg mt-2">{stat.name}</CardTitle>
                <CardDescription className="mt-1">{stat.description}</CardDescription>
                {/* Enhanced Change Indicator */}
                <div className={`mt-2 text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : stat.changeType === 'negative' 
                    ? 'text-red-600' 
                    : 'text-muted-foreground'
                }`}>
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Competitive Advantage Banner */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
            <span className="text-sm font-medium text-foreground">🚀 Competitive Advantages:</span>
            <span className="text-sm text-muted-foreground">$100 minimum vs AED 2,000</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Global access</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Multi-currency</span>
          </div>
        </div>
      </div>
    </div>
  );
}