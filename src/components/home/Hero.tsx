import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Users, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="hero-bg text-white relative overflow-hidden">
      {/* Premium animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-secondary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-32 lg:py-40 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 leading-none">
              <span className="gradient-text block">Revolutionize</span>
              <span className="text-white block">Real Estate</span>
              <span className="text-white/90 block text-4xl md:text-5xl lg:text-6xl mt-4 font-space font-medium">
                Investment
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <p className="text-xl md:text-2xl text-white/90 mb-6 font-inter leading-relaxed max-w-3xl mx-auto">
              Invest in premium UAE real estate with blockchain technology. Fractional ownership, transparent returns, and global accessibility.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm md:text-base">
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
                Minimum Investment: AED 500 (≈ $136 USD)
              </div>
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
                Expected Returns: 8-15% Annual
              </div>
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
                Securities Compliant
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto" style={{animationDelay: '0.6s'}}>
            <Link to="/properties">
              <Button size="xl" variant="secondary" className="flex-1">
                <TrendingUp className="h-5 w-5" />
                Start Investing
              </Button>
            </Link>
            <Link to="/demo" className="flex-1">
              <Button size="xl" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 glass">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </div>
          
          <div className="animate-fade-in-up mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" style={{animationDelay: '0.9s'}}>
            <div className="glass p-6 rounded-2xl backdrop-blur-xl">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-2">
                AED 1.8B+
              </div>
              <p className="text-white/80 font-inter">Assets Under Management</p>
            </div>
            <div className="glass p-6 rounded-2xl backdrop-blur-xl">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-2">
                15,000+
              </div>
              <p className="text-white/80 font-inter">Active Investors</p>
            </div>
            <div className="glass p-6 rounded-2xl backdrop-blur-xl">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-2">
                10%
              </div>
              <p className="text-white/80 font-inter">Average Annual Return</p>
            </div>
          </div>
        </div>
        
        {/* Enhanced features section below */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-6xl mx-auto">
          <div className="card-premium p-8 text-center group animate-fade-in-up" style={{animationDelay: '1.2s'}}>
            <div className="mx-auto h-16 w-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow-pulse">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-playfair font-semibold mb-4 text-foreground">Premium Returns</h3>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Earn 6-12% annual returns through carefully selected premium real estate investments
            </p>
          </div>
          
          <div className="card-premium p-8 text-center group animate-fade-in-up" style={{animationDelay: '1.3s'}}>
            <div className="mx-auto h-16 w-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow-pulse">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-playfair font-semibold mb-4 text-foreground">Bank-Grade Security</h3>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Enterprise-grade encryption and blockchain technology ensure your investments are secure
            </p>
          </div>
          
          <div className="card-premium p-8 text-center group animate-fade-in-up" style={{animationDelay: '1.4s'}}>
            <div className="mx-auto h-16 w-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow-pulse">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-playfair font-semibold mb-4 text-foreground">Accessible Investment</h3>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Own fractional shares in premium properties worldwide starting with just AED 500
            </p>
          </div>
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
}