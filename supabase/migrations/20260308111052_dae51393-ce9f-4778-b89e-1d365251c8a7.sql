
-- Phase A: store_registry table for multi-store SaaS
CREATE TABLE public.store_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL,
  store_url text NOT NULL,
  supabase_url text,
  supabase_anon_key text,
  owner_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  monthly_revenue numeric DEFAULT 0,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.store_registry ENABLE ROW LEVEL SECURITY;

-- Super-admins (admins of THIS project) can see all stores
CREATE POLICY "Super admins can manage all stores"
  ON public.store_registry FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Store owners can view their own stores
CREATE POLICY "Owners can view own stores"
  ON public.store_registry FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- Phase C: email_sequences table for post-purchase automation
CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  email_type text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, email_type)
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email sequences"
  ON public.email_sequences FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access on email_sequences"
  ON public.email_sequences FOR ALL
  USING (auth.role() = 'service_role');
