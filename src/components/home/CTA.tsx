import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <div className="py-20 bg-gradient-to-br from-primary via-primary to-orange-accent relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-orange-accent/90" />
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px] animate-pulse" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Secure Your Investment Future
        </h2>
        <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
          Join our exclusive early access program. Limited spots available for founding investors.
          <br />
          <span className="font-semibold text-white">Start building your real estate empire today.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/auth/signup">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90 text-xl px-12 py-6 font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 rounded-full">
              Claim Your Spot Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/properties">
            <Button size="lg" variant="ghost" className="text-lg px-8 text-primary-foreground hover:bg-white/20 border-2 border-white/30 backdrop-blur-sm">
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}