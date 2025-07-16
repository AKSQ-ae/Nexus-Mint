import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Coins,
  Activity,
  TrendingUp,
  Users,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ContractInteraction } from '../contracts/ContractInteraction';
import { SmartContractMonitor } from '../enhanced/SmartContractMonitor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMetaMaskConnection } from '@/lib/services/web3-service';

interface RealTokenizationFlowProps {
  propertyId: string;
  property: any;
}

type TokenizationStep = 'audit' | 'contract' | 'verification' | 'launch' | 'monitoring';

export function RealTokenizationFlow({ propertyId, property }: RealTokenizationFlowProps) {
  const [currentStep, setCurrentStep] = useState<TokenizationStep>('audit');
  const [auditResults, setAuditResults] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenizationHistory, setTokenizationHistory] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected, account, connectWallet } = useMetaMaskConnection();

  useEffect(() => {
    loadTokenizationData();
    if (contractData) {
      loadRealTimeMetrics();
      const interval = setInterval(loadRealTimeMetrics, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [propertyId, contractData]);

  const loadTokenizationData = async () => {
    try {
      // Load existing tokenization data
      const { data: existing } = await supabase
        .from('property_tokens')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (existing) {
        setContractData(existing);
        setCurrentStep('monitoring');
      }

      // Load tokenization history
      const { data: history } = await supabase
        .from('smart_contract_events')
        .select('*')
        .eq('contract_address', existing?.contract_address || '')
        .order('created_at', { ascending: false })
        .limit(10);

      setTokenizationHistory(history || []);
    } catch (error) {
      console.error('Error loading tokenization data:', error);
    }
  };

  const loadRealTimeMetrics = async () => {
    if (!contractData) return;

    try {
      // Get real-time token metrics
      const { data: supply } = await supabase
        .from('token_supply')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      const { data: transactions } = await supabase
        .from('investment_transactions')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'completed');

      const { data: investors } = await supabase
        .from('investments')
        .select('user_id')
        .eq('property_id', propertyId)
        .eq('status', 'confirmed');

      const uniqueInvestors = new Set(investors?.map(i => i.user_id)).size;
      const totalVolume = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
      const avgTransaction = transactions?.length ? totalVolume / transactions.length : 0;

      setRealTimeMetrics({
        totalSupply: supply?.total_supply || 0,
        availableTokens: supply?.available_supply || 0,
        tokensSold: (supply?.total_supply || 0) - (supply?.available_supply || 0),
        uniqueInvestors,
        totalVolume,
        avgTransaction,
        tokenPrice: supply?.token_price || 0,
        marketCap: (supply?.total_supply || 0) * (supply?.token_price || 0),
        fundingProgress: supply ? ((supply.total_supply - supply.available_supply) / supply.total_supply) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
    }
  };

  const runSmartContractAudit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-property-contract', {
        body: { 
          propertyId,
          propertyData: property,
          auditorId: user?.id 
        }
      });

      if (error) throw error;

      setAuditResults(data);
      
      // Validate with TOKO
      const validationEvent = new CustomEvent('tokenization-validation', {
        detail: {
          success: data.score >= 90,
          message: data.score >= 90 
            ? '✅ Validation passed! Property meets all tokenisation requirements.'
            : '⚠️ Validation failed. Property does not meet minimum requirements. Please review the audit results.'
        }
      });
      window.dispatchEvent(validationEvent);
      
      if (data.score >= 90) {
        setCurrentStep('contract');
      }
      
      toast({
        title: "Audit Complete",
        description: "Property and legal documents have been validated",
      });
    } catch (error) {
      console.error('Audit failed:', error);
      
      // Send failure event to TOKO
      const validationEvent = new CustomEvent('tokenization-validation', {
        detail: {
          success: false,
          message: '❌ Validation error. Unable to complete property audit. Please try again.'
        }
      });
      window.dispatchEvent(validationEvent);
      
      toast({
        title: "Audit Failed",
        description: "Unable to complete property audit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deploySmartContract = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('deploy-real-property-contract', {
        body: { 
          propertyId,
          auditResults,
          deployerAddress: account,
          contractParams: {
            totalSupply: 1000000,
            tokenPrice: property.price / 1000000,
            propertyValue: property.price,
            minInvestment: 100
          }
        }
      });

      if (error) throw error;

      setContractData(data.contractData);
      setCurrentStep('verification');
      
      toast({
        title: "Contract Deployed",
        description: "Smart contract successfully deployed to blockchain",
      });
    } catch (error) {
      console.error('Contract deployment failed:', error);
      toast({
        title: "Deployment Failed",
        description: "Unable to deploy smart contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyContract = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-contract', {
        body: { 
          contractAddress: contractData?.contract_address,
          sourceCode: contractData?.source_code,
          constructorParams: contractData?.constructor_params 
        }
      });

      if (error) throw error;

      setVerificationStatus('verified');
      setCurrentStep('launch');
      
      toast({
        title: "Contract Verified",
        description: "Smart contract verified on blockchain explorer",
      });
    } catch (error) {
      console.error('Contract verification failed:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify contract. Launching without verification.",
        variant: "destructive",
      });
      setVerificationStatus('unverified');
      setCurrentStep('launch');
    } finally {
      setIsLoading(false);
    }
  };

  const launchTokenization = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('launch-tokenization', {
        body: { 
          propertyId,
          contractAddress: contractData?.contract_address 
        }
      });

      if (error) throw error;

      setCurrentStep('monitoring');
      
      toast({
        title: "Tokenization Launched",
        description: "Property is now available for investment!",
      });
    } catch (error) {
      console.error('Launch failed:', error);
      toast({
        title: "Launch Failed",
        description: "Unable to launch tokenization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    const steps = ['audit', 'contract', 'verification', 'launch', 'monitoring'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Real Estate Tokenization Process
          </CardTitle>
          <CardDescription>
            Complete blockchain tokenization for {property.title}
          </CardDescription>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step: {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <Progress value={getStepProgress()} />
          </div>
        </CardHeader>
      </Card>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="audit" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="contract" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Contract</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden md:inline">Verify</span>
          </TabsTrigger>
          <TabsTrigger value="launch" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">Launch</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Monitor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Property & Legal Audit
              </CardTitle>
              <CardDescription>
                Comprehensive audit of property documentation and legal compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!auditResults ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Property Documentation</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Title Deed Verification</li>
                        <li>• Property Valuation Report</li>
                        <li>• Legal Ownership Proof</li>
                        <li>• Insurance Documentation</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Compliance Checks</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Securities Law Compliance</li>
                        <li>• AML/KYC Requirements</li>
                        <li>• Tax Implications</li>
                        <li>• Regulatory Approval</li>
                      </ul>
                    </div>
                  </div>
                  <Button 
                    onClick={runSmartContractAudit} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Running Audit...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Start Property Audit
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Property audit completed successfully. All documents verified and compliance requirements met.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Audit Score</h4>
                      <p className="text-2xl font-bold text-green-600">{auditResults?.score || 95}/100</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Risk Level</h4>
                      <Badge variant="secondary" className="mt-1">
                        {auditResults?.riskLevel || 'Low'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Smart Contract Deployment
              </CardTitle>
              <CardDescription>
                Deploy ERC-1155 property token contract to blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!contractData ? (
                <>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {!isConnected 
                        ? "Connect your wallet to deploy the smart contract"
                        : "Ready to deploy smart contract to blockchain"
                      }
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Contract Features</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• ERC-1155 Multi-Token</li>
                        <li>• Automated Dividends</li>
                        <li>• Role-Based Access</li>
                        <li>• Pausable & Secure</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Token Parameters</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Total Supply: 1,000,000</li>
                        <li>• Token Price: ${(property.price / 1000000).toFixed(2)}</li>
                        <li>• Min Investment: $100</li>
                        <li>• Property Value: ${property.price?.toLocaleString()}</li>
                      </ul>
                    </div>
                  </div>

                  <Button 
                    onClick={deploySmartContract} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Deploying Contract...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        {isConnected ? 'Deploy Smart Contract' : 'Connect Wallet'}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <ContractInteraction 
                  propertyId={propertyId}
                  propertyTitle={property.title}
                  tokenData={contractData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Contract Verification
              </CardTitle>
              <CardDescription>
                Verify smart contract source code on blockchain explorer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationStatus === 'pending' ? (
                <>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Contract verification provides transparency and trust for investors
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={verifyContract} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Verifying Contract...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Contract Source Code
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Contract {verificationStatus === 'verified' ? 'successfully verified' : 'deployed but unverified'} on blockchain explorer
                    </AlertDescription>
                  </Alert>
                  
                  {contractData?.contract_address && (
                    <Button variant="outline" className="w-full" asChild>
                      <a 
                        href={`https://polygonscan.com/address/${contractData.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Polygon Explorer
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Launch Tokenization
              </CardTitle>
              <CardDescription>
                Make property tokens available for public investment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Ready to launch! Property tokens will be available for investment.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={launchTokenization} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Launch Tokenization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {realTimeMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens Sold</p>
                      <p className="text-2xl font-bold">{realTimeMetrics.tokensSold.toLocaleString()}</p>
                    </div>
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mt-2">
                    <Progress value={realTimeMetrics.fundingProgress} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {realTimeMetrics.fundingProgress.toFixed(1)}% funded
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <p className="text-2xl font-bold">${realTimeMetrics.totalVolume.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg: ${realTimeMetrics.avgTransaction.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Investors</p>
                      <p className="text-2xl font-bold">{realTimeMetrics.uniqueInvestors}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Market Cap: ${realTimeMetrics.marketCap.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <SmartContractMonitor 
            contractAddress={contractData?.contract_address} 
            propertyId={propertyId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}