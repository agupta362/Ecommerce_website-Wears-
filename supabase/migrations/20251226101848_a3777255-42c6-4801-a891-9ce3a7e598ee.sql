-- Create function to restore product stock when order is cancelled
CREATE OR REPLACE FUNCTION public.handle_order_cancelled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only process when status changes TO 'cancelled' and was NOT 'cancelled' before
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Restore stock for each item in the order
    UPDATE product_sizes ps
    SET stock = ps.stock + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND ps.product_id = oi.product_id
      AND ps.size = oi.size;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order cancellation
DROP TRIGGER IF EXISTS handle_order_cancelled_trigger ON orders;
CREATE TRIGGER handle_order_cancelled_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_cancelled();