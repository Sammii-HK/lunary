/**
 * Source-labelling for the interpretive grimoire free-chart CTAs.
 *
 * The grimoire reach pages (placements, aspect combos, houses, zodiac-in-chart,
 * ...) are Lunary's highest-volume Bing + GEO surface. Their shared free-chart
 * CTA used to point at an untagged `/birth-chart`, so an AI/Bing-referred reader
 * who clicked through was bucketed as "direct" and the per-hub grimoire ->
 * signup conversion was invisible.
 *
 * {@link withGrimoireRef} appends a `?ref=grimoire_<hub>` source label to an
 * internal funnel href. This rides the existing first-touch attribution:
 * `mapUtmToSource` (src/lib/attribution.ts) recognises the `grimoire_` prefix
 * and buckets the visit as the `grimoire` channel instead of letting an internal
 * click collapse to `direct`, while the raw hub stays readable in
 * `first_touch_ref` for per-hub funnel slicing. It is measurement-only: the
 * visible copy, position and destination page are unchanged.
 */

/**
 * Append `?ref=grimoire_<hub>` to a same-origin funnel href.
 *
 * Only internal paths with no existing query string are tagged, so external
 * links and already-parameterised hrefs (e.g. the facts UTM CTA) are returned
 * untouched. A missing or blank hub falls back to `universal`.
 */
export function withGrimoireRef(href: string, hub: string): string {
  if (!href.startsWith('/')) return href; // external / non-funnel link
  if (href.includes('?')) return href; // already tagged (e.g. facts UTM)
  const safeHub = (hub || 'universal').trim() || 'universal';
  return `${href}?ref=grimoire_${safeHub}`;
}
