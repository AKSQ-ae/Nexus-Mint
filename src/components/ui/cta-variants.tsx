import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Zap, Crown } from 'lucide-react';

const ctaVariants = [
  {
    id: 'A',
    headline: "Secure Your Investment Future",
    subtext: "Join our exclusive early access program. Limited spots available for founding investors.",
    primaryCta: "Claim Your Spot Now",
    secondaryCta: "Browse Properties",
    icon: Crown,
    style: "premium"
  },
  {
    id: 'B', 
    headline: "Start Building Wealth Today",
    subtext: "Access premium UAE real estate from just $100. Build your property portfolio in minutes.",
    primaryCta: "Start Investing Now",
    secondaryCta: "View Properties",
    icon: Star,
    style: "accessible"
  },
  {
    id: 'C',
    headline: "Own Real Estate in 60 Seconds",
    subtext: "Revolutionary blockchain technology makes property investment instant and affordable.",
    primaryCta: "Get Started Instantly",
    secondaryCta: "Learn How",
    icon: Zap,
    style: "urgent"
  }
];

export function CTAVariants() {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [testingMode, setTestingMode] = useState(false);

  // Auto-rotate variants for A/B testing
  useEffect(() => {
    if (testingMode) {
      const interval = setInterval(() => {
        setSelectedVariant((prev) => (prev + 1) % ctaVariants.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testingMode]);

  const variant = ctaVariants[selectedVariant];
  const Icon = variant.icon;

  const getVariantStyles = () => {
    switch (variant.style) {
      case 'premium':
        return {
          bg: 'bg-gradient-to-br from-primary via-primary to-orange-accent',
          primaryBtn: 'bg-background text-primary hover:bg-background/90 shadow-elegant',
          accent: 'text-primary-foreground'
        };
      case 'accessible':
        return {
          bg: 'bg-gradient-to-r from-success to-primary',
          primaryBtn: 'bg-background text-primary hover:bg-background/90 shadow-elegant',
          accent: 'text-success-foreground'
        };
      case 'urgent':
        return {
          bg: 'bg-gradient-to-br from-warning to-orange-accent',
          primaryBtn: 'bg-background text-warning hover:bg-background/90 shadow-elegant',
          accent: 'text-warning-foreground'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`py-20 ${styles.bg} relative overflow-hidden`}>
      {/* Testing Controls */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-lg p-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTestingMode(!testingMode)}
            className="text-xs text-primary-foreground"
          >
            {testingMode ? 'Stop Test' : 'A/B Test'}
          </Button>
          <div className="flex gap-1">
            {ctaVariants.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedVariant(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedVariant ? 'bg-background' : 'bg-background/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-orange-accent/90" />
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px] animate-pulse" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Icon className={`h-8 w-8 ${styles.accent} animate-pulse`} />
          <div className="text-sm font-medium ${styles.accent} opacity-80">
            Variant {variant.id}
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
          {variant.headline}
        </h2>
        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-10 leading-relaxed">
          {variant.subtext}
          <br />
          <span className="font-semibold text-primary-foreground">Start building your real estate empire today.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/auth/signup">
            <Button 
              size="xl" 
              className={`${styles.primaryBtn} text-xl px-12 py-6 font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 rounded-full`}
            >
              {variant.primaryCta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/properties">
            <Button 
              size="lg" 
              variant="ghost" 
              className="text-lg px-8 text-primary-foreground hover:bg-background/20 border-2 border-background/30 backdrop-blur-sm"
            >
              {variant.secondaryCta}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}