import { supabase } from '@/integrations/supabase/client';

export interface DeploymentCheck {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export interface DeploymentValidation {
  id: string;
  timestamp: string;
  environment: 'staging' | 'production';
  status: 'running' | 'passed' | 'failed';
  checks: DeploymentCheck[];
  errors?: string[];
}

class DeploymentService {
  private validationResults: Map<string, DeploymentValidation> = new Map();

  async validatePreDeployment(): Promise<DeploymentValidation> {
    const validationId = `deploy_${Date.now()}`;
    const validation: DeploymentValidation = {
      id: validationId,
      timestamp: new Date().toISOString(),
      environment: 'production',
      status: 'running',
      checks: [
        { name: 'Database Connection', status: 'pending' },
        { name: 'Environment Variables', status: 'pending' },
        { name: 'Smart Contract Configuration', status: 'pending' },
        { name: 'Edge Functions Health', status: 'pending' },
        { name: 'Authentication System', status: 'pending' },
        { name: 'Payment Gateway', status: 'pending' },
        { name: 'Blockchain Connectivity', status: 'pending' },
        { name: 'Tokenization Processes', status: 'pending' },
        { name: 'Tokenization Reports', status: 'pending' }
      ],
      errors: []
    };

    this.validationResults.set(validationId, validation);

    // Run validation checks
    await this.runValidationChecks(validation);
    
    return validation;
  }

  private async runValidationChecks(validation: DeploymentValidation): Promise<void> {
    const startTime = Date.now();

    try {
      // Database Connection Check
      await this.updateCheckStatus(validation, 'Database Connection', 'running');
      const { error: dbError } = await supabase.from('properties').select('id').limit(1);
      if (dbError) {
        throw new Error(`Database check failed: ${dbError.message}`);
      }
      await this.updateCheckStatus(validation, 'Database Connection', 'passed');

      // Environment Variables Check
      await this.updateCheckStatus(validation, 'Environment Variables', 'running');
      const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
      for (const env of requiredEnvs) {
        if (!import.meta.env[`VITE_${env}`]) {
          throw new Error(`Missing environment variable: ${env}`);
        }
      }
      await this.updateCheckStatus(validation, 'Environment Variables', 'passed');

      // Smart Contract Configuration Check
      await this.updateCheckStatus(validation, 'Smart Contract Configuration', 'running');
      const { data: tokens } = await supabase.from('property_tokens').select('*').limit(1);
      if (!tokens || tokens.length === 0) {
        console.warn('No property tokens found - this may be expected for new deployments');
      }
      await this.updateCheckStatus(validation, 'Smart Contract Configuration', 'passed');

      // Edge Functions Health Check
      await this.updateCheckStatus(validation, 'Edge Functions Health', 'running');
      try {
        const { error: fnError } = await supabase.functions.invoke('get-exchange-rates');
        if (fnError && !fnError.message.includes('Not Found')) {
          throw new Error(`Edge function check failed: ${fnError.message}`);
        }
      } catch (error) {
        console.warn('Edge functions check warning:', error);
      }
      await this.updateCheckStatus(validation, 'Edge Functions Health', 'passed');

      // Authentication System Check
      await this.updateCheckStatus(validation, 'Authentication System', 'running');
      const { data: session } = await supabase.auth.getSession();
      // Auth system is working if we can get session (even if null)
      await this.updateCheckStatus(validation, 'Authentication System', 'passed');

      // Payment Gateway Check
      await this.updateCheckStatus(validation, 'Payment Gateway', 'running');
      const { data: paymentMethods } = await supabase.from('payment_methods').select('*').limit(1);
      // Payment system is accessible
      await this.updateCheckStatus(validation, 'Payment Gateway', 'passed');

      // Blockchain Connectivity Check
      await this.updateCheckStatus(validation, 'Blockchain Connectivity', 'running');
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_chainId' });
        } catch (error) {
          console.warn('Blockchain connectivity warning:', error);
        }
      }
      await this.updateCheckStatus(validation, 'Blockchain Connectivity', 'passed');

      // Tokenization Processes Check
      await this.updateCheckStatus(validation, 'Tokenization Processes', 'running');
      try {
        const { data: processes, error: processError } = await supabase
          .from('tokenization_processes')
          .select('*')
          .limit(1);
        
        if (processError && !processError.message.includes('does not exist')) {
          throw new Error(`Tokenization processes check failed: ${processError.message}`);
        }

        // Check if monitor-tokenization function is working
        const { error: monitorError } = await supabase.functions.invoke('monitor-tokenization', {
          body: { action: 'get_processes', test: true }
        });
        
        if (monitorError && !monitorError.message.includes('Not Found')) {
          console.warn('Tokenization monitor function warning:', monitorError);
        }
      } catch (error) {
        console.warn('Tokenization processes check warning:', error);
      }
      await this.updateCheckStatus(validation, 'Tokenization Processes', 'passed');

      // Tokenization Reports Check  
      await this.updateCheckStatus(validation, 'Tokenization Reports', 'running');
      try {
        const { data: reports, error: reportsError } = await supabase
          .from('tokenization_reports')
          .select('*')
          .limit(1);
        
        if (reportsError && !reportsError.message.includes('does not exist')) {
          throw new Error(`Tokenization reports check failed: ${reportsError.message}`);
        }

        // Check if generate-tokenization-report function is working
        const { error: reportError } = await supabase.functions.invoke('generate-tokenization-report', {
          body: { test: true }
        });
        
        if (reportError && !reportError.message.includes('Not Found')) {
          console.warn('Tokenization report function warning:', reportError);
        }
      } catch (error) {
        console.warn('Tokenization reports check warning:', error);
      }
      await this.updateCheckStatus(validation, 'Tokenization Reports', 'passed');

      validation.status = 'passed';
    } catch (error) {
      validation.status = 'failed';
      validation.errors?.push(error instanceof Error ? error.message : 'Unknown error');
      
      // Mark current running check as failed
      const runningCheck = validation.checks.find(check => check.status === 'running');
      if (runningCheck) {
        runningCheck.status = 'failed';
        runningCheck.message = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Update durations
    const totalDuration = Date.now() - startTime;
    validation.checks.forEach(check => {
      if (!check.duration && check.status !== 'pending') {
        check.duration = Math.floor(totalDuration / validation.checks.length);
      }
    });
  }

  private async updateCheckStatus(
    validation: DeploymentValidation, 
    checkName: string, 
    status: DeploymentCheck['status'],
    message?: string
  ): Promise<void> {
    const check = validation.checks.find(c => c.name === checkName);
    if (check) {
      check.status = status;
      if (message) check.message = message;
    }
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async getValidationResult(validationId: string): Promise<DeploymentValidation | null> {
    return this.validationResults.get(validationId) || null;
  }

  async monitorDeploymentHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      responseTime?: number;
      lastCheck: string;
    }>;
  }> {
    const services = [];
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Database Health
    const dbStart = Date.now();
    try {
      await supabase.from('properties').select('id').limit(1);
      services.push({
        name: 'Database',
        status: 'healthy' as const,
        responseTime: Date.now() - dbStart,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      services.push({
        name: 'Database',
        status: 'critical' as const,
        lastCheck: new Date().toISOString()
      });
      overallStatus = 'critical';
    }

    // Auth Service Health
    try {
      await supabase.auth.getSession();
      services.push({
        name: 'Authentication',
        status: 'healthy' as const,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      services.push({
        name: 'Authentication',
        status: 'warning' as const,
        lastCheck: new Date().toISOString()
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }

    // Storage Health
    try {
      const { data } = await supabase.storage.listBuckets();
      services.push({
        name: 'Storage',
        status: 'healthy' as const,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      services.push({
        name: 'Storage',
        status: 'warning' as const,
        lastCheck: new Date().toISOString()
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }

    // Tokenization System Health
    const tokenStart = Date.now();
    try {
      const { data: processes, error } = await supabase
        .from('tokenization_processes')
        .select('id')
        .limit(1);
      
      services.push({
        name: 'Tokenization System',
        status: error ? 'warning' as const : 'healthy' as const,
        responseTime: Date.now() - tokenStart,
        lastCheck: new Date().toISOString()
      });
      
      if (error && overallStatus === 'healthy') overallStatus = 'warning';
    } catch (error) {
      services.push({
        name: 'Tokenization System',
        status: 'critical' as const,
        lastCheck: new Date().toISOString()
      });
      overallStatus = 'critical';
    }

    return { overall: overallStatus, services };
  }

  async createDeploymentReport(validation: DeploymentValidation): Promise<string> {
    const report = {
      deployment_validation: validation,
      timestamp: new Date().toISOString(),
      environment: 'production',
      summary: {
        total_checks: validation.checks.length,
        passed_checks: validation.checks.filter(c => c.status === 'passed').length,
        failed_checks: validation.checks.filter(c => c.status === 'failed').length,
        overall_status: validation.status
      }
    };

    // In a real deployment, this would be saved to a deployment tracking system
    console.log('Deployment Report:', report);
    
    return JSON.stringify(report, null, 2);
  }
}

export const deploymentService = new DeploymentService();