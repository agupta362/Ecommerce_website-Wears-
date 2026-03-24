-- Add is_clearance column to products table
ALTER TABLE public.products 
ADD COLUMN is_clearance boolean DEFAULT false;