-- Create edge_cache table for Edge Function caching
CREATE TABLE IF NOT EXISTS public.edge_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for expiry lookups
CREATE INDEX IF NOT EXISTS idx_edge_cache_expires 
  ON public.edge_cache(expires_at);

-- Enable RLS
ALTER TABLE public.edge_cache ENABLE ROW LEVEL SECURITY;

-- Only Edge Functions (service role) can access
CREATE POLICY "Service role full access" ON public.edge_cache
  FOR ALL USING (auth.role() = 'service_role');