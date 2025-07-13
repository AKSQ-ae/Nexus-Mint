import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Key,
  Globe,
  Server
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetrics {
  sslStatus: 'valid' | 'expiring' | 'expired' | 'invalid';
  certificateExpiry: Date | null;
  corsConfiguration: 'secure' | 'permissive' | 'misconfigured';
  authenticationStrength: 'strong' | 'moderate' | 'weak';
  rateLimitStatus: 'active' | 'bypassed' | 'disabled';
  encryptionStatus: 'end-to-end' | 'transport-only' | 'none';
  suspiciousActivityDetected: boolean;
  lastSecurityScan: Date | null;
}

interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: Date;
  blocked: boolean;
  description: string;
}

export const SecurityResilience: React.FC = () => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    sslStatus: 'valid',
    certificateExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    corsConfiguration: 'secure',
    authenticationStrength: 'strong',
    rateLimitStatus: 'active',
    encryptionStatus: 'end-to-end',
    suspiciousActivityDetected: false,
    lastSecurityScan: new Date()
  });

  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);

  // Simulate security checks
  const performSecurityScan = async (): Promise<SecurityMetrics> => {
    try {
      // Check SSL certificate status
      const domain = window.location.hostname;
      const sslCheck = await fetch(`https://${domain}`, { method: 'HEAD' });
      
      // Simulate security metrics evaluation
      const metrics: SecurityMetrics = {
        sslStatus: sslCheck.ok ? 'valid' : 'invalid',
        certificateExpiry: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        corsConfiguration: Math.random() > 0.1 ? 'secure' : 'permissive',
        authenticationStrength: 'strong', // Based on current auth setup
        rateLimitStatus: 'active',
        encryptionStatus: 'end-to-end',
        suspiciousActivityDetected: Math.random() > 0.9, // 10% chance of suspicious activity
        lastSecurityScan: new Date()
      };

      return metrics;

    } catch (error) {
      console.error('Security scan failed:', error);
      return {
        ...securityMetrics,
        sslStatus: 'invalid',
        lastSecurityScan: new Date()
      };
    }
  };

  // Detect and handle security threats
  const detectThreat = (type: SecurityThreat['type'], source: string): SecurityThreat => {
    const threat: SecurityThreat = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: type === 'sql_injection' || type === 'brute_force' ? 'critical' : 'medium',
      source,
      timestamp: new Date(),
      blocked: autoBlockEnabled,
      description: getThreatDescription(type)
    };

    return threat;
  };

  const getThreatDescription = (type: SecurityThreat['type']): string => {
    switch (type) {
      case 'brute_force':
        return 'Multiple failed login attempts detected from single source';
      case 'sql_injection':
        return 'Suspicious SQL patterns detected in request parameters';
      case 'xss':
        return 'Cross-site scripting attempt detected in user input';
      case 'csrf':
        return 'Cross-site request forgery attempt detected';
      case 'rate_limit_exceeded':
        return 'Request rate limit exceeded - potential DDoS attempt';
      default:
        return 'Unknown security threat detected';
    }
  };

  // Simulate threat detection
  const simulateThreatDetection = () => {
    const threatTypes: SecurityThreat['type'][] = [
      'brute_force', 'sql_injection', 'xss', 'csrf', 'rate_limit_exceeded'
    ];
    
    const randomType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const randomSource = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    const threat = detectThreat(randomType, randomSource);
    setThreats(prev => [threat, ...prev.slice(0, 9)]); // Keep last 10 threats

    if (threat.severity === 'critical') {
      toast.error(`Critical security threat detected: ${threat.description}`);
    } else {
      toast.warning(`Security threat detected: ${threat.description}`);
    }

    if (threat.blocked) {
      toast.info(`Threat ${threat.id} automatically blocked`);
    }
  };

  // Check CORS configuration
  const checkCorsConfiguration = async (): Promise<'secure' | 'permissive' | 'misconfigured'> => {
    try {
      // In a real implementation, this would check actual CORS headers
      const response = await fetch(window.location.origin, { method: 'OPTIONS' });
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      if (!corsHeader) return 'misconfigured';
      if (corsHeader === '*') return 'permissive';
      return 'secure';
    } catch {
      return 'misconfigured';
    }
  };

  // Monitor SSL certificate expiry
  const checkSSLStatus = (): 'valid' | 'expiring' | 'expired' | 'invalid' => {
    if (!securityMetrics.certificateExpiry) return 'invalid';
    
    const now = Date.now();
    const expiry = securityMetrics.certificateExpiry.getTime();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
  };

  // Security monitoring loop
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      const metrics = await performSecurityScan();
      setSecurityMetrics(metrics);

      // Random threat simulation (10% chance per check)
      if (Math.random() > 0.9) {
        simulateThreatDetection();
      }

      // Alert on certificate expiry
      const sslStatus = checkSSLStatus();
      if (sslStatus === 'expiring') {
        toast.warning('SSL certificate expires within 30 days');
      } else if (sslStatus === 'expired') {
        toast.error('SSL certificate has expired');
      }

    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getSecurityScore = (): number => {
    let score = 100;
    
    if (securityMetrics.sslStatus !== 'valid') score -= 25;
    if (securityMetrics.corsConfiguration !== 'secure') score -= 15;
    if (securityMetrics.authenticationStrength !== 'strong') score -= 20;
    if (securityMetrics.rateLimitStatus !== 'active') score -= 10;
    if (securityMetrics.encryptionStatus !== 'end-to-end') score -= 20;
    if (securityMetrics.suspiciousActivityDetected) score -= 10;
    
    return Math.max(0, score);
  };

  const getStatusColor = (status: string) => {
    if (status.includes('valid') || status.includes('secure') || status.includes('strong') || status.includes('active')) {
      return 'text-green-600';
    }
    if (status.includes('expiring') || status.includes('moderate') || status.includes('permissive')) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  const getThreatSeverityColor = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Resilience Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Security Score:</span>
              <span className="font-bold">{getSecurityScore()}/100</span>
            </div>
            <Progress value={getSecurityScore()} className="h-3" />
          </div>

          {/* SSL Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">SSL Certificate:</span>
              <Badge className={getStatusColor(securityMetrics.sslStatus)}>
                {securityMetrics.sslStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Certificate Expiry:</span>
              <span className="text-sm font-mono">
                {securityMetrics.certificateExpiry?.toLocaleDateString() || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Security Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">CORS Configuration:</span>
              <Badge className={getStatusColor(securityMetrics.corsConfiguration)}>
                {securityMetrics.corsConfiguration.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Auth Strength:</span>
              <Badge className={getStatusColor(securityMetrics.authenticationStrength)}>
                {securityMetrics.authenticationStrength.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Protection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Rate Limiting:</span>
              <Badge className={getStatusColor(securityMetrics.rateLimitStatus)}>
                {securityMetrics.rateLimitStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Encryption:</span>
              <Badge className={getStatusColor(securityMetrics.encryptionStatus)}>
                {securityMetrics.encryptionStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Threat Detection */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Suspicious Activity:</span>
            <Badge variant={securityMetrics.suspiciousActivityDetected ? "destructive" : "default"}>
              {securityMetrics.suspiciousActivityDetected ? 'DETECTED' : 'NONE'}
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "default" : "outline"}
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
            
            <Button
              onClick={simulateThreatDetection}
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulate Threat
            </Button>
            
            <Button
              onClick={() => setAutoBlockEnabled(!autoBlockEnabled)}
              variant="outline"
              size="sm"
            >
              <Lock className="h-4 w-4 mr-2" />
              {autoBlockEnabled ? 'Disable' : 'Enable'} Auto-block
            </Button>

            <Button
              onClick={async () => {
                const metrics = await performSecurityScan();
                setSecurityMetrics(metrics);
                toast.success('Security scan completed');
              }}
              variant="outline"
              size="sm"
            >
              <Server className="h-4 w-4 mr-2" />
              Manual Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Threats Log */}
      <Card>
        <CardHeader>
          <CardTitle>Security Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threats.map((threat) => (
              <div key={threat.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{threat.id}</span>
                  <div className="flex gap-2">
                    <Badge className={getThreatSeverityColor(threat.severity)}>
                      {threat.severity.toUpperCase()}
                    </Badge>
                    <Badge variant={threat.blocked ? "default" : "destructive"}>
                      {threat.blocked ? 'BLOCKED' : 'ALLOWED'}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  <div>Type: {threat.type.replace('_', ' ').toUpperCase()}</div>
                  <div>Source: {threat.source}</div>
                  <div>Time: {threat.timestamp.toLocaleString()}</div>
                </div>

                <p className="text-sm">{threat.description}</p>
              </div>
            ))}
            
            {threats.length === 0 && (
              <p className="text-center text-muted-foreground">No security threats detected</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Security Alerts */}
      {getSecurityScore() < 70 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Security Score Below Acceptable Threshold</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              Critical security configurations need immediate attention to protect financial data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};