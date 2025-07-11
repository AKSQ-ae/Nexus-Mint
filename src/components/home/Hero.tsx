import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Users, Play } from 'lucide-react';
import { InteractiveLogo } from '@/components/ui/interactive-logo';

export function Hero() {
  console.log('Hero component rendering with journey section');
  
  return (
    <section className="bg-white text-foreground relative overflow-hidden" style={{background: 'radial-gradient(ellipse at center, rgba(30, 144, 255, 0.03) 0%, rgba(255, 255, 255, 1) 70%)'}}>
      {/* Premium animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-secondary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-32 lg:py-40 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Interactive Nexus "N" Logo Only */}
          <div className="animate-fade-in-up flex justify-center mb-3">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-space font-black bg-gradient-nexus bg-clip-text text-transparent tracking-[0.2em] uppercase transform hover:scale-105 transition-all duration-300 drop-shadow-lg">
              NEXUS
            </h2>
          </div>
          
          {/* Own. Earn. Multiply Motto */}
          <div className="animate-fade-in-up flex justify-center mb-16" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-4 text-lg md:text-xl lg:text-2xl font-space font-semibold">
              <span className="text-orange-accent hover:text-blue-primary transition-colors duration-300 cursor-default">Own</span>
              <div className="w-2 h-2 bg-orange-accent rounded-full animate-pulse"></div>
              <span className="text-orange-accent hover:text-blue-primary transition-colors duration-300 cursor-default">Earn</span>
              <div className="w-2 h-2 bg-orange-accent rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-orange-accent hover:text-blue-primary transition-colors duration-300 cursor-default">Multiply</span>
            </div>
          </div>
          
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 leading-none text-foreground">
              <span className="block bg-gradient-to-r from-coral via-secondary to-coral bg-clip-text text-transparent font-extrabold">Own Premium Real Estate for $100</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-inter leading-relaxed max-w-3xl mx-auto">
              Tokenized UAE properties. Instant trading. Real returns.
            </p>
          </div>
          
          <div className="animate-fade-in-up flex justify-center max-w-md mx-auto" style={{animationDelay: '0.7s'}}>
            <Link to="/properties">
              <Button size="xl" className="bg-starbucks-green hover:bg-starbucks-green/90 text-white font-semibold px-8 py-4 text-lg shadow-elegant hover:shadow-glow transform hover:scale-105">
                Start Investing
              </Button>
            </Link>
          </div>
          
          <div className="animate-fade-in-up mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" style={{animationDelay: '0.9s'}}>
            <div className="metric-card group">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-blue-primary mb-2">
                AED <span className="count-up" data-target="10">0</span>M+
              </div>
              <p className="text-muted-foreground font-inter font-medium">Assets Under Management</p>
              <div className="metric-sparkline mt-3">
                <svg width="80" height="20" className="mx-auto">
                  <polyline 
                    fill="none" 
                    stroke="hsl(var(--blue-primary))" 
                    strokeWidth="2"
                    points="0,15 20,12 40,8 60,5 80,3"
                    className="animate-draw-line"
                  />
                </svg>
              </div>
            </div>
            <div className="metric-card group">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-blue-primary mb-2">
                <span className="count-up" data-target="1000">0</span>+
              </div>
              <p className="text-muted-foreground font-inter font-medium">Active Investors</p>
              <div className="metric-progress mt-3">
                <div className="w-20 h-2 bg-grey-light rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-primary to-secondary rounded-full animate-progress-fill" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
            <div className="metric-card group">
              <div className="text-3xl md:text-4xl font-playfair font-bold text-orange-accent mb-2">
                <span className="count-up" data-target="10">0</span>%
              </div>
              <p className="text-muted-foreground font-inter font-medium">Average Annual Return</p>
              <div className="metric-dial mt-3">
                <svg width="40" height="40" className="mx-auto">
                  <circle cx="20" cy="20" r="15" fill="none" stroke="hsl(var(--grey-light))" strokeWidth="3"/>
                  <circle 
                    cx="20" cy="20" r="15" 
                    fill="none" 
                    stroke="hsl(var(--orange-accent))" 
                    strokeWidth="3"
                    strokeDasharray="31.4"
                    strokeDashoffset="22"
                    className="animate-dial-fill"
                    transform="rotate(-90 20 20)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
}