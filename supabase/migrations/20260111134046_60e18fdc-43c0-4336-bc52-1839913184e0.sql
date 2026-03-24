-- Fix #1: Replace decrease_product_stock RPC with a secure trigger
-- This prevents direct manipulation of stock via RPC calls

-- First, revoke public access to the function
REVOKE EXECUTE ON FUNCTION public.decrease_product_stock FROM anon;
REVOKE EXECUTE ON FUNCTION public.decrease_product_stock FROM authenticated;

-- Create a trigger function that automatically decreases stock when order items are inserted
CREATE OR REPLACE FUNCTION public.trigger_decrease_stock_on_order_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only decrease stock if product_id is provided
  IF NEW.product_id IS NOT NULL THEN
    UPDATE product_sizes
    SET stock = GREATEST(0, stock - NEW.quantity)
    WHERE product_id = NEW.product_id AND size = NEW.size;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on order_items INSERT
DROP TRIGGER IF EXISTS decrease_stock_on_order_item ON order_items;
CREATE TRIGGER decrease_stock_on_order_item
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_decrease_stock_on_order_item();

-- Fix #2: Update order_items SELECT policy to prevent guest order item exposure
-- Drop the existing policy and recreate with stricter conditions
DROP POLICY IF EXISTS "View order items for own orders" ON order_items;

CREATE POLICY "View order items for own orders" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      -- User can view their own orders (non-guest)
      (orders.user_id IS NOT NULL AND orders.user_id = auth.uid())
      -- Admins can view all orders
      OR has_role(auth.uid(), 'admin')
    )
  )
);

-- Also fix the orders guest policy - guest orders should NOT be publicly viewable
-- They should only be viewable via a secure lookup (e.g., by order number + email)
DROP POLICY IF EXISTS "Guest orders can be viewed" ON orders;

-- Guest orders should only be viewable by admins
-- If you need guest order lookup, implement it via a secure Edge Function
CREATE POLICY "Admins can view guest orders" ON orders
FOR SELECT USING (
  user_id IS NULL AND has_role(auth.uid(), 'admin')
);