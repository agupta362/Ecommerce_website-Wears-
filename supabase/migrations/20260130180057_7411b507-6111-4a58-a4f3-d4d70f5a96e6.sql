-- Update the increment function to check max_uses and return success/failure
DROP FUNCTION IF EXISTS public.increment_discount_usage(TEXT);

CREATE OR REPLACE FUNCTION public.increment_discount_usage(p_code TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_updated boolean := false;
BEGIN
  -- Only increment if max_uses is null (unlimited) OR used_count < max_uses
  UPDATE discount_codes
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND (max_uses IS NULL OR COALESCE(used_count, 0) < max_uses);
  
  -- Check if a row was updated
  IF FOUND THEN
    v_updated := true;
  END IF;
  
  RETURN v_updated;
END;
$$;