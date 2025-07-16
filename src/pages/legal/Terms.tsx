import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { brandingConfig } from '@/lib/branding.config';

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This platform facilitates real estate investment through tokenization. 
          All investments carry risk and are subject to UAE regulatory requirements.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Investment Risks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Capital at Risk:</strong> The value of your investment may go down as well as up. 
              You may not get back the amount you invested.
            </p>
            <p>
              <strong>Property Market Risk:</strong> Real estate values can fluctuate due to market conditions, 
              economic factors, and local regulations.
            </p>
            <p>
              <strong>Liquidity Risk:</strong> Property tokens may not be easily convertible to cash. 
              There is no guarantee of a secondary market.
            </p>
            <p>
              <strong>Regulatory Risk:</strong> Changes in UAE laws and regulations may affect your investment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Regulatory Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This platform operates under UAE jurisdiction and complies with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dubai Financial Services Authority (DFSA) regulations</li>
              <li>UAE Securities and Commodities Authority (SCA) requirements</li>
              <li>Dubai Land Department (DLD) property regulations</li>
              <li>UAE Anti-Money Laundering (AML) laws</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Eligible Investors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>To invest on this platform, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 21 years old</li>
              <li>Complete our KYC (Know Your Customer) verification</li>
              <li>Meet minimum investment requirements</li>
              <li>Be legally permitted to invest in UAE real estate</li>
              <li>Understand the risks associated with property investment</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Fees and Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Platform Fees:</h4>
              <ul className="space-y-1">
                <li>• Onboarding Fee: 2.5% of investment amount</li>
                <li>• Management Fee: 1.5% annually</li>
                <li>• Transaction Fee: 0.5% per trade</li>
                <li>• Dubai Land Department Fee: 4% (for property registration)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              All fees are disclosed before investment and included in your investment summary.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Property Token Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Property tokens represent fractional ownership rights in the underlying real estate asset:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proportional share of rental income distributions</li>
              <li>Proportional share of capital appreciation upon sale</li>
              <li>Voting rights on major property decisions (for holdings above 5%)</li>
              <li>Access to property performance reports and updates</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This platform does not provide investment advice. All information is for educational 
              purposes only. You should consult with qualified financial advisors before making 
              investment decisions.
            </p>
            <p>
              Past performance is not indicative of future results. All projected returns are 
              estimates and not guaranteed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>{brandingConfig.appName}</strong></p>
              <p>Registered Address: {brandingConfig.contact.address}</p>
              <p>Email: {brandingConfig.contact.email}</p>
              <p>Phone: {brandingConfig.contact.phone}</p>
              <p>License: [Your License Number]</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}