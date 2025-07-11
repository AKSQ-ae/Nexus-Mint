import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedNotificationCenter } from '@/components/enhanced/EnhancedNotificationCenter';
import { SmartContractMonitor } from '@/components/enhanced/SmartContractMonitor';
import { RealTimeChat } from '@/components/enhanced/RealTimeChat';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  Bell,
  MessageCircle,
  Shield,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminStats {
  total_users: number;
  total_properties: number;
  total_investments: number;
  total_value: number;
  pending_kyc: number;
  active_sessions: number;
  unprocessed_events: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_properties: 0,
    total_investments: 0,
    total_value: 0,
    pending_kyc: 0,
    active_sessions: 0,
    unprocessed_events: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  const { onlineUsers, totalOnlineUsers, getPageUserCounts } = useRealTimePresence('admin-dashboard');

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_role_assignments')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .eq('is_active', true)
          .single();

        setIsAdmin(!!data && !error);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  // Fetch admin statistics
  const fetchStats = async () => {
    if (!user?.id || !isAdmin) return;

    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch property count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch investment stats
      const { data: investments } = await supabase
        .from('investments')
        .select('total_amount')
        .in('status', ['confirmed', 'completed']);

      const totalInvestments = investments?.length || 0;
      const totalValue = investments?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Fetch pending KYC count
      const { count: pendingKyc } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'pending');

      // Fetch active sessions count
      const { count: activeSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('last_seen', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Last 30 minutes

      // Fetch unprocessed contract events
      const { count: unprocessedEvents } = await supabase
        .from('smart_contract_events')
        .select('*', { count: 'exact', head: true })
        .eq('processed', false);

      setStats({
        total_users: userCount || 0,
        total_properties: propertyCount || 0,
        total_investments: totalInvestments,
        total_value: totalValue,
        pending_kyc: pendingKyc || 0,
        active_sessions: activeSessions || 0,
        unprocessed_events: unprocessedEvents || 0
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, user?.id]);

  // Trigger edge functions for analytics
  const triggerAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-analytics', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Analytics calculation triggered',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger analytics',
        variant: 'destructive',
      });
    }
  };

  // Sync property data
  const syncPropertyData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-property-data');

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Updated ${data.properties_updated || 0} properties`,
      });
      
      fetchStats(); // Refresh stats
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync property data',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor and manage the real estate investment platform
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {totalOnlineUsers} online
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.total_users}</p>
                {stats.pending_kyc > 0 && (
                  <p className="text-xs text-orange-600">{stats.pending_kyc} pending KYC</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Properties</p>
                <p className="text-2xl font-bold">{stats.total_properties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold">${(stats.total_value / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">{stats.total_investments} investments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Active Now</p>
                <p className="text-2xl font-bold">{stats.active_sessions}</p>
                {stats.unprocessed_events > 0 && (
                  <p className="text-xs text-red-600">{stats.unprocessed_events} pending events</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={triggerAnalytics} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Calculate Analytics
            </Button>
            <Button variant="outline" onClick={syncPropertyData} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Property Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Online Users ({totalOnlineUsers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {onlineUsers.slice(0, 10).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{user.display_name || 'Anonymous'}</span>
                      <div className="text-xs text-muted-foreground">
                        {user.page_url}
                      </div>
                    </div>
                  ))}
                  {onlineUsers.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No users currently online
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Page Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(getPageUserCounts()).map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">{page}</span>
                      <Badge variant="secondary">{count} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <EnhancedNotificationCenter />
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <SmartContractMonitor propertyId="admin-overview" />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealTimeChat roomId="admin-general" className="h-96" />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <p className="text-sm font-medium">Active Chat Rooms</p>
                      <p className="text-xs text-muted-foreground">Monitor ongoing conversations</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <p className="text-sm font-medium">Flagged Messages</p>
                      <p className="text-xs text-muted-foreground">Review reported content</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}