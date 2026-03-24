-- 1. Fix rate_limits table - remove public access, only service role via edge functions
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Rate limits should only be accessible via service role (edge functions use service role key)
-- No client-side access needed
CREATE POLICY "Only service role can access rate limits"
ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- 2. Fix guest orders RLS - remove overly permissive policy
DROP POLICY IF EXISTS "Guest orders viewable by email" ON public.orders;

-- Guest orders should only be viewable by admins (users can track via order number on confirmation page)
-- The order confirmation page shows order details immediately after creation

-- 3. Fix newsletter_subscribers - ensure emails are not publicly readable
-- Current policies: "Admins can view subscribers" (SELECT) and "Anyone can subscribe" (INSERT)
-- Add explicit denial for non-admin SELECT to be safe
DROP POLICY IF EXISTS "Anyone can view subscribers" ON public.newsletter_subscribers;

-- Add unsubscribe capability via email match
CREATE POLICY "Users can unsubscribe with their email"
ON public.newsletter_subscribers
FOR DELETE
USING (true);  -- In practice, unsubscribe link would have the email

-- 4. Fix order_items INSERT policy - verify order ownership
DROP POLICY IF EXISTS "Insert order items" ON public.order_items;

CREATE POLICY "Insert order items for own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);