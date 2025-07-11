import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingDown, DollarSign, Clock, Shield } from 'lucide-react';

export default function RiskDisclaimer() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">Risk Disclaimer</h1>
        <p className="text-muted-foreground">
          Important: Please read carefully before investing
        </p>
      </div>

      <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>WARNING:</strong> Real estate investment carries significant risks. 
          You could lose some or all of your invested capital. Only invest amounts you can afford to lose.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg text-center">
          <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-semibold text-red-800 dark:text-red-200">Market Risk</h3>
          <p className="text-sm text-red-600 dark:text-red-300">Property values fluctuate</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg text-center">
          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h3 className="font-semibold text-orange-800 dark:text-orange-200">Liquidity Risk</h3>
          <p className="text-sm text-orange-600 dark:text-orange-300">May be hard to sell quickly</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg text-center">
          <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Income Risk</h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-300">Rental income not guaranteed</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg text-center">
          <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-800 dark:text-purple-200">Regulatory Risk</h3>
          <p className="text-sm text-purple-600 dark:text-purple-300">Laws may change</p>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Capital Risk</CardTitle>
            <CardDescription>Your investment may lose value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-red-800 dark:text-red-200">Key Risks:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>Property values can decrease:</strong> Dubai real estate has experienced significant price fluctuations, with values dropping up to 50% during market downturns.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>No capital protection:</strong> Unlike bank deposits, there is no government guarantee or protection on your investment.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>Total loss possible:</strong> In extreme cases, you could lose 100% of your invested amount.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400">Liquidity Risk</CardTitle>
            <CardDescription>Difficulty in selling your investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-orange-800 dark:text-orange-200">Liquidity Challenges:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span><strong>No guaranteed market:</strong> Property tokens may not have an active secondary market for trading.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span><strong>Lock-up periods:</strong> Some investments may have minimum holding periods before you can exit.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span><strong>Price discovery:</strong> Limited trading may result in wide bid-ask spreads and volatile pricing.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">Income and Yield Risk</CardTitle>
            <CardDescription>Rental income is not guaranteed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Income Risks:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Vacancy risk:</strong> Properties may remain unoccupied, generating no rental income.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Tenant default:</strong> Tenants may fail to pay rent or damage the property.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Maintenance costs:</strong> Unexpected repairs and maintenance can reduce net income.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span><strong>Market rent fluctuations:</strong> Rental rates may decrease due to oversupply or economic conditions.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">Regulatory and Legal Risk</CardTitle>
            <CardDescription>Changes in laws may affect your investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">Regulatory Risks:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Property law changes:</strong> UAE property laws, foreign ownership rules, or taxation may change.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Tokenization regulations:</strong> New regulations on digital assets may affect property tokens.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Platform regulation:</strong> Regulatory changes may affect our ability to operate.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">Technology and Platform Risk</CardTitle>
            <CardDescription>Risks specific to digital property tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Technology Risks:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Smart contract risk:</strong> Bugs or vulnerabilities in blockchain smart contracts.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Platform failure:</strong> Technical issues may affect your ability to trade or access investments.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Cybersecurity:</strong> Risk of hacking, data breaches, or loss of digital assets.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Important Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Investment Advice Disclaimer:</h4>
                <p className="text-sm">
                  This platform does not provide investment, financial, or tax advice. All information is for educational purposes only. 
                  You should consult with qualified professionals before making investment decisions.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Past Performance Warning:</h4>
                <p className="text-sm">
                  Past performance of properties or investments is not indicative of future results. 
                  Historical data and projections are estimates only and should not be relied upon.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Suitability Assessment:</h4>
                <p className="text-sm">
                  Real estate investment may not be suitable for all investors. Consider your financial situation, 
                  investment objectives, risk tolerance, and investment experience before investing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Final Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              By proceeding with any investment on this platform, you acknowledge that you have read, 
              understood, and accepted all the risks outlined above. You confirm that you are investing 
              only amounts you can afford to lose and that you understand property investment may not 
              be suitable for your financial situation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}