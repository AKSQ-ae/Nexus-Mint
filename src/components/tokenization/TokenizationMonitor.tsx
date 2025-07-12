import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { ErrorDisplay } from '@/components/ui/enhanced-error-handling';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  BarChart3, 
  FileText,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';

interface TokenizationProcess {
  id: string;
  property_id: string;
  status: string;
  current_step: string;
  progress_percentage: number;
  started_at: string;
  completed_at?: string;
  steps_completed: string[];
  error_logs: any[];
  properties?: {
    title: string;
    location: string;
    price: number;
  };
  tokenization_steps?: any[];
}

interface TokenizationMonitorProps {
  propertyId?: string;
  processId?: string;
  onProcessComplete?: (processId: string) => void;
}

export function TokenizationMonitor({ 
  propertyId, 
  processId, 
  onProcessComplete 
}: TokenizationMonitorProps) {
  const [processes, setProcesses] = useState<TokenizationProcess[]>([]);
  const [currentProcess, setCurrentProcess] = useState<TokenizationProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (processId) {
      fetchProcess(processId);
    } else {
      fetchProcesses();
    }
  }, [processId, propertyId]);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('monitor-tokenization', {
        body: { action: 'list_processes' }
      });

      if (error) throw error;
      setProcesses(data.processes || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch processes';
      setError(errorMsg);
      enhancedToast.error({ 
        title: 'Failed to Load Processes',
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProcess = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('monitor-tokenization', {
        body: { action: 'get_process', processId: id }
      });

      if (error) throw error;
      setCurrentProcess(data.process);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch process';
      setError(errorMsg);
      enhancedToast.error({ 
        title: 'Failed to Load Process',
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const createProcess = async () => {
    if (!propertyId) return;

    try {
      const { data, error } = await supabase.functions.invoke('monitor-tokenization', {
        body: { 
          action: 'create_process', 
          propertyId 
        }
      });

      if (error) throw error;
      
      setCurrentProcess(data.process);
      enhancedToast.success({
        title: 'Tokenization Process Started',
        description: 'Monitoring has begun for this property'
      });

      if (onProcessComplete) {
        onProcessComplete(data.process.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create process';
      enhancedToast.error({ 
        title: 'Failed to Start Process',
        description: errorMsg
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading tokenization processes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Tokenization Monitor"
        message={error}
        onRetry={() => processId ? fetchProcess(processId) : fetchProcesses()}
      />
    );
  }

  // Show process creation for new properties
  if (!currentProcess && !processes.length && propertyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Start Tokenization Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Begin monitoring the tokenization process for this property to track progress and generate reports.
          </p>
          <Button onClick={createProcess} className="w-full">
            Start Monitoring Process
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show current process details
  if (currentProcess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tokenization Process Monitor
              </div>
              <Badge className={getStatusColor(currentProcess.status)}>
                {currentProcess.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{currentProcess.properties?.title}</h3>
                <p className="text-muted-foreground">{currentProcess.properties?.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <p>{new Date(currentProcess.started_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p>{formatDuration(currentProcess.started_at, currentProcess.completed_at)}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {currentProcess.progress_percentage}%
                  </span>
                </div>
                <Progress value={currentProcess.progress_percentage} className="w-full" />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Process Steps</h4>
                {currentProcess.tokenization_steps?.map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <p className="font-medium capitalize">
                          {step.step_name.replace('_', ' ')}
                        </p>
                        {step.started_at && (
                          <p className="text-sm text-muted-foreground">
                            {step.completed_at ? 
                              `Completed in ${formatDuration(step.started_at, step.completed_at)}` :
                              `Started ${new Date(step.started_at).toLocaleTimeString()}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(step.status)}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {currentProcess.error_logs && currentProcess.error_logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Error Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentProcess.error_logs.map((log, index) => (
                  <div key={index} className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="font-medium">{log.step}</p>
                    <p className="text-sm text-red-600">{log.error}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show processes list
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Tokenization Processes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tokenization processes found
          </p>
        ) : (
          <div className="space-y-4">
            {processes.map((process) => (
              <div key={process.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{process.properties?.title}</h3>
                  <Badge className={getStatusColor(process.status)}>
                    {process.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  {process.properties?.location}
                </p>
                <Progress value={process.progress_percentage} className="mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Started: {new Date(process.started_at).toLocaleDateString()}</span>
                  <span>{process.progress_percentage}% complete</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}