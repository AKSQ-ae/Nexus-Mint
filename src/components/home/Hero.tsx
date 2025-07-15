import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Users, Play, Building, DollarSign, ChartLine, RefreshCw, Sparkles, Target, Zap } from 'lucide-react';
import { InteractiveLogo } from '@/components/ui/interactive-logo';

export function Hero() {
  console.log('Hero component rendering with journey section');
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full blur-3xl animate-float-delay-1"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-br from-blue-300/10 to-orange-300/10 rounded-full blur-3xl animate-float-delay-2"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-pulse-fast"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse-slow"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced NEXUS MINT Logo */}
          <div className="animate-fade-in-up flex justify-center mb-12">
            <div className="relative group">
              <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-[0.15em] uppercase transform hover:scale-105 transition-all duration-700 relative">
                <span className="text-blue-600 group-hover:text-blue-700 transition-colors duration-500">NEXUS</span>
                <span className="text-orange-500 ml-2 lg:ml-4 group-hover:text-orange-600 transition-colors duration-500">MINT</span>
              </h1>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-orange-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          
          {/* Enhanced Own. Earn. Multiply Motto */}
          <div className="animate-fade-in-up flex justify-center mb-16" style={{animationDelay: '0.2s'}}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-lg md:text-xl lg:text-2xl font-semibold">
              <div className="flex items-center gap-2 group">
                <span className="text-blue-primary group-hover:scale-110 transition-all duration-300 cursor-default">Own</span>
                <Target className="w-5 h-5 text-blue-primary group-hover:rotate-12 transition-all duration-300" />
              </div>
              <div className="w-2 h-2 bg-orange-accent rounded-full animate-pulse"></div>
              <div className="flex items-center gap-2 group">
                <span className="text-orange-accent group-hover:scale-110 transition-all duration-300 cursor-default">Earn</span>
                <Zap className="w-5 h-5 text-orange-accent group-hover:rotate-12 transition-all duration-300" />
              </div>
              <div className="w-2 h-2 bg-blue-secondary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="flex items-center gap-2 group">
                <span className="text-blue-secondary group-hover:scale-110 transition-all duration-300 cursor-default">Multiply</span>
                <TrendingUp className="w-5 h-5 text-blue-secondary group-hover:rotate-12 transition-all duration-300" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Step-based transaction flow */}
          <div className="mb-20 max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6">
                Your Journey to Real Estate Wealth
              </h3>
              <p className="text-lg lg:text-xl text-muted-foreground font-inter max-w-3xl mx-auto leading-relaxed">
                Three simple steps to transform your investment approach and build generational wealth
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 lg:gap-12 sm:grid-cols-3">
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 hover:scale-105" style={{animationDelay: '0.5s'}}>
                <div className="absolute top-4 right-4 text-6xl font-bold text-orange-500/10">01</div>
                <div className="step-icon mx-auto mb-6 relative z-10 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <Building className="w-10 h-10 text-white group-hover:rotate-12 transition-all duration-500" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors relative z-10">
                  Acquire Your Slice
                </h4>
                <p className="text-gray-600 font-medium leading-relaxed text-lg relative z-10">
                  Start with AED 500 to own on-chain, fractional shares in prime UAE real estate
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 hover:scale-105" style={{animationDelay: '0.6s'}}>
                <div className="absolute top-4 right-4 text-6xl font-bold text-blue-600/10">02</div>
                <div className="step-icon mx-auto mb-6 relative z-10 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 via-green-500 to-green-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <DollarSign className="w-10 h-10 text-white group-hover:rotate-12 transition-all duration-500" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors relative z-10">
                  Earn 8–12% p.a.
                </h4>
                 <p className="text-gray-600 font-medium leading-relaxed text-lg relative z-10">
                   Earn 8–12% p.a. rental income, paid quarterly into your Nexus Mint Wallet fully transparent, zero paperwork.
                 </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 hover:scale-105" style={{animationDelay: '0.7s'}}>
                <div className="absolute top-4 right-4 text-6xl font-bold text-orange-500/10">03</div>
                <div className="step-icon mx-auto mb-6 relative z-10 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-300 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <ChartLine className="w-10 h-10 text-white group-hover:rotate-12 transition-all duration-500" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-500 transition-colors relative z-10">
                  Trade & Multiply
                </h4>
                <p className="text-gray-600 font-medium leading-relaxed text-lg relative z-10">
                  Trade & Multiply on our marketplace, reinvesting instantly to watch your wealth compound as property values rise.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair font-bold mb-8 leading-none text-foreground">
              <span className="block bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600 bg-clip-text text-transparent font-extrabold animate-gradient-x">
                Own Premium Real Estate for $100
              </span>
            </h2>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 font-inter leading-relaxed max-w-4xl mx-auto">
              Fractional UAE Real Estate. Instant Liquidity. Proven Yields.
            </p>
          </div>
          
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-6 items-center justify-center max-w-2xl mx-auto" style={{animationDelay: '0.7s'}}>
            <Link to="/auth/signup" className="w-full sm:w-auto group">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group-hover:scale-105 transition-all duration-300">
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-180 transition-all duration-500" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </Link>
            <Link to="/properties" className="w-full sm:w-auto group">
              <Button variant="outline" size="xl" className="w-full sm:w-auto bg-white/90 hover:bg-white group-hover:scale-105 transition-all duration-300">
                <Building className="mr-2 h-5 w-5 group-hover:rotate-12 transition-all duration-300" />
                Browse Properties
              </Button>
            </Link>
          </div>
          
          {/* Enhanced Early Access Section */}
          <div className="animate-fade-in-up mt-20 text-center" style={{animationDelay: '0.9s'}}>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6">Early Access</h3>
            <p className="text-lg lg:text-xl text-muted-foreground font-inter max-w-3xl mx-auto mb-12 leading-relaxed">
              Join our invitation-only launch cohort and lock in your spot today.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12">
              <div className="metric-card group animate-fade-in-up" style={{animationDelay: '1.0s'}}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-primary/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <Building className="w-8 h-8 text-white group-hover:rotate-12 transition-all duration-500" />
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

              <div className="metric-card group animate-fade-in-up" style={{animationDelay: '1.1s'}}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-primary/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <Users className="w-8 h-8 text-white group-hover:rotate-12 transition-all duration-500" />
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

              <div className="metric-card group animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-accent via-orange-500 to-orange-accent/80 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <ChartLine className="w-8 h-8 text-white group-hover:rotate-12 transition-all duration-500" />
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

              <div className="metric-card group animate-fade-in-up" style={{animationDelay: '1.3s'}}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 via-green-500 to-green-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <Shield className="w-8 h-8 text-white group-hover:rotate-12 transition-all duration-500" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-playfair font-bold text-green-600 mb-2">
                  <span className="count-up" data-target="100">100</span>%
                </div>
                <p className="text-muted-foreground font-inter font-medium mb-3">Regulated & Secure</p>
                <svg className="w-full h-6 mx-auto" viewBox="0 0 100 20">
                  <polyline 
                    points="0,10 25,8 50,6 75,4 100,2"
                    fill="none" 
                    stroke="hsl(142 71% 45%)" 
                    strokeWidth="2"
                    className="animate-draw-line"
                  />
                </svg>
              </div>
            </div>

            {/* Enhanced CTA for Early Access */}
            <div className="animate-fade-in-up" style={{animationDelay: '1.4s'}}>
              <div className="bg-gradient-to-r from-blue-primary/10 via-orange-accent/10 to-blue-primary/10 rounded-2xl p-8 border border-blue-primary/20">
                <h4 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Investment Journey?</h4>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join our exclusive early access program and be among the first to experience the future of real estate investment.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/early-access" className="group">
                    <Button className="bg-gradient-to-r from-blue-primary to-blue-secondary hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <Shield className="mr-2 h-5 w-5 group-hover:rotate-12 transition-all duration-300" />
                      Join Early Access
                    </Button>
                  </Link>
                  <Link to="/how-it-works" className="group">
                    <Button variant="outline" className="border-blue-primary text-blue-primary hover:bg-blue-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 group-hover:scale-105">
                      <Play className="mr-2 h-5 w-5 group-hover:rotate-12 transition-all duration-300" />
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}