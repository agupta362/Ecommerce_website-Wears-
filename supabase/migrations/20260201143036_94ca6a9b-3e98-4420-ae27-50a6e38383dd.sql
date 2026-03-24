-- =============================================
-- PHASE 1: Invoice System Database Schema
-- =============================================

-- 1. Create invoice_sequences table for atomic sequential numbering
CREATE TABLE public.invoice_sequences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_code text NOT NULL UNIQUE,
  next_number integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on invoice_sequences
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can manage sequences
CREATE POLICY "Admins can manage invoice sequences"
ON public.invoice_sequences
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create invoices table
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  store_code text NOT NULL DEFAULT 'RKN',
  sequence_number integer NOT NULL,
  generated_at timestamp with time zone DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),
  pdf_url text
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can manage all invoices
CREATE POLICY "Admins can manage invoices"
ON public.invoices
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS: Users can view invoices for their own orders
CREATE POLICY "Users can view own order invoices"
ON public.invoices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = invoices.order_id
    AND orders.user_id = auth.uid()
  )
);

-- 3. Add order_source column to orders table
ALTER TABLE public.orders 
ADD COLUMN order_source text DEFAULT 'online';

-- Add comment for clarity
COMMENT ON COLUMN public.orders.order_source IS 'Source of order: online, in_store';

-- 4. Create generate_invoice_number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_store_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq integer;
  v_invoice text;
BEGIN
  -- Lock and increment atomically using FOR UPDATE
  UPDATE invoice_sequences 
  SET next_number = next_number + 1, updated_at = now()
  WHERE store_code = p_store_code
  RETURNING next_number - 1 INTO v_seq;
  
  -- Initialize if not exists
  IF v_seq IS NULL THEN
    INSERT INTO invoice_sequences (store_code, next_number)
    VALUES (p_store_code, 2)
    ON CONFLICT (store_code) DO UPDATE 
    SET next_number = invoice_sequences.next_number + 1, updated_at = now()
    RETURNING next_number - 1 INTO v_seq;
  END IF;
  
  -- Format: STORECODE-000001 (6 digits, zero-padded)
  v_invoice := p_store_code || '-' || LPAD(v_seq::text, 6, '0');
  RETURN v_invoice;
END;
$$;

-- 5. Create index for faster invoice lookups
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_invoices_store_code ON public.invoices(store_code);
CREATE INDEX idx_orders_order_source ON public.orders(order_source);

-- 6. Initialize default store sequence
INSERT INTO public.invoice_sequences (store_code, next_number)
VALUES ('RKN', 1)
ON CONFLICT (store_code) DO NOTHING;