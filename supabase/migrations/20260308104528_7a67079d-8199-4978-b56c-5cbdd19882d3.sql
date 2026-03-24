-- Abandoned carts table for cart recovery marketing
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  cart_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  first_reminder_sent_at timestamptz,
  second_reminder_sent_at timestamptz,
  recovered_at timestamptz,
  recovered_order_id uuid REFERENCES orders(id),
  discount_code text,
  CONSTRAINT user_or_guest CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

-- Index for efficient querying of stale carts
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovery ON abandoned_carts(user_id, recovered_at, created_at);

-- Marketing emails log to prevent spam and track campaigns
CREATE TABLE IF NOT EXISTS marketing_emails_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  email_type text NOT NULL,
  reference_id uuid,
  sent_at timestamptz DEFAULT now(),
  resend_id text,
  opened_at timestamptz,
  clicked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_marketing_emails_recipient ON marketing_emails_log(recipient_email, email_type);

-- RLS for abandoned_carts
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own abandoned carts"
ON abandoned_carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own abandoned carts"
ON abandoned_carts FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all abandoned carts"
ON abandoned_carts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS for marketing_emails_log
ALTER TABLE marketing_emails_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketing emails log"
ON marketing_emails_log FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at on abandoned_carts
CREATE TRIGGER update_abandoned_carts_updated_at
  BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();