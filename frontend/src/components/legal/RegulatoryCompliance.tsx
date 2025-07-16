import React from 'react';
import { Shield, FileText, Globe, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ComplianceItem {
  title: string;
  status: 'active' | 'pending' | 'planned';
  description: string;
  jurisdiction: string;
  icon: React.ReactNode;
}

const complianceItems: ComplianceItem[] = [
  {
    title: 'Securities Compliance',
    status: 'pending',
    description: 'Registration and compliance with securities regulations for tokenized real estate offerings',
    jurisdiction: 'UAE, US, EU',
    icon: <Shield className="h-5 w-5" />
  },
  {
    title: 'AML/KYC Standards',
    status: 'active',
    description: 'Comprehensive Anti-Money Laundering and Know Your Customer procedures',
    jurisdiction: 'Global',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    title: 'Data Protection',
    status: 'active',
    description: 'GDPR, CCPA, and local data protection compliance',
    jurisdiction: 'Global',
    icon: <Shield className="h-5 w-5" />
  },
  {
    title: 'Virtual Asset Licensing',
    status: 'planned',
    description: 'Virtual asset service provider licensing for blockchain operations',
    jurisdiction: 'UAE, Singapore',
    icon: <Award className="h-5 w-5" />
  },
  {
    title: 'Real Estate Regulations',
    status: 'pending',
    description: 'Compliance with local real estate investment and ownership laws',
    jurisdiction: 'Multi-jurisdictional',
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: 'Tax Compliance',
    status: 'active',
    description: 'Tax reporting and compliance frameworks for international investors',
    jurisdiction: 'Global',
    icon: <Globe className="h-5 w-5" />
  }
];

const regulatoryPartners = [
  {
    name: 'Leading Securities Law Firm',
    role: 'Securities Compliance',
    description: 'International law firm specializing in securities tokenization',
    status: 'engaged'
  },
  {
    name: 'Blockchain Regulatory Advisors',
    role: 'Virtual Asset Compliance',
    description: 'Specialized consultancy for blockchain regulatory matters',
    status: 'engaged'
  },
  {
    name: 'Real Estate Legal Partners',
    role: 'Property Law Compliance',
    description: 'Local legal expertise in target markets',
    status: 'pending'
  },
  {
    name: 'Tax Advisory Firm',
    role: 'Tax Compliance',
    description: 'International tax structuring and compliance',
    status: 'engaged'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    case 'planned':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'engaged':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pending':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'planned':
      return <Globe className="h-4 w-4 text-blue-600" />;
    default:
      return <Shield className="h-4 w-4 text-gray-600" />;
  }
};

export function RegulatoryCompliance() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Regulatory Compliance</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Nexus is committed to operating within the highest regulatory standards across all jurisdictions. 
            We work with leading legal and compliance experts to ensure full regulatory compliance.
          </p>
        </div>

        {/* Compliance Framework */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Compliance Framework</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceItems.map((item, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-premium transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    {getStatusIcon(item.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {item.jurisdiction}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Partners */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Legal & Advisory Partners</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {regulatoryPartners.map((partner, index) => (
              <Card key={index} className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{partner.name}</h4>
                      <p className="text-sm text-primary">{partner.role}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(partner.status)}`}>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regulatory Timeline */}
        <Card className="bg-gradient-subtle mb-12">
          <CardHeader>
            <CardTitle className="text-center">Regulatory Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Phase 1: Foundation</h4>
                  <Badge className="mb-3 bg-green-500/10 text-green-700 border-green-200">Q1 2025</Badge>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Legal entity structure</li>
                    <li>• AML/KYC framework</li>
                    <li>• Data protection compliance</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Phase 2: Licensing</h4>
                  <Badge className="mb-3 bg-yellow-500/10 text-yellow-700 border-yellow-200">Q2-Q3 2025</Badge>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Securities compliance filing</li>
                    <li>• Virtual asset licensing</li>
                    <li>• Real estate regulations</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Phase 3: Expansion</h4>
                  <Badge className="mb-3 bg-blue-500/10 text-blue-700 border-blue-200">Q4 2025+</Badge>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multi-jurisdictional compliance</li>
                    <li>• International expansion</li>
                    <li>• Additional product lines</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commitment Statement */}
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Our Compliance Commitment</h3>
            <p className="text-lg opacity-90 mb-6 max-w-3xl mx-auto">
              Nexus is committed to operating with the highest standards of regulatory compliance, 
              transparency, and investor protection. We will not launch any product or service 
              until we have obtained all necessary regulatory approvals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                View Legal Documents
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Contact Legal Team
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground max-w-4xl mx-auto">
            <strong>Important Notice:</strong> Nexus is currently in development and regulatory approval process. 
            The information provided here represents our planned compliance framework. 
            No investment opportunities are currently available until all regulatory approvals are obtained. 
            This website is for informational purposes only and does not constitute an offer to sell or solicitation of any securities.
          </p>
        </div>
      </div>
    </section>
  );
}