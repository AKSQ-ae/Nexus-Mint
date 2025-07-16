import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, DollarSign, PieChart, Target, AlertTriangle } from 'lucide-react';
import { ValidatedInput, validators, FormValidationSummary } from '@/components/ui/form-validation';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { currencyService } from '@/lib/services/currency-service';

interface CalculatorProps {
  propertyValue?: number;
  expectedReturn?: number;
  minimumInvestment?: number;
  className?: string;
  // Legacy props for compatibility
  tokenSupply?: any;
  onInvest?: (amount: number, total: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InvestmentCalculator({ 
  propertyValue = 2500000, // AED
  expectedReturn = 12.5, // %
  minimumInvestment = 100, // USD
  className = "",
  loading = false,
  onInvest
}: CalculatorProps) {
  const [investment, setInvestment] = useState(minimumInvestment);
  const [currency, setCurrency] = useState<'USD' | 'AED'>('USD');
  const [timeframe, setTimeframe] = useState(5); // years
  const [exchangeRate, setExchangeRate] = useState(3.67);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  useEffect(() => {
    const updateRate = async () => {
      await currencyService.updateExchangeRate();
      const rates = currencyService.getCurrentRates();
      setExchangeRate(rates.USD_TO_AED);
    };
    updateRate();
  }, []);

  const getInvestmentInAED = () => {
    return currency === 'USD' ? investment * exchangeRate : investment;
  };

  const getInvestmentInUSD = () => {
    return currency === 'AED' ? investment / exchangeRate : investment;
  };

  const getOwnershipPercentage = () => {
    return (getInvestmentInAED() / propertyValue) * 100;
  };

  const getAnnualReturn = () => {
    return getInvestmentInUSD() * (expectedReturn / 100);
  };

  const getTotalReturn = () => {
    const principal = getInvestmentInUSD();
    return principal * Math.pow(1 + expectedReturn / 100, timeframe);
  };

  const getProfit = () => {
    return getTotalReturn() - getInvestmentInUSD();
  };

  const validateInvestment = () => {
    const errors: string[] = [];
    
    if (investment < minimumInvestment) {
      errors.push(`Minimum investment is $${minimumInvestment.toLocaleString()}`);
    }
    
    if (investment > 1000000) {
      errors.push('Maximum investment is $1,000,000');
    }
    
    if (timeframe < 1 || timeframe > 20) {
      errors.push('Investment period must be between 1 and 20 years');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInvestmentCalculation = async () => {
    if (!validateInvestment()) return;
    
    setIsCalculating(true);
    try {
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onInvest) {
        onInvest(investment, getTotalReturn());
        enhancedToast.success({
          title: 'Investment Calculated',
          description: `Ready to invest $${investment.toLocaleString()}`,
        });
      }
    } catch (error) {
      enhancedToast.error({
        title: 'Calculation Error',
        description: 'Unable to calculate investment. Please try again.',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number, currencyType: 'USD' | 'AED') => {
    if (currencyType === 'USD') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `AED ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Investment Calculator
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">
            Competitive Returns
          </Badge>
          <Badge variant="outline">
            From $100 minimum
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculate">Calculate</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculate" className="space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <FormValidationSummary errors={validationErrors} />
            )}

            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                label="Investment Amount"
                value={investment.toString()}
                onChange={(value) => {
                  setInvestment(Number(value) || minimumInvestment);
                  validateInvestment();
                }}
                validators={[
                  (val) => validators.required(val, 'Investment amount'),
                  (val) => validators.minAmount(Number(val), minimumInvestment),
                  (val) => validators.maxAmount(Number(val), 1000000),
                ]}
                type="number"
                placeholder={`Minimum $${minimumInvestment}`}
                disabled={loading || isCalculating}
                required
                hint={`Minimum: $${minimumInvestment.toLocaleString()}, Maximum: $1,000,000`}
              />
              
              <ValidatedInput
                label="Investment Period (Years)"
                value={timeframe.toString()}
                onChange={(value) => {
                  setTimeframe(Number(value) || 1);
                  validateInvestment();
                }}
                validators={[
                  (val) => validators.required(val, 'Investment period'),
                  (val) => {
                    const num = Number(val);
                    return {
                      isValid: num >= 1 && num <= 20,
                      errors: num < 1 || num > 20 ? ['Period must be between 1 and 20 years'] : []
                    };
                  }
                ]}
                type="number"
                placeholder="Years"
                disabled={loading || isCalculating}
                required
                hint="Choose between 1 and 20 years"
              />
            </div>

            {/* Currency Toggle */}
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Currency:</span>
              <div className="flex">
                <Button
                  variant={currency === 'USD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrency('USD')}
                  className="rounded-r-none"
                  disabled={loading || isCalculating}
                >
                  USD
                </Button>
                <Button
                  variant={currency === 'AED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrency('AED')}
                  className="rounded-l-none"
                  disabled={loading || isCalculating}
                >
                  AED
                </Button>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Quick amounts:</span>
              {[100, 500, 1000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInvestment(amount);
                    setCurrency('USD');
                    validateInvestment();
                  }}
                  disabled={loading || isCalculating}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Ownership</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {getOwnershipPercentage().toFixed(4)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  of property value
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Annual Return</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(getAnnualReturn(), 'USD')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {expectedReturn}% per year
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Value</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getTotalReturn(), 'USD')}
                </div>
                <div className="text-xs text-muted-foreground">
                  After {timeframe} years
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Total Profit</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(getProfit(), 'USD')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(((getTotalReturn() / getInvestmentInUSD()) - 1) * 100).toFixed(1)}% gain
                </div>
              </Card>
            </div>

            {/* Investment Breakdown */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-3">Investment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Initial Investment:</span>
                  <span className="font-medium">
                    {formatCurrency(getInvestmentInUSD(), 'USD')} 
                    ({formatCurrency(getInvestmentInAED(), 'AED')})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Property Value:</span>
                  <span className="font-medium">{formatCurrency(propertyValue / exchangeRate, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Ownership:</span>
                  <span className="font-medium">{getOwnershipPercentage().toFixed(4)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Projected Value ({timeframe}y):</span>
                  <span className="font-bold text-primary">{formatCurrency(getTotalReturn(), 'USD')}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Our Platform */}
              <Card className="p-4 border-primary">
                <h4 className="font-semibold text-primary mb-3">Nexus Mint (Our Platform)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Minimum Investment:</span>
                    <span className="font-medium text-green-600">$100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Returns:</span>
                    <span className="font-medium text-green-600">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access:</span>
                    <span className="font-medium text-green-600">Global</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KYC Required:</span>
                    <span className="font-medium text-green-600">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currencies:</span>
                    <span className="font-medium text-green-600">Multi-currency</span>
                  </div>
                </div>
              </Card>

              {/* Traditional Real Estate */}
              <Card className="p-4 border-muted">
                <h4 className="font-semibold text-muted-foreground mb-3">Traditional REIT</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Minimum Investment:</span>
                    <span className="font-medium text-red-600">AED 2,000 (~$545)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Returns:</span>
                    <span className="font-medium text-yellow-600">8-12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access:</span>
                    <span className="font-medium text-red-600">Emirates ID Only</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KYC Required:</span>
                    <span className="font-medium text-red-600">Emirates ID</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currencies:</span>
                    <span className="font-medium text-red-600">AED Only</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Why Choose Nexus Mint?</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Highly accessible $100 minimum investment</li>
                <li>✅ No geographical restrictions - global access</li>
                <li>✅ Competitive average returns (12.5%+)</li>
                <li>✅ Multi-currency support (USD, EUR, AED, GBP)</li>
                <li>✅ Serving international investors worldwide</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}