-- Create a function to decrease stock that bypasses RLS
CREATE OR REPLACE FUNCTION public.decrease_product_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_sizes
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE product_id = p_product_id AND size = p_size;
END;
$$;

-- Grant execute permission to authenticated users and anon
GRANT EXECUTE ON FUNCTION public.decrease_product_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrease_product_stock TO anon;