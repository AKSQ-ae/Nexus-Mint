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
  { 
    name: "Dubai Land Department", 
    caption: "Licensed by Dubai Land Department"
  },
  { 
    name: "UAE Central Bank", 
    caption: "Regulated by UAE Central Bank"
  },
  { 
    name: "Abu Dhabi Global Market", 
    caption: "Regulated by ADGM"
  },
  { 
    name: "Blockchain Auditors", 
    caption: "Audited by XYZ Blockchain Auditors"
  },
  { 
    name: "Legal Partners", 
    caption: "Legal counsel by ABC Law Firm"
  }
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
            Strategic Regulatory Partners & Compliance
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
            {partnerLogos.map((partner, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="h-12 bg-muted/30 rounded-lg flex items-center justify-center px-6 hover:bg-muted/50 transition-colors duration-200">
                  <span className="text-sm font-medium text-muted-foreground">
                    {partner.name}
                  </span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-white/95 px-3 py-2 rounded text-sm text-foreground opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-3 whitespace-nowrap shadow-lg">
                  {partner.caption}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a 
              href="/compliance#licenses" 
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
            >
              View our licenses & audit reports →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}