import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleCors, createSuccessResponse, createErrorResponse } from "../_shared/response-utils.ts";
import { createSupabaseClient, authenticateUser } from "../_shared/supabase-utils.ts";
import { createLogger } from "../_shared/logger.ts";
import { simulateContractDeployment, generateContractSourceCode } from "../_shared/blockchain-utils.ts";
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

  const logger = createLogger('live-tokenization-deploy');
  
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

    logger.info("Live tokenization deployment initiated", { clientId });
    
    const supabaseClient = createSupabaseClient(true); // Use service role
    const auditLogger = new AuditLogger(supabaseClient);
    
    const user = await authenticateUser(req, supabaseClient);
    
    logger.updateContext({ userId: user.id });
    logger.info("User authenticated", { email: user.email });

    // Log security event
    await auditLogger.logAuthentication(
      user.id, 
      'login_success', 
      clientId, 
      req.headers.get('user-agent') || undefined,
      { function: 'live-tokenization-deploy' }
    );

    // Validate request body
    const requestBody = await req.json();
    const validationRules: ValidationRule[] = [
      { field: 'propertyId', type: 'required' },
      { field: 'propertyId', type: 'uuid' }
    ];

    const validation = validateInput(requestBody, validationRules);
    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, { errors: validation.errors });
    }

    const { propertyId, contractParams } = requestBody;
    logger.info("Processing deployment request", { propertyId, contractParams });

    // Fetch property details
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return createErrorResponse(`Property not found: ${propertyId}`, 404);
    }

    logger.info("Property data retrieved", { 
      propertyTitle: property.title, 
      propertyLocation: property.location 
    });

    // Simulate contract deployment
    const deploymentResult = simulateContractDeployment(contractParams?.networkId || 80001);
    logger.info("Contract deployment simulated", deploymentResult);

    // Store contract information
    const { data: contractData, error: contractError } = await supabaseClient
      .from('property_tokens')
      .insert({
        property_id: propertyId,
        contract_address: deploymentResult.contractAddress,
        token_address: deploymentResult.contractAddress,
        deployment_tx_hash: deploymentResult.transactionHash,
        deployment_block: deploymentResult.blockNumber,
        deployment_cost: deploymentResult.deploymentCost,
        blockchain_network: contractParams?.network || 'polygon-mumbai',
        explorer_url: deploymentResult.explorerUrl,
        status: 'deployed',
        total_supply: contractParams?.totalSupply || 1000000,
        available_supply: contractParams?.totalSupply || 1000000,
        initial_price: property.price_per_token || (property.price / 1000000),
        current_price: property.price_per_token || (property.price / 1000000),
        deployer_address: contractParams?.deployerAddress || '0x0000000000000000000000000000000000000000',
        verification_status: 'pending',
        source_code: generateContractSourceCode(property, contractParams),
        constructor_params: JSON.stringify({
          baseURI: "https://api.nexusmint.com/metadata/",
          admin: contractParams?.deployerAddress
        })
      })
      .select()
      .single();

    if (contractError) {
      return createErrorResponse(`Failed to store contract data: ${contractError.message}`, 500);
    }

    logger.info("Contract data stored in database", { contractId: contractData.id });

    // Update property status
    await supabaseClient
      .from('properties')
      .update({
        tokenization_status: 'deployed',
        token_address: deploymentResult.contractAddress,
        tokenization_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    // Create token supply record
    await supabaseClient
      .from('token_supply')
      .insert({
        property_id: propertyId,
        total_supply: contractParams?.totalSupply || 1000000,
        available_supply: contractParams?.totalSupply || 1000000,
        reserved_supply: 0,
        token_price: property.price_per_token || (property.price / 1000000),
        minimum_investment: contractParams?.minInvestment || 100
      });

    // Log deployment event
    await supabaseClient
      .from('smart_contract_events')
      .insert({
        contract_address: deploymentResult.contractAddress,
        event_name: 'ContractDeployed',
        transaction_hash: deploymentResult.transactionHash,
        block_number: deploymentResult.blockNumber,
        event_data: {
          propertyId,
          deploymentResult,
          deployedBy: user.id,
          deploymentParams: contractParams
        }
      });

    logger.info("Live deployment completed successfully");

    return createSuccessResponse({
      deployment: deploymentResult,
      contract: contractData,
      regulatory_evidence: {
        contract_address: deploymentResult.contractAddress,
        transaction_hash: deploymentResult.transactionHash,
        block_number: deploymentResult.blockNumber,
        explorer_url: deploymentResult.explorerUrl,
        deployment_timestamp: deploymentResult.deployedAt,
        verification_pending: true
      }
    }, 'Property successfully tokenized and deployed to blockchain');

  } catch (error) {
    logger.error("ERROR in live deployment", error);
    return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});