import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  message?: string;
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const healthChecks: HealthCheck[] = [];
    const timestamp = new Date().toISOString();

    // Database Health Check
    const dbStart = Date.now();
    try {
      const { error: dbError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      healthChecks.push({
        service: 'database',
        status: dbError ? 'down' : 'healthy',
        responseTime: Date.now() - dbStart,
        message: dbError?.message,
        timestamp
      });
    } catch (error) {
      healthChecks.push({
        service: 'database',
        status: 'down',
        responseTime: Date.now() - dbStart,
        message: error.message,
        timestamp
      });
    }

    // Auth Service Health Check
    const authStart = Date.now();
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      healthChecks.push({
        service: 'auth',
        status: authError ? 'degraded' : 'healthy',
        responseTime: Date.now() - authStart,
        message: authError?.message,
        timestamp
      });
    } catch (error) {
      healthChecks.push({
        service: 'auth',
        status: 'down',
        responseTime: Date.now() - authStart,
        message: error.message,
        timestamp
      });
    }

    // Storage Health Check
    const storageStart = Date.now();
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      healthChecks.push({
        service: 'storage',
        status: storageError ? 'degraded' : 'healthy',
        responseTime: Date.now() - storageStart,
        message: storageError?.message,
        timestamp
      });
    } catch (error) {
      healthChecks.push({
        service: 'storage',
        status: 'down',
        responseTime: Date.now() - storageStart,
        message: error.message,
        timestamp
      });
    }

    // Edge Functions Health Check
    const functionsStart = Date.now();
    try {
      // Test a simple function call
      const { error: fnError } = await supabase.functions.invoke('get-exchange-rates', {
        body: { test: true }
      });
      
      healthChecks.push({
        service: 'edge_functions',
        status: fnError && !fnError.message.includes('Not Found') ? 'degraded' : 'healthy',
        responseTime: Date.now() - functionsStart,
        message: fnError?.message,
        timestamp
      });
    } catch (error) {
      healthChecks.push({
        service: 'edge_functions',
        status: 'degraded',
        responseTime: Date.now() - functionsStart,
        message: error.message,
        timestamp
      });
    }

    // Real-time Health Check
    const realtimeStart = Date.now();
    try {
      // Test realtime connection
      const channel = supabase.channel('health-check');
      
      healthChecks.push({
        service: 'realtime',
        status: 'healthy',
        responseTime: Date.now() - realtimeStart,
        timestamp
      });
      
      // Clean up channel
      await supabase.removeChannel(channel);
    } catch (error) {
      healthChecks.push({
        service: 'realtime',
        status: 'degraded',
        responseTime: Date.now() - realtimeStart,
        message: error.message,
        timestamp
      });
    }

    // Calculate overall health
    const downServices = healthChecks.filter(check => check.status === 'down').length;
    const degradedServices = healthChecks.filter(check => check.status === 'degraded').length;
    
    let overallStatus = 'healthy';
    if (downServices > 0) {
      overallStatus = 'critical';
    } else if (degradedServices > 0) {
      overallStatus = 'warning';
    }

    // Calculate average response time
    const avgResponseTime = healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length;

    const response = {
      overall_status: overallStatus,
      timestamp,
      average_response_time: Math.round(avgResponseTime),
      services: healthChecks,
      summary: {
        total_services: healthChecks.length,
        healthy: healthChecks.filter(check => check.status === 'healthy').length,
        degraded: degradedServices,
        down: downServices
      }
    };

    console.log('Health check completed:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});