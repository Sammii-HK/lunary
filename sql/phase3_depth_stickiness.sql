-- Phase 3: Depth & Stickiness
-- Tables: daily_rituals, weekly_challenges, challenge_completions, milestones_achieved, cosmic_gifts
-- Also extends user_streaks with challenge streak columns.
-- Run this SQL against the database to create Phase 3 infrastructure.

-- 1. daily_rituals
CREATE TABLE IF NOT EXISTS daily_rituals (
  id                 SERIAL PRIMARY KEY,
  user_id            TEXT NOT NULL,
  ritual_date        DATE NOT NULL,
  ritual_type        VARCHAR(20) NOT NULL,        -- morning | evening

  -- Morning fields
  cosmic_score       INT,
  card_pulled        JSONB,                       -- {name, keywords, brief_interpretation}
  intention_id       UUID,                        -- FK to collections (category = 'intention')
  crystal_color      JSONB,                       -- {crystal, color, reason}

  -- Evening fields
  mood               VARCHAR(50),
  mood_moon_phase    TEXT,
  gratitude          TEXT,
  intention_reviewed BOOLEAN DEFAULT FALSE,
  intention_outcome  VARCHAR(30),                 -- progressing | blocked | manifested | released
  dream_intention    TEXT,

  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ritual_date, ritual_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_rituals_user ON daily_rituals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rituals_date ON daily_rituals(ritual_date);

-- 2. weekly_challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id                  SERIAL PRIMARY KEY,
  week_start          DATE NOT NULL UNIQUE,       -- Monday of the week
  transit_key         VARCHAR(100) NOT NULL,       -- e.g. "venus_in_pisces"
  challenge_title     VARCHAR(200) NOT NULL,
  challenge_description TEXT NOT NULL,
  daily_prompts       JSONB NOT NULL DEFAULT '[]', -- Array of 7 daily prompts
  xp_per_day          INT NOT NULL DEFAULT 1,
  xp_bonus_week       INT NOT NULL DEFAULT 5,
  participant_count   INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week ON weekly_challenges(week_start);

-- 3. challenge_completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  challenge_id    INT NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  check_in_date   DATE NOT NULL,
  completed       BOOLEAN DEFAULT FALSE,
  reflection      TEXT,                           -- optional day-7 reflection
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_challenge ON challenge_completions(user_id, challenge_id);

-- 4. milestones_achieved
CREATE TABLE IF NOT EXISTS milestones_achieved (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  milestone_type  VARCHAR(50) NOT NULL,           -- solar_return | lunar_return | saturn_return | app_anniversary | reading_count | journal_count | streak
  milestone_key   VARCHAR(100) NOT NULL,          -- e.g. "solar_return_2026", "100_tarot_readings"
  milestone_data  JSONB DEFAULT '{}'::jsonb,
  achieved_at     TIMESTAMPTZ,
  notified_at     TIMESTAMPTZ,
  celebrated      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user ON milestones_achieved(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_celebrated ON milestones_achieved(celebrated);

-- 5. cosmic_gifts
CREATE TABLE IF NOT EXISTS cosmic_gifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     TEXT NOT NULL,
  recipient_id  TEXT NOT NULL,
  gift_type     TEXT NOT NULL,                    -- tarot_pull | cosmic_encouragement | birthday_transit | crystal_recommendation | custom_ritual
  content       JSONB NOT NULL DEFAULT '{}'::jsonb,
  message       TEXT,                             -- personal message (max 500 chars)
  opened_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_not_self_gift CHECK (sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_cosmic_gifts_recipient_unopened ON cosmic_gifts(recipient_id) WHERE opened_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cosmic_gifts_sender ON cosmic_gifts(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cosmic_gifts_recipient ON cosmic_gifts(recipient_id, created_at DESC);

-- 6. Extend user_streaks with challenge streak columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_streaks' AND column_name='challenge_streak') THEN
    ALTER TABLE user_streaks ADD COLUMN challenge_streak INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_streaks' AND column_name='longest_challenge_streak') THEN
    ALTER TABLE user_streaks ADD COLUMN longest_challenge_streak INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_streaks' AND column_name='last_challenge_week') THEN
    ALTER TABLE user_streaks ADD COLUMN last_challenge_week DATE;
  END IF;
END $$;

-- Trigger: auto-increment participant_count on weekly_challenges
CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only increment on the first check-in for a user+challenge pair
    IF NOT EXISTS (
      SELECT 1 FROM challenge_completions
      WHERE user_id = NEW.user_id AND challenge_id = NEW.challenge_id AND id != NEW.id
    ) THEN
      UPDATE weekly_challenges SET participant_count = participant_count + 1 WHERE id = NEW.challenge_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_challenge_participant_count ON challenge_completions;
CREATE TRIGGER trg_challenge_participant_count
  AFTER INSERT ON challenge_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_participant_count();
