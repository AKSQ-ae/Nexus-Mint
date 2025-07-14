-- Create audit_logs table for security and compliance monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('authentication', 'authorization', 'data_access', 'data_modification', 'system', 'compliance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);

-- Create function to automatically log data modifications
CREATE OR REPLACE FUNCTION public.log_data_modification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    severity,
    category
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'old_data', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_data', CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    ),
    CASE WHEN TG_OP = 'DELETE' THEN 'high' ELSE 'medium' END,
    'data_modification'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to key tables
CREATE TRIGGER audit_investments
  AFTER INSERT OR UPDATE OR DELETE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.log_data_modification();

CREATE TRIGGER audit_properties
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.log_data_modification();

CREATE TRIGGER audit_property_tokens
  AFTER INSERT OR UPDATE OR DELETE ON public.property_tokens
  FOR EACH ROW EXECUTE FUNCTION public.log_data_modification();