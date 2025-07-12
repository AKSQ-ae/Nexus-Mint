import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Search, TrendingUp, DollarSign, Shield, Users, Globe, BarChart3, Star, CheckCircle, Award, Zap, ArrowRight, Sparkles, Crown, Bolt } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ProgressiveSection } from '@/components/ui/progressive-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      name: 'Low Entry Investment',
      description: 'Start with just $100. Fractional ownership makes premium real estate accessible to everyone.',
      icon: Wallet,
      details: 'No hefty down payments or million-dollar minimums. Own a piece of premium Dubai real estate with pocket change.',
      benefits: ['$100 minimum investment', 'Instant portfolio diversification', 'No hidden fees or charges'],
      highlight: 'Start from $100',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      badge: 'bg-green-100 text-green-800'
    },
    {
      name: 'Expert Property Curation',
      description: 'Our team of certified appraisers and market analysts select only the highest-performing properties.',
      icon: Search,
      details: 'Every property undergoes rigorous due diligence including market analysis, legal verification, and yield projections.',
      benefits: ['Professional property audits', 'Market performance analysis', 'Legal title verification'],
      highlight: '99% Success Rate',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Automated Returns',
      description: 'Receive quarterly rental distributions and benefit from property appreciation automatically.',
      icon: TrendingUp,
      details: 'Returns are calculated and distributed automatically. No landlord duties or property management required.',
      benefits: ['12-18% expected annual returns', 'Monthly dividend payments', 'Zero management hassle'],
      highlight: 'Up to 18% Returns',
      color: 'primary',
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800'
    },
    {
      name: 'Blockchain Security',
      description: 'Your ownership is secured on blockchain with full transparency and regulatory compliance.',
      icon: Shield,
      details: 'Smart contracts ensure transparent transactions while UAE regulations protect your investments.',
      benefits: ['Immutable ownership records', 'Full transaction transparency', 'Regulatory compliance'],
      highlight: 'Bank-Grade Security',
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800'
    }
  ];

  const stats = [
    { label: '15,000+', sublabel: 'Active Investors', icon: Users, color: 'text-green-500' },
    { label: '$500M+', sublabel: 'Assets Under Management', icon: DollarSign, color: 'text-blue-500' },
    { label: '100+', sublabel: 'Countries Supported', icon: Globe, color: 'text-purple-500' }
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-background via-accent/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced Header with Animation */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Star className="h-12 w-12 text-primary animate-spin-slow" />
              <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
            </div>
            <div className="text-center">
              <h2 className="text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2">
                Why Choose <span className="bg-gradient-to-r from-primary to-orange-accent bg-clip-text text-transparent">Nexus Mint</span>
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-primary to-orange-accent mx-auto rounded-full animate-pulse" />
            </div>
            <div className="relative">
              <Bolt className="h-12 w-12 text-orange-accent animate-bounce" />
              <Crown className="h-6 w-6 text-orange-accent absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <p className="text-2xl text-muted-foreground max-w-5xl mx-auto leading-relaxed mb-12 font-light">
            The world's most advanced blockchain-powered real estate investment platform,
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-accent bg-clip-text text-transparent font-semibold">
              democratizing property ownership for the next generation of investors
            </span>
          </p>
          
          {/* Enhanced Stats with Animation */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-foreground">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced Core Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={feature.name} 
              className={`group relative overflow-hidden bg-gradient-to-br ${feature.bgGradient} border-2 ${feature.borderColor} hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:rotate-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredFeature(feature.name)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Highlight Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className={`${feature.badge} font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-bounce`}>
                  {feature.highlight}
                </Badge>
              </div>

              <CardHeader className="text-center relative pt-8 pb-4">
                {/* Enhanced Icon Container */}
                <div className={`mx-auto h-24 w-24 ${feature.iconBg} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative shadow-lg`}>
                  <feature.icon className={`h-12 w-12 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  
                  {/* Pulse Animation on Hover */}
                  {hoveredFeature === feature.name && (
                    <>
                      <div className={`absolute inset-0 ${feature.iconBg} rounded-3xl animate-ping opacity-50`} />
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-orange-accent/20 rounded-3xl animate-pulse" />
                    </>
                  )}
                  
                  {/* Floating Sparkles */}
                  <Sparkles className={`absolute -top-1 -right-1 h-4 w-4 ${feature.iconColor} animate-pulse`} />
                </div>
                
                <CardTitle className={`text-xl mb-4 group-hover:${feature.iconColor} transition-colors duration-300 font-bold`}>
                  {feature.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center px-6 pb-6">
                <CardDescription className="text-muted-foreground leading-relaxed mb-6 text-sm">
                  {feature.description}
                </CardDescription>
                
                {/* Benefits List */}
                <div className="space-y-3">
                  {feature.benefits.slice(0, 2).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 animate-pulse" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Effect - Learn More */}
                <div className={`mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
                  <Button variant="ghost" size="sm" className={`${feature.iconColor} hover:bg-white/20 rounded-full`}>
                    Learn More <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>

              {/* Animated Border */}
              <div className={`absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} 
                   style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
            </Card>
          ))}
        </div>

        {/* Enhanced Trust Indicators with Better Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Shield, title: 'UAE SCA Compliant', desc: 'Fully regulated by UAE Securities & Commodities Authority', badge: 'Verified ✓', color: 'green' },
            { icon: Users, title: '15,000+ Investors', desc: 'Growing global community of successful real estate investors', badge: 'Growing Daily', color: 'blue' },
            { icon: Award, title: '$500M+ Assets', desc: 'Total assets under management across global portfolio', badge: 'Expanding', color: 'purple' }
          ].map((item, index) => (
            <Card key={index} className={`text-center p-8 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border-2 border-${item.color}-200 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden`}>
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className={`mx-auto w-20 h-20 bg-${item.color}-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative shadow-lg`}>
                <item.icon className={`h-10 w-10 text-${item.color}-600`} />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-orange-accent/20 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
              </div>
              
              <h4 className="font-bold text-xl mb-3 text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
              <Badge className={`bg-${item.color}-200 text-${item.color}-800 font-bold px-4 py-1 rounded-full shadow-md`}>
                {item.badge}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/20 via-orange-accent/10 to-primary/20 border-2 border-primary/30 max-w-4xl mx-auto relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-orange-accent/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-accent" />
            
            <CardContent className="p-12 relative">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Zap className="h-8 w-8 text-primary animate-pulse" />
                <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Ready to Start Your Real Estate Investment Journey?
                </h3>
                <Star className="h-8 w-8 text-orange-accent animate-spin-slow" />
              </div>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of investors who are already building wealth through smart, secure, and accessible real estate investments
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-orange-accent hover:from-primary/90 hover:to-orange-accent/90 shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 rounded-full">
                  Start Investing Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 rounded-full transition-all duration-300 hover:scale-105">
                  Learn More
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}