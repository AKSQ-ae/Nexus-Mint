import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Download, 
  AlertTriangle,
  Zap,
  Database,
  Shield,
  Wallet,
  Cloud,
  Activity
} from 'lucide-react';
import { deploymentService, DeploymentValidation, DeploymentCheck } from '@/lib/services/deployment-service';
import { toast } from 'sonner';

const getCheckIcon = (status: DeploymentCheck['status']) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'running':
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getCheckIconType = (checkName: string) => {
  if (checkName.includes('Database')) return <Database className="h-4 w-4" />;
  if (checkName.includes('Auth')) return <Shield className="h-4 w-4" />;
  if (checkName.includes('Payment')) return <Wallet className="h-4 w-4" />;
  if (checkName.includes('Edge Functions')) return <Zap className="h-4 w-4" />;
  if (checkName.includes('Blockchain')) return <Activity className="h-4 w-4" />;
  return <Cloud className="h-4 w-4" />;
};

export const DeploymentValidator: React.FC = () => {
  const [validation, setValidation] = useState<DeploymentValidation | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runValidation = async () => {
    setIsRunning(true);
    try {
      const result = await deploymentService.validatePreDeployment();
      setValidation(result);
      
      // Poll for updates during validation
      const pollInterval = setInterval(async () => {
        const updated = await deploymentService.getValidationResult(result.id);
        if (updated) {
          setValidation(updated);
          if (updated.status !== 'running') {
            clearInterval(pollInterval);
            setIsRunning(false);
            
            if (updated.status === 'passed') {
              toast.success('All deployment checks passed! Ready for production.');
            } else {
              toast.error('Deployment validation failed. Please review the issues.');
            }
          }
        }
      }, 500);

    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to run deployment validation');
      setIsRunning(false);
    }
  };

  const downloadReport = async () => {
    if (!validation) return;
    
    try {
      const report = await deploymentService.createDeploymentReport(validation);
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deployment-report-${validation.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Deployment report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getProgressValue = () => {
    if (!validation) return 0;
    const completed = validation.checks.filter(c => c.status === 'passed' || c.status === 'failed').length;
    return (completed / validation.checks.length) * 100;
  };

  const getStatusColor = (status: DeploymentValidation['status']) => {
    switch (status) {
      case 'passed':
        return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'failed':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Production Deployment Validator
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={runValidation}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running Validation...' : 'Run Validation'}
              </Button>
              
              {validation && (
                <Button
                  variant="outline"
                  onClick={downloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {validation && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(validation.status)}>
                    {validation.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {validation.timestamp}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {validation.checks.filter(c => c.status === 'passed').length} / {validation.checks.length} checks passed
                </div>
              </div>

              <Progress value={getProgressValue()} className="h-2" />

              <div className="space-y-3">
                {validation.checks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCheckIconType(check.name)}
                      <span className="font-medium">{check.name}</span>
                      {check.message && (
                        <span className="text-sm text-muted-foreground">
                          - {check.message}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {check.duration && (
                        <span className="text-xs text-muted-foreground">
                          {check.duration}ms
                        </span>
                      )}
                      {getCheckIcon(check.status)}
                    </div>
                  </div>
                ))}
              </div>

              {validation.errors && validation.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium text-red-700">Deployment Issues Found:</div>
                      {validation.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600">
                          • {error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validation.status === 'passed' && (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <AlertDescription className="text-emerald-700">
                    <div className="font-medium">✅ Ready for Production Deployment</div>
                    <div className="text-sm mt-1">
                      All critical systems have been validated and are functioning correctly.
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {!validation && !isRunning && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">Pre-Deployment Validation</h3>
              <p className="text-muted-foreground mb-4">
                Run comprehensive checks to ensure nexus_mint is ready for production deployment.
              </p>
              <p className="text-sm text-muted-foreground">
                This will validate database connections, smart contracts, payment systems, and more.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};