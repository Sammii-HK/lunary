/**
 * Unified content categorisation
 *
 * Single source of truth for categorising posts by caption keywords.
 * Uses kebab-case consistently (e.g. 'angel-number' not 'angel_numbers').
 *
 * Used by:
 * - collect-performance.ts (daily cron + backfill)
 * - tiktok-performance/route.ts (admin bulk import)
 * - content-scores.ts (scheduling weights)
 */

/**
 * Auto-categorise a post by matching keywords in its caption.
 * Returns a kebab-case category string.
 */
export function categorisePost(description: string): string {
  const lower = description.toLowerCase();

  // Angel numbers
  if (
    /\b(111|222|333|444|555|666|777|888|999|000|1010|1111|1212|angel\s*number)\b/.test(
      lower,
    )
  )
    return 'angel-number';

  // Chiron
  if (/\bchiron\b/.test(lower)) return 'chiron-sign';

  // Sign identity ("if you're a [sign]")
  if (/\bif you'?re a\b/.test(lower)) return 'sign-identity';

  // Sign check ("stop scrolling")
  if (/\bstop scrolling\b/.test(lower)) return 'sign-check';

  // Rankings
  if (/\branking\b|\btier list\b|\btop 3\b|\bbottom 3\b/.test(lower))
    return 'ranking';

  // Hot take
  if (/\bunpopular opinion\b|\bhot take\b/.test(lower)) return 'hot-take';

  // Quiz
  if (/\bwhich one are you\b|\bwhich .* are you\b/.test(lower)) return 'quiz';

  // Transit alert (retrograde is transit-alert, not standalone)
  if (/\btransit\b|\bretrograde\b/.test(lower)) return 'transit-alert';

  // Did you know
  if (/\bdid you know\b/.test(lower)) return 'did-you-know';

  // Myth
  if (/\bthe real reason\b|\bnobody tells you\b/.test(lower)) return 'myth';

  // Saturn return (suppressed)
  if (/\bsaturn return\b/.test(lower)) return 'saturn-return';

  // Spells / rituals
  if (/\bspell\b|\britual\b/.test(lower)) return 'spells';

  // Tarot (major/minor arcana, card names)
  if (
    /\btarot\b|\bmajor arcana\b|\bminor arcana\b|\bthe fool\b|\bthe magician\b|\bhigh priestess\b|\bthe empress\b|\bthe emperor\b|\bhierophant\b|\bthe lovers\b|\bthe chariot\b|\bstrength\b|\bthe hermit\b|\bwheel of fortune\b|\bjustice\b|\bthe hanged man\b|\bdeath\b|\btemperance\b|\bthe devil\b|\bthe tower\b|\bthe star\b|\bthe moon\b|\bthe sun\b|\bjudgement\b|\bthe world\b|\bwands\b|\bcups\b|\bswords\b|\bpentacles\b/.test(
      lower,
    )
  )
    return 'tarot';

  // Lunar / moon phases
  if (/\bmoon phase\b|\bfull moon\b|\bnew moon\b|\blunar\b/.test(lower))
    return 'lunar';

  // Planetary (individual planets — but NOT "retrograde" which maps to transit-alert above)
  if (
    /\b(mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\b/.test(
      lower,
    ) &&
    !/\bretrograde\b/.test(lower)
  )
    return 'planetary';

  // Numerology / life path
  if (/\bnumerology\b|\blife path\b/.test(lower)) return 'numerology-sign';

  // Sign origin
  if (/\bwhy is\b.*\bsign\b/.test(lower)) return 'sign-origin';

  // Crystal healing
  if (/\bcrystal\b|\bstone\b/.test(lower)) return 'crystal-healing';

  // Generic zodiac (catch-all for zodiac sign mentions)
  if (
    /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/.test(
      lower,
    )
  )
    return 'sign-identity';

  return 'generic-educational';
}
