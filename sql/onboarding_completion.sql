-- Onboarding completion tracking
CREATE TABLE IF NOT EXISTS onboarding_completion (
  user_id TEXT PRIMARY KEY,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  steps_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_completion_completed_at ON onboarding_completion(completed_at);

