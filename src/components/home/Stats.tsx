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
          <h2 className="text-3xl font-bold text-foreground">Global Access. Local Returns.</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-4xl mx-auto">
            Empowering investors in 30+ countries to build AED 5B+ in tokenized real estate—starting at just AED 500.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
            <div>
              <span className="text-blue-600 font-semibold">Effortless Diversification</span>
              <span className="text-muted-foreground"> – Allocate AED 100 across a basket of vetted UAE properties in one click for balanced, low-risk exposure.</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
            <div>
              <span className="text-blue-600 font-semibold">Institutional-Grade Security</span>
              <span className="text-muted-foreground"> – Enterprise-level encryption and multi-signature custody keep your capital rock-solid.</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
            <div>
              <span className="text-blue-600 font-semibold">Advanced Tokenization Technology</span>
              <span className="text-muted-foreground"> – On-chain property tokenization delivers instant settlement, full transparency, and seamless fractional ownership.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}