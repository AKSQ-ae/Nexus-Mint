import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Web3Integration } from '@/components/web3/Web3Integration';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  Coins, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Shield
} from 'lucide-react';

interface PropertyData {
  id: string;
  title: string;
  location: string;
  price: number;
  price_per_token: number;
  min_investment: number;
  funding_target: number;
  funding_deadline: string;
  total_tokens: number;
  tokens_issued: number;
  tokenization_status: string;
  contract_address?: string;
  images: any[];
  description: string;
}

interface TokenizationFlowProps {
  propertyId: string;
}

export const TokenizationFlow = ({ propertyId }: TokenizationFlowProps) => {
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchPropertyData();
  }, [propertyId]);

  const fetchPropertyData = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data as any);
      
      // Determine current step based on tokenization status
      if (data.tokenization_status === 'available') setCurrentStep(1);
      else if (data.tokenization_status === 'active') setCurrentStep(3);
      else if (data.tokenization_status === 'launched') setCurrentStep(4);
      
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycSubmission = async () => {
    // Simulate KYC process
    setKycStatus('pending');
    setTimeout(() => {
      setKycStatus('approved');
      setCurrentStep(2);
      toast.success('KYC verification approved!');
    }, 2000);
  };

  const handleTokenLaunch = async () => {
    try {
      // First, validate with TOKO
      if (property && user) {
        const formData = {
          propertyId: property.id,
          propertyValue: property.price,
          tokenPrice: property.price_per_token,
          totalTokens: property.total_tokens,
          minInvestment: property.min_investment,
          fundingTarget: property.funding_target,
          fundingDeadline: property.funding_deadline,
          propertyType: 'residential', // Default, could be enhanced
          location: property.location,
          description: property.description,
          documents: [] // Could be enhanced with actual documents
        };

        const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-tokenization', {
          body: { formData, userId: user.id }
        });

        if (validationError) throw validationError;

        if (!validationData.valid) {
          toast.error(`Validation failed: ${validationData.errors.join(', ')}`);
          return;
        }

        toast.success('TOKO validation passed! Proceeding with tokenization...');
      }

      // Call tokenization deployment function
      const { data, error } = await supabase.functions.invoke('live-tokenization-deploy', {
        body: { propertyId }
      });

      if (error) throw error;

      toast.success('Tokenization launched successfully!');
      setCurrentStep(3);
      fetchPropertyData(); // Refresh data
      
    } catch (error) {
      console.error('Tokenization launch failed:', error);
      toast.error('Failed to launch tokenization');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Property Not Found</h3>
        <p className="text-muted-foreground">The requested property could not be loaded.</p>
      </div>
    );
  }

  const fundingProgress = property.funding_target 
    ? (property.tokens_issued * property.price_per_token / property.funding_target) * 100 
    : 0;

  const steps = [
    {
      id: 1,
      title: 'KYC Verification',
      description: 'Complete identity verification',
      icon: Shield,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      id: 2,
      title: 'Property Review',
      description: 'Review property details and documentation',
      icon: FileText,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 3,
      title: 'Token Launch',
      description: 'Deploy smart contract and mint tokens',
      icon: Coins,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    },
    {
      id: 4,
      title: 'Investment',
      description: 'Purchase property tokens',
      icon: TrendingUp,
      status: currentStep === 4 ? 'active' : 'pending'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Property Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-2xl">{property.title}</CardTitle>
              <CardDescription className="text-lg">{property.location}</CardDescription>
            </div>
            <Badge variant={
              property.tokenization_status === 'launched' ? 'default' :
              property.tokenization_status === 'active' ? 'secondary' : 'outline'
            }>
              {property.tokenization_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">${property.price.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Property Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${property.price_per_token}</div>
              <div className="text-sm text-muted-foreground">Per Token</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{property.total_tokens || 0}</div>
              <div className="text-sm text-muted-foreground">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{property.tokens_issued || 0}</div>
              <div className="text-sm text-muted-foreground">Tokens Sold</div>
            </div>
          </div>

          {property.funding_target && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Funding Progress</span>
                <span>{fundingProgress.toFixed(1)}%</span>
              </div>
              <Progress value={fundingProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${(property.tokens_issued * property.price_per_token).toLocaleString()} raised</span>
                <span>${property.funding_target.toLocaleString()} target</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tokenization Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Tokenization Process</CardTitle>
          <CardDescription>
            Follow these steps to complete the property tokenization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${step.status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                      step.status === 'active' ? 'bg-primary/10 border-primary text-primary' :
                      'bg-muted border-muted-foreground/20 text-muted-foreground'}
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      step.status === 'active' ? 'text-primary' : 
                      step.status === 'completed' ? 'text-green-700' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    {/* Step-specific content */}
                    {step.id === 1 && currentStep === 1 && (
                      <div className="space-y-3">
                        <div className={`p-3 rounded-lg border ${
                          kycStatus === 'approved' ? 'bg-green-50 border-green-200' :
                          kycStatus === 'pending' ? 'bg-orange-50 border-orange-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-2 text-sm">
                            <span>KYC Status:</span>
                            <Badge variant={
                              kycStatus === 'approved' ? 'default' :
                              kycStatus === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {kycStatus}
                            </Badge>
                          </div>
                        </div>
                        {kycStatus !== 'approved' && (
                          <Button onClick={handleKycSubmission} size="sm">
                            {kycStatus === 'pending' ? 'Processing...' : 'Complete KYC'}
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {step.id === 2 && currentStep === 2 && (
                      <div className="space-y-3">
                        <p className="text-sm">Review property documentation and approve tokenization.</p>
                        <Button onClick={handleTokenLaunch} size="sm">
                          Launch Tokenization <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Web3 Integration - Only show when tokens are launched */}
      {currentStep >= 3 && property.contract_address && (
        <Web3Integration
          propertyId={property.id}
          contractAddress={property.contract_address}
          tokenPrice={property.price_per_token}
          minInvestment={property.min_investment}
        />
      )}
    </div>
  );
};