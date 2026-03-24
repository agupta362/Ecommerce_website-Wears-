-- Create store_settings table for admin-configurable options
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Admin full access policy using existing has_role function
CREATE POLICY "Admin full access" ON public.store_settings
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Public read access (for frontend to display bundle info)
CREATE POLICY "Public read access" ON public.store_settings
  FOR SELECT USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default loyalty settings
INSERT INTO public.store_settings (key, value) VALUES 
('loyalty', '{
  "enabled": true,
  "requiresSignup": true,
  "freeItemThreshold": 9,
  "freeItemValue": 1600,
  "rewardCodeExpiryDays": 90,
  "itemLabel": "jersey"
}'::jsonb),
('bundles', '{
  "enabled": true,
  "deals": [
    {"id": "duo", "name": "Duo Pack", "description": "Buy any 2 items", "requiredCount": 2, "freeShipping": true, "discountAmount": 0, "bonusPoints": 2},
    {"id": "trio", "name": "Trio Pack", "description": "Buy any 3 items", "requiredCount": 3, "freeShipping": true, "discountAmount": 300, "bonusPoints": 3},
    {"id": "squad", "name": "Squad Deal", "description": "Buy 4+ items", "requiredCount": 4, "freeShipping": true, "discountAmount": 500, "bonusPoints": 4}
  ],
  "pointsToFreeItem": 9
}'::jsonb);