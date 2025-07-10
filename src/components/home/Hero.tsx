import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Real Estate Investment
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Invest in premium real estate through blockchain technology. 
            Start with as little as $100 and earn passive income from tokenized properties.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Link to="/properties">
              <Button size="lg" className="text-lg px-8">
                Browse Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">High Returns</h3>
            <p className="mt-2 text-muted-foreground">
              Earn 8-12% annual returns through rental income and property appreciation
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Secure & Transparent</h3>
            <p className="mt-2 text-muted-foreground">
              Blockchain technology ensures secure, transparent, and immutable transactions
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Accessible</h3>
            <p className="mt-2 text-muted-foreground">
              Start investing with just $100 - no large capital requirements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}