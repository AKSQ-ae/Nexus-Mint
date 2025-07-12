-- Create tokenization process monitoring table
CREATE TABLE public.tokenization_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id),
  user_id UUID NOT NULL,
  process_type TEXT NOT NULL DEFAULT 'property_tokenization',
  status TEXT NOT NULL DEFAULT 'started',
  current_step TEXT NOT NULL DEFAULT 'initialization',
  progress_percentage INTEGER DEFAULT 0,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  step_details JSONB DEFAULT '{}'::jsonb,
  error_logs JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tokenization reports table
CREATE TABLE public.tokenization_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.tokenization_processes(id),
  property_id UUID NOT NULL REFERENCES public.properties(id),
  report_type TEXT NOT NULL DEFAULT 'completion_report',
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  performance_data JSONB DEFAULT '{}'::jsonb,
  compliance_data JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID,
  status TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create process step tracking table
CREATE TABLE public.tokenization_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.tokenization_processes(id),
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  step_data JSONB DEFAULT '{}'::jsonb,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tokenization_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokenization_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokenization_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tokenization_processes
CREATE POLICY "Users can view own processes" ON public.tokenization_processes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own processes" ON public.tokenization_processes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own processes" ON public.tokenization_processes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all processes" ON public.tokenization_processes
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for tokenization_reports
CREATE POLICY "Users can view reports for their processes" ON public.tokenization_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tokenization_processes 
      WHERE id = process_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create reports" ON public.tokenization_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all reports" ON public.tokenization_reports
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for tokenization_steps
CREATE POLICY "Users can view steps for their processes" ON public.tokenization_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tokenization_processes 
      WHERE id = process_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage steps" ON public.tokenization_steps
  FOR ALL WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_tokenization_processes_user_id ON public.tokenization_processes(user_id);
CREATE INDEX idx_tokenization_processes_property_id ON public.tokenization_processes(property_id);
CREATE INDEX idx_tokenization_processes_status ON public.tokenization_processes(status);
CREATE INDEX idx_tokenization_reports_process_id ON public.tokenization_reports(process_id);
CREATE INDEX idx_tokenization_steps_process_id ON public.tokenization_steps(process_id);

-- Create updated_at trigger
CREATE TRIGGER update_tokenization_processes_updated_at
  BEFORE UPDATE ON public.tokenization_processes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();