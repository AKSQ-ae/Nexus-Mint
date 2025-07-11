import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  Smartphone,
  Bitcoin,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  Globe,
  Apple,
  Wallet
} from 'lucide-react';

export function EnhancedPaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe');

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Cards',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      fees: '2.9% + $0.30',
      speed: 'Instant',
      security: 'Bank-grade encryption',
      availability: 'Global',
      features: ['Instant confirmation', 'Chargeback protection', '3D Secure'],
      supported: ['USD', 'AED', 'EUR', 'GBP']
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: Apple,
      description: 'Secure payments with Touch/Face ID',
      fees: '2.9% + $0.30',
      speed: 'Instant',
      security: 'Biometric authentication',
      availability: 'iOS devices',
      features: ['Biometric security', 'No card details shared', 'One-touch payment'],
      supported: ['USD', 'AED', 'EUR']
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      icon: Smartphone,
      description: 'Quick payments with Google account',
      fees: '2.9% + $0.30',
      speed: 'Instant',
      security: 'Tokenized transactions',
      availability: 'Android/Web',
      features: ['Tokenized security', 'Cross-platform', 'Quick setup'],
      supported: ['USD', 'AED', 'EUR']
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Bitcoin,
      description: 'Bitcoin, Ethereum, USDC, USDT',
      fees: '1.5%',
      speed: '10-30 minutes',
      security: 'Blockchain verified',
      availability: 'Global',
      features: ['Lower fees', 'Decentralized', 'Global access'],
      supported: ['BTC', 'ETH', 'USDC', 'USDT']
    }
  ];

  const advantages = [
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Investment confirmed immediately, no 24-hour waiting period'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'All payments protected by industry-leading security protocols'
    },
    {
      icon: Globe,
      title: 'Global Acceptance',
      description: 'Multiple currencies and payment methods worldwide'
    },
    {
      icon: CheckCircle,
      title: 'Zero Chargebacks',
      description: 'Blockchain settlement eliminates payment disputes'
    }
  ];

  const comparisonData = [
    {
      feature: 'Settlement Time',
      nexus: 'Instant',
      traditional: '24-72 hours',
      advantage: true
    },
    {
      feature: 'Payment Methods',
      nexus: '4+ Options',
      traditional: 'Bank transfer only',
      advantage: true
    },
    {
      feature: 'Global Access',
      nexus: 'Worldwide',
      traditional: 'Limited regions',
      advantage: true
    },
    {
      feature: 'Transaction Fees',
      nexus: '1.5-2.9%',
      traditional: '3-5%',
      advantage: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Methods</h2>
          <p className="text-muted-foreground">Multiple secure payment options with instant confirmation</p>
        </div>
      </div>

      <Tabs defaultValue="methods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methods">Payment Options</TabsTrigger>
          <TabsTrigger value="advantages">Advantages</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <Card 
                  key={method.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{method.name}</CardTitle>
                          <CardDescription className="text-sm">{method.description}</CardDescription>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Fees</p>
                        <p className="font-medium">{method.fees}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Speed</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {method.speed}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Security</p>
                        <p className="font-medium flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {method.security}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Availability</p>
                        <p className="font-medium flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {method.availability}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {method.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Supported</p>
                      <div className="flex flex-wrap gap-1">
                        {method.supported.map((currency, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {currency}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={isSelected ? "default" : "outline"}
                    >
                      {isSelected ? 'Selected' : 'Select Method'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="advantages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enhanced Payment Experience
              </CardTitle>
              <CardDescription>
                Superior payment infrastructure for modern real estate investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advantages.map((advantage, index) => {
                  const Icon = advantage.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{advantage.title}</h3>
                        <p className="text-sm text-muted-foreground">{advantage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">PCI DSS Level 1</p>
                  <p className="text-sm text-muted-foreground">Highest security standard</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">SOC 2 Compliant</p>
                  <p className="text-sm text-muted-foreground">Audited security controls</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">Global Licenses</p>
                  <p className="text-sm text-muted-foreground">Regulatory compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Infrastructure Comparison</CardTitle>
              <CardDescription>
                See how our payment system compares to traditional platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Feature</th>
                      <th className="text-left p-3">Nexus Platform</th>
                      <th className="text-left p-3">Traditional Platforms</th>
                      <th className="text-center p-3">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{row.feature}</td>
                        <td className="p-3 text-green-600 font-medium">{row.nexus}</td>
                        <td className="p-3 text-muted-foreground">{row.traditional}</td>
                        <td className="p-3 text-center">
                          {row.advantage && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}