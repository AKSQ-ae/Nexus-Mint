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
      description: 'Competitive annual returns',
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
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Why Choose Nexus Mint?</h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Own, Earn, Multiply your wealth through regulated tokenized real estate.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="max-w-4xl mx-auto">
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