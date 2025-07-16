import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  FileText, 
  Shield, 
  CheckCircle, 
  Download,
  ExternalLink,
  Code,
  Database,
  Zap
} from 'lucide-react';

interface DocumentationItem {
  title: string;
  description: string;
  type: 'technical' | 'regulatory' | 'user';
  status: 'complete' | 'draft' | 'review';
  downloadUrl?: string;
  viewUrl?: string;
}

export const DocumentationPackage = () => {
  const documentationItems: DocumentationItem[] = [
    // Technical Documentation
    {
      title: 'API Reference Guide',
      description: 'Complete API documentation with endpoints, authentication, and examples',
      type: 'technical',
      status: 'complete',
      downloadUrl: '/docs/api-reference.pdf',
      viewUrl: '/docs/api'
    },
    {
      title: 'Smart Contract Documentation',
      description: 'ERC-1155 contract specifications, deployment guides, and security audits',
      type: 'technical',
      status: 'complete',
      downloadUrl: '/docs/smart-contracts.pdf'
    },
    {
      title: 'Database Schema Reference',
      description: 'Complete database schema with RLS policies and migration scripts',
      type: 'technical',
      status: 'complete',
      downloadUrl: '/docs/database-schema.pdf'
    },
    {
      title: 'Infrastructure Setup Guide',
      description: 'Deployment, monitoring, and maintenance procedures',
      type: 'technical',
      status: 'complete',
      downloadUrl: '/docs/infrastructure.pdf'
    },
    
    // Regulatory Documentation
    {
      title: 'Compliance Framework',
      description: 'AML/KYC procedures, audit trails, and regulatory reporting',
      type: 'regulatory',
      status: 'complete',
      downloadUrl: '/docs/compliance-framework.pdf'
    },
    {
      title: 'Security Assessment Report',
      description: 'Penetration testing results, vulnerability assessments, and remediation',
      type: 'regulatory',
      status: 'complete',
      downloadUrl: '/docs/security-assessment.pdf'
    },
    {
      title: 'Data Protection Impact Assessment',
      description: 'GDPR compliance, data handling procedures, and privacy policies',
      type: 'regulatory',
      status: 'complete',
      downloadUrl: '/docs/dpia.pdf'
    },
    {
      title: 'Regulatory Submission Package',
      description: 'Complete regulatory filing documentation for property tokenization',
      type: 'regulatory',
      status: 'complete',
      downloadUrl: '/docs/regulatory-submission.pdf'
    },
    
    // User Documentation
    {
      title: 'User Guide',
      description: 'Step-by-step guide for investors using the platform',
      type: 'user',
      status: 'complete',
      downloadUrl: '/docs/user-guide.pdf',
      viewUrl: '/help'
    },
    {
      title: 'Investment Process Guide',
      description: 'Detailed walkthrough of the investment and tokenization process',
      type: 'user',
      status: 'complete',
      downloadUrl: '/docs/investment-guide.pdf'
    },
    {
      title: 'Wallet Integration Guide',
      description: 'Instructions for connecting and managing Web3 wallets',
      type: 'user',
      status: 'complete',
      downloadUrl: '/docs/wallet-guide.pdf'
    },
    {
      title: 'FAQ and Troubleshooting',
      description: 'Common questions and solutions for platform users',
      type: 'user',
      status: 'complete',
      viewUrl: '/faq'
    }
  ];

  const getTypeIcon = (type: DocumentationItem['type']) => {
    switch (type) {
      case 'technical':
        return <Code className="h-4 w-4" />;
      case 'regulatory':
        return <Shield className="h-4 w-4" />;
      case 'user':
        return <Book className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: DocumentationItem['type']) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regulatory':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusBadge = (status: DocumentationItem['status']) => {
    const variants = {
      complete: 'default',
      draft: 'secondary',
      review: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const technicalDocs = documentationItems.filter(doc => doc.type === 'technical');
  const regulatoryDocs = documentationItems.filter(doc => doc.type === 'regulatory');
  const userDocs = documentationItems.filter(doc => doc.type === 'user');

  const downloadAllDocs = () => {
    // In a real implementation, this would create a ZIP file with all documentation
    alert('This would download a complete documentation package as a ZIP file');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Documentation Package</CardTitle>
          <CardDescription>
            Comprehensive technical, regulatory, and user documentation for the tokenization platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={downloadAllDocs} size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Complete Package
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Technical Docs</p>
                <p className="text-2xl font-bold text-blue-600">{technicalDocs.length}</p>
              </div>
              <Code className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regulatory Docs</p>
                <p className="text-2xl font-bold text-red-600">{regulatoryDocs.length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Guides</p>
                <p className="text-2xl font-bold text-green-600">{userDocs.length}</p>
              </div>
              <Book className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Technical Documentation
          </CardTitle>
          <CardDescription>
            Developer guides, API references, and system architecture documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {technicalDocs.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getTypeIcon(doc.type)}
                  <div>
                    <h4 className="font-semibold">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}
                  
                  <div className="flex gap-2">
                    {doc.viewUrl && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    {doc.downloadUrl && (
                      <Button size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Regulatory Documentation
          </CardTitle>
          <CardDescription>
            Compliance frameworks, security assessments, and regulatory submission materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {regulatoryDocs.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getTypeIcon(doc.type)}
                  <div>
                    <h4 className="font-semibold">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}
                  
                  <div className="flex gap-2">
                    {doc.viewUrl && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    {doc.downloadUrl && (
                      <Button size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-green-600" />
            User Documentation
          </CardTitle>
          <CardDescription>
            User guides, tutorials, and support materials for platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {userDocs.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getTypeIcon(doc.type)}
                  <div>
                    <h4 className="font-semibold">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}
                  
                  <div className="flex gap-2">
                    {doc.viewUrl && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    {doc.downloadUrl && (
                      <Button size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Standards */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Technical Standards</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  OpenAPI 3.0 specification for all APIs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Comprehensive code comments and examples
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Architecture diagrams and system flows
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Deployment and configuration guides
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Regulatory Standards</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  ISO 27001 security documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  GDPR compliance documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Audit trail specifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Risk assessment reports
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};