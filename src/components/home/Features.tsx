import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Search, TrendingUp, DollarSign } from 'lucide-react';

export function Features() {
  const features = [
    {
      name: 'Easy Investment',
      description: 'Start investing with just $100. No complex paperwork or large minimum investments required.',
      icon: Wallet,
    },
    {
      name: 'Curated Properties',
      description: 'Our experts select high-quality properties with strong rental yields and appreciation potential.',
      icon: Search,
    },
    {
      name: 'Passive Income',
      description: 'Earn regular rental income distributions directly to your account automatically.',
      icon: TrendingUp,
    },
    {
      name: 'Liquidity',
      description: 'Trade your property tokens on our marketplace for increased liquidity compared to traditional real estate.',
      icon: DollarSign,
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Why Choose Nexus Platform</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We make real estate investment accessible, transparent, and profitable for everyone
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.name} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}