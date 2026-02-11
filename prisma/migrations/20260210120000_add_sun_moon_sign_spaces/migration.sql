-- Add Sun Sign and Moon Sign community spaces

-- 12 Sun Sign Spaces
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

-- 12 Moon Sign Spaces
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
