import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Coins,
  TrendingUp,
  Shield,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SmartContractMonitorProps {
  contractAddress?: string;
  propertyId: string;
}

interface ContractEvent {
  id: string;
  contract_address: string;
  event_name: string;
  block_number: number;
  transaction_hash: string;
  event_data: any;
  processed: boolean;
  created_at: string;
}

interface ContractMetrics {
  total_events: number;
  processed_events: number;
  pending_events: number;
  error_events: number;
  last_block: number;
  contracts_monitored: number;
}

export function SmartContractMonitor({ contractAddress, propertyId }: SmartContractMonitorProps) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [metrics, setMetrics] = useState<ContractMetrics>({
    total_events: 0,
    processed_events: 0,
    pending_events: 0,
    error_events: 0,
    last_block: 0,
    contracts_monitored: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('events');

  // Fetch contract events and metrics
  const fetchData = async () => {
    try {
      // Fetch recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('smart_contract_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Calculate metrics
      const totalEvents = eventsData?.length || 0;
      const processedEvents = eventsData?.filter(e => e.processed).length || 0;
      const pendingEvents = eventsData?.filter(e => !e.processed).length || 0;
      const uniqueContracts = new Set(eventsData?.map(e => e.contract_address)).size;
      const lastBlock = Math.max(...(eventsData?.map(e => e.block_number) || [0]));

      // Track error events by checking for events with error data
      const errorEvents = eventsData?.filter(e => {
        if (!e.event_data || typeof e.event_data !== 'object') return false;
        const eventData = e.event_data as Record<string, any>;
        return eventData.error || eventData.failed || eventData.reverted || e.event_name.includes('Error');
      }).length || 0;

      setMetrics({
        total_events: totalEvents,
        processed_events: processedEvents,
        pending_events: pendingEvents,
        error_events: errorEvents,
        last_block: lastBlock,
        contracts_monitored: uniqueContracts
      });

    } catch (error) {
      console.error('Error fetching contract data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contract data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('contract-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smart_contract_events',
        },
        (payload) => {
          console.log('Contract event change:', payload);
          fetchData(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simulate contract event processing
  const processEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('smart_contract_events')
        .update({ processed: true })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, processed: true } : event
        )
      );

      toast({
        title: 'Success',
        description: 'Event processed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process event',
        variant: 'destructive',
      });
    }
  };

  // Mock function to create sample events
  const createSampleEvents = async () => {
    const sampleEvents = [
      {
        contract_address: '0x1234567890123456789012345678901234567890',
        event_name: 'TokenPurchase',
        block_number: Math.floor(Math.random() * 1000000) + 18000000,
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        event_data: {
          buyer: '0xabcdef123456789012345678901234567890abcd',
          amount: Math.floor(Math.random() * 1000) + 100,
          token_id: Math.floor(Math.random() * 10000),
          property_id: 'prop-123'
        },
        processed: false
      },
      {
        contract_address: '0x0987654321098765432109876543210987654321',
        event_name: 'DividendDistribution',
        block_number: Math.floor(Math.random() * 1000000) + 18000000,
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        event_data: {
          property_id: 'prop-456',
          total_amount: Math.floor(Math.random() * 10000) + 1000,
          recipients: Math.floor(Math.random() * 50) + 10
        },
        processed: false
      }
    ];

    try {
      const { error } = await supabase
        .from('smart_contract_events')
        .insert(sampleEvents);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Sample events created',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create sample events',
        variant: 'destructive',
      });
    }
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'TokenPurchase':
      case 'TokenMint':
        return Coins;
      case 'DividendDistribution':
      case 'RevenueShare':
        return TrendingUp;
      case 'OwnershipTransfer':
      case 'PropertyUpdate':
        return Shield;
      default:
        return Activity;
    }
  };

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case 'TokenPurchase':
      case 'TokenMint':
        return 'text-green-600';
      case 'DividendDistribution':
      case 'RevenueShare':
        return 'text-blue-600';
      case 'OwnershipTransfer':
      case 'PropertyUpdate':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Smart Contract Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={createSampleEvents}>
              <Activity className="h-4 w-4 mr-2" />
              Add Sample
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="px-6 pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">Recent Events</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="metrics" className="mt-0 px-6 pb-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total Events</p>
                      <p className="text-2xl font-bold">{metrics.total_events}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Processed</p>
                      <p className="text-2xl font-bold">{metrics.processed_events}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold">{metrics.pending_events}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Contracts</p>
                      <p className="text-2xl font-bold">{metrics.contracts_monitored}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Last Block</p>
                      <p className="text-2xl font-bold">{metrics.last_block.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold">
                        {metrics.total_events > 0 
                          ? Math.round((metrics.processed_events / metrics.total_events) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <ScrollArea className="h-96">
              {events.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No contract events</p>
                  <p className="text-sm">
                    Smart contract events will appear here when they occur.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {events.map((event) => {
                    const EventIcon = getEventIcon(event.event_name);
                    const iconColor = getEventColor(event.event_name);
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4 hover:bg-muted/50 border-l-4 border-l-transparent hover:border-l-primary transition-colors"
                      >
                        <div className={`flex-shrink-0 mt-1 ${iconColor}`}>
                          <EventIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{event.event_name}</p>
                                <Badge variant={event.processed ? "default" : "secondary"}>
                                  {event.processed ? 'Processed' : 'Pending'}
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-muted-foreground font-mono mb-2">
                                {event.contract_address}
                              </p>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Block: {event.block_number}</span>
                                  <span>
                                    {new Date(event.created_at).toLocaleString()}
                                  </span>
                                </div>
                                
                                {event.event_data && (
                                  <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                    <pre className="whitespace-pre-wrap break-all">
                                      {JSON.stringify(event.event_data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {event.transaction_hash && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    window.open(`https://etherscan.io/tx/${event.transaction_hash}`, '_blank');
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {!event.processed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => processEvent(event.id)}
                                >
                                  Process
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}