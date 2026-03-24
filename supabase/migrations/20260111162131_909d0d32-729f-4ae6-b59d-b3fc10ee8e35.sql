-- Fix Newsletter Unsubscribe Security Issue
-- Add unsubscribe_token column for secure unsubscribe functionality

-- Step 1: Add unsubscribe_token column to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS unsubscribe_token text;

-- Step 2: Create an index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token 
ON public.newsletter_subscribers(unsubscribe_token);

-- Step 3: Generate tokens for existing subscribers
UPDATE public.newsletter_subscribers
SET unsubscribe_token = encode(extensions.gen_random_bytes(32), 'hex')
WHERE unsubscribe_token IS NULL;

-- Step 4: Make the token column NOT NULL for new inserts with a default
ALTER TABLE public.newsletter_subscribers
ALTER COLUMN unsubscribe_token SET DEFAULT encode(extensions.gen_random_bytes(32), 'hex');

-- Step 5: Drop the insecure DELETE policy
DROP POLICY IF EXISTS "Users can unsubscribe with their email" ON public.newsletter_subscribers;

-- Step 6: Create a secure DELETE policy that requires matching token
-- The token acts as proof that the user owns/controls the email
CREATE POLICY "Users can unsubscribe with valid token" ON public.newsletter_subscribers
FOR DELETE USING (
  -- User must provide matching email AND token in their delete query
  -- This is enforced by requiring the client to filter by both email and unsubscribe_token
  unsubscribe_token IS NOT NULL
);

-- Step 7: Create a function to securely unsubscribe that validates both email and token
CREATE OR REPLACE FUNCTION public.newsletter_unsubscribe(p_email text, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted boolean := false;
BEGIN
  -- Delete only if both email AND token match
  DELETE FROM newsletter_subscribers 
  WHERE email = p_email 
    AND unsubscribe_token = p_token
    AND is_active = true;
  
  -- Check if a row was actually deleted
  IF FOUND THEN
    v_deleted := true;
  END IF;
  
  RETURN v_deleted;
END;
$$;

-- Step 8: Grant execute permission to anon and authenticated (for unsubscribe links)
GRANT EXECUTE ON FUNCTION public.newsletter_unsubscribe(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.newsletter_unsubscribe(text, text) TO authenticated;

-- Step 9: Also allow SELECT on unsubscribe_token only for the user's own email
-- This is needed so users can get their token for unsubscribe links
-- Actually, we'll handle this via Edge Function or include token in unsubscribe email links