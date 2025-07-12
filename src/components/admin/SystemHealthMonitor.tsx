import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Shield, 
  Cloud, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { deploymentService } from '@/lib/services/deployment-service';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime?: number;
  lastCheck: string;
}

export const SystemHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<{
    overall: 'healthy' | 'warning' | 'critical';
    services: ServiceStatus[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const health = await deploymentService.monitorDeploymentHealth();
      setHealthData(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkHealth();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'warning':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'critical':
        return 'text-red-500 bg-red-50 border-red-200';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      case 'storage':
        return <Cloud className="h-4 w-4" />;
      case 'tokenization system':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Monitor
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-emerald-50 border-emerald-200' : ''}
            >
              <Clock className="h-4 w-4 mr-1" />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {healthData && (
          <>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6" />
                <div>
                  <div className="font-medium">Overall System Status</div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <Badge className={getStatusColor(healthData.overall)}>
                {healthData.overall.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Service Status
              </h4>
              
              {healthData.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(service.name)}
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {service.responseTime && (
                      <span className="text-sm text-muted-foreground">
                        {service.responseTime}ms
                      </span>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {getStatusIcon(service.status)}
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(service.status)}
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {healthData.overall === 'critical' && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Issues Detected
                </div>
                <p className="text-sm text-red-600">
                  One or more critical services are not functioning properly. 
                  Production deployment should be delayed until these issues are resolved.
                </p>
              </div>
            )}

            {healthData.overall === 'warning' && (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Service Warnings
                </div>
                <p className="text-sm text-amber-600">
                  Some services are experiencing issues but core functionality remains operational.
                  Monitor closely during deployment.
                </p>
              </div>
            )}

            {healthData.overall === 'healthy' && (
              <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                  <CheckCircle className="h-4 w-4" />
                  All Systems Operational
                </div>
                <p className="text-sm text-emerald-600">
                  All services are running normally. System is ready for production operations.
                </p>
              </div>
            )}
          </>
        )}

        {!healthData && !isLoading && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">System Health</h3>
            <p className="text-muted-foreground">
              Monitor the health of all critical services in real-time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};