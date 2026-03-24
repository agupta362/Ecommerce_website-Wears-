-- Drop the conflicting ALL policy that blocks user inserts
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

-- Recreate admin policies for SELECT, UPDATE, DELETE only (not INSERT)
CREATE POLICY "Admins can select reviews" ON public.reviews
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all reviews" ON public.reviews
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));