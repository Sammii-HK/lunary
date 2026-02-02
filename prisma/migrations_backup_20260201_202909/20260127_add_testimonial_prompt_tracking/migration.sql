-- Add testimonial prompt tracking
CREATE TABLE IF NOT EXISTS testimonial_prompt_tracking (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dont_ask_until TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonial_prompt_user_id ON testimonial_prompt_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_prompt_dont_ask_until ON testimonial_prompt_tracking(dont_ask_until);
