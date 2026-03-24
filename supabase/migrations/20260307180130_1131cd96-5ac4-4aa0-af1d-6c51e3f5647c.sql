CREATE TABLE public.international_shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  flat_rate numeric NOT NULL DEFAULT 0,
  per_kg_rate numeric NOT NULL DEFAULT 0,
  estimated_days text DEFAULT '7-14 business days',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.international_shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active intl zones" ON public.international_shipping_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage intl zones" ON public.international_shipping_zones
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Seed default zones
INSERT INTO public.international_shipping_zones (zone_name, countries, flat_rate, estimated_days) VALUES
  ('South Asia', ARRAY['IN','BD','LK','PK','BT','MM'], 500, '5-7 business days'),
  ('Southeast Asia', ARRAY['TH','MY','SG','ID','PH','VN'], 1200, '7-10 business days'),
  ('Europe', ARRAY['GB','DE','FR','IT','ES','NL','BE','PT','AT','CH','SE','NO','DK','FI','IE','PL'], 2000, '10-14 business days'),
  ('Americas', ARRAY['US','CA','MX','BR','AR','CL','CO'], 2500, '10-14 business days'),
  ('Middle East', ARRAY['AE','SA','QA','KW','BH','OM'], 1500, '7-10 business days'),
  ('Rest of World', ARRAY['AU','NZ','JP','KR','ZA','KE','NG'], 3000, '14-21 business days');
