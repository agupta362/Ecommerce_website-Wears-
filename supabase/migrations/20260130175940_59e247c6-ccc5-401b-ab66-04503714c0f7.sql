-- Create function to safely increment discount code usage
CREATE OR REPLACE FUNCTION public.increment_discount_usage(p_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE discount_codes
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE code = UPPER(TRIM(p_code));
END;
$$;