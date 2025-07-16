// Enhanced currency conversion service for USD <-> AED with real-time rates
import { supabase } from '@/integrations/supabase/client';

export interface CurrencyConversion {
  usd: number;
  aed: number;
  rate: number;
  lastUpdated: Date;
}

export interface CurrencyDisplayOptions {
  primary?: 'USD' | 'AED';
  showBoth?: boolean;
  format?: 'short' | 'long';
}

interface ExchangeRates {
  USD_TO_AED: number;
  AED_TO_USD: number;
}

interface ExchangeRateResponse {
  success: boolean;
  rates: ExchangeRates;
  lastUpdated: string;
  source: string;
  error?: string;
}

class CurrencyService {
  private exchangeRate: number = 3.6725; // USD to AED fallback rate
  private lastUpdated: Date = new Date();
  private cachedRates: ExchangeRates = {
    USD_TO_AED: 3.6725,
    AED_TO_USD: 0.272
  };
  private lastFetch = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
  
  // Default to AED as primary currency
  private readonly DEFAULT_CURRENCY = 'AED';
  private readonly MINIMUM_INVESTMENT_AED = 500;

  // Fetch real-time exchange rates
  private async fetchExchangeRates(): Promise<void> {
    const now = Date.now();
    
    // Return if cache is still valid
    if (now - this.lastFetch < this.CACHE_DURATION) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-exchange-rates');
      
      if (error) throw error;
      
      const response: ExchangeRateResponse = data;
      
      if (response.success && response.rates) {
        this.cachedRates = response.rates;
        this.exchangeRate = response.rates.USD_TO_AED;
        this.lastFetch = now;
        this.lastUpdated = new Date();
        console.log(`Exchange rates updated from ${response.source}`);
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using cached rates:', error);
    }
  }

  // Auto-update rates on service initialization
  async updateExchangeRate(): Promise<void> {
    await this.fetchExchangeRates();
  }

  convertToAED(usdAmount: number): number {
    return Math.round(usdAmount * this.exchangeRate * 100) / 100;
  }

  convertToUSD(aedAmount: number): number {
    return Math.round((aedAmount / this.exchangeRate) * 100) / 100;
  }

  // Async versions that ensure fresh rates
  async convertToAEDAsync(usdAmount: number): Promise<number> {
    await this.fetchExchangeRates();
    return this.convertToAED(usdAmount);
  }

  async convertToUSDAsync(aedAmount: number): Promise<number> {
    await this.fetchExchangeRates();
    return this.convertToUSD(aedAmount);
  }

  getConversion(usdAmount: number): CurrencyConversion {
    return {
      usd: usdAmount,
      aed: this.convertToAED(usdAmount),
      rate: this.exchangeRate,
      lastUpdated: this.lastUpdated
    };
  }

  formatCurrency(amount: number, currency: 'USD' | 'AED', options: CurrencyDisplayOptions = {}): string {
    const { showBoth = false, format = 'short' } = options;
    
    if (currency === 'USD') {
      const usdFormatted = format === 'short' 
        ? `$${amount.toLocaleString()}`
        : `${amount.toLocaleString()} USD`;
      
      if (showBoth) {
        const aedAmount = this.convertToAED(amount);
        const aedFormatted = format === 'short'
          ? `AED ${aedAmount.toLocaleString()}`
          : `${aedAmount.toLocaleString()} AED`;
        return `${usdFormatted} (${aedFormatted})`;
      }
      
      return usdFormatted;
    } else {
      const aedFormatted = format === 'short'
        ? `AED ${amount.toLocaleString()}`
        : `${amount.toLocaleString()} AED`;
      
      if (showBoth) {
        const usdAmount = this.convertToUSD(amount);
        const usdFormatted = format === 'short'
          ? `$${usdAmount.toLocaleString()}`
          : `${usdAmount.toLocaleString()} USD`;
        return `${aedFormatted} (${usdFormatted})`;
      }
      
      return aedFormatted;
    }
  }

  // Dubai property market realistic price ranges
  getDubaiPropertyPrice(propertyType: string, size: number): number {
    const pricePerSqft: Record<string, number> = {
      'apartment': 1200, // AED per sqft
      'villa': 800,
      'penthouse': 2000,
      'office': 1000,
      'townhouse': 900
    };

    const basePrice = (pricePerSqft[propertyType] || 1000) * size;
    return Math.round(basePrice);
  }

  getRealisticYield(): number {
    // Dubai rental yields typically 6-12%
    return Math.round((6 + Math.random() * 6) * 100) / 100;
  }

  // Get current exchange rates
  getCurrentRates(): ExchangeRates {
    return this.cachedRates;
  }

  // Initialize rates on app start
  async initializeRates(): Promise<void> {
    await this.fetchExchangeRates();
  }
}

export const currencyService = new CurrencyService();

// Auto-initialize rates when service is imported
currencyService.initializeRates().catch(console.warn);