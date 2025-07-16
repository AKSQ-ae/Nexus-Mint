import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Home, TrendingUp, Repeat, Shield, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Own',
      description: 'Purchase fractional ownership of UAE real estate from AED 500.',
      icon: Home,
    },
    {
      step: '02',
      title: 'Earn',
      description: 'Collect quarterly rental income straight to your digital wallet.',
      icon: TrendingUp,
    },
    {
      step: '03',
      title: 'Multiply',
      description: 'Trade 24/7 and reinvest to compound your holdings.',
      icon: Repeat,
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-4">Three-Step Investment Process</h2>
        </div>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 relative">
          {steps.map((step, index) => (
            <div key={step.step} className="relative group">
              <div className="card-premium p-8 rounded-xl h-full hover:shadow-xl hover:border-2 hover:border-primary hover:-translate-y-1 transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <Badge 
                    className="text-lg px-4 py-2 rounded-full bg-muted text-muted-foreground group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"
                  >
                    {step.step}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-12 h-1 bg-gradient-to-r from-primary via-secondary to-orange-500 transform -translate-y-1/2 z-10 animate-[shimmer_2s_ease-in-out_infinite] rounded-full" />
              )}
            </div>
          ))}
        </div>
        
        {/* Feature Grid - Two Rows */}
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-success/5 rounded-xl border border-success/20 hover:border-success/40 transition-colors">
              <CheckCircle className="h-10 w-10 text-success mx-auto mb-4" />
              <h4 className="font-semibold text-success mb-3 text-lg">Regulatory Compliance</h4>
              <p className="text-muted-foreground">Regulated by UAE SCA</p>
            </div>
            
            <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20 hover:border-primary/40 transition-colors">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <h4 className="font-semibold text-primary mb-3 text-lg">Investor Protection</h4>
              <p className="text-muted-foreground">Encrypted investment records</p>
            </div>
            
            <div className="text-center p-8 bg-purple-500/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <TrendingUp className="h-10 w-10 text-purple-500 mx-auto mb-4" />
              <h4 className="font-semibold text-purple-500 mb-3 text-lg">Performance Analytics</h4>
              <p className="text-muted-foreground">Real‑time portfolio dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}