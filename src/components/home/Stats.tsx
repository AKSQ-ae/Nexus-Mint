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
    <div className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Verified Performance Metrics</h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            25,000+ verified investors from 30 countries. AED 5B+ in regulated tokenized real estate transactions.
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={stat.name} className="text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant group-hover:shadow-premium transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <h3 className="font-semibold text-foreground mb-2">{stat.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{stat.description}</p>
                <div className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${
                  stat.changeType === 'positive' ? 'bg-success/10 text-success' :
                  stat.changeType === 'negative' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">Why Choose Nexus Mint?</h3>
          <div className="space-y-6">
            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-primary font-semibold text-lg">Effortless Diversification</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Invest AED 500 in a curated UAE property portfolio—instantly diversified with a single tap.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-primary font-semibold text-lg">Institutional-Grade Security</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Enterprise-level encryption and multi-signature custody keep your capital rock-solid.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-primary font-semibold text-lg">Advanced Tokenization Technology</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    On-chain property tokenization delivers instant settlement, full transparency, and seamless fractional ownership.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}