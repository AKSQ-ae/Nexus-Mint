import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Search, TrendingUp, DollarSign, Shield, Users, Globe, BarChart3, Star, CheckCircle, Award, Zap } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ProgressiveSection } from '@/components/ui/progressive-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      name: 'Low Entry Investment',
      description: 'Start with just $100. Fractional ownership makes premium real estate accessible to everyone.',
      icon: Wallet,
      details: 'No hefty down payments or million-dollar minimums. Own a piece of premium Dubai real estate with pocket change.',
      benefits: ['$100 minimum investment', 'Instant portfolio diversification', 'No hidden fees or charges'],
      highlight: 'Start from $100',
      color: 'green'
    },
    {
      name: 'Expert Property Curation',
      description: 'Our team of certified appraisers and market analysts select only the highest-performing properties.',
      icon: Search,
      details: 'Every property undergoes rigorous due diligence including market analysis, legal verification, and yield projections.',
      benefits: ['Professional property audits', 'Market performance analysis', 'Legal title verification'],
      highlight: '99% Success Rate',
      color: 'blue'
    },
    {
      name: 'Automated Returns',
      description: 'Receive quarterly rental distributions and benefit from property appreciation automatically.',
      icon: TrendingUp,
      details: 'Returns are calculated and distributed automatically. No landlord duties or property management required.',
      benefits: ['12-18% expected annual returns', 'Monthly dividend payments', 'Zero management hassle'],
      highlight: 'Up to 18% Returns',
      color: 'primary'
    },
    {
      name: 'Blockchain Security',
      description: 'Your ownership is secured on blockchain with full transparency and regulatory compliance.',
      icon: Shield,
      details: 'Smart contracts ensure transparent transactions while UAE regulations protect your investments.',
      benefits: ['Immutable ownership records', 'Full transaction transparency', 'Regulatory compliance'],
      highlight: 'Bank-Grade Security',
      color: 'orange'
    },
    {
      name: 'Global Accessibility',
      description: 'Invest in UAE real estate from anywhere in the world with our compliant, user-friendly platform.',
      icon: Globe,
      details: 'Access premium Middle Eastern real estate markets regardless of your location or nationality.',
      benefits: ['24/7 global access', 'Multi-currency support', 'International compliance'],
      highlight: '100+ Countries',
      color: 'purple'
    },
    {
      name: 'Real-Time Analytics',
      description: 'Track your investments with advanced analytics, market insights, and performance metrics.',
      icon: BarChart3,
      details: 'Comprehensive dashboard with real-time property values, market trends, and portfolio performance.',
      benefits: ['Live performance tracking', 'Market analysis tools', 'Detailed reporting'],
      highlight: 'Live Updates',
      color: 'cyan'
    },
    {
      name: 'Liquidity Options',
      description: 'Trade tokens on secondary markets or hold for long-term appreciation - your choice.',
      icon: DollarSign,
      details: 'Unlike traditional real estate, you can exit investments relatively quickly through token trading.',
      benefits: ['Secondary market trading', 'Flexible exit strategies', 'Improved liquidity over physical real estate'],
      highlight: '24/7 Trading',
      color: 'emerald'
    },
    {
      name: 'Community & Support',
      description: 'Join a community of investors with dedicated support and educational resources.',
      icon: Users,
      details: 'Access investor education, market insights, and professional support throughout your journey.',
      benefits: ['Dedicated investor support', 'Educational resources', 'Community forums'],
      highlight: '24/7 Support',
      color: 'rose'
    },
  ];


  return (
    <div className="py-20 bg-gradient-to-b from-background via-accent/5 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Star className="h-10 w-10 text-primary animate-pulse" />
              <div className="absolute inset-0 h-10 w-10 text-primary animate-ping opacity-20">
                <Star className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-foreground">Why Choose <span className="gradient-text">Nexus Mint</span></h2>
            <div className="relative">
              <Zap className="h-10 w-10 text-primary animate-pulse" />
              <div className="absolute inset-0 h-10 w-10 text-primary animate-ping opacity-20">
                <Zap className="h-10 w-10" />
              </div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            The world's most advanced blockchain-powered real estate investment platform, democratizing property ownership for the next generation of investors
          </p>
          
          {/* Key Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-gradient-subtle px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>15,000+ Active Investors</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-subtle px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>$500M+ Assets Under Management</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-subtle px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>100+ Countries Supported</span>
            </div>
          </div>
        </div>
        
        {/* Core Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.slice(0, 4).map((feature, index) => (
            <Card 
              key={feature.name} 
              className="group hover:shadow-premium transition-all duration-500 hover:-translate-y-2 border-l-4 border-l-primary/30 hover:border-l-primary bg-gradient-to-br from-background to-accent/10"
              onMouseEnter={() => setHoveredFeature(feature.name)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader className="text-center relative overflow-hidden">
                <div className="absolute top-0 right-0">
                  <Badge variant="secondary" className="text-xs">
                    {feature.highlight}
                  </Badge>
                </div>
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative">
                  <feature.icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                  {hoveredFeature === feature.name && (
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                  {feature.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </CardDescription>
                <div className="space-y-2">
                  {feature.benefits.slice(0, 2).map((benefit, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features Section */}
        <ProgressiveSection
          title="Advanced Features & Capabilities"
          preview="Explore our cutting-edge features including global accessibility, real-time analytics, flexible liquidity options, and comprehensive community support that set us apart from traditional real estate investing."
          variant="card"
          className="mb-16"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {features.slice(4).map((feature, index) => (
              <Card 
                key={feature.name} 
                className="group hover:shadow-premium transition-all duration-500 hover:-translate-y-2 border-l-4 border-l-secondary/30 hover:border-l-secondary bg-gradient-to-br from-background to-accent/10"
                onMouseEnter={() => setHoveredFeature(feature.name)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <Badge variant="outline" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <div className="mx-auto h-20 w-20 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative">
                    <feature.icon className="h-10 w-10 text-secondary group-hover:scale-110 transition-transform" />
                    {hoveredFeature === feature.name && (
                      <div className="absolute inset-0 bg-secondary/20 rounded-2xl animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CardTitle className="text-xl group-hover:text-secondary transition-colors">
                      {feature.name}
                    </CardTitle>
                    <InfoTooltip content={
                      <div className="space-y-3 max-w-xs">
                        <p className="font-medium">{feature.details}</p>
                        <div>
                          <p className="font-medium mb-2">Key Benefits:</p>
                          <ul className="space-y-1">
                            {feature.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
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
                  <CardDescription className="text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {feature.benefits.slice(0, 2).map((benefit, i) => (
                      <div key={i} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ProgressiveSection>

        
        {/* Enhanced Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-premium transition-all duration-300 group">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-bold text-lg mb-2">UAE SCA Compliant</h4>
            <p className="text-sm text-muted-foreground mb-4">Fully regulated by UAE Securities & Commodities Authority</p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Verified ✓</Badge>
          </Card>
          
          <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-premium transition-all duration-300 group">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-lg mb-2">15,000+ Investors</h4>
            <p className="text-sm text-muted-foreground mb-4">Growing global community of successful real estate investors</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Growing Daily</Badge>
          </Card>
          
          <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-premium transition-all duration-300 group">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-lg mb-2">$500M+ Assets</h4>
            <p className="text-sm text-muted-foreground mb-4">Total assets under management across global portfolio</p>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">Expanding</Badge>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Real Estate Investment Journey?</h3>
              <p className="text-muted-foreground mb-6">Join thousands of investors who are already building wealth through smart real estate investments</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 shadow-elegant hover:shadow-premium transition-all">
                  Start Investing Today
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}