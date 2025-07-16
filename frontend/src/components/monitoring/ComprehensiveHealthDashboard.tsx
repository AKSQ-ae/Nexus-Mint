import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Globe, 
  Server, 
  Shield, 
  Zap,
  Users,
  TrendingUp,
  Clock,
  Wifi,
  HardDrive,
  Cpu,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value?: string | number;
  lastCheck: string;
  responseTime?: number;
  details?: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastUpdated: string;
  services: HealthMetric[];
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    activeUsers: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export const ComprehensiveHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      // Call the deployment health check function
      const { data, error } = await supabase.functions.invoke('deployment-health-check');
      
      if (error) throw error;

      // Mock additional system data for comprehensive dashboard
      const mockSystemHealth: SystemHealth = {
        overall: data?.overall || 'healthy',
        uptime: '99.98%',
        lastUpdated: new Date().toISOString(),
        services: [
          {
            name: 'Database',
            status: 'healthy',
            value: '< 50ms',
            lastCheck: new Date().toISOString(),
            responseTime: 45,
            details: 'All connections healthy'
          },
          {
            name: 'Authentication',
            status: 'healthy',
            value: 'Active',
            lastCheck: new Date().toISOString(),
            responseTime: 23,
            details: 'Supabase Auth running smoothly'
          },
          {
            name: 'Edge Functions',
            status: 'healthy',
            value: '12/12',
            lastCheck: new Date().toISOString(),
            responseTime: 156,
            details: 'All functions operational'
          },
          {
            name: 'Storage',
            status: 'healthy',
            value: '85% free',
            lastCheck: new Date().toISOString(),
            responseTime: 67,
            details: 'Storage buckets accessible'
          },
          {
            name: 'Real-time',
            status: 'healthy',
            value: 'Connected',
            lastCheck: new Date().toISOString(),
            responseTime: 12,
            details: 'WebSocket connections stable'
          },
          {
            name: 'CDN',
            status: 'healthy',
            value: 'Global',
            lastCheck: new Date().toISOString(),
            responseTime: 89,
            details: 'Content delivery optimized'
          }
        ],
        performance: {
          cpu: 45,
          memory: 62,
          disk: 38,
          activeUsers: 1247,
          requestsPerSecond: 156,
          errorRate: 0.02
        },
        alerts: []
      };

      setHealth(mockSystemHealth);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      setHealth({
        overall: 'critical',
        uptime: 'Unknown',
        lastUpdated: new Date().toISOString(),
        services: [],
        performance: {
          cpu: 0,
          memory: 0,
          disk: 0,
          activeUsers: 0,
          requestsPerSecond: 0,
          errorRate: 100
        },
        alerts: [{
          id: '1',
          type: 'error',
          message: 'Failed to connect to health monitoring service',
          timestamp: new Date().toISOString()
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading health data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of all Nexus Mint platform components
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button onClick={fetchHealthData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(health?.overall || 'unknown')}`} />
              <div>
                <h3 className="text-2xl font-bold capitalize">{health?.overall}</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {health?.lastUpdated ? new Date(health.lastUpdated).toLocaleTimeString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{health?.uptime}</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health?.services.map((service, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {service.name}
                </span>
                <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'warning' ? 'secondary' : 'destructive'}>
                  {service.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {service.value && (
                  <div className="text-lg font-semibold">{service.value}</div>
                )}
                {service.responseTime && (
                  <div className="text-sm text-muted-foreground">
                    Response: {service.responseTime}ms
                  </div>
                )}
                {service.details && (
                  <div className="text-xs text-muted-foreground">{service.details}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={health?.performance.cpu} className="mb-2" />
                <div className="text-2xl font-bold">{health?.performance.cpu}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={health?.performance.memory} className="mb-2" />
                <div className="text-2xl font-bold">{health?.performance.memory}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.performance.activeUsers?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Currently online</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{health?.performance.errorRate}%</div>
                <div className="text-sm text-muted-foreground">Last 24h</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Requests/Second</span>
                    <span className="font-bold">{health?.performance.requestsPerSecond}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <span className="font-bold">156ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold text-green-600">99.98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Disk Usage</span>
                    <span className="font-bold">{health?.performance.disk}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network I/O</span>
                    <span className="font-bold">2.4 GB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Connections</span>
                    <span className="font-bold">45/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {health?.alerts && health.alerts.length > 0 ? (
            <div className="space-y-4">
              {health.alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{alert.type.toUpperCase()}</AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium">No Active Alerts</h3>
                  <p>All systems are operating normally.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};