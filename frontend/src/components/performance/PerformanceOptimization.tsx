import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Users, 
  Server, 
  Database, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  activeUsers: number;
  uptime: number;
}

interface LoadTestResult {
  scenario: string;
  duration: number;
  virtualUsers: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  status: 'passed' | 'failed' | 'warning';
}

export const PerformanceOptimization = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.02,
    cpuUsage: 34,
    memoryUsage: 68,
    dbConnections: 45,
    activeUsers: 127,
    uptime: 99.97
  });

  const [loadTestResults, setLoadTestResults] = useState<LoadTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(100, prev.responseTime + (Math.random() - 0.5) * 50),
        throughput: Math.max(800, prev.throughput + (Math.random() - 0.5) * 200),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.01)),
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeUsers: Math.max(50, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runLoadTests = async () => {
    setIsRunningTests(true);
    setLoadTestResults([]);

    const scenarios = [
      { name: 'Property Browsing', users: 100, duration: 300 },
      { name: 'User Registration', users: 50, duration: 180 },
      { name: 'Investment Flow', users: 25, duration: 420 },
      { name: 'Portfolio Dashboard', users: 75, duration: 240 },
      { name: 'API Endpoints', users: 200, duration: 360 }
    ];

    for (const scenario of scenarios) {
      // Simulate load test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: LoadTestResult = {
        scenario: scenario.name,
        duration: scenario.duration,
        virtualUsers: scenario.users,
        requestsPerSecond: Math.random() * 100 + 50,
        averageResponseTime: Math.random() * 500 + 200,
        errorRate: Math.random() * 0.05,
        status: Math.random() > 0.8 ? 'warning' : 'passed'
      };

      setLoadTestResults(prev => [...prev, result]);
    }

    setIsRunningTests(false);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: LoadTestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Performance Optimization Dashboard</CardTitle>
          <CardDescription>
            Monitor system performance and run load tests to ensure optimal user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={runLoadTests} disabled={isRunningTests}>
              {isRunningTests ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Load Tests
                </>
              )}
            </Button>
            
            <Badge variant="outline" className="text-green-600">
              System Status: Healthy
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.responseTime, { good: 200, warning: 500 })}`}>
                  {Math.round(metrics.responseTime)}ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.throughput)}/s
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.errorRate * 100, { good: 1, warning: 5 })}`}>
                  {(metrics.errorRate * 100).toFixed(2)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.activeUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>CPU Usage</span>
                <span className={getStatusColor(metrics.cpuUsage, { good: 50, warning: 80 })}>
                  {Math.round(metrics.cpuUsage)}%
                </span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span className={getStatusColor(metrics.memoryUsage, { good: 70, warning: 85 })}>
                  {Math.round(metrics.memoryUsage)}%
                </span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Uptime</span>
                <span className="text-green-600">{metrics.uptime}%</span>
              </div>
              <Progress value={metrics.uptime} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Connections</span>
              <span className="font-medium">{metrics.dbConnections}/100</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Query Performance</span>
              <span className="font-medium text-green-600">Optimal</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Connection Pool</span>
              <span className="font-medium text-blue-600">Healthy</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Slow Queries</span>
              <span className="font-medium text-green-600">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load Test Results */}
      {loadTestResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Load Test Results
            </CardTitle>
            <CardDescription>
              Results from the latest performance testing session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadTestResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      {result.scenario}
                    </h4>
                    <Badge variant={result.status === 'passed' ? 'default' : 'secondary'}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Virtual Users</span>
                      <div className="font-medium">{result.virtualUsers}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <div className="font-medium">{result.duration}s</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requests/sec</span>
                      <div className="font-medium">{result.requestsPerSecond.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Response</span>
                      <div className="font-medium">{Math.round(result.averageResponseTime)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Error Rate</span>
                      <div className={`font-medium ${getStatusColor(result.errorRate * 100, { good: 1, warning: 5 })}`}>
                        {(result.errorRate * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Excellent Response Times</h4>
                <p className="text-sm text-green-700">
                  Your application maintains sub-300ms response times across all endpoints.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Monitor Memory Usage</h4>
                <p className="text-sm text-orange-700">
                  Memory usage is approaching 70%. Consider implementing caching strategies.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Scale for Growth</h4>
                <p className="text-sm text-blue-700">
                  Current capacity supports 500 concurrent users. Plan scaling for 1000+ users.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};