-- Add INSERT policy for investments table to allow authenticated users to create their own investments
CREATE POLICY "Users can create own investments" ON public.investments
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also add UPDATE policy for investments table
CREATE POLICY "Users can update own investments" ON public.investments
FOR UPDATE 
USING (auth.uid() = user_id);