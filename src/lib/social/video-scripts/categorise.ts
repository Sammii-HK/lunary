/**
 * Unified content categorisation
 *
 * Single source of truth for categorising posts by caption keywords.
 * Uses kebab-case consistently (e.g. 'angel-number' not 'angel_numbers').
 *
 * Order matters: astrology categories are checked FIRST (specific keywords
 * that won't false-positive on non-astrology content), then cross-persona
 * categories (broader patterns that would otherwise swallow astrology posts).
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

  // ── Astrology categories (checked first — specific, no false positives) ──

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

  // Hot take (astrology-specific)
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

  // Horoscope catch-all (astrology posts that don't match specific categories)
  if (
    /\b(horoscope|zodiac|astrology|birth chart|natal chart|rising sign|moon sign|sun sign|ascendant|midheaven)\b/.test(
      lower,
    )
  )
    return 'generic-astrology';

  // ── Cross-persona categories (checked after astrology) ──────────────────

  // sammii (BIP/founder) — multi-word phrases to avoid false positives
  if (
    /\b(building in public|bip\b|just shipped|indie hacker|bootstrapped|solo founder)\b/.test(
      lower,
    )
  )
    return 'build-in-public';

  if (
    /\b(founder journey|startup journey|founder story|lesson.{0,5}learned|as a founder)\b/.test(
      lower,
    )
  )
    return 'founder-story';

  if (
    /\b(machine learning|mcp server|llm|ai agent|tech stack|typescript|next\.js|nextjs|vercel)\b/.test(
      lower,
    )
  )
    return 'tech-insight';

  if (/\b(claude code|chatgpt|cursor ai|copilot|ai tool)\b/.test(lower))
    return 'ai-tools';

  if (
    /\b(new feature|just released|changelog|shipped v\d|beta launch)\b/.test(
      lower,
    )
  )
    return 'product-update';

  if (
    /\b(monthly active|daily active|mau\b|dau\b|mrr\b|conversion rate|retention rate|revenue growth)\b/.test(
      lower,
    )
  )
    return 'growth-metrics';

  // sammii sparkle (creative/AI art)
  if (
    /\b(ai art|ai generated|ai image|midjourney|stable diffusion|flux\b|comfyui|nano banana|generated with)\b/.test(
      lower,
    )
  )
    return 'ai-art';

  if (
    /\b(creative process|behind the scenes|making of|how i made)\b/.test(lower)
  )
    return 'creative-process';

  if (/\b(glitch art|aesthetic|vaporwave|surreal)\b/.test(lower))
    return 'visual-experiment';

  if (
    /\b(ar filter|augmented reality|face filter|instagram filter)\b/.test(lower)
  )
    return 'ar-filter';

  // scape² (photography) — multi-word phrases
  if (
    /\b(landscape photo|nature photo|sunset photo|golden hour|mountain view)\b/.test(
      lower,
    )
  )
    return 'landscape-photo';

  if (/\b(street photo|urban photo|architecture photo|cityscape)\b/.test(lower))
    return 'urban-photo';

  if (/\b(abstract photo|minimal photo|texture study)\b/.test(lower))
    return 'abstract-photo';

  // General/cross-persona engagement
  if (
    /\b(agree\?|thoughts\?|what do you think|controversial take)\b/.test(lower)
  )
    return 'engagement-hook';

  return 'generic-educational';
}
