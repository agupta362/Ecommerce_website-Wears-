-- Insert default price filter range setting if not exists
INSERT INTO store_settings (key, value)
VALUES ('price_filter', '{"min": 0, "max": 10000, "step": 100}')
ON CONFLICT (key) DO NOTHING;