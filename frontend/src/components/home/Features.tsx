import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Building2, TrendingUp, Link2, CheckCircle, Award, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      name: 'Accessible Investing',
      description: 'Start with AED 500 from anywhere—instant KYC, no Emirates ID needed.',
      icon: CreditCard,
      benefits: ['Low AED 500 minimum', 'Global accessibility', 'Instant KYC process'],
      highlight: 'AED 500 Min',
      gradient: 'from-blue-500/20 via-blue-400/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-white',
      borderGlow: 'hover:shadow-blue-500/25',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    },
    {
      name: 'Curated Grade-A Assets',
      description: 'Hand-picked Dubai properties vetted by certified appraisers.',
      icon: Building2,
      benefits: ['Expert property selection', 'Certified appraisals', 'Premium Dubai locations'],
      highlight: 'Grade-A Only',
      gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
      borderGlow: 'hover:shadow-emerald-500/25',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    {
      name: 'Earn & Compound',
      description: 'Quarterly rental payouts auto-reinvest for seamless compounding.',
      icon: TrendingUp,
      benefits: ['Quarterly rental income', 'Auto-reinvestment', 'Compound growth'],
      highlight: '8-12% p.a.',
      gradient: 'from-orange-500/20 via-orange-400/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconColor: 'text-white',
      borderGlow: 'hover:shadow-orange-500/25',
      badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    },
    {
      name: 'Advanced Tokenization',
      description: 'On-chain fractional shares with instant settlement and full transparency.',
      icon: Link2,
      benefits: ['Blockchain-powered', 'Instant settlement', 'Full transparency'],
      highlight: '24/7 Trading',
      gradient: 'from-purple-500/20 via-purple-400/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-white',
      borderGlow: 'hover:shadow-purple-500/25',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    }
  ];

  const stats = [
    { label: '5+', sublabel: 'Properties in Pipeline', icon: Building2, color: 'text-blue-600' },
    { label: '100+', sublabel: 'Waitlist Investors', icon: TrendingUp, color: 'text-emerald-600' },
    { label: '8–12%', sublabel: 'Projected Returns p.a.', icon: TrendingUp, color: 'text-orange-600' }
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-background via-accent/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced Header with Modern Styling */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative max-w-4xl mx-auto">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-orange-500/5 rounded-3xl blur-xl" />
            
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                {/* Main Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-3">
                  Why Nexus Mint?
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-500 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
                  <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
                </div>
              </div>
              
              {/* Subtitle */}
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                Discover the future of real estate investment through blockchain innovation
              </p>
            </div>
          </div>
        </div>
        
        {/* Harmonized Core Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={feature.name} 
              className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 hover:border-white/40 ${feature.borderGlow} transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredFeature(feature.name)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Unified Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`} />

              <CardHeader className="text-center relative pt-8 pb-4">
                {/* Synchronized Icon Design */}
                <div className={`mx-auto h-20 w-20 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative shadow-xl`}>
                  <feature.icon className={`h-10 w-10 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  
                  {/* Synchronized Pulse Effect */}
                  {hoveredFeature === feature.name && (
                    <div className={`absolute -inset-2 ${feature.iconBg} rounded-2xl animate-ping opacity-30`} />
                  )}
                  
                  {/* Consistent Sparkle Position */}
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-white/80" />
                </div>
                
                <CardTitle className="text-lg mb-3 group-hover:text-foreground transition-colors duration-300 font-bold">
                  {feature.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center px-6 pb-6 relative z-10">
                <CardDescription className="text-muted-foreground leading-relaxed mb-4 text-sm group-hover:text-foreground/80 transition-colors duration-300">
                  {feature.description}
                </CardDescription>
                
                {/* Synchronized Benefits Layout */}
                <div className="space-y-2 mb-4">
                  {feature.benefits.slice(0, 2).map((benefit, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Consistent Hover Button */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button variant="ghost" size="sm" className="text-foreground hover:bg-white/20 rounded-full text-xs px-4">
                    Learn More <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Streamlined Trust Indicator */}
        <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-100 border-2 border-blue-200 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden max-w-2xl mx-auto mb-16">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="mx-auto w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative shadow-lg">
            <Users className="h-10 w-10 text-blue-600" />
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
          </div>
          
          <h4 className="font-bold text-xl mb-3 text-foreground">Join the Future of Real Estate Investment</h4>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-lg mx-auto">
            Be part of a revolutionary platform that's democratizing access to premium Dubai real estate through blockchain technology and fractional ownership.
          </p>
          <Badge className="bg-blue-200 text-blue-800 font-bold px-4 py-1 rounded-full shadow-md">
            Early Access Available
          </Badge>
        </Card>

      </div>
    </div>
  );
}