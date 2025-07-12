import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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

  return (
    <section className="py-16 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Transparent Fee Structure</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden costs. All fees are clearly disclosed upfront so you know exactly what you're paying.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
            <TabsTrigger value="breakdown">Fee Breakdown</TabsTrigger>
            <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calculator Input */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Investment Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="investment">Investment Amount (USD)</Label>
                    <Input
                      id="investment"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                      className="text-lg mt-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                      <span className="text-sm font-medium">Investment Fee (1.5%)</span>
                      <span className="font-semibold">${fees.investmentFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                      <span className="text-sm font-medium">Annual Management (0.5%)</span>
                      <span className="font-semibold">${fees.annualManagement.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Net Investment Amount</span>
                        <span className="text-lg font-bold text-primary">
                          ${fees.netInvestment.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                        <span>Total fees (first year)</span>
                        <span>${fees.totalFirstYear.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Benefits */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    What You Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Professional Property Management</h4>
                        <p className="text-sm text-muted-foreground">Full-service management including maintenance, tenant relations, and optimization</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Blockchain Infrastructure</h4>
                        <p className="text-sm text-muted-foreground">Secure tokenization, smart contracts, and automated distributions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Regulatory Compliance</h4>
                        <p className="text-sm text-muted-foreground">Full legal and regulatory compliance across all jurisdictions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">24/7 Platform Access</h4>
                        <p className="text-sm text-muted-foreground">Real-time portfolio tracking, trading, and customer support</p>
                      </div>
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