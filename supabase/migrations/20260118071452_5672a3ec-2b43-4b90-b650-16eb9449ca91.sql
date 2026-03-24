-- Drop the vulnerable INSERT policy that allows guest order manipulation
DROP POLICY IF EXISTS "Insert order items for own orders" ON public.order_items;

-- Create a new restrictive INSERT policy
-- Only allows inserts via service role (Edge Functions) - direct client inserts are blocked
-- This fixes the vulnerability where any client could insert items into any guest order
CREATE POLICY "Block direct client inserts to order_items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (false);

-- Note: Order creation now happens atomically via the create-order Edge Function
-- which uses service role to bypass RLS and ensures items can only be added
-- to orders created in the same transaction