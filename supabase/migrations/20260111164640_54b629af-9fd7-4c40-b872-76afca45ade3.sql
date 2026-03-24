-- Add NCM courier tracking fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS ncm_order_id integer,
ADD COLUMN IF NOT EXISTS ncm_status text,
ADD COLUMN IF NOT EXISTS ncm_created_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ncm_last_sync timestamp with time zone,
ADD COLUMN IF NOT EXISTS ncm_vendor_ref text;

-- Create index for faster NCM order lookups
CREATE INDEX IF NOT EXISTS idx_orders_ncm_order_id ON public.orders(ncm_order_id) WHERE ncm_order_id IS NOT NULL;

-- Create NCM branches cache table for storing branch data
CREATE TABLE IF NOT EXISTS public.ncm_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id integer NOT NULL UNIQUE,
  branch_name text NOT NULL,
  covered_areas text[],
  is_active boolean DEFAULT true,
  last_synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ncm_branches
ALTER TABLE public.ncm_branches ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read branches (public data)
CREATE POLICY "Anyone can view NCM branches" ON public.ncm_branches
FOR SELECT USING (true);

-- Only admins can manage branches
CREATE POLICY "Admins can manage NCM branches" ON public.ncm_branches
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));