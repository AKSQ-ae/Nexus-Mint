import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Search, TrendingUp, DollarSign, Shield, Users, Globe, BarChart3 } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export function Features() {
  const features = [
    {
      name: 'Low Entry Investment',
      description: 'Start with just $100 USD (≈ AED 367). Fractional ownership makes premium real estate accessible to everyone.',
      icon: Wallet,
      details: 'No hefty down payments or million-dollar minimums. Own a piece of premium Dubai real estate with pocket change.',
      benefits: ['$100 minimum investment', 'Instant portfolio diversification', 'No hidden fees or charges']
    },
    {
      name: 'Expert Property Curation',
      description: 'Our team of certified appraisers and market analysts select only the highest-performing properties.',
      icon: Search,
      details: 'Every property undergoes rigorous due diligence including market analysis, legal verification, and yield projections.',
      benefits: ['Professional property audits', 'Market performance analysis', 'Legal title verification']
    },
    {
      name: 'Automated Returns',
      description: 'Receive quarterly rental distributions and benefit from property appreciation automatically.',
      icon: TrendingUp,
      details: 'Returns are calculated and distributed automatically. No landlord duties or property management required.',
      benefits: ['8-15% expected annual returns', 'Quarterly dividend payments', 'Zero management hassle']
    },
    {
      name: 'Blockchain Security',
      description: 'Your ownership is secured on blockchain with full transparency and regulatory compliance.',
      icon: Shield,
      details: 'Smart contracts ensure transparent transactions while UAE regulations protect your investments.',
      benefits: ['Immutable ownership records', 'Full transaction transparency', 'Regulatory compliance']
    },
    {
      name: 'Global Accessibility',
      description: 'Invest in UAE real estate from anywhere in the world with our compliant, user-friendly platform.',
      icon: Globe,
      details: 'Access premium Middle Eastern real estate markets regardless of your location or nationality.',
      benefits: ['24/7 global access', 'Multi-currency support', 'International compliance']
    },
    {
      name: 'Real-Time Analytics',
      description: 'Track your investments with advanced analytics, market insights, and performance metrics.',
      icon: BarChart3,
      details: 'Comprehensive dashboard with real-time property values, market trends, and portfolio performance.',
      benefits: ['Live performance tracking', 'Market analysis tools', 'Detailed reporting']
    },
    {
      name: 'Liquidity Options',
      description: 'Trade tokens on secondary markets or hold for long-term appreciation - your choice.',
      icon: DollarSign,
      details: 'Unlike traditional real estate, you can exit investments relatively quickly through token trading.',
      benefits: ['Secondary market trading', 'Flexible exit strategies', 'Improved liquidity over physical real estate']
    },
    {
      name: 'Community & Support',
      description: 'Join a community of investors with dedicated support and educational resources.',
      icon: Users,
      details: 'Access investor education, market insights, and professional support throughout your journey.',
      benefits: ['Dedicated investor support', 'Educational resources', 'Community forums']
    },
  ];

  return (
    <div className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Nexus Mint</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The premier blockchain-powered real estate investment platform making property ownership accessible to everyone
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.name} className="card-premium group">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  <InfoTooltip content={
                    <div className="space-y-3 max-w-xs">
                      <p className="font-medium">{feature.details}</p>
                      <div>
                        <p className="font-medium mb-2">Key Benefits:</p>
                        <ul className="space-y-1">
                          {feature.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  } />
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-xl border">
            <Shield className="h-8 w-8 text-success mx-auto mb-3" />
            <h4 className="font-semibold mb-2">UAE SCA Compliant</h4>
            <p className="text-sm text-muted-foreground">Fully regulated by UAE Securities & Commodities Authority</p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-xl border">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">15,000+ Investors</h4>
            <p className="text-sm text-muted-foreground">Growing community of successful real estate investors</p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-xl border">
            <BarChart3 className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">$500M+ Assets</h4>
            <p className="text-sm text-muted-foreground">Total assets under management across portfolio</p>
          </div>
        </div>
      </div>
    </div>
  );
}