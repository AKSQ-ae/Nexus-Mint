import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Home, TrendingUp, Repeat, Shield, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Own',
      description: 'Purchase fractional ownership of premium UAE real estate with as little as $100 and secure your digital property tokens.',
      icon: Home,
      details: 'Browse our expertly curated portfolio and invest in tokenised Dubai properties. Each token represents verified fractional ownership.',
      requirements: ['Minimum $100 investment', 'Digital property tokens', 'Verified ownership rights']
    },
    {
      step: '02',
      title: 'Earn',
      description: 'Receive returns from monthly rental income and capital appreciation, directly deposited to your digital wallet.',
      icon: TrendingUp,
      details: 'Automatic monthly distributions from rental income plus potential capital gains as property values increase over time.',
      requirements: ['Monthly rental distributions', 'Capital appreciation tracking', 'Automated payments']
    },
    {
      step: '03',
      title: 'Multiply',
      description: 'Easily trade your tokens on our marketplace, reinvest in new properties, and multiply your real estate portfolio.',
      icon: Repeat,
      details: 'Flexible exit options through our marketplace. Trade tokens instantly or reinvest to compound your real estate holdings.',
      requirements: ['Instant marketplace trading', 'Portfolio diversification', 'Compound growth potential']
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Investment Process Details</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Detailed breakdown of each investment step and requirements
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            <span>UAE Securities & Commodities Authority Compliant</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.step} className="relative group">
              <div className="card-premium p-6 rounded-xl h-full">
                <div className="text-center mb-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2 rounded-full">
                    {step.step}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <InfoTooltip content={
                      <div className="space-y-3">
                        <p className="font-medium">{step.details}</p>
                        <div>
                          <p className="font-medium mb-2">Requirements:</p>
                          <ul className="space-y-1">
                            {step.requirements.map((req, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    } />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-secondary transform -translate-y-1/2 z-10" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Information Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-success/5 rounded-xl border border-success/20">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" />
            <h4 className="font-semibold text-success mb-2">Regulatory Compliance</h4>
            <p className="text-sm text-muted-foreground">Full compliance with UAE Securities and Commodities Authority regulations</p>
          </div>
          
          <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-primary mb-2">Investor Protection</h4>
            <p className="text-sm text-muted-foreground">Advanced security measures and transparent investment documentation</p>
          </div>
          
          <div className="text-center p-6 bg-secondary/5 rounded-xl border border-secondary/20">
            <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h4 className="font-semibold text-secondary mb-2">Performance Tracking</h4>
            <p className="text-sm text-muted-foreground">Real-time portfolio monitoring and detailed analytics dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}