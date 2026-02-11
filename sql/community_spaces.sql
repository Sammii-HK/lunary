-- Community Spaces: transit-based support groups, sign lounges, retrograde check-ins
-- Run this SQL against the database to create the community infrastructure tables.

-- 1. community_spaces
CREATE TABLE IF NOT EXISTS community_spaces (
  id SERIAL PRIMARY KEY,
  space_type TEXT NOT NULL,          -- 'saturn_return' | 'sign_space' | 'retrograde_checkin'
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  sign TEXT,                         -- For sign_space: zodiac sign. For retrograde: sign it's in
  planet TEXT,                       -- For retrograde: 'Mercury'. For saturn_return: 'Saturn'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,            -- null = always active
  ends_at TIMESTAMPTZ,              -- null = permanent
  post_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES community_spaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  post_text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT post_text_length CHECK (char_length(post_text) >= 10 AND char_length(post_text) <= 1000)
);

-- 3. community_memberships
CREATE TABLE IF NOT EXISTS community_memberships (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES community_spaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_spaces_type ON community_spaces(space_type);
CREATE INDEX IF NOT EXISTS idx_community_spaces_slug ON community_spaces(slug);
CREATE INDEX IF NOT EXISTS idx_community_spaces_active ON community_spaces(is_active);
CREATE INDEX IF NOT EXISTS idx_community_posts_space ON community_posts(space_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_approved ON community_posts(space_id, is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_space ON community_memberships(space_id);

-- Trigger: auto-update updated_at on community_spaces
CREATE OR REPLACE FUNCTION update_community_spaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_spaces_updated_at ON community_spaces;
CREATE TRIGGER trg_community_spaces_updated_at
  BEFORE UPDATE ON community_spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_community_spaces_updated_at();

-- Trigger: auto-increment post_count on community_spaces
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_spaces SET post_count = post_count + 1 WHERE id = NEW.space_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_spaces SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.space_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_post_count ON community_posts;
CREATE TRIGGER trg_community_post_count
  AFTER INSERT OR DELETE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_count();

-- Trigger: auto-increment member_count on community_spaces
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_spaces SET member_count = member_count + 1 WHERE id = NEW.space_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_spaces SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.space_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_member_count ON community_memberships;
CREATE TRIGGER trg_community_member_count
  AFTER INSERT OR DELETE ON community_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- Seed data: 12 Rising Sign Spaces
INSERT INTO community_spaces (space_type, slug, title, description, sign, is_active) VALUES
  ('sign_space', 'aries-rising', 'Aries Rising', 'Bold first impressions and fearless self-expression. A space for those who lead with fire.', 'Aries', true),
  ('sign_space', 'taurus-rising', 'Taurus Rising', 'Grounded presence and sensory wisdom. A space for those who lead with steadiness.', 'Taurus', true),
  ('sign_space', 'gemini-rising', 'Gemini Rising', 'Curious minds and quick connections. A space for those who lead with words.', 'Gemini', true),
  ('sign_space', 'cancer-rising', 'Cancer Rising', 'Intuitive nurturing and emotional depth. A space for those who lead with care.', 'Cancer', true),
  ('sign_space', 'leo-rising', 'Leo Rising', 'Radiant confidence and creative spirit. A space for those who lead with heart.', 'Leo', true),
  ('sign_space', 'virgo-rising', 'Virgo Rising', 'Thoughtful analysis and healing presence. A space for those who lead with intention.', 'Virgo', true),
  ('sign_space', 'libra-rising', 'Libra Rising', 'Graceful diplomacy and aesthetic vision. A space for those who lead with balance.', 'Libra', true),
  ('sign_space', 'scorpio-rising', 'Scorpio Rising', 'Magnetic intensity and transformative power. A space for those who lead with depth.', 'Scorpio', true),
  ('sign_space', 'sagittarius-rising', 'Sagittarius Rising', 'Adventurous spirit and philosophical fire. A space for those who lead with vision.', 'Sagittarius', true),
  ('sign_space', 'capricorn-rising', 'Capricorn Rising', 'Ambitious determination and quiet authority. A space for those who lead with structure.', 'Capricorn', true),
  ('sign_space', 'aquarius-rising', 'Aquarius Rising', 'Innovative thinking and humanitarian spirit. A space for those who lead with originality.', 'Aquarius', true),
  ('sign_space', 'pisces-rising', 'Pisces Rising', 'Dreamy intuition and boundless empathy. A space for those who lead with soul.', 'Pisces', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed data: 12 Sun Sign Spaces
INSERT INTO community_spaces (space_type, slug, title, description, sign, is_active) VALUES
  ('sign_space', 'aries-sun', 'Aries Sun', 'Cardinal fire energy and pioneering spirit. A space for those whose core identity burns with Aries.', 'Aries', true),
  ('sign_space', 'taurus-sun', 'Taurus Sun', 'Fixed earth energy and enduring values. A space for those whose core identity is rooted in Taurus.', 'Taurus', true),
  ('sign_space', 'gemini-sun', 'Gemini Sun', 'Mutable air energy and endless curiosity. A space for those whose core identity dances with Gemini.', 'Gemini', true),
  ('sign_space', 'cancer-sun', 'Cancer Sun', 'Cardinal water energy and deep nurturing. A space for those whose core identity flows with Cancer.', 'Cancer', true),
  ('sign_space', 'leo-sun', 'Leo Sun', 'Fixed fire energy and radiant creativity. A space for those whose core identity shines with Leo.', 'Leo', true),
  ('sign_space', 'virgo-sun', 'Virgo Sun', 'Mutable earth energy and devoted service. A space for those whose core identity refines with Virgo.', 'Virgo', true),
  ('sign_space', 'libra-sun', 'Libra Sun', 'Cardinal air energy and harmonious vision. A space for those whose core identity seeks balance with Libra.', 'Libra', true),
  ('sign_space', 'scorpio-sun', 'Scorpio Sun', 'Fixed water energy and transformative depth. A space for those whose core identity dives with Scorpio.', 'Scorpio', true),
  ('sign_space', 'sagittarius-sun', 'Sagittarius Sun', 'Mutable fire energy and boundless exploration. A space for those whose core identity roams with Sagittarius.', 'Sagittarius', true),
  ('sign_space', 'capricorn-sun', 'Capricorn Sun', 'Cardinal earth energy and disciplined ambition. A space for those whose core identity builds with Capricorn.', 'Capricorn', true),
  ('sign_space', 'aquarius-sun', 'Aquarius Sun', 'Fixed air energy and visionary thinking. A space for those whose core identity innovates with Aquarius.', 'Aquarius', true),
  ('sign_space', 'pisces-sun', 'Pisces Sun', 'Mutable water energy and boundless compassion. A space for those whose core identity dreams with Pisces.', 'Pisces', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed data: 12 Moon Sign Spaces
INSERT INTO community_spaces (space_type, slug, title, description, sign, is_active) VALUES
  ('sign_space', 'aries-moon', 'Aries Moon', 'Fiery emotional instincts and bold inner needs. A space for those whose emotional world is lit by Aries.', 'Aries', true),
  ('sign_space', 'taurus-moon', 'Taurus Moon', 'Steady emotional comfort and sensory grounding. A space for those whose emotional world is rooted in Taurus.', 'Taurus', true),
  ('sign_space', 'gemini-moon', 'Gemini Moon', 'Restless emotional curiosity and mental processing. A space for those whose emotional world buzzes with Gemini.', 'Gemini', true),
  ('sign_space', 'cancer-moon', 'Cancer Moon', 'Deep emotional intuition and nurturing instincts. A space for those whose emotional world flows with Cancer.', 'Cancer', true),
  ('sign_space', 'leo-moon', 'Leo Moon', 'Warm emotional expression and creative feelings. A space for those whose emotional world glows with Leo.', 'Leo', true),
  ('sign_space', 'virgo-moon', 'Virgo Moon', 'Analytical emotional processing and mindful care. A space for those whose emotional world refines with Virgo.', 'Virgo', true),
  ('sign_space', 'libra-moon', 'Libra Moon', 'Harmonious emotional needs and relational depth. A space for those whose emotional world balances with Libra.', 'Libra', true),
  ('sign_space', 'scorpio-moon', 'Scorpio Moon', 'Intense emotional depths and transformative feelings. A space for those whose emotional world transforms with Scorpio.', 'Scorpio', true),
  ('sign_space', 'sagittarius-moon', 'Sagittarius Moon', 'Adventurous emotional spirit and philosophical feelings. A space for those whose emotional world explores with Sagittarius.', 'Sagittarius', true),
  ('sign_space', 'capricorn-moon', 'Capricorn Moon', 'Reserved emotional strength and structured feelings. A space for those whose emotional world builds with Capricorn.', 'Capricorn', true),
  ('sign_space', 'aquarius-moon', 'Aquarius Moon', 'Detached emotional clarity and unconventional feelings. A space for those whose emotional world innovates with Aquarius.', 'Aquarius', true),
  ('sign_space', 'pisces-moon', 'Pisces Moon', 'Boundless emotional empathy and dreamy inner life. A space for those whose emotional world dissolves with Pisces.', 'Pisces', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed data: Saturn Return Circle
INSERT INTO community_spaces (space_type, slug, title, description, planet, metadata, is_active) VALUES
  ('saturn_return', 'saturn-return', 'Saturn Return Circle', 'A supportive space for those navigating their Saturn Return (ages 27-30). Weekly themes to guide your journey of growth and restructuring.', 'Saturn', '{"weekly_themes":["Structure & Boundaries","Career & Purpose","Relationships & Commitment","Health & Discipline","Identity & Authenticity","Legacy & Responsibility","Integration & Wisdom"]}', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed data: 2026 Mercury Retrograde Check-In Spaces
INSERT INTO community_spaces (space_type, slug, title, description, sign, planet, starts_at, ends_at, is_active) VALUES
  ('retrograde_checkin', 'mercury-retrograde-2026-01', 'Mercury Retrograde in Aquarius', 'Check in during Mercury Retrograde in Aquarius. Share your experiences and survival tips.', 'Aquarius', 'Mercury', '2026-01-15T00:00:00Z', '2026-02-04T23:59:59Z', false),
  ('retrograde_checkin', 'mercury-retrograde-2026-05', 'Mercury Retrograde in Gemini', 'Check in during Mercury Retrograde in Gemini. Share your experiences and survival tips.', 'Gemini', 'Mercury', '2026-05-10T00:00:00Z', '2026-06-03T23:59:59Z', false),
  ('retrograde_checkin', 'mercury-retrograde-2026-09', 'Mercury Retrograde in Virgo', 'Check in during Mercury Retrograde in Virgo. Share your experiences and survival tips.', 'Virgo', 'Mercury', '2026-09-09T00:00:00Z', '2026-09-30T23:59:59Z', false),
  ('retrograde_checkin', 'mercury-retrograde-2026-12', 'Mercury Retrograde in Capricorn', 'Check in during Mercury Retrograde in Capricorn. Share your experiences and survival tips.', 'Capricorn', 'Mercury', '2026-12-29T00:00:00Z', '2027-01-18T23:59:59Z', false)
ON CONFLICT (slug) DO NOTHING;
