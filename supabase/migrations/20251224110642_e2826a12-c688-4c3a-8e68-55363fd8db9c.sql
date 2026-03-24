-- Create loyalty_rewards table to track user's jersey purchases and points
CREATE TABLE public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_jerseys_purchased INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  free_kits_earned INTEGER DEFAULT 0,
  free_kits_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on loyalty_rewards
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Users can only view their own loyalty data
CREATE POLICY "Users can view own loyalty"
ON public.loyalty_rewards
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all loyalty records
CREATE POLICY "Admins can view all loyalty"
ON public.loyalty_rewards
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create reward_codes table for free kit vouchers
CREATE TABLE public.reward_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT UNIQUE NOT NULL,
  reward_type TEXT DEFAULT 'free_kit',
  discount_value INTEGER DEFAULT 1600,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_in_order_id UUID REFERENCES public.orders(id),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on reward_codes
ALTER TABLE public.reward_codes ENABLE ROW LEVEL SECURITY;

-- Users can only view their own reward codes
CREATE POLICY "Users can view own reward codes"
ON public.reward_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all reward codes
CREATE POLICY "Admins can view all reward codes"
ON public.reward_codes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to handle order delivery and update loyalty
CREATE OR REPLACE FUNCTION public.handle_order_delivered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jersey_count INTEGER;
  current_earned INTEGER;
  new_earned INTEGER;
  bonus_pts INTEGER;
  new_code TEXT;
BEGIN
  -- Only process when status changes TO 'delivered' and user_id is not null
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.user_id IS NOT NULL THEN
    
    -- Count jerseys in this order
    SELECT COALESCE(SUM(quantity), 0) INTO jersey_count
    FROM order_items WHERE order_id = NEW.id;
    
    -- Calculate bonus points (2 pts per jersey after 3rd)
    IF jersey_count >= 3 THEN
      bonus_pts := (jersey_count - 2) * 2;
    ELSE
      bonus_pts := 0;
    END IF;
    
    -- Get current earned count before update
    SELECT COALESCE(free_kits_earned, 0) INTO current_earned
    FROM loyalty_rewards WHERE user_id = NEW.user_id;
    
    -- Insert or update loyalty record
    INSERT INTO loyalty_rewards (user_id, total_jerseys_purchased, bonus_points, free_kits_earned)
    VALUES (NEW.user_id, jersey_count, bonus_pts, jersey_count / 9)
    ON CONFLICT (user_id) DO UPDATE SET
      total_jerseys_purchased = loyalty_rewards.total_jerseys_purchased + jersey_count,
      bonus_points = loyalty_rewards.bonus_points + bonus_pts,
      free_kits_earned = (loyalty_rewards.total_jerseys_purchased + jersey_count) / 9,
      updated_at = now();
    
    -- Get new earned count after update
    SELECT free_kits_earned INTO new_earned
    FROM loyalty_rewards WHERE user_id = NEW.user_id;
    
    -- Generate reward code if new free kit earned
    IF new_earned > COALESCE(current_earned, 0) THEN
      new_code := 'FREEKIT-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || NEW.id::TEXT), 1, 8));
      
      INSERT INTO reward_codes (user_id, code, reward_type, discount_value)
      VALUES (NEW.user_id, new_code, 'free_kit', 1600);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order delivery
CREATE TRIGGER on_order_delivered
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_delivered();

-- Create function to mark reward code as used (called from checkout)
CREATE OR REPLACE FUNCTION public.use_reward_code(p_code TEXT, p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Update the code if it belongs to user and is unused
  UPDATE reward_codes
  SET 
    is_used = true,
    used_at = now(),
    used_in_order_id = p_order_id
  WHERE code = UPPER(p_code)
    AND user_id = v_user_id
    AND is_used = false
    AND expires_at > now();
  
  -- Return true if a row was updated
  IF FOUND THEN
    -- Increment redeemed count
    UPDATE loyalty_rewards
    SET free_kits_redeemed = free_kits_redeemed + 1,
        updated_at = now()
    WHERE user_id = v_user_id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;