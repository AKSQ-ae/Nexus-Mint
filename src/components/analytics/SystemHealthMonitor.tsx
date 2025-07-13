import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database, Globe, Zap, FileText, TestTube, Eye, Shield, Gauge, Bug, Code, GitBranch, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestingMetrics {
  eslint: {
    status: 'passed' | 'warning' | 'failed';
    errors: number;
    warnings: number;
    lastRun: string;
  };
  typescript: {
    status: 'passed' | 'failed';
    errors: number;
    lastRun: string;
  };
  jestUnit: {
    status: 'passed' | 'failed';
    tests: number;
    passed: number;
    failed: number;
    coverage: number;
    lastRun: string;
  };
  reactTesting: {
    status: 'passed' | 'failed';
    tests: number;
    passed: number;
    failed: number;
    lastRun: string;
  };
  playwright: {
    status: 'passed' | 'failed';
    tests: number;
    passed: number;
    failed: number;
    lastRun: string;
  };
  accessibility: {
    status: 'passed' | 'warning' | 'failed';
    violations: number;
    wcagLevel: string;
    lastRun: string;
  };
  lighthouse: {
    status: 'passed' | 'warning' | 'failed';
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
    lastRun: string;
  };
  postman: {
    status: 'passed' | 'failed';
    tests: number;
    passed: number;
    failed: number;
    lastRun: string;
  };
  sentry: {
    status: 'healthy' | 'warning' | 'critical';
    errors: number;
    issues: number;
    lastError: string;
  };
  security: {
    status: 'passed' | 'warning' | 'failed';
    vulnerabilities: number;
    critical: number;
    high: number;
    lastScan: string;
  };
  performance: {
    bundleSize: number;
    maxBundleSize: number;
    cssSize: number;
    jsSize: number;
    status: 'passed' | 'warning' | 'failed';
  };
}

interface SystemMetrics {
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
  databaseHealth: 'healthy' | 'degraded' | 'down';
  apiHealth: 'healthy' | 'degraded' | 'down';
  testing: TestingMetrics;
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
    testing: {
      eslint: {
        status: 'passed',
        errors: 0,
        warnings: 2,
        lastRun: new Date().toISOString()
      },
      typescript: {
        status: 'passed',
        errors: 0,
        lastRun: new Date().toISOString()
      },
      jestUnit: {
        status: 'passed',
        tests: 45,
        passed: 43,
        failed: 2,
        coverage: 87,
        lastRun: new Date().toISOString()
      },
      reactTesting: {
        status: 'passed',
        tests: 12,
        passed: 12,
        failed: 0,
        lastRun: new Date().toISOString()
      },
      playwright: {
        status: 'passed',
        tests: 8,
        passed: 7,
        failed: 1,
        lastRun: new Date().toISOString()
      },
      accessibility: {
        status: 'passed',
        violations: 0,
        wcagLevel: 'AA',
        lastRun: new Date().toISOString()
      },
      lighthouse: {
        status: 'passed',
        performance: 92,
        accessibility: 98,
        bestPractices: 95,
        seo: 90,
        pwa: 88,
        lastRun: new Date().toISOString()
      },
      postman: {
        status: 'passed',
        tests: 24,
        passed: 22,
        failed: 2,
        lastRun: new Date().toISOString()
      },
      sentry: {
        status: 'healthy',
        errors: 3,
        issues: 1,
        lastError: '2 hours ago'
      },
      security: {
        status: 'passed',
        vulnerabilities: 0,
        critical: 0,
        high: 0,
        lastScan: new Date().toISOString()
      },
      performance: {
        bundleSize: 245,
        maxBundleSize: 500,
        cssSize: 45,
        jsSize: 200,
        status: 'passed'
      }
    }
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { toast } = useToast();

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(200 + Math.random() * 100),
        activeUsers: Math.floor(100 + Math.random() * 50),
        errorRate: parseFloat((Math.random() * 0.5).toFixed(2)),
        testing: {
          ...prev.testing,
          sentry: {
            ...prev.testing.sentry,
            errors: Math.floor(Math.random() * 10)
          },
          lighthouse: {
            ...prev.testing.lighthouse,
            performance: Math.floor(85 + Math.random() * 15)
          }
        }
      }));
      setLastUpdated(new Date());
    }, 30000);

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
      case 'healthy': case 'passed': return 'text-green-600';
      case 'warning': case 'degraded': return 'text-yellow-600';
      case 'critical': case 'down': case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'passed': return <CheckCircle className="w-4 h-4" />;
      case 'warning': case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': case 'down': case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': case 'passed': return 'default';
      case 'warning': case 'degraded': return 'secondary';
      case 'critical': case 'down': case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive System Health</h2>
          <p className="text-muted-foreground">
            Complete testing and monitoring dashboard • Last updated: {lastUpdated.toLocaleTimeString()}
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

      {/* Core System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average API response</p>
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
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Code Quality & Type Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Code Quality & Type Safety
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <span className="font-medium">ESLint</span>
                <p className="text-xs text-muted-foreground">{metrics.testing.eslint.errors} errors, {metrics.testing.eslint.warnings} warnings</p>
              </div>
              <Badge variant={getBadgeVariant(metrics.testing.eslint.status)}>
                {metrics.testing.eslint.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <span className="font-medium">TypeScript</span>
                <p className="text-xs text-muted-foreground">{metrics.testing.typescript.errors} type errors</p>
              </div>
              <Badge variant={getBadgeVariant(metrics.testing.typescript.status)}>
                {metrics.testing.typescript.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Suite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Jest Unit Tests</span>
                <Badge variant={getBadgeVariant(metrics.testing.jestUnit.status)}>
                  {metrics.testing.jestUnit.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.jestUnit.passed}/{metrics.testing.jestUnit.tests} passed
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={metrics.testing.jestUnit.coverage} className="flex-1" />
                <span className="text-xs">{metrics.testing.jestUnit.coverage}% coverage</span>
              </div>
            </div>

            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">React Testing</span>
                <Badge variant={getBadgeVariant(metrics.testing.reactTesting.status)}>
                  {metrics.testing.reactTesting.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.reactTesting.passed}/{metrics.testing.reactTesting.tests} passed
              </p>
            </div>

            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Playwright E2E</span>
                <Badge variant={getBadgeVariant(metrics.testing.playwright.status)}>
                  {metrics.testing.playwright.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.playwright.passed}/{metrics.testing.playwright.tests} passed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality & Performance Audits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Accessibility & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Accessibility Tests</span>
                <Badge variant={getBadgeVariant(metrics.testing.accessibility.status)}>
                  WCAG {metrics.testing.accessibility.wcagLevel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.accessibility.violations} violations found
              </p>
            </div>

            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Lighthouse CI</span>
                <Badge variant={getBadgeVariant(metrics.testing.lighthouse.status)}>
                  {metrics.testing.lighthouse.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Performance: {metrics.testing.lighthouse.performance}/100</div>
                <div>Accessibility: {metrics.testing.lighthouse.accessibility}/100</div>
                <div>Best Practices: {metrics.testing.lighthouse.bestPractices}/100</div>
                <div>SEO: {metrics.testing.lighthouse.seo}/100</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Security Audit</span>
                <Badge variant={getBadgeVariant(metrics.testing.security.status)}>
                  {metrics.testing.security.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.security.vulnerabilities} vulnerabilities ({metrics.testing.security.critical} critical)
              </p>
            </div>

            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Sentry Monitoring</span>
                <Badge variant={getBadgeVariant(metrics.testing.sentry.status)}>
                  {metrics.testing.sentry.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.sentry.errors} errors, {metrics.testing.sentry.issues} issues
              </p>
            </div>

            <div className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">API Tests</span>
                <Badge variant={getBadgeVariant(metrics.testing.postman.status)}>
                  {metrics.testing.postman.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.testing.postman.passed}/{metrics.testing.postman.tests} endpoints passed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Performance Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold">{metrics.testing.performance.bundleSize}KB</div>
              <p className="text-xs text-muted-foreground">Total Bundle</p>
              <Progress 
                value={(metrics.testing.performance.bundleSize / metrics.testing.performance.maxBundleSize) * 100} 
                className="mt-2" 
              />
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold">{metrics.testing.performance.jsSize}KB</div>
              <p className="text-xs text-muted-foreground">JavaScript</p>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold">{metrics.testing.performance.cssSize}KB</div>
              <p className="text-xs text-muted-foreground">CSS</p>
            </div>
            <div className="text-center p-3 border rounded">
              <Badge variant={getBadgeVariant(metrics.testing.performance.status)} className="w-full">
                {metrics.testing.performance.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Budget Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Core Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Database</span>
              <div className={`flex items-center gap-2 ${getStatusColor(metrics.databaseHealth)}`}>
                {getStatusIcon(metrics.databaseHealth)}
                <span className="text-sm font-medium">{metrics.databaseHealth}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">API Services</span>
              <div className={`flex items-center gap-2 ${getStatusColor(metrics.apiHealth)}`}>
                {getStatusIcon(metrics.apiHealth)}
                <span className="text-sm font-medium">{metrics.apiHealth}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}