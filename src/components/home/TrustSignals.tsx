import { Card, CardContent } from '@/components/ui/card';
import { Building2, Shield, TrendingUp } from 'lucide-react';

const investmentPillars = [
  {
    icon: Building2,
    title: 'Curated Property Assets',
    benefits: [
      'Grade-A commercial & residential properties',
      'Backed by leading real-estate partners'
    ]
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    benefits: [
      'Enterprise-grade blockchain security',
      'Third-party smart-contract audits'
    ]
  },
  {
    icon: TrendingUp,
    title: 'Transparent Performance',
    benefits: [
      '10%+ projected annual returns',
      'Real-time on-chain audit trail'
    ]
  }
];

const partnerLogos = [
  { name: "Dubai Real Estate Authority", width: "120px" },
  { name: "UAE Central Bank", width: "100px" },
  { name: "Blockchain Auditors", width: "140px" },
  { name: "Legal Partners", width: "110px" }
];

export function TrustSignals() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Investment Pillars */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            Your Investment <span className="gradient-text">Pillars</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three foundational pillars that make your investment secure, profitable, and transparent
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {investmentPillars.map((pillar, index) => (
              <Card 
                key={index}
                className="p-8 card-premium group hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-0 text-center">
                  <div className="h-16 w-16 bg-gradient-secondary rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:shadow-glow">
                    <pillar.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{pillar.title}</h3>
                  <ul className="space-y-3 text-left">
                    {pillar.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-muted-foreground flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partner Logos */}
        <div className="border-t border-border/50 pt-16">
          <h3 className="text-center text-lg font-semibold mb-8 text-muted-foreground">
            Regulatory Partners & Compliance
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {partnerLogos.map((partner, index) => (
              <div 
                key={index}
                className="h-12 bg-muted/30 rounded-lg flex items-center justify-center px-6 hover:opacity-100 transition-opacity"
                style={{ width: partner.width }}
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}