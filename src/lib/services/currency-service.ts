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

class CurrencyService {
  private exchangeRate: number = 3.6725; // USD to AED rate (relatively stable)
  private lastUpdated: Date = new Date();

  // In production, this would fetch from a real API like xe.com or fixer.io
  async updateExchangeRate(): Promise<void> {
    try {
      // Simulated API call - in production, use real exchange rate API
      const mockRate = 3.6725 + (Math.random() - 0.5) * 0.01; // Small variation
      this.exchangeRate = mockRate;
      this.lastUpdated = new Date();
    } catch (error) {
      console.warn('Failed to update exchange rate, using cached rate');
    }
  }

  convertToAED(usdAmount: number): number {
    return Math.round(usdAmount * this.exchangeRate * 100) / 100;
  }

  convertToUSD(aedAmount: number): number {
    return Math.round((aedAmount / this.exchangeRate) * 100) / 100;
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
}

export const currencyService = new CurrencyService();