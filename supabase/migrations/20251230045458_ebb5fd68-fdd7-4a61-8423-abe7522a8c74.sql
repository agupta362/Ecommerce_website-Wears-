-- Fix guest checkout by making the INSERT policy PERMISSIVE
-- The issue is that RESTRICTIVE policies require ALL conditions to be true
-- For guest orders, auth.uid() IS NULL and user_id IS NULL, but NULL = NULL is false

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Create a new PERMISSIVE policy that properly handles guest orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT
  WITH CHECK (
    -- Authenticated users can create orders with their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
    -- Guest users can create orders with NULL user_id
    OR (user_id IS NULL)
  );