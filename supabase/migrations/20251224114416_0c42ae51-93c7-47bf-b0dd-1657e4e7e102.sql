-- Add policy for users to view their own reviews (needed after insert)
CREATE POLICY "Users can view own reviews"
ON public.reviews
FOR SELECT
USING (auth.uid() = user_id);