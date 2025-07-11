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
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-3xl p-8 shadow-elegant hover:shadow-glow transition-all duration-500 hover:scale-105" style={{animationDelay: '0.5s'}}>
                <div className="absolute top-4 right-4 text-6xl font-playfair font-black text-orange-accent/10">01</div>
                <div className="step-icon mx-auto mb-6 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-primary/80 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-2xl font-playfair font-bold mb-4 text-foreground group-hover:text-blue-primary transition-colors relative z-10">
                  Acquire Your Slice
                </h4>
                <p className="text-muted-foreground font-inter font-medium leading-relaxed text-xl relative z-10">
                  Start with AED 500 to own on-chain, fractional shares in prime UAE real estate
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-3xl p-8 shadow-elegant hover:shadow-glow transition-all duration-500 hover:scale-105" style={{animationDelay: '0.6s'}}>
                <div className="absolute top-4 right-4 text-6xl font-playfair font-black text-blue-primary/10">02</div>
                <div className="step-icon mx-auto mb-6 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-primary/80 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-2xl font-playfair font-bold mb-4 text-foreground group-hover:text-blue-primary transition-colors relative z-10">
                  Earn 8–12% p.a.
                </h4>
                <p className="text-muted-foreground font-inter font-medium leading-relaxed text-xl relative z-10">
                  Earn 8–12% p.a. rental income, paid quarterly into your Nexus Wallet fully transparent, zero paperwork.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="step-card group animate-fade-in-up relative overflow-hidden bg-white/80 backdrop-blur-sm border border-grey-light/30 rounded-3xl p-8 shadow-elegant hover:shadow-glow transition-all duration-500 hover:scale-105" style={{animationDelay: '0.7s'}}>
                <div className="absolute top-4 right-4 text-6xl font-playfair font-black text-secondary/10">03</div>
                <div className="step-icon mx-auto mb-6 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary via-coral to-secondary/80 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-2xl font-playfair font-bold mb-4 text-foreground group-hover:text-secondary transition-colors relative z-10">
                  Trade & Multiply
                </h4>
                <p className="text-muted-foreground font-inter font-medium leading-relaxed text-xl relative z-10">
                  Trade & Multiply on our marketplace, reinvesting instantly to watch your wealth compound as property values rise.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
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