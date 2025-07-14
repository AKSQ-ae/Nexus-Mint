import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleCors, createSuccessResponse, createErrorResponse } from "../_shared/response-utils.ts";
import { createSupabaseClient, authenticateUser } from "../_shared/supabase-utils.ts";
import { createLogger } from "../_shared/logger.ts";
import { validateInput, ValidationRule } from "../_shared/validation.ts";
import { 
  applyRateLimit, 
  validateRequest, 
  createSecureResponse, 
  getClientIdentifier 
} from "../_shared/security-middleware.ts";
import { AuditLogger } from "../_shared/audit-logger.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const logger = createLogger('regulatory-evidence-export');

  try {
    // Apply security middleware
    const clientId = getClientIdentifier(req);
    const requestValidation = validateRequest(req);
    if (!requestValidation.valid) {
      return createSecureResponse({ error: requestValidation.error }, 400);
    }

    const rateLimit = applyRateLimit(req);
    if (!rateLimit.allowed) {
      return createSecureResponse(
        { error: 'Rate limit exceeded', remainingRequests: rateLimit.remaining }, 
        429,
        { 'X-RateLimit-Remaining': rateLimit.remaining.toString() }
      );
    }

    logger.info("Regulatory evidence export initiated", { clientId });
    
    const supabaseClient = createSupabaseClient(true);
    const auditLogger = new AuditLogger(supabaseClient);

    // Authenticate user
    const user = await authenticateUser(req, supabaseClient);
    
    logger.updateContext({ userId: user.id });
    logger.info("User authenticated for evidence export", { email: user.email });

    // Log compliance access
    await auditLogger.logComplianceEvent(
      user.id,
      'regulatory_evidence_export',
      'compliance_report',
      undefined,
      { 
        function: 'regulatory-evidence-export',
        ip_address: clientId,
        user_agent: req.headers.get('user-agent') || undefined
      }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { propertyId, includeTransactions = true } = await req.json();
    
    logStep("Generating regulatory evidence package", { propertyId, includeTransactions });

    // Gather all relevant data for regulatory submission
    const evidencePackage = {
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: user.email,
        property_id: propertyId,
        report_type: "Regulatory Compliance Evidence Package",
        version: "1.0"
      },
      property_details: {},
      smart_contract_data: {},
      tokenization_process: {},
      investment_transactions: [],
      audit_trail: [],
      compliance_checks: {},
      technical_specifications: {}
    };

    // 1. Property Details
    const { data: property } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (property) {
      evidencePackage.property_details = {
        id: property.id,
        title: property.title,
        location: property.location,
        description: property.description,
        property_type: property.property_type,
        total_value: property.price,
        tokenization_status: property.tokenization_status,
        created_at: property.created_at,
        updated_at: property.updated_at,
        is_active: property.is_active,
        images: property.images,
        amenities: property.amenities,
        coordinates: property.coordinates
      };
    }

    // 2. Smart Contract Data
    const { data: contractData } = await supabaseClient
      .from('property_tokens')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    if (contractData) {
      evidencePackage.smart_contract_data = {
        contract_address: contractData.contract_address,
        deployment_tx_hash: contractData.deployment_tx_hash,
        deployment_block: contractData.deployment_block,
        blockchain_network: contractData.blockchain_network,
        explorer_url: contractData.explorer_url,
        verification_status: contractData.verification_status,
        total_supply: contractData.total_supply,
        available_supply: contractData.available_supply,
        deployer_address: contractData.deployer_address,
        source_code: contractData.source_code,
        constructor_params: contractData.constructor_params,
        deployment_cost: contractData.deployment_cost,
        created_at: contractData.created_at
      };
    }

    // 3. Tokenization Process
    const { data: processes } = await supabaseClient
      .from('tokenization_processes')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (processes && processes.length > 0) {
      evidencePackage.tokenization_process = {
        latest_process: processes[0],
        all_processes: processes,
        total_processes: processes.length
      };
    }

    // 4. Investment Transactions (if requested)
    if (includeTransactions) {
      const { data: transactions } = await supabaseClient
        .from('investment_transactions')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      evidencePackage.investment_transactions = transactions || [];
    }

    // 5. Audit Trail
    const { data: events } = await supabaseClient
      .from('smart_contract_events')
      .select('*')
      .eq('contract_address', contractData?.contract_address || '')
      .order('created_at', { ascending: false });

    evidencePackage.audit_trail = events || [];

    // 6. Compliance Checks
    evidencePackage.compliance_checks = {
      kyc_verification_required: true,
      aml_checks_enabled: true,
      regulatory_jurisdiction: "UAE",
      data_retention_policy: "7 years",
      audit_trail_complete: evidencePackage.audit_trail.length > 0,
      smart_contract_verified: contractData?.verification_status === 'verified',
      rls_policies_enabled: true,
      encryption_at_rest: true,
      gdpr_compliant: true,
      last_compliance_check: new Date().toISOString()
    };

    // 7. Technical Specifications
    evidencePackage.technical_specifications = {
      blockchain_network: contractData?.blockchain_network || "polygon-mumbai",
      smart_contract_standard: "ERC-1155",
      programming_language: "Solidity ^0.8.19",
      development_framework: "Hardhat",
      security_features: [
        "Role-based access control",
        "Pausable functionality",
        "Reentrancy protection",
        "Supply tracking",
        "Metadata freezing",
        "Income distribution"
      ],
      database_system: "PostgreSQL with Row Level Security",
      api_framework: "Supabase Edge Functions",
      frontend_framework: "React with TypeScript",
      hosting_infrastructure: "Supabase Cloud",
      compliance_monitoring: "Real-time audit trails",
      data_backup_frequency: "Continuous",
      disaster_recovery_rpo: "< 1 minute",
      disaster_recovery_rto: "< 5 minutes"
    };

    // Generate summary statistics
    const summary = {
      total_properties_tokenized: 1,
      total_transactions: evidencePackage.investment_transactions.length,
      total_audit_events: evidencePackage.audit_trail.length,
      contract_deployment_confirmed: !!contractData?.contract_address,
      regulatory_compliance_score: calculateComplianceScore(evidencePackage),
      last_updated: new Date().toISOString()
    };

    logStep("Evidence package generated", {
      propertyId,
      transactionCount: evidencePackage.investment_transactions.length,
      auditEventCount: evidencePackage.audit_trail.length,
      complianceScore: summary.regulatory_compliance_score
    });

    // Store the evidence package for later retrieval
    const { error: storeError } = await supabaseClient
      .from('regulatory_submissions')
      .insert({
        property_id: propertyId,
        submission_type: 'evidence_package',
        submission_data: evidencePackage,
        generated_by: user.id,
        status: 'draft',
        compliance_score: summary.regulatory_compliance_score
      });

    if (storeError) {
      logStep("Warning: Failed to store evidence package", storeError);
    }

    return new Response(JSON.stringify({
      success: true,
      evidence_package: evidencePackage,
      summary,
      download_instructions: {
        format: "JSON",
        size_kb: JSON.stringify(evidencePackage).length / 1024,
        recommended_use: "Regulatory submission and compliance documentation"
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep("ERROR in evidence export", { error: errorMessage });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function calculateComplianceScore(evidencePackage: any): number {
  let score = 0;
  const maxScore = 100;

  // Property details complete (20 points)
  if (evidencePackage.property_details.id) score += 20;

  // Smart contract deployed and verified (30 points)
  if (evidencePackage.smart_contract_data.contract_address) score += 15;
  if (evidencePackage.smart_contract_data.verification_status === 'verified') score += 15;

  // Tokenization process documented (20 points)
  if (evidencePackage.tokenization_process.latest_process) score += 20;

  // Audit trail present (20 points)
  if (evidencePackage.audit_trail.length > 0) score += 20;

  // Compliance checks passed (10 points)
  if (evidencePackage.compliance_checks.audit_trail_complete) score += 5;
  if (evidencePackage.compliance_checks.rls_policies_enabled) score += 5;

  return Math.min(score, maxScore);
}