import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenizationFormData {
  propertyId: string;
  propertyValue: number;
  tokenPrice: number;
  totalTokens: number;
  minInvestment: number;
  fundingTarget: number;
  fundingDeadline: string;
  propertyType: string;
  location: string;
  description: string;
  documents: string[];
  [key: string]: any;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { formData, userId } = await req.json()

    if (!formData || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate the tokenization form data
    const validationResult = validateTokenizationData(formData)

    // If validation passes, store the validation record
    if (validationResult.valid) {
      await storeValidationRecord(supabaseClient, userId, formData, validationResult)
    }

    return new Response(
      JSON.stringify(validationResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in validate-tokenization:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function validateTokenizationData(data: TokenizationFormData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!data.propertyId) {
    errors.push('Property ID is required')
  }

  if (!data.propertyValue || data.propertyValue <= 0) {
    errors.push('Property value must be greater than 0')
  }

  if (!data.tokenPrice || data.tokenPrice <= 0) {
    errors.push('Token price must be greater than 0')
  }

  if (!data.totalTokens || data.totalTokens <= 0) {
    errors.push('Total tokens must be greater than 0')
  }

  if (!data.minInvestment || data.minInvestment <= 0) {
    errors.push('Minimum investment must be greater than 0')
  }

  if (!data.fundingTarget || data.fundingTarget <= 0) {
    errors.push('Funding target must be greater than 0')
  }

  if (!data.fundingDeadline) {
    errors.push('Funding deadline is required')
  }

  if (!data.propertyType) {
    errors.push('Property type is required')
  }

  if (!data.location) {
    errors.push('Location is required')
  }

  if (!data.description || data.description.length < 50) {
    errors.push('Description must be at least 50 characters')
  }

  // Business logic validation
  if (data.tokenPrice * data.totalTokens !== data.propertyValue) {
    errors.push('Token price × total tokens must equal property value')
  }

  if (data.minInvestment > data.fundingTarget) {
    errors.push('Minimum investment cannot exceed funding target')
  }

  if (data.fundingTarget > data.propertyValue) {
    errors.push('Funding target cannot exceed property value')
  }

  // Date validation
  const deadline = new Date(data.fundingDeadline)
  const now = new Date()
  if (deadline <= now) {
    errors.push('Funding deadline must be in the future')
  }

  if (deadline > new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)) {
    warnings.push('Funding deadline is more than 1 year away')
  }

  // Document validation
  if (!data.documents || data.documents.length === 0) {
    warnings.push('No supporting documents provided')
  }

  // Property value range validation
  if (data.propertyValue < 100000) {
    warnings.push('Property value is below recommended minimum')
  }

  if (data.propertyValue > 10000000) {
    warnings.push('Property value is above typical range')
  }

  // Token price validation
  if (data.tokenPrice < 10) {
    warnings.push('Token price is very low')
  }

  if (data.tokenPrice > 10000) {
    warnings.push('Token price is very high')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

async function storeValidationRecord(
  supabaseClient: any, 
  userId: string, 
  formData: TokenizationFormData, 
  validationResult: ValidationResult
) {
  try {
    const { error } = await supabaseClient
      .from('tokenization_validations')
      .insert({
        user_id: userId,
        property_id: formData.propertyId,
        form_data: formData,
        validation_result: validationResult,
        status: validationResult.valid ? 'approved' : 'rejected',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing validation record:', error)
    }
  } catch (error) {
    console.error('Error storing validation record:', error)
  }
}