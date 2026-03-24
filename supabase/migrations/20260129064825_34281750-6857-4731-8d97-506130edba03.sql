-- Fix: Add explicit SELECT policies for addresses table
-- Currently only has ALL policy for users managing own addresses, but explicit SELECT is best practice

-- Add SELECT policy for users to view their own addresses
CREATE POLICY "Users can view own addresses"
ON public.addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Add SELECT policy for admins to view all addresses
CREATE POLICY "Admins can view all addresses"
ON public.addresses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));