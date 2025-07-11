-- Create property_audits table for audit functionality
CREATE TABLE public.property_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  auditor_id UUID NOT NULL,
  audit_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'Medium',
  compliance_status TEXT NOT NULL DEFAULT 'pending',
  audit_results JSONB DEFAULT '{}',
  audit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_audits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all audits" 
ON public.property_audits 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create audits" 
ON public.property_audits 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update audits" 
ON public.property_audits 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_property_audits_property_id ON public.property_audits(property_id);
CREATE INDEX idx_property_audits_audit_date ON public.property_audits(audit_date);
CREATE INDEX idx_property_audits_compliance ON public.property_audits(compliance_status);

-- Add audit tracking columns to property_tokens
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS verification_id TEXT;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS explorer_url TEXT;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS source_code TEXT;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS constructor_params TEXT;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS compiler_version TEXT DEFAULT '0.8.19';
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS optimization_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS deployment_cost TEXT;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS deployer_address TEXT;
ALTER TABLE public.property_tokens ADD COLUMN IF NOT EXISTS audit_hash TEXT;

-- Add trigger for updated_at
CREATE TRIGGER update_property_audits_updated_at
BEFORE UPDATE ON public.property_audits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();