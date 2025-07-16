import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Shield, Info, CheckCircle, Zap, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FeeStructure {
  name: string;
  percentage: number;
  description: string;
  when: string;
  calculation: string;
}

const feeStructure: FeeStructure[] = [
  {
    name: 'Investment Fee',
    percentage: 1.5,
    description: 'One-time fee when you make an investment',
    when: 'At investment',
    calculation: 'Flat 1.5% of investment amount'
  },
  {
    name: 'Annual Management Fee',
    percentage: 0.5,
    description: 'Ongoing fee for property management and platform operations',
    when: 'Annual',
    calculation: '0.5% of your investment value per year'
  },
  {
    name: 'Exit Fee',
    percentage: 0.5,
    description: 'Fee when selling tokens on the marketplace',
    when: 'When selling',
    calculation: '0.5% of sale proceeds'
  },
  {
    name: 'Performance Fee',
    percentage: 10,
    description: 'Fee on property appreciation above 8% annually',
    when: 'On appreciation',
    calculation: '10% of gains above 8% annual appreciation'
  }
];

const comparisonData = [
  {
    platform: 'Nexus',
    investmentFee: '1.5%',
    managementFee: '0.5%',
    exitFee: '0.5%',
    performanceFee: '10%*',
    totalFirstYear: '~2.0%',
    highlight: true
  },
  {
    platform: 'Traditional REIT',
    investmentFee: '0-2%',
    managementFee: '1-2%',
    exitFee: '0%',
    performanceFee: 'N/A',
    totalFirstYear: '~1.5-4%',
    highlight: false
  },
  {
    platform: 'Real Estate Crowdfunding',
    investmentFee: '0-3%',
    managementFee: '1-2%',
    exitFee: '1-3%',
    performanceFee: '10-20%',
    totalFirstYear: '~2-7%',
    highlight: false
  }
];

export function FeeTransparency() {
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [animatedValues, setAnimatedValues] = useState({ 
    investmentFee: 0, 
    annualManagement: 0, 
    totalFirstYear: 0, 
    netInvestment: 0 
  });

  const calculateFees = (amount: number) => {
    const investmentFee = amount * 0.015;
    const annualManagement = amount * 0.005;
    const totalFirstYear = investmentFee + annualManagement;
    
    return {
      investmentFee,
      annualManagement,
      totalFirstYear,
      netInvestment: amount - investmentFee
    };
  };

  const fees = calculateFees(investmentAmount);

  // Animate fee values when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(fees);
    }, 100);
    return () => clearTimeout(timer);
  }, [fees.investmentFee, fees.annualManagement, fees.totalFirstYear, fees.netInvestment]);

  const feePercentage = ((fees.totalFirstYear / investmentAmount) * 100).toFixed(2);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-orange-950/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-5xl font-bold text-foreground">
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent font-extrabold">Transparent</span> Fee Structure
            </h2>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-bounce" style={{animationDelay: '0.2s'}}>
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-orange-500/30 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Complete transparency with no hidden fees. Calculate exactly what you'll pay and understand every cost before investing. 
            Our industry-leading low fees maximize your returns.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 px-6 py-3 rounded-full border border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-800 dark:text-green-200">No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 px-6 py-3 rounded-full border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">Industry-Leading Low Rates</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-6 py-3 rounded-full border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-800 dark:text-purple-200">Full Cost Transparency</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="calculator" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <TabsTrigger value="calculator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">Fee Calculator</TabsTrigger>
            <TabsTrigger value="breakdown" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-semibold">Fee Breakdown</TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold">Market Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calculator Input */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-elegant border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Investment Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="investment" className="text-base font-medium">Investment Amount (USD)</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="investment"
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                          className="text-lg pl-10 h-12 border-primary/30 focus:border-primary"
                          placeholder="10,000"
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        {[5000, 10000, 25000, 50000].map(amount => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setInvestmentAmount(amount)}
                            className="text-xs"
                          >
                            ${amount.toLocaleString()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-lg animate-fade-in">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse shadow-md"></div>
                            <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">Investment Fee (1.5%)</span>
                          </div>
                          <span className="font-bold text-xl text-orange-700 dark:text-orange-300">${animatedValues.investmentFee.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg animate-fade-in">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md"></div>
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Annual Management (0.5%)</span>
                          </div>
                          <span className="font-bold text-xl text-blue-700 dark:text-blue-300">${animatedValues.annualManagement.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-emerald-950/50 p-6 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100">Net Investment Amount</span>
                          <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent animate-scale-in">
                            ${animatedValues.netInvestment.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-4">
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">Total fees (first year)</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-200">${animatedValues.totalFirstYear.toFixed(2)} ({feePercentage}%)</span>
                        </div>
                        <Progress 
                          value={parseFloat(feePercentage)} 
                          className="h-3 bg-emerald-100 dark:bg-emerald-900"
                          aria-label={`Fee percentage: ${feePercentage}%`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Breakdown Visual */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Fee Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span>Net Investment</span>
                        </div>
                        <span className="font-medium">{(((investmentAmount - fees.investmentFee) / investmentAmount) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Investment Fee</span>
                        </div>
                        <span className="font-medium">1.5%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Annual Management</span>
                        </div>
                        <span className="font-medium">0.5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Benefits */}
              <Card className="shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border-2 border-indigo-200 dark:border-indigo-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    What You Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 group hover:bg-accent/30 p-3 rounded-lg transition-colors">
                      <Zap className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-medium text-foreground">Professional Property Management</h4>
                        <p className="text-sm text-muted-foreground">Full-service management including maintenance, tenant relations, and optimization</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 group hover:bg-accent/30 p-3 rounded-lg transition-colors">
                      <Lock className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-medium text-foreground">Blockchain Infrastructure</h4>
                        <p className="text-sm text-muted-foreground">Secure tokenization, smart contracts, and automated distributions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 group hover:bg-accent/30 p-3 rounded-lg transition-colors">
                      <Shield className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-medium text-foreground">Regulatory Compliance</h4>
                        <p className="text-sm text-muted-foreground">Full legal and regulatory compliance across all jurisdictions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 group hover:bg-accent/30 p-3 rounded-lg transition-colors">
                      <Globe className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-medium text-foreground">24/7 Platform Access</h4>
                        <p className="text-sm text-muted-foreground">Real-time portfolio tracking, trading, and customer support</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-3">Ready to start investing?</p>
                      <Button className="w-full shadow-elegant hover:shadow-premium transition-all">
                        Start Investing Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {feeStructure.map((fee, index) => (
                <Card key={index} className="shadow-elegant hover:shadow-premium transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{fee.name}</h3>
                      <Badge variant="outline">{fee.percentage}%</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{fee.description}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">When:</span>
                        <span className="font-medium">{fee.when}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Calculation:</span>
                        <InfoTooltip content={fee.calculation}>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </InfoTooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-subtle">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Fee Notes</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Performance fees only apply to gains above 8% annual appreciation</p>
                  <p>• All fees are calculated transparently and deducted automatically</p>
                  <p>• No hidden charges or surprise fees</p>
                  <p>• Early exit fees may apply within the first 90 days</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Platform</th>
                    <th className="text-left py-3 px-4 font-semibold">Investment Fee</th>
                    <th className="text-left py-3 px-4 font-semibold">Management Fee</th>
                    <th className="text-left py-3 px-4 font-semibold">Exit Fee</th>
                    <th className="text-left py-3 px-4 font-semibold">Performance Fee</th>
                    <th className="text-left py-3 px-4 font-semibold">Total (First Year)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-border ${row.highlight ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {row.platform}
                          {row.highlight && <Badge variant="default">Nexus</Badge>}
                        </div>
                      </td>
                      <td className="py-4 px-4">{row.investmentFee}</td>
                      <td className="py-4 px-4">{row.managementFee}</td>
                      <td className="py-4 px-4">{row.exitFee}</td>
                      <td className="py-4 px-4">{row.performanceFee}</td>
                      <td className="py-4 px-4 font-semibold">{row.totalFirstYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Card className="bg-gradient-subtle">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Why Nexus Offers Better Value</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Lower Total Costs</h4>
                    <p className="text-sm text-muted-foreground">
                      Our integrated approach eliminates many traditional intermediary fees
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Better Liquidity</h4>
                    <p className="text-sm text-muted-foreground">
                      Active marketplace with lower exit fees compared to crowdfunding platforms
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Global Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Access to international properties without traditional barriers
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Transparent Technology</h4>
                    <p className="text-sm text-muted-foreground">
                      Blockchain-based transparency eliminates hidden costs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}