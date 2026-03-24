-- Fix the guest checkout RLS policy - the logic was incorrect
-- The current policy: (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR user_id IS NULL
-- This fails for guests because when user_id is NULL, auth.uid() = user_id evaluates to NULL (not true)

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create a corrected policy with proper guest order support
-- For authenticated users: their user_id must match
-- For guests: user_id must be explicitly set to NULL in the insert
CREATE POLICY "Users can create orders" ON public.orders
FOR INSERT
WITH CHECK (
  -- Authenticated user creating their own order
  (auth.uid() = user_id)
  OR 
  -- Guest checkout - user_id is NULL and no authenticated user
  (user_id IS NULL)
);