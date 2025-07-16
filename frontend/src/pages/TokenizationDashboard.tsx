import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TokenizationMonitor } from '@/components/tokenization/TokenizationMonitor';
import { TokenizationReports } from '@/components/tokenization/TokenizationReports';
import { RealTokenizationFlow } from '@/components/tokenization/RealTokenizationFlow';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { ErrorDisplay } from '@/components/ui/enhanced-error-handling';
import { 
  Activity, 
  FileText, 
  Settings, 
  BarChart3,
  ArrowLeft,
  Building,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  tokenization_status: string;
  tokenization_active: boolean;
  total_tokens?: number;
  tokens_issued?: number;
  funding_target?: number;
}

interface ProcessStats {
  total_processes: number;
  active_processes: number;
  completed_processes: number;
  total_value_tokenized: number;
}

export default function TokenizationDashboard() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const processId = searchParams.get('processId');
  
  const [property, setProperty] = useState<Property | null>(null);
  const [stats, setStats] = useState<ProcessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('monitor');

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
    fetchStats();
  }, [propertyId]);

  const fetchProperty = async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch property';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get process statistics
      const { data: processes, error: processError } = await supabase
        .from('tokenization_processes')
        .select('status, properties(price)');

      if (processError) throw processError;

      const stats: ProcessStats = {
        total_processes: processes.length,
        active_processes: processes.filter(p => p.status === 'in_progress').length,
        completed_processes: processes.filter(p => p.status === 'completed').length,
        total_value_tokenized: processes
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.properties?.price || 0), 0)
      };

      setStats(stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading tokenization dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay
          title="Failed to Load Dashboard"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={propertyId ? `/properties/${propertyId}` : '/properties'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tokenization Dashboard</h1>
            {property && (
              <p className="text-muted-foreground">
                {property.title} • {property.location}
              </p>
            )}
          </div>
        </div>
        {property && (
          <Badge 
            variant={property.tokenization_active ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {property.tokenization_status.replace('_', ' ').toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_processes}</div>
              <p className="text-xs text-muted-foreground">
                All tokenization processes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active_processes}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Building className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_processes}</div>
              <p className="text-xs text-muted-foreground">
                Successfully tokenized
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_value_tokenized)}</div>
              <p className="text-xs text-muted-foreground">
                Properties tokenized
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Details (if viewing specific property) */}
      {property && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Value:</span> {formatCurrency(property.price)}</p>
                  <p><span className="text-muted-foreground">Status:</span> {property.tokenization_status}</p>
                  <p><span className="text-muted-foreground">Active:</span> {property.tokenization_active ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              {property.total_tokens && (
                <div>
                  <h3 className="font-semibold mb-2">Tokenization</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Total Tokens:</span> {property.total_tokens.toLocaleString()}</p>
                    <p><span className="text-muted-foreground">Issued:</span> {(property.tokens_issued || 0).toLocaleString()}</p>
                    <p><span className="text-muted-foreground">Available:</span> {((property.total_tokens || 0) - (property.tokens_issued || 0)).toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              {property.funding_target && (
                <div>
                  <h3 className="font-semibold mb-2">Funding</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Target:</span> {formatCurrency(property.funding_target)}</p>
                    <p><span className="text-muted-foreground">Progress:</span> {Math.round(((property.tokens_issued || 0) / (property.total_tokens || 1)) * 100)}%</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Process Monitor
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports & Analytics
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <TokenizationMonitor 
            propertyId={propertyId}
            processId={processId}
            onProcessComplete={(id) => {
              // Update URL to include process ID
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('processId', id);
              window.history.pushState({}, '', newUrl.toString());
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {processId ? (
            <TokenizationReports 
              processId={processId}
              propertyId={propertyId}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No process selected</p>
                  <p className="text-sm text-muted-foreground">Start a tokenization process to view reports</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          {propertyId && property ? (
            <RealTokenizationFlow propertyId={propertyId} property={property} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No property selected</p>
                  <p className="text-sm text-muted-foreground">Select a property to manage tokenization</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}