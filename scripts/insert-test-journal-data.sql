-- Insert test journal data with proper metadata for pattern detection
-- This creates a test user with 15 journal entries containing:
-- - Mood tags
-- - Moon phase data
-- - Meaningful text with house keywords
-- - Patterns: "reflective" during New Moon, relationship themes, career themes

BEGIN;

-- Create test user
INSERT INTO "user" (id, name, email)
VALUES (
  'test-pattern-user-001',
  'Pattern Test User',
  'pattern-test@example.com'
)
ON CONFLICT (id) DO NOTHING;

-- Create user profile with birth chart
INSERT INTO user_profiles (
  user_id,
  name,
  birthday,
  location,
  birth_chart
)
VALUES (
  'test-pattern-user-001',
  'Pattern Test User',
  '1990-06-15',
  '{"latitude": 51.5074, "longitude": -0.1278, "birthTime": "14:30", "timezone": "Europe/London"}'::jsonb,
  '[
    {"body": "Sun", "sign": "Gemini", "degree": 23.5, "eclipticLongitude": 83.5},
    {"body": "Moon", "sign": "Pisces", "degree": 12.3, "eclipticLongitude": 342.3},
    {"body": "Ascendant", "sign": "Libra", "degree": 15.0, "eclipticLongitude": 195.0},
    {"body": "Mercury", "sign": "Gemini", "degree": 28.1, "eclipticLongitude": 88.1},
    {"body": "Venus", "sign": "Taurus", "degree": 19.4, "eclipticLongitude": 49.4},
    {"body": "Mars", "sign": "Pisces", "degree": 5.2, "eclipticLongitude": 335.2}
  ]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  birth_chart = EXCLUDED.birth_chart;

-- Insert 15 journal entries with patterns
INSERT INTO collections (user_id, category, title, content, created_at)
VALUES
  -- Relationship theme + reflective mood (creates pattern)
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 1',
   '{"text": "Had a deep conversation with my partner today about our future together. Feeling reflective about where we are heading.", "moodTags": ["reflective"], "moonPhase": "New Moon", "cardReferences": [], "source": "test-data", "transitHighlight": "Mars in Aries"}'::jsonb,
   NOW() - INTERVAL '30 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 3',
   '{"text": "Thinking about my relationships and how I show up for others. Energized about commitment right now.", "moodTags": ["energized"], "moonPhase": "Waxing Crescent", "cardReferences": [], "source": "test-data", "transitHighlight": "Mars in Aries"}'::jsonb,
   NOW() - INTERVAL '27 days'),

  -- Career theme (creates 10th house pattern)
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 5',
   '{"text": "Big meeting at work today about the new project. Feeling hopeful about taking on more responsibility.", "moodTags": ["hopeful"], "moonPhase": "First Quarter", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '25 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 7',
   '{"text": "My partner and I are navigating some challenges. Feeling anxious but hopeful we will work through this together.", "moodTags": ["anxious"], "moonPhase": "Waxing Gibbous", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '23 days'),

  -- Self-reflection theme
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 9',
   '{"text": "Spent time journaling about who I am becoming. Feeling reflective about this journey of self-discovery.", "moodTags": ["reflective"], "moonPhase": "Full Moon", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '21 days'),

  -- Relationship theme again (reinforces 7th house pattern)
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 11',
   '{"text": "Reflecting on my career goals and where I want to be in five years. Inspired about the path ahead.", "moodTags": ["inspired"], "moonPhase": "Waning Gibbous", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '19 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 13',
   '{"text": "Looking in the mirror and really seeing myself today. Peaceful energy around my identity and how I show up.", "moodTags": ["peaceful"], "moonPhase": "Last Quarter", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '17 days'),

  -- Home/family theme (creates 4th house pattern)
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 15',
   '{"text": "Reorganizing my space today and it is bringing up feelings about home and family. Reflective about my roots.", "moodTags": ["reflective"], "moonPhase": "Waning Crescent", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '15 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 17',
   '{"text": "Painted for hours today and lost track of time. Feeling joyful and so alive in my creative flow.", "moodTags": ["joyful"], "moonPhase": "New Moon", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '13 days'),

  -- Another relationship entry (reinforces pattern)
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 19',
   '{"text": "Thinking about the people in my life and who truly sees me. Grateful about my relationships.", "moodTags": ["grateful"], "moonPhase": "Waxing Crescent", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '11 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 21',
   '{"text": "Had a breakthrough moment at work today. Feeling energized and ready to step into my power.", "moodTags": ["energized"], "moonPhase": "First Quarter", "cardReferences": [], "source": "test-data", "transitHighlight": "Mars in Aries"}'::jsonb,
   NOW() - INTERVAL '9 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 23',
   '{"text": "Deep meditation session this morning. Feeling reflective and connected to something greater.", "moodTags": ["reflective"], "moonPhase": "Waxing Gibbous", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '7 days'),

  -- Another relationship entry
  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 25',
   '{"text": "My partner mentioned something that really resonated with me. Feeling hopeful about our partnership.", "moodTags": ["hopeful"], "moonPhase": "Full Moon", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '5 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 27',
   '{"text": "Called my mom today and we talked about childhood memories. Feeling peaceful about where I come from.", "moodTags": ["peaceful"], "moonPhase": "Waning Gibbous", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '3 days'),

  ('test-pattern-user-001', 'journal', 'Journal Entry - Day 29',
   '{"text": "Met up with friends today and realized how much I value community. Feeling grateful and supported.", "moodTags": ["grateful"], "moonPhase": "Last Quarter", "cardReferences": [], "source": "test-data"}'::jsonb,
   NOW() - INTERVAL '1 day');

COMMIT;

-- Verify data was inserted
SELECT
  COUNT(*) as entry_count,
  MIN(created_at) as first_entry,
  MAX(created_at) as last_entry
FROM collections
WHERE user_id = 'test-pattern-user-001'
  AND category = 'journal';

-- Show sample entry
SELECT
  title,
  content->'moodTags' as moods,
  content->'moonPhase' as moon_phase,
  created_at
FROM collections
WHERE user_id = 'test-pattern-user-001'
  AND category = 'journal'
ORDER BY created_at DESC
LIMIT 3;
