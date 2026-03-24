-- Create rate zones table for zone-based shipping pricing
CREATE TABLE public.ncm_rate_zones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name text UNIQUE NOT NULL,
  branches text[] DEFAULT '{}',
  base_rate integer DEFAULT 150,
  per_kg_rate integer DEFAULT 30,
  cod_fee integer DEFAULT 0,
  estimated_days text DEFAULT '3-5 days',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ncm_rate_zones ENABLE ROW LEVEL SECURITY;

-- Admin-only management policy
CREATE POLICY "Admins can manage rate zones" ON public.ncm_rate_zones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Public can read rate zones (needed for checkout)
CREATE POLICY "Anyone can view rate zones" ON public.ncm_rate_zones
  FOR SELECT USING (true);

-- Insert default zones
INSERT INTO public.ncm_rate_zones (zone_name, branches, base_rate, per_kg_rate, estimated_days, is_default) VALUES
('Valley', ARRAY['KATHMANDU', 'LALITPUR', 'BHAKTAPUR', 'KIRTIPUR', 'MADHYAPUR THIMI'], 100, 20, '1-2 days', false),
('Nearby Cities', ARRAY['BHARATPUR', 'HETAUDA', 'NARAYANGHAT-CHITWAN', 'DHULIKHEL', 'BANEPA'], 120, 25, '2-3 days', false),
('Major Cities', ARRAY['POKHARA', 'BIRATNAGAR', 'BIRGUNJ', 'DHARAN', 'BUTWAL', 'NEPALGUNJ', 'ITAHARI', 'JANAKPUR', 'DAMAK', 'TULSIPUR', 'GHORAHI'], 150, 30, '3-5 days', false),
('Remote Areas', ARRAY[]::text[], 200, 40, '5-7 days', true);

-- Create updated_at trigger
CREATE TRIGGER update_ncm_rate_zones_updated_at
  BEFORE UPDATE ON public.ncm_rate_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();