import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import branding from '@/config/branding.config';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <Shield className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium">GDPR Compliant</span>
        </div>
        <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Lock className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium">256-bit Encryption</span>
        </div>
        <div className="flex items-center space-x-2 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <Eye className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium">No Data Selling</span>
        </div>
        <div className="flex items-center space-x-2 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <Database className="h-6 w-6 text-orange-600" />
          <span className="text-sm font-medium">UAE Data Centers</span>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full name and contact details</li>
                <li>Date of birth and nationality</li>
                <li>Government-issued ID and passport</li>
                <li>Proof of address documentation</li>
                <li>Financial information for KYC compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Investment Data:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Investment amounts and preferences</li>
                <li>Transaction history and portfolio performance</li>
                <li>Risk tolerance and investment experience</li>
                <li>Wallet addresses and blockchain transactions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Technical Data:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and usage patterns</li>
                <li>App performance and error logs</li>
                <li>Location data (with consent)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Legal Compliance:</h4>
                <ul className="text-sm space-y-1">
                  <li>• KYC/AML verification</li>
                  <li>• Regulatory reporting</li>
                  <li>• Tax compliance</li>
                  <li>• Fraud prevention</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Service Delivery:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Account management</li>
                  <li>• Investment processing</li>
                  <li>• Customer support</li>
                  <li>• Performance reporting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Data Protection & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Security Measures:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>• AES-256 encryption at rest</div>
                <div>• TLS 1.3 for data in transit</div>
                <div>• Multi-factor authentication</div>
                <div>• Regular security audits</div>
                <div>• SOC 2 Type II compliance</div>
                <div>• Penetration testing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Sharing & Third Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We only share your data when required:</p>
            <div className="space-y-3">
              <div className="border-l-4 border-yellow-500 pl-4">
                <strong>Regulatory Bodies:</strong> DFSA, SCA, Dubai Police for compliance
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <strong>Service Providers:</strong> KYC verification, payment processing, cloud hosting
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <strong>Legal Requirements:</strong> Court orders, law enforcement requests
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We never sell your personal data to third parties for marketing purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Access & Control:</h4>
                <ul className="text-sm space-y-1">
                  <li>• View your personal data</li>
                  <li>• Download your data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete your account</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Opt out of marketing emails</li>
                  <li>• Control push notifications</li>
                  <li>• Manage cookie preferences</li>
                  <li>• Request data portability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Retention Periods:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>KYC Documents:</strong> 7 years after account closure
                </div>
                <div>
                  <strong>Transaction Records:</strong> 10 years (regulatory requirement)
                </div>
                <div>
                  <strong>Marketing Data:</strong> Until you opt out
                </div>
                <div>
                  <strong>Technical Logs:</strong> 90 days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>For privacy-related inquiries, contact our Data Protection Officer:</p>
              <div className="bg-muted p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {branding.legalEmail}</p>
                  <p><strong>Phone:</strong> {branding.phone ?? 'Phone Number'}</p>
                  <p><strong>Address:</strong> {branding.address ?? 'Company Address'}</p>
                  <p><strong>Response Time:</strong> Within 30 days of request</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}