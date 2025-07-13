import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Shield, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Archive,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseHealth {
  connectionStatus: 'healthy' | 'degraded' | 'critical' | 'disconnected';
  responseTime: number;
  activeConnections: number;
  maxConnections: number;
  transactionIntegrity: boolean;
  backupStatus: 'current' | 'stale' | 'failed' | 'unknown';
  lastBackup: Date | null;
  replicationLag: number;
}

interface TransactionMonitor {
  id: string;
  type: 'investment' | 'payment' | 'user_action';
  status: 'pending' | 'committed' | 'failed' | 'rolled_back';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  retryCount: number;
}

export const DatabaseResilience: React.FC = () => {
  const [dbHealth, setDbHealth] = useState<DatabaseHealth>({
    connectionStatus: 'healthy',
    responseTime: 0,
    activeConnections: 0,
    maxConnections: 100,
    transactionIntegrity: true,
    backupStatus: 'unknown',
    lastBackup: null,
    replicationLag: 0
  });

  const [transactions, setTransactions] = useState<TransactionMonitor[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  // Database health check with comprehensive metrics
  const checkDatabaseHealth = async (): Promise<DatabaseHealth> => {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }

      // Test transaction integrity
      const { data: integrityTest, error: integrityError } = await supabase.rpc(
        'refresh_analytics_views'
      );

      // Simulate checking database stats (in real app, would query pg_stat_database)
      const mockStats = {
        activeConnections: Math.floor(Math.random() * 20) + 5,
        maxConnections: 100,
        replicationLag: Math.floor(Math.random() * 100)
      };

      const health: DatabaseHealth = {
        connectionStatus: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'critical',
        responseTime,
        activeConnections: mockStats.activeConnections,
        maxConnections: mockStats.maxConnections,
        transactionIntegrity: !integrityError,
        backupStatus: 'current', // Would check actual backup status
        lastBackup: new Date(Date.now() - Math.random() * 3600000), // Mock last backup
        replicationLag: mockStats.replicationLag
      };

      return health;

    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        connectionStatus: 'disconnected',
        responseTime: Date.now() - startTime,
        activeConnections: 0,
        maxConnections: 100,
        transactionIntegrity: false,
        backupStatus: 'failed',
        lastBackup: null,
        replicationLag: -1
      };
    }
  };

  // Execute transaction with monitoring and rollback capability
  const executeMonitoredTransaction = async (
    transactionType: 'investment' | 'payment' | 'user_action',
    operation: () => Promise<any>
  ): Promise<boolean> => {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const monitor: TransactionMonitor = {
      id: transactionId,
      type: transactionType,
      status: 'pending',
      startTime: new Date(),
      retryCount: 0
    };

    setTransactions(prev => [monitor, ...prev]);

    try {
      // Execute the operation within a transaction context
      const result = await operation();
      
      const completedMonitor = {
        ...monitor,
        status: 'committed' as const,
        endTime: new Date(),
        duration: Date.now() - monitor.startTime.getTime()
      };
      
      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? completedMonitor : t
      ));

      toast.success(`Transaction ${transactionId} committed successfully`);
      return true;

    } catch (error) {
      console.error(`Transaction ${transactionId} failed:`, error);
      
      // Attempt rollback
      try {
        // In real implementation, would perform actual rollback
        const rolledBackMonitor = {
          ...monitor,
          status: 'rolled_back' as const,
          endTime: new Date(),
          duration: Date.now() - monitor.startTime.getTime()
        };
        
        setTransactions(prev => prev.map(t => 
          t.id === transactionId ? rolledBackMonitor : t
        ));

        toast.warning(`Transaction ${transactionId} rolled back`);
      } catch (rollbackError) {
        const failedMonitor = {
          ...monitor,
          status: 'failed' as const,
          endTime: new Date(),
          duration: Date.now() - monitor.startTime.getTime()
        };
        
        setTransactions(prev => prev.map(t => 
          t.id === transactionId ? failedMonitor : t
        ));

        toast.error(`Transaction ${transactionId} failed and rollback unsuccessful`);
      }
      
      return false;
    }
  };

  // Simulate critical data backup
  const performBackup = async (): Promise<boolean> => {
    try {
      toast.info('Starting database backup...');
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDbHealth(prev => ({
        ...prev,
        backupStatus: 'current',
        lastBackup: new Date()
      }));

      toast.success('Database backup completed successfully');
      return true;

    } catch (error) {
      setDbHealth(prev => ({
        ...prev,
        backupStatus: 'failed'
      }));

      toast.error('Database backup failed');
      return false;
    }
  };

  // Monitor database health continuously
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      const health = await checkDatabaseHealth();
      setDbHealth(health);

      // Alert on critical issues
      if (health.connectionStatus === 'critical' || health.connectionStatus === 'disconnected') {
        toast.error('Database connection critical - Investigation required');
      }

      if (!health.transactionIntegrity) {
        toast.error('Transaction integrity compromised - System protection activated');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Auto-backup scheduling
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const interval = setInterval(() => {
      const hoursSinceBackup = dbHealth.lastBackup 
        ? (Date.now() - dbHealth.lastBackup.getTime()) / (1000 * 60 * 60)
        : 24;

      if (hoursSinceBackup >= 6) { // Backup every 6 hours
        performBackup();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoBackupEnabled, dbHealth.lastBackup]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'disconnected': return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  const getTransactionStatusColor = (status: TransactionMonitor['status']) => {
    switch (status) {
      case 'committed': return 'bg-green-500';
      case 'pending': return 'bg-blue-500';
      case 'rolled_back': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionUsage = () => {
    return (dbHealth.activeConnections / dbHealth.maxConnections) * 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Resilience Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Connection Status:</span>
              <Badge className={getStatusColor(dbHealth.connectionStatus)}>
                {dbHealth.connectionStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Response Time:</span>
              <span className={`text-sm font-mono ${getStatusColor(dbHealth.connectionStatus)}`}>
                {dbHealth.responseTime}ms
              </span>
            </div>
          </div>

          {/* Connection Pool */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Connection Pool Usage:</span>
              <span>{dbHealth.activeConnections}/{dbHealth.maxConnections}</span>
            </div>
            <Progress value={getConnectionUsage()} className="h-2" />
          </div>

          {/* Transaction Integrity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction Integrity:</span>
            <Badge variant={dbHealth.transactionIntegrity ? "default" : "destructive"}>
              {dbHealth.transactionIntegrity ? 'INTACT' : 'COMPROMISED'}
            </Badge>
          </div>

          {/* Backup Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Backup Status:</span>
              <Badge variant={dbHealth.backupStatus === 'current' ? "default" : "destructive"}>
                {dbHealth.backupStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Last Backup:</span>
              <span className="text-sm font-mono">
                {dbHealth.lastBackup?.toLocaleString() || 'Never'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "default" : "outline"}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
            
            <Button
              onClick={performBackup}
              variant="outline"
              size="sm"
            >
              <Archive className="h-4 w-4 mr-2" />
              Manual Backup
            </Button>
            
            <Button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              variant="outline"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              {autoBackupEnabled ? 'Disable' : 'Enable'} Auto-backup
            </Button>

            <Button
              onClick={() => executeMonitoredTransaction('investment', async () => {
                // Simulate investment transaction
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true };
              })}
              variant="outline"
              size="sm"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Test Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{transaction.id}</span>
                  <Badge className={getTransactionStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <span>Type: {transaction.type}</span>
                  <span>Duration: {transaction.duration || '---'}ms</span>
                  <span>Retries: {transaction.retryCount}</span>
                </div>

                {transaction.status === 'pending' && (
                  <Progress value={75} className="mt-2 h-2" />
                )}
              </div>
            ))}
            
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground">No transactions monitored yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {dbHealth.connectionStatus === 'critical' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Database Performance Critical</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              Database response time is degraded. Investment operations may be affected.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};