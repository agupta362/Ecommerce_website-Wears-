-- Add SELECT policy for guest orders
-- This allows the .insert().select() to work for guest checkout
-- The INSERT works, but SELECT fails because NULL = NULL is NULL (not TRUE)

CREATE POLICY "Guest orders can be viewed"
ON public.orders
FOR SELECT
USING (user_id IS NULL);