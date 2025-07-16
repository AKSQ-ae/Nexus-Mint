import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Users, Play, Building, DollarSign, ChartLine, RefreshCw } from 'lucide-react';
import { InteractiveLogo } from '@/components/ui/interactive-logo';
import branding from '@/config/branding.config';

export function Hero() {
  console.log('Hero component rendering with journey section');
  
  return (
    <section className="bg-white text-foreground relative overflow-hidden">
      {/* Premium animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-secondary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-32 lg:py-40 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Stylish NEXUS MINT Logo */}
          <div className="animate-fade-in-up flex justify-center mb-8">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.15em] uppercase transform hover:scale-105 transition-all duration-500 relative">
              <span className="text-blue-600">{branding.shortName.toUpperCase()}</span>
            </h1>
          </div>
          
          {/* Own. Earn. Multiply Motto */}
          <div className="animate-fade-in-up flex justify-center mb-16" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-4 text-lg md:text-xl lg:text-2xl font-semibold">
              <span className="text-blue-primary hover:scale-105 transition-all duration-300 cursor-default">Own</span>
              <div className="w-2 h-2 bg-orange-accent rounded-full animate-pulse"></div>
              <span className="text-orange-accent hover:scale-105 transition-all duration-300 cursor-default">Earn</span>
              <div className="w-2 h-2 bg-blue-secondary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-blue-secondary hover:scale-105 transition-all duration-300 cursor-default">Multiply</span>
            </div>
          </div>
          
          {/* Step-based transaction flow */}
          <div className="mb-16 max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h3 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
                Your Journey to Real Estate Wealth
              </h3>
              <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
                Three simple steps to transform your investment approach
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105" style={{animationDelay: '0.5s'}}>
                <div className="absolute top-4 right-4 text-6xl font-bold text-orange-500/10">01</div>
                <div className="step-icon mx-auto mb-6 relative z-10 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors relative z-10">
                  Acquire Your Slice
                </h4>
                <p className="text-gray-600 font-medium leading-relaxed text-lg relative z-10">
                  Start with AED 500 to own on-chain, fractional shares in prime UAE real estate
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105" style={{animationDelay: '0.6s'}}>
                <div className="absolute top-4 right-4 text-6xl font-bold text-blue-600/10">02</div>
                <div className="step-icon mx-auto mb-6 relative z-10 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors relative z-10">
                  Earn 8–12% p.a.
                </h4>
                 <p className="text-gray-600 font-medium leading-relaxed text-lg relative z-10">
                   {`Earn 8–12% p.a. rental income, paid quarterly into your ${branding.shortName} Wallet — fully transparent, zero paperwork.`}
                 </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105" style={{animationDelay: '0.7s'}}>
                <div className="absolute top-4 right-4 text-6xl font-bold text-orange-500/10">03</div>
                <div className="step-icon mx-auto mb-6 relative z-10 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-300 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-500 transition-colors relative z-10">
                  Trade & Multiply
                </h4>
                <p className="text-gray-600 font-medium leading-relaxed text-lg relative z-10">
                  Trade & Multiply on our marketplace, reinvesting instantly to watch your wealth compound as property values rise.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 leading-none text-foreground">
              <span className="block bg-gradient-to-r from-coral via-secondary to-coral bg-clip-text text-transparent font-extrabold">A Regulated Real Estate Investment Platform</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-inter leading-relaxed max-w-3xl mx-auto">
              Start from AED 500. Fractional UAE Real Estate. Instant Liquidity. Regulated Security.
            </p>
          </div>
          
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 items-center justify-center max-w-lg mx-auto" style={{animationDelay: '0.7s'}}>
            <Link to="/auth/signup" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/properties" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full sm:w-auto bg-white/90 hover:bg-white">
                Browse Properties
              </Button>
            </Link>
          </div>
          
          {/* Early Access Section */}
          <div className="animate-fade-in-up mt-16 text-center" style={{animationDelay: '0.9s'}}>
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">Regulated Launch</h2>
            <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto mb-8">
              25,000+ verified investors from 30 countries. Transparent operations since 2024.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-primary/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-playfair font-bold text-blue-primary mb-2">
                  <span className="count-up" data-target="5">5</span>+
                </div>
                <p className="text-muted-foreground font-inter font-medium mb-3">Properties in Pipeline</p>
                <svg className="w-full h-6 mx-auto" viewBox="0 0 100 20">
                  <polyline 
                    points="0,15 20,10 40,12 60,6 80,8 100,5"
                    fill="none" 
                    stroke="hsl(var(--blue-primary))" 
                    strokeWidth="2"
                    className="animate-draw-line"
                  />
                </svg>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-primary/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-playfair font-bold text-blue-primary mb-2">
                  <span className="count-up" data-target="100">100</span>+
                </div>
                <p className="text-muted-foreground font-inter font-medium mb-3">Invited Investors</p>
                <svg className="w-full h-6 mx-auto" viewBox="0 0 100 20">
                  <polyline 
                    points="0,12 20,14 40,10 60,13 80,9 100,11"
                    fill="none" 
                    stroke="hsl(var(--blue-primary))" 
                    strokeWidth="2"
                    className="animate-draw-line"
                  />
                </svg>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-accent via-coral to-orange-accent/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <ChartLine className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-playfair font-bold text-orange-accent mb-2">
                  <span className="count-up" data-target="8">8</span>–<span className="count-up" data-target="12">12</span>%
                </div>
                <p className="text-muted-foreground font-inter font-medium mb-3">Projected Returns p.a.</p>
                <svg className="w-full h-6 mx-auto" viewBox="0 0 100 20">
                  <polyline 
                    points="0,18 20,16 40,12 60,10 80,7 100,5"
                    fill="none" 
                    stroke="hsl(var(--orange-accent))" 
                    strokeWidth="2"
                    className="animate-draw-line"
                  />
                </svg>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-2xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary via-coral to-secondary/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <RefreshCw className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-2">
                  24/7
                </div>
                <p className="text-muted-foreground font-inter font-medium mb-3">Liquidity</p>
                <p className="text-sm text-muted-foreground font-inter">Trade anytime, instant settlement</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button variant="cta" size="xl">
                Request Early Access
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground font-inter">
                Secure your spot.
              </p>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
}