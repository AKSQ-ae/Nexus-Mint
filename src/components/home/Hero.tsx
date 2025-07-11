import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Users, Play } from 'lucide-react';
import { InteractiveLogo } from '@/components/ui/interactive-logo';

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
          {/* Interactive Nexus "N" Logo Only */}
          <div className="animate-fade-in-up flex justify-center mb-6">
            <InteractiveLogo 
              src="/lovable-uploads/4c987739-d8fc-4bb8-bedb-e287c825a3f2.png"
              alt="Nexus N Logo"
              className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24"
            />
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 leading-none text-white">
              <span className="block bg-gradient-to-r from-white via-coral to-white bg-clip-text text-transparent font-extrabold">Wealth On Tap</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <p className="text-xl md:text-2xl text-white/90 mb-12 font-inter leading-relaxed max-w-3xl mx-auto">
              Own premium assets for just $100.
            </p>
          </div>
          
          <div className="animate-fade-in-up flex justify-center max-w-md mx-auto" style={{animationDelay: '0.6s'}}>
            <Link to="/properties">
              <Button size="xl" className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 text-lg">
                <TrendingUp className="h-5 w-5" />
                Start Investing
              </Button>
            </Link>
          </div>
          
          <div className="animate-fade-in-up mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" style={{animationDelay: '0.9s'}}>
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-xl">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-white mb-2">
                AED 10M+
              </div>
              <p className="text-white/90 font-inter font-medium">Assets Under Management</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-xl">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-white mb-2">
                1000+
              </div>
              <p className="text-white/90 font-inter font-medium">Active Investors</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-xl">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-white mb-2">
                10%
              </div>
              <p className="text-white/90 font-inter font-medium">Average Annual Return</p>
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