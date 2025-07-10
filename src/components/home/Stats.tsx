import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, Users, Shield } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      name: 'Total Properties',
      value: '250+',
      icon: Building,
      description: 'Premium properties available',
    },
    {
      name: 'Average Returns',
      value: '10.5%',
      icon: TrendingUp,
      description: 'Annual return for investors',
    },
    {
      name: 'Active Investors',
      value: '15,000+',
      icon: Users,
      description: 'Growing community',
    },
    {
      name: 'Total Value',
      value: '$500M+',
      icon: Shield,
      description: 'Assets under management',
    },
  ];

  return (
    <div className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Platform Statistics</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of investors building wealth through real estate
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <CardTitle className="text-lg mt-2">{stat.name}</CardTitle>
                <CardDescription className="mt-1">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}