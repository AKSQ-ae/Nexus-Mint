import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database, Globe, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
  databaseHealth: 'healthy' | 'degraded' | 'down';
  apiHealth: 'healthy' | 'degraded' | 'down';
  performance: {
    score: number;
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    cls: number; // Cumulative Layout Shift
  };
}

export function SystemHealthMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    status: 'healthy',
    responseTime: 245,
    uptime: 99.9,
    errorRate: 0.1,
    activeUsers: 127,
    databaseHealth: 'healthy',
    apiHealth: 'healthy',
    performance: {
      score: 92,
      fcp: 1.2,
      lcp: 2.1,
      cls: 0.05
    }
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { toast } = useToast();

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate metric variations
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(200 + Math.random() * 100),
        activeUsers: Math.floor(100 + Math.random() * 50),
        errorRate: parseFloat((Math.random() * 0.5).toFixed(2)),
        performance: {
          ...prev.performance,
          score: Math.floor(85 + Math.random() * 15),
        }
      }));
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Alert on critical issues
  useEffect(() => {
    if (metrics.errorRate > 1.0) {
      toast({
        title: "High Error Rate Detected",
        description: `Error rate has increased to ${metrics.errorRate}%`,
        variant: "destructive",
      });
    }
    if (metrics.responseTime > 1000) {
      toast({
        title: "Slow Response Time",
        description: `Response time is ${metrics.responseTime}ms`,
        variant: "destructive",
      });
    }
  }, [metrics.errorRate, metrics.responseTime, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': case 'degraded': return 'text-yellow-600';
      case 'critical': case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': case 'down': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Badge 
          variant={metrics.status === 'healthy' ? 'default' : 'destructive'}
          className="flex items-center gap-2"
        >
          {getStatusIcon(metrics.status)}
          {metrics.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average API response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <Progress value={metrics.uptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Service Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className={`flex items-center gap-2 ${getStatusColor(metrics.databaseHealth)}`}>
                {getStatusIcon(metrics.databaseHealth)}
                <span className="text-sm font-medium">{metrics.databaseHealth}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <div className={`flex items-center gap-2 ${getStatusColor(metrics.apiHealth)}`}>
                {getStatusIcon(metrics.apiHealth)}
                <span className="text-sm font-medium">{metrics.apiHealth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Performance Score</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.performance.score} className="w-20" />
                <span className="text-sm font-medium">{metrics.performance.score}/100</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">First Contentful Paint</span>
              <span className="text-sm font-medium">{metrics.performance.fcp}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Largest Contentful Paint</span>
              <span className="text-sm font-medium">{metrics.performance.lcp}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cumulative Layout Shift</span>
              <span className="text-sm font-medium">{metrics.performance.cls}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}