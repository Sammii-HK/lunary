# Grimoire SEO Recovery Matrix

Last updated: 2026-05-04

This is the working recovery posture for grimoire after the April 27-28 Google collapse.
The goal is not to get everything indexed at once. The goal is to re-earn trust on a smaller, clearer surface.

## Buckets

- `Keep indexed + improve`: core recovery pages
- `Keep live, deprioritize`: useful for users/internal linking, but not something to push hard in discovery
- `Noindex root / tool`: root or tool page should not compete in search, but leaf pages can still be useful
- `Remove from sitemap`: stop advertising aggressively even if page stays live

## Family decisions

### Horoscopes
- Monthly sign pages: `Keep indexed + improve`
- Yearly sign pages: `Keep indexed + improve`
- Sign root pages: `Noindex root / tool` (already done)
- Daily hub + daily sign pages: `Noindex root / tool` (already done)
- Weekly hub + weekly sign pages: `Noindex root / tool` (already done)
- Far-future year/month inventory: `Remove from sitemap` and constrain route discovery (in progress, largely done)

### Transits
- Main hub: `Keep indexed + improve`
- Individual transit pages: `Keep indexed + improve`
- Year pages: `Keep indexed + improve`, but only near-term
- Transit of the day: `Noindex root / tool` (already done)
- App duplicate `/transits`: `Remove from sitemap` (done)

### Moon
- Main hub: `Keep indexed + improve`
- Year pages: `Keep indexed + improve`, but only near-term
- Dated moon event pages: `Keep indexed + improve`
- Moon phases/full moon pages: `Keep live, deprioritize`
- Moon content links to `/moon` and `/moon-calendar`: normalized to grimoire routes (done)
- 2026 moon canonicals: fixed (done)

### Numerology
- Main hub: `Keep indexed + improve`
- Strong evergreen leaves: `Keep indexed + improve`
- Year pages: `Keep indexed + improve`, but only near-term
- Angel number hub: `Keep live, deprioritize`
- Angel number leaves: `Keep indexed + improve` selectively based on demand

### Synastry
- Main synastry guide: `Keep indexed + improve`
- Synastry aspect leaves: `Keep indexed + improve`
- Synastry generator: `Noindex root / tool` (done)

### Birthday
- Birthday hub: `Keep live, deprioritize`
- Birthday leaves: `Keep indexed + improve` selectively; likely large template family that needs later pruning
- Treat as high-risk for template duplication

### Compatibility
- Root hub: `Noindex root / tool` (done)
- Pair pages: `Keep live, deprioritize` until stronger evidence they deserve recovery priority

### Zodiac
- Root hub: `Noindex root / tool` (done)
- Sign pages: `Keep live, deprioritize`

### Crystals
- Root hub: `Noindex root / tool` (done)
- Root removed from main sitemap and crystals sitemap (done)
- Leaf pages: `Keep live, deprioritize`

### Runes
- Root hub: `Noindex root / tool` (done)
- Root removed from main sitemap (done)
- Leaf pages: `Keep live, deprioritize`

### Spells
- Main hub: `Keep live, deprioritize`
- Spell leaves: `Keep live, deprioritize`
- Paginated archive pages: `Noindex root / tool` and canonicalize to root (done)

### Tarot
- Main hub: `Keep live, deprioritize`
- Strong card pages: `Keep indexed + improve`
- Spreads hub: `Keep live, deprioritize`
- Utility yes/no pages: `Keep live, deprioritize`

### Events
- Main hub: `Keep live, deprioritize`
- Year/event pages: `Keep indexed + improve` only for near-term years
- Far-future years: `Remove from sitemap` and route discovery

## Immediate next improvement work

1. Rewrite top monthly horoscope pages with real transit/aspect logic.
2. Rewrite top yearly horoscope pages with real transit/aspect logic.
3. Improve top transit pages for intent match and specificity.
4. Decide birthday family pruning rules after sampling real pages.
5. Sample angel numbers / moon-sign overlap before stricter noindex decisions.
