-- Pinterest Quote Queue
-- Stores the pre-generated quotes scheduled for Pinterest posting so we can build a week-long bank

CREATE TABLE IF NOT EXISTS pinterest_quote_queue (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES social_quotes(id) ON DELETE SET NULL,
  quote_text TEXT NOT NULL,
  quote_author TEXT,
  scheduled_date DATE NOT NULL UNIQUE,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pinterest_quote_queue_date ON pinterest_quote_queue(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_pinterest_quote_queue_status ON pinterest_quote_queue(status);
CREATE INDEX IF NOT EXISTS idx_pinterest_quote_queue_quote_id ON pinterest_quote_queue(quote_id);

CREATE OR REPLACE FUNCTION update_pinterest_quote_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pinterest_quote_queue_timestamp ON pinterest_quote_queue;
CREATE TRIGGER update_pinterest_quote_queue_timestamp
BEFORE UPDATE ON pinterest_quote_queue
FOR EACH ROW
EXECUTE FUNCTION update_pinterest_quote_queue_updated_at();
