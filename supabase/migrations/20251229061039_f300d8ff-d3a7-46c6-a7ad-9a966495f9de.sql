-- Create sale_banners table for admin-editable promotional banners
CREATE TABLE public.sale_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT DEFAULT 'Shop Now',
  button_link TEXT DEFAULT '/shop',
  background_style TEXT DEFAULT 'retro-gradient',
  is_active BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sale_banners ENABLE ROW LEVEL SECURITY;

-- Admins can manage banners
CREATE POLICY "Admins can manage sale banners"
ON public.sale_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active banners
CREATE POLICY "Anyone can view active sale banners"
ON public.sale_banners
FOR SELECT
USING (
  is_active = true 
  AND (start_date IS NULL OR start_date <= now()) 
  AND (end_date IS NULL OR end_date >= now())
);

-- Add timestamp update trigger
CREATE TRIGGER update_sale_banners_updated_at
BEFORE UPDATE ON public.sale_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();