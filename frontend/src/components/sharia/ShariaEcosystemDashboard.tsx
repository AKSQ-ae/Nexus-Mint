import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { NexusMintShariaService, PropertyEcosystem, InvestorPortfolio, MarketplaceOverview } from '@/lib/services/nexus-sharia-service';

interface ShariaEcosystemDashboardProps {
  factoryAddress?: string;
  userAddress?: string;
}

export const ShariaEcosystemDashboard: React.FC<ShariaEcosystemDashboardProps> = ({
  factoryAddress = "0x...", // Replace with actual factory address
  userAddress
}) => {
  const { toast } = useToast();
  const [service, setService] = useState<NexusMintShariaService | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State for different sections
  const [propertyCount, setPropertyCount] = useState<bigint>(BigInt(0));
  const [marketplaceOverview, setMarketplaceOverview] = useState<MarketplaceOverview | null>(null);
  const [userPortfolio, setUserPortfolio] = useState<InvestorPortfolio | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyEcosystem | null>(null);

  // Form states
  const [newPropertyForm, setNewPropertyForm] = useState({
    nexusPropertyId: '',
    dubaiBrokerageId: '',
    propertyAddress: '',
    propertyValueAED: '',
    totalShares: '',
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    permittedUses: ['Residential', 'Commercial', 'Mixed-Use', 'Retail', 'Office'] as [string, string, string, string, string],
    metadataURI: 'ipfs://QmYourMetadataHash'
  });

  useEffect(() => {
    initializeService();
  }, [factoryAddress]);

  useEffect(() => {
    if (service) {
      loadDashboardData();
    }
  }, [service, userAddress]);

  const initializeService = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new (await import('ethers')).BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const shariaService = new NexusMintShariaService(factoryAddress, signer);
        setService(shariaService);
      }
    } catch (error) {
      console.error('Error initializing service:', error);
      toast({
        title: "Connection Error",
        description: "Please connect your wallet to continue.",
        variant: "destructive"
      });
    }
  };

  const loadDashboardData = async () => {
    if (!service) return;
    
    setLoading(true);
    try {
      // Load basic stats
      const [count, overview] = await Promise.all([
        service.getPropertyCount(),
        service.getMarketplaceOverview()
      ]);
      
      setPropertyCount(count);
      setMarketplaceOverview(overview);

      // Load user portfolio if address provided
      if (userAddress) {
        const portfolio = await service.getInvestorPortfolio(userAddress);
        setUserPortfolio(portfolio);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async () => {
    if (!service) return;

    setLoading(true);
    try {
      const result = await service.createPropertyEcosystem({
        nexusPropertyId: newPropertyForm.nexusPropertyId,
        dubaiBrokerageId: newPropertyForm.dubaiBrokerageId,
        propertyAddress: newPropertyForm.propertyAddress,
        propertyValueAED: NexusMintShariaService.parseAED(newPropertyForm.propertyValueAED),
        totalShares: BigInt(newPropertyForm.totalShares),
        permittedUses: newPropertyForm.permittedUses,
        metadataURI: newPropertyForm.metadataURI,
        tokenName: newPropertyForm.tokenName,
        tokenSymbol: newPropertyForm.tokenSymbol,
        totalSupply: NexusMintShariaService.parseAED(newPropertyForm.totalSupply)
      });

      toast({
        title: "Property Created Successfully",
        description: `Property Token ID: ${result.propertyTokenId.toString()}`
      });

      // Reset form and reload data
      setNewPropertyForm({
        nexusPropertyId: '',
        dubaiBrokerageId: '',
        propertyAddress: '',
        propertyValueAED: '',
        totalShares: '',
        tokenName: '',
        tokenSymbol: '',
        totalSupply: '',
        permittedUses: ['Residential', 'Commercial', 'Mixed-Use', 'Retail', 'Office'],
        metadataURI: 'ipfs://QmYourMetadataHash'
      });
      
      loadDashboardData();
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create property ecosystem.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyDetails = async (propertyId: bigint) => {
    if (!service) return;

    try {
      const ecosystem = await service.getPropertyEcosystem(propertyId);
      setSelectedProperty(ecosystem);
    } catch (error) {
      console.error('Error loading property details:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load property details.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            🕌 Nexus Mint Sharia Ecosystem
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete Islamic finance-compliant property tokenization platform with unified smart contract architecture
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {propertyCount.toString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {marketplaceOverview?.activeProperties.toString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {marketplaceOverview?.totalActiveListings.toString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {marketplaceOverview ? 
                  NexusMintShariaService.formatAED(marketplaceOverview.accumulatedFeesAED) : 
                  '0 AED'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Property</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Create Property Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Create Property Ecosystem
                </CardTitle>
                <CardDescription>
                  Deploy a complete Sharia-compliant property tokenization system in one transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nexusPropertyId">Nexus Property ID</Label>
                    <Input
                      id="nexusPropertyId"
                      placeholder="NEXUS-PROP-001"
                      value={newPropertyForm.nexusPropertyId}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        nexusPropertyId: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dubaiBrokerageId">Dubai Brokerage ID</Label>
                    <Input
                      id="dubaiBrokerageId"
                      placeholder="DUBAI-BRK-123"
                      value={newPropertyForm.dubaiBrokerageId}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        dubaiBrokerageId: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input
                      id="propertyAddress"
                      placeholder="Downtown Dubai, UAE"
                      value={newPropertyForm.propertyAddress}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        propertyAddress: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyValueAED">Property Value (AED)</Label>
                    <Input
                      id="propertyValueAED"
                      placeholder="1000000"
                      type="number"
                      value={newPropertyForm.propertyValueAED}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        propertyValueAED: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenName">Token Name</Label>
                    <Input
                      id="tokenName"
                      placeholder="Downtown Dubai Property Token"
                      value={newPropertyForm.tokenName}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        tokenName: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenSymbol">Token Symbol</Label>
                    <Input
                      id="tokenSymbol"
                      placeholder="DDPT"
                      value={newPropertyForm.tokenSymbol}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        tokenSymbol: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalSupply">Total Token Supply</Label>
                    <Input
                      id="totalSupply"
                      placeholder="1000000"
                      type="number"
                      value={newPropertyForm.totalSupply}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        totalSupply: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalShares">Total Shares</Label>
                    <Input
                      id="totalShares"
                      placeholder="10000"
                      type="number"
                      value={newPropertyForm.totalShares}
                      onChange={(e) => setNewPropertyForm(prev => ({
                        ...prev,
                        totalShares: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateProperty} 
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? 'Creating...' : 'Create Property Ecosystem'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Investor Portfolio
                </CardTitle>
                <CardDescription>
                  Unified portfolio view across all Sharia-compliant properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userPortfolio ? (
                  <div className="space-y-4">
                    {userPortfolio.propertyTokenIds.map((propertyId, index) => (
                      <Card key={propertyId.toString()} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">Property #{propertyId.toString()}</h4>
                            <p className="text-sm text-muted-foreground">
                              Tokens: {userPortfolio.tokenBalances[index].toString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Invested: {NexusMintShariaService.formatAED(userPortfolio.totalInvestedAED[index])}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              {NexusMintShariaService.formatAED(userPortfolio.currentValuesAED[index])}
                            </p>
                            <p className="text-sm text-emerald-500">
                              Pending: {NexusMintShariaService.formatAED(userPortfolio.pendingReturnsAED[index])}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Connect your wallet to view portfolio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  All Properties
                </CardTitle>
                <CardDescription>
                  Browse all tokenized properties in the ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Property listing coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Sharia Administration
                </CardTitle>
                <CardDescription>
                  Manage Sharia compliance and certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Admin functions coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sharia Compliance Badge */}
        <div className="text-center">
          <Badge variant="outline" className="border-emerald-200 text-emerald-700">
            🕌 Fully Sharia Compliant • Islamic Finance Certified
          </Badge>
        </div>
      </div>
    </div>
  );
};