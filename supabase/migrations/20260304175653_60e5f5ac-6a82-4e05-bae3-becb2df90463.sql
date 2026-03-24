
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_key text NOT NULL,
  variant_value text NOT NULL,
  variant_label text,
  color_hex text,
  image_index integer DEFAULT 0,
  price_modifier numeric DEFAULT 0,
  stock integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (product_id, variant_key, variant_value)
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product variants"
ON public.product_variants FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product variants"
ON public.product_variants FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
