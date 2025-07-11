import React from 'react';
import { currencyService, CurrencyDisplayOptions } from '@/lib/services/currency-service';

interface CurrencyDisplayProps {
  amount: number;
  currency: 'USD' | 'AED';
  options?: CurrencyDisplayOptions;
  className?: string;
}

export function CurrencyDisplay({ amount, currency, options = {}, className }: CurrencyDisplayProps) {
  const { showBoth = true, primary = 'AED' } = options;
  
  const formatted = currencyService.formatCurrency(amount, currency, options);
  
  if (showBoth && primary !== currency) {
    const conversion = currency === 'USD' 
      ? currencyService.getConversion(amount)
      : { usd: currencyService.convertToUSD(amount), aed: amount };
    
    const primaryAmount = primary === 'AED' ? conversion.aed : conversion.usd;
    const secondaryAmount = primary === 'AED' ? conversion.usd : conversion.aed;
    
    const primaryFormatted = currencyService.formatCurrency(primaryAmount, primary, { showBoth: false });
    const secondaryFormatted = currencyService.formatCurrency(secondaryAmount, primary === 'AED' ? 'USD' : 'AED', { showBoth: false });
    
    return (
      <span className={className}>
        <span className="font-semibold text-foreground">{primaryFormatted}</span>
        <span className="text-sm text-muted-foreground ml-1">({secondaryFormatted})</span>
      </span>
    );
  }
  
  return <span className={className}>{formatted}</span>;
}

export function PriceCard({ title, usdPrice, className }: { title: string; usdPrice: number; className?: string }) {
  const conversion = currencyService.getConversion(usdPrice);
  
  return (
    <div className={`bg-card p-4 rounded-lg border ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2">
        <div className="text-2xl font-bold text-foreground">
          AED {conversion.aed.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          ${conversion.usd.toLocaleString()} USD
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Rate: 1 USD = {conversion.rate} AED
      </div>
    </div>
  );
}