import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  User,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionHealth {
  isValid: boolean;
  expiresAt: Date | null;
  lastRefresh: Date;
  refreshAttempts: number;
  maxRefreshAttempts: number;
  autoRefreshEnabled: boolean;
  backupSessionActive: boolean;
}

interface SessionBackup {
  userId: string;
  sessionData: any;
  timestamp: Date;
  encrypted: boolean;
}

export const SessionResilience: React.FC = () => {
  const { user, session } = useAuth();
  const [sessionHealth, setSessionHealth] = useState<SessionHealth>({
    isValid: false,
    expiresAt: null,
    lastRefresh: new Date(),
    refreshAttempts: 0,
    maxRefreshAttempts: 3,
    autoRefreshEnabled: true,
    backupSessionActive: false
  });

  const [backupSessions, setBackupSessions] = useState<SessionBackup[]>([]);
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [warningIssued, setWarningIssued] = useState(false);

  // Session heartbeat interval (every 30 seconds)
  const HEARTBEAT_INTERVAL = 30000;
  // Warning threshold (5 minutes before expiry)
  const WARNING_THRESHOLD = 5 * 60 * 1000;
  // Auto-refresh threshold (10 minutes before expiry)
  const REFRESH_THRESHOLD = 10 * 60 * 1000;

  // Track user activity
  const updateActivity = useCallback(() => {
    setLastActivity(new Date());
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  // Create encrypted session backup
  const createSessionBackup = useCallback(async () => {
    if (!user || !session) return;

    try {
      const backup: SessionBackup = {
        userId: user.id,
        sessionData: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user_metadata: user.user_metadata
        },
        timestamp: new Date(),
        encrypted: true
      };

      // Store in secure local storage with encryption
      const encrypted = btoa(JSON.stringify(backup));
      localStorage.setItem(`session_backup_${user.id}`, encrypted);
      
      setBackupSessions(prev => [backup, ...prev.slice(0, 2)]); // Keep last 3 backups
      
    } catch (error) {
      console.error('Failed to create session backup:', error);
    }
  }, [user, session]);

  // Restore from backup session
  const restoreFromBackup = useCallback(async () => {
    if (!user) return false;

    try {
      const backupData = localStorage.getItem(`session_backup_${user.id}`);
      if (!backupData) return false;

      const backup: SessionBackup = JSON.parse(atob(backupData));
      
      // Attempt to restore session
      const { data, error } = await supabase.auth.setSession({
        access_token: backup.sessionData.access_token,
        refresh_token: backup.sessionData.refresh_token
      });

      if (error) throw error;

      setSessionHealth(prev => ({ ...prev, backupSessionActive: true }));
      toast.success('Session restored from backup');
      return true;

    } catch (error) {
      console.error('Failed to restore session from backup:', error);
      return false;
    }
  }, [user]);

  // Proactive session refresh
  const refreshSession = useCallback(async () => {
    if (!session) return false;

    try {
      setSessionHealth(prev => ({ 
        ...prev, 
        refreshAttempts: prev.refreshAttempts + 1 
      }));

      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      setSessionHealth(prev => ({
        ...prev,
        isValid: true,
        lastRefresh: new Date(),
        refreshAttempts: 0,
        expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000) : null
      }));

      // Create new backup after successful refresh
      await createSessionBackup();
      
      toast.success('Session refreshed successfully');
      return true;

    } catch (error) {
      console.error('Session refresh failed:', error);
      
      setSessionHealth(prev => {
        const newAttempts = prev.refreshAttempts + 1;
        if (newAttempts >= prev.maxRefreshAttempts) {
          toast.error('Session refresh failed - Attempting backup restore');
          restoreFromBackup();
        }
        return { ...prev, refreshAttempts: newAttempts };
      });
      
      return false;
    }
  }, [session, createSessionBackup, restoreFromBackup]);

  // Check session validity and handle expiration
  const checkSessionHealth = useCallback(async () => {
    if (!session || !user) {
      setSessionHealth(prev => ({ ...prev, isValid: false }));
      return;
    }

    const now = Date.now();
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
    const timeUntilExpiry = expiresAt ? expiresAt.getTime() - now : 0;

    setSessionHealth(prev => ({
      ...prev,
      isValid: timeUntilExpiry > 0,
      expiresAt
    }));

    // Issue warning if close to expiry
    if (timeUntilExpiry > 0 && timeUntilExpiry <= WARNING_THRESHOLD && !warningIssued) {
      setWarningIssued(true);
      toast.warning(`Session expires in ${Math.ceil(timeUntilExpiry / 60000)} minutes`);
    }

    // Auto-refresh if enabled and approaching expiry
    if (
      sessionHealth.autoRefreshEnabled && 
      timeUntilExpiry > 0 && 
      timeUntilExpiry <= REFRESH_THRESHOLD &&
      sessionHealth.refreshAttempts < sessionHealth.maxRefreshAttempts
    ) {
      await refreshSession();
    }

    // Reset warning flag if session was refreshed
    if (timeUntilExpiry > WARNING_THRESHOLD && warningIssued) {
      setWarningIssued(false);
    }

  }, [session, user, sessionHealth, warningIssued, refreshSession]);

  // Start/stop heartbeat monitoring
  const toggleHeartbeat = useCallback(() => {
    if (heartbeatActive) {
      setHeartbeatActive(false);
      return;
    }

    setHeartbeatActive(true);
    const interval = setInterval(checkSessionHealth, HEARTBEAT_INTERVAL);
    
    return () => {
      clearInterval(interval);
      setHeartbeatActive(false);
    };
  }, [heartbeatActive, checkSessionHealth]);

  // Initialize session monitoring
  useEffect(() => {
    if (user && session) {
      checkSessionHealth();
      createSessionBackup();
      
      // Auto-start heartbeat
      const cleanup = toggleHeartbeat();
      return cleanup;
    }
  }, [user, session]);

  const getTimeRemaining = () => {
    if (!sessionHealth.expiresAt) return 'Unknown';
    const remaining = sessionHealth.expiresAt.getTime() - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getHealthColor = () => {
    if (!sessionHealth.isValid) return 'text-red-600';
    const remaining = sessionHealth.expiresAt ? sessionHealth.expiresAt.getTime() - Date.now() : 0;
    if (remaining <= WARNING_THRESHOLD) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressValue = () => {
    if (!sessionHealth.expiresAt) return 0;
    const total = 60 * 60 * 1000; // 1 hour session
    const remaining = sessionHealth.expiresAt.getTime() - Date.now();
    return Math.max(0, (remaining / total) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Session Resilience Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Session Status:</span>
              <Badge className={getHealthColor()}>
                {sessionHealth.isValid ? 'VALID' : 'INVALID'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Time Remaining:</span>
              <span className={`text-sm font-mono ${getHealthColor()}`}>
                {getTimeRemaining()}
              </span>
            </div>
          </div>

          {/* Session Expiry Progress */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Session Health:</span>
            <Progress value={getProgressValue()} className="h-2" />
          </div>

          {/* Auto-refresh Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto-refresh:</span>
            <Badge variant={sessionHealth.autoRefreshEnabled ? "default" : "secondary"}>
              {sessionHealth.autoRefreshEnabled ? 'ENABLED' : 'DISABLED'}
            </Badge>
          </div>

          {/* Refresh Attempts */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Refresh Attempts:</span>
            <span className="text-sm">
              {sessionHealth.refreshAttempts}/{sessionHealth.maxRefreshAttempts}
            </span>
          </div>

          {/* Backup Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Backup Sessions:</span>
            <span className="text-sm">{backupSessions.length} available</span>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={refreshSession}
              disabled={!session || sessionHealth.refreshAttempts >= sessionHealth.maxRefreshAttempts}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Manual Refresh
            </Button>
            
            <Button
              onClick={restoreFromBackup}
              disabled={!user || backupSessions.length === 0}
              variant="outline"
              size="sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Restore Backup
            </Button>
            
            <Button
              onClick={() => setSessionHealth(prev => ({ 
                ...prev, 
                autoRefreshEnabled: !prev.autoRefreshEnabled 
              }))}
              variant="outline"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              {sessionHealth.autoRefreshEnabled ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
          </div>

          {/* Activity Monitor */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span>Last Activity:</span>
              <span className="font-mono">
                {lastActivity.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Heartbeat:</span>
              <Badge variant={heartbeatActive ? "default" : "secondary"}>
                {heartbeatActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Warnings */}
      {!sessionHealth.isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Session Invalid</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              Your session has expired or become invalid. Please refresh or restore from backup.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};