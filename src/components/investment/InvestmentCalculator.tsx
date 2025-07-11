import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, DollarSign, PieChart, Target } from 'lucide-react';
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
}

export function InvestmentCalculator({ 
  propertyValue = 2500000, // AED
  expectedReturn = 12.5, // %
  minimumInvestment = 100, // USD
  className = ""
}: CalculatorProps) {
  const [investment, setInvestment] = useState(minimumInvestment);
  const [currency, setCurrency] = useState<'USD' | 'AED'>('USD');
  const [timeframe, setTimeframe] = useState(5); // years
  const [exchangeRate, setExchangeRate] = useState(3.67);
  
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
            Higher returns than PRYPCO
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
            <TabsTrigger value="compare">vs PRYPCO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculate" className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment">Investment Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="investment"
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value) || minimumInvestment)}
                    min={minimumInvestment}
                    className="flex-1"
                  />
                  <div className="flex">
                    <Button
                      variant={currency === 'USD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrency('USD')}
                      className="rounded-r-none"
                    >
                      USD
                    </Button>
                    <Button
                      variant={currency === 'AED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrency('AED')}
                      className="rounded-l-none"
                    >
                      AED
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe">Investment Period (Years)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={timeframe}
                  onChange={(e) => setTimeframe(Number(e.target.value) || 1)}
                  min={1}
                  max={20}
                />
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
                  }}
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

              {/* PRYPCO */}
              <Card className="p-4 border-muted">
                <h4 className="font-semibold text-muted-foreground mb-3">PRYPCO Mint</h4>
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
                <li>✅ 5.45x more accessible ($100 vs $545 minimum)</li>
                <li>✅ No Emirates ID requirement - global access</li>
                <li>✅ Higher average returns (12.5% vs 8-12%)</li>
                <li>✅ Multi-currency support (USD, EUR, AED, GBP)</li>
                <li>✅ Target PRYPCO's 6,000+ international waitlist</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}