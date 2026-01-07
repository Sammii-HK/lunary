-- Testimonial Feedback Event Tracking

CREATE TABLE IF NOT EXISTS testimonial_feedback_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email_type TEXT NOT NULL, -- intro | followup
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonial_feedback_user_type
  ON testimonial_feedback_events(user_id, email_type);
CREATE INDEX IF NOT EXISTS idx_testimonial_feedback_sent_at
  ON testimonial_feedback_events(sent_at);

CREATE OR REPLACE FUNCTION update_testimonial_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_testimonial_feedback_timestamp ON testimonial_feedback_events;
CREATE TRIGGER update_testimonial_feedback_timestamp
BEFORE UPDATE ON testimonial_feedback_events
FOR EACH ROW
EXECUTE FUNCTION update_testimonial_feedback_updated_at();
