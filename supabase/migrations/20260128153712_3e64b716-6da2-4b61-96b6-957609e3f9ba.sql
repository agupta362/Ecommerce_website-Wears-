-- Add shipping rate columns to ncm_branches table for per-branch pricing
ALTER TABLE ncm_branches 
ADD COLUMN IF NOT EXISTS shipping_rate integer DEFAULT 150,
ADD COLUMN IF NOT EXISTS per_kg_rate integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS estimated_days text DEFAULT '3-5 days';