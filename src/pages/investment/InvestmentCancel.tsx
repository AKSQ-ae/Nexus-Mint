import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

export function InvestmentCancel() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-orange-600">Payment Cancelled</CardTitle>
          <p className="text-muted-foreground">
            Your payment was cancelled and no charges were made
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">What happened?</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• The payment process was cancelled</li>
              <li>• No money has been charged to your account</li>
              <li>• Your investment was not processed</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">What would you like to do?</h3>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/properties" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Another Investment
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/properties" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Browse Properties
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Need help with your investment?
            </p>
            <Link to="/support" className="text-primary hover:underline text-sm">
              Contact Support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}