-- Phase 1: Database Schema Updates for NCM Integration

-- Add new columns to orders table for NCM shipment data
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS ncm_tracking_id text,
ADD COLUMN IF NOT EXISTS ncm_delivery_type text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS ncm_package_weight numeric,
ADD COLUMN IF NOT EXISTS ncm_cod_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS destination_branch text,
ADD COLUMN IF NOT EXISTS alternate_phone text,
ADD COLUMN IF NOT EXISTS delivery_instruction text;

-- Create ncm_comments table to store order comments
CREATE TABLE IF NOT EXISTS public.ncm_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ncm_order_id integer,
  comment text NOT NULL,
  author text,
  is_vendor boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ncm_comments
ALTER TABLE public.ncm_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for ncm_comments
CREATE POLICY "Admins can manage NCM comments" ON public.ncm_comments
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own order comments" ON public.ncm_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = ncm_comments.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Create ncm_tickets table for support tickets
CREATE TABLE IF NOT EXISTS public.ncm_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ncm_ticket_id integer,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ncm_tickets
ALTER TABLE public.ncm_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for ncm_tickets
CREATE POLICY "Admins can manage NCM tickets" ON public.ncm_tickets
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ncm_comments_order_id ON public.ncm_comments(order_id);
CREATE INDEX IF NOT EXISTS idx_ncm_tickets_order_id ON public.ncm_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_ncm_order_id ON public.orders(ncm_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_destination_branch ON public.orders(destination_branch);