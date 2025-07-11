import { Shield, Award, FileCheck, Users, Building2, TrendingUp } from 'lucide-react';

const trustSignals = [
  {
    icon: Shield,
    title: "Secured by Blockchain",
    description: "Enterprise-grade blockchain security"
  },
  {
    icon: Award,
    title: "ISO 27001 Certified",
    description: "International security management standard"
  },
  {
    icon: FileCheck,
    title: "Smart Contract Audited",
    description: "Third-party security audits completed"
  },
  {
    icon: Users,
    title: "Institutional Backing",
    description: "Supported by leading real estate firms"
  },
  {
    icon: Building2,
    title: "Premium Properties",
    description: "Grade A commercial and residential assets"
  },
  {
    icon: TrendingUp,
    title: "Proven Track Record",
    description: "10%+ average annual returns since 2020"
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
        {/* Trust Badges */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            Trusted & <span className="gradient-text">Secure</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Your investments are protected by industry-leading security and regulatory compliance
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {trustSignals.map((signal, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-6 card-premium rounded-xl group hover:scale-105 transition-transform"
              >
                <div className="h-12 w-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow">
                  <signal.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2 text-center">{signal.title}</h3>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {signal.description}
                </p>
              </div>
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