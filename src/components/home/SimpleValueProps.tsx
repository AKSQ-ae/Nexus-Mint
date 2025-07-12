import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Globe, PieChart, Smartphone } from 'lucide-react';

const valueProps = [
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: 'Start Small',
    description: 'Begin with just $100'
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: 'Go Global',
    description: 'Properties in 15+ countries'
  },
  {
    icon: <PieChart className="h-8 w-8 text-primary" />,
    title: 'Diversify Easy',
    description: 'Spread risk across markets'
  },
  {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: 'Manage Anywhere',
    description: 'Full mobile experience'
  }
];

export function SimpleValueProps() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {valueProps.map((prop, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  {prop.icon}
                </div>
                <h3 className="font-semibold text-foreground">{prop.title}</h3>
                <p className="text-sm text-muted-foreground">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}