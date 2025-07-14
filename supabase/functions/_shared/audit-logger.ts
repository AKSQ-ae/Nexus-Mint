/**
 * Enhanced Audit Logging System
 * Provides comprehensive audit trails for compliance and security monitoring
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'compliance';
}

export class AuditLogger {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    try {
      // Log to Supabase
      await this.supabase.from('audit_logs').insert(auditEntry);
      
      // Log to console for immediate visibility
      console.log(`[AUDIT] ${auditEntry.action}`, auditEntry);

      // For critical events, also send to external monitoring
      if (entry.severity === 'critical') {
        await this.sendToExternalMonitoring(auditEntry);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Fallback: write to local storage or external service
    }
  }

  async logUserAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      severity: 'medium',
      category: 'data_access'
    });
  }

  async logAuthentication(
    userId: string | null,
    action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout',
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      user_id: userId || undefined,
      action,
      resource_type: 'user_session',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata,
      severity: action.includes('failure') ? 'high' : 'low',
      category: 'authentication'
    });
  }

  async logDataModification(
    userId: string,
    action: 'create' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: `${action}_${resourceType}`,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: {
        old_data: oldData,
        new_data: newData,
        timestamp: Date.now()
      },
      severity: action === 'delete' ? 'high' : 'medium',
      category: 'data_modification'
    });
  }

  async logSecurityEvent(
    action: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    ipAddress?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resource_type: 'security_event',
      ip_address: ipAddress,
      metadata,
      severity,
      category: 'system'
    });
  }

  async logComplianceEvent(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: {
        ...metadata,
        compliance_timestamp: Date.now(),
        retention_required: true
      },
      severity: 'high',
      category: 'compliance'
    });
  }

  private async sendToExternalMonitoring(entry: AuditLogEntry): Promise<void> {
    // Send to external monitoring service (Sentry, DataDog, etc.)
    console.warn('[CRITICAL AUDIT EVENT]', entry);
    
    // Could integrate with external services here
    // Example: await fetch('https://monitoring-service.com/audit', { ... });
  }

  async generateAuditReport(
    startDate: string,
    endDate: string,
    filters?: {
      userId?: string;
      category?: string;
      severity?: string;
      resourceType?: string;
    }
  ): Promise<AuditLogEntry[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to generate audit report: ${error.message}`);
    }

    return data || [];
  }
}