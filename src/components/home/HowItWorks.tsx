import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { CheckCircle, DollarSign, TrendingUp, Shield } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create Account & KYC',
      description: 'Sign up with email verification and complete Know Your Customer (KYC) compliance for investor protection.',
      icon: CheckCircle,
      details: 'Quick 5-minute process. Upload ID document and verify your identity to comply with UAE financial regulations.',
      requirements: ['Valid government ID', 'Email verification', 'Phone verification']
    },
    {
      step: '02',
      title: 'Browse Properties',
      description: 'Explore our curated selection of premium UAE real estate investments with detailed analytics.',
      icon: Shield,
      details: 'All properties are audited by certified appraisers and come with legal documentation and ownership verification.',
      requirements: ['Property valuation reports', 'Legal title verification', 'Rental yield projections']
    },
    {
      step: '03',
      title: 'Invest Securely',
      description: 'Purchase property tokens starting from $100 USD using secure payment methods and blockchain technology.',
      icon: DollarSign,
      details: 'Payments processed through licensed payment partners. Tokens represent fractional ownership secured on blockchain.',
      requirements: ['Minimum $100 USD investment', 'Secure payment processing', 'Blockchain token issuance']
    },
    {
      step: '04',
      title: 'Earn & Track Returns',
      description: 'Receive quarterly rental distributions and track property appreciation through your dashboard.',
      icon: TrendingUp,
      details: 'Returns distributed automatically. Full transparency with real-time performance tracking and market analytics.',
      requirements: ['Quarterly rental distributions', 'Real-time portfolio tracking', 'Annual property valuations']
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your journey to real estate investment success in four transparent, regulated steps
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            <span>UAE Securities & Commodities Authority Compliant</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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