# Grimoire SEO Recovery Matrix

Last updated: 2026-05-04

This is the working recovery posture for grimoire after the April 27-28 Google collapse.
The goal is not to get everything indexed at once. The goal is to re-earn trust on a smaller, clearer surface.

## Research-backed working diagnosis

Based on current Google Search documentation, the most likely failure mode here is not a single technical exclusion. It is a section-level confidence collapse triggered by a mix of:

- **scaled-content risk**: too many adjacent pages that can look mass-produced at section scale
- **doorway-adjacent structure**: many similar pages sitting close to search intent without enough differentiation
- **people-first weakness**: not enough obvious originality, specificity, or editorial attention on some families
- **technical trust drag**: duplicate URLs, stale slugs, mixed canonical/sitemap/link signals

Relevant Google docs:

- Helpful, reliable, people-first content:
  - https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Search Essentials:
  - https://developers.google.com/search/docs/essentials
- Spam policies: scaled content abuse / doorway abuse:
  - https://developers.google.com/search/docs/essentials/spam-policies
- Google guidance on generative AI content:
  - https://developers.google.com/search/docs/fundamentals/using-gen-ai-content

## Risk framing

- `High scaled-content risk`: large families with many similar pages and weak differentiation
- `Medium scaled-content risk`: some repetitiveness, but clear user value if tightened
- `Lower risk`: stronger intent match, clearer usefulness, or proven winners

## Buckets

- `Keep indexed + improve`: core recovery pages
- `Keep live, deprioritize`: useful for users/internal linking, but not something to push hard in discovery
- `Noindex root / tool`: root or tool page should not compete in search, but leaf pages can still be useful
- `Remove from sitemap`: stop advertising aggressively even if page stays live

## Family decisions

### Horoscopes

- Monthly sign pages: `Keep indexed + improve`
- Yearly sign pages: `Keep indexed + improve`
- Risk: `Lower risk` for monthly/yearly core pages, `High scaled-content risk` for daily/weekly/far-future layers
- Sign root pages: `Noindex root / tool` (already done)
- Daily hub + daily sign pages: `Noindex root / tool` (already done)
- Weekly hub + weekly sign pages: `Noindex root / tool` (already done)
- Far-future year/month inventory: `Remove from sitemap` and constrain route discovery (in progress, largely done)

### Transits

- Main hub: `Keep indexed + improve`
- Individual transit pages: `Keep indexed + improve`
- Year pages: `Keep indexed + improve`, but only near-term
- Risk: `Medium risk` overall; strong intent family, but future-year spray and near-duplicate transit variants are dangerous
- Transit of the day: `Noindex root / tool` (already done)
- App duplicate `/transits`: `Remove from sitemap` (done)

### Moon

- Main hub: `Keep indexed + improve`
- Year pages: `Keep indexed + improve`, but only near-term
- Dated moon event pages: `Keep indexed + improve`
- Moon phases/full moon pages: `Keep live, deprioritize`
- Risk: `Medium risk`; useful family, but dated/event variants and canonical mistakes can make it look noisy fast
- Moon content links to `/moon` and `/moon-calendar`: normalized to grimoire routes (done)
- 2026 moon canonicals: fixed (done)

### Numerology

- Main hub: `Keep indexed + improve`
- Strong evergreen leaves: `Keep indexed + improve`
- Year pages: `Keep indexed + improve`, but only near-term
- Angel number hub: `Keep live, deprioritize`
- Angel number leaves: `Keep indexed + improve` selectively based on demand
- Risk: `Medium risk`; evergreen demand is real, but the long tail can become scaled-query capture if not selective

### Synastry

- Main synastry guide: `Keep indexed + improve`
- Synastry aspect leaves: `Keep indexed + improve`
- Synastry generator: `Noindex root / tool` (done)
- Risk: `Medium risk`; pages can be useful, but family needs clear relational specificity to avoid looking templated

### Birthday

- Birthday hub: `Keep live, deprioritize`
- Birthday hub removed from birthday sitemap (done)
- Birthday leaves: `Keep indexed + improve` selectively; likely large template family that needs later pruning
- Risk: `High scaled-content risk`; 366 adjacent pages with heavy structural overlap, even if the family had real demand
- Recovery stance: keep leaves live, stop over-advertising the family, avoid blanket noindex until we have clearer evidence

### Compatibility

- Root hub: `Noindex root / tool` (done)
- Pair pages: `Keep live, deprioritize` until stronger evidence they deserve recovery priority
- Compatibility sitemap restricted to curated pairs only (done)
- Risk: `High scaled-content risk`; many near-duplicate intent pages, strongest doorway-adjacent family in the section

### Zodiac

- Root hub: `Noindex root / tool` (done)
- Sign pages: `Keep live, deprioritize`
- Risk: `Medium to high`; broad sign explainers are easy to make and hard to differentiate at scale

### Crystals

- Root hub: `Noindex root / tool` (done)
- Root removed from main sitemap and crystals sitemap (done)
- Leaf pages: `Keep live, deprioritize`
- Risk: `High`; weaker family with low pre-collapse performance and little recovery value

### Runes

- Root hub: `Noindex root / tool` (done)
- Root removed from main sitemap (done)
- Leaf pages: `Keep live, deprioritize`
- Risk: `High`; weak demand, easy to look like long-tail inventory padding

### Spells

- Main hub: `Keep live, deprioritize`
- Spell leaves: `Keep live, deprioritize`
- Paginated archive pages: `Noindex root / tool` and canonicalize to root (done)
- Risk: `Medium to high`; potentially useful, but quality bar is high and the family can read as broad lifestyle inventory

### Tarot

- Main hub: `Keep live, deprioritize`
- Strong card pages: `Keep indexed + improve`
- Spreads hub: `Keep live, deprioritize`
- Utility yes/no pages: `Keep live, deprioritize`
- Risk: `Medium`; strongest pages can stay, but utilities/spread variants should not dominate discovery

### Events

- Main hub: `Keep live, deprioritize`
- Year/event pages: `Keep indexed + improve` only for near-term years
- Far-future years: `Remove from sitemap` and route discovery
- Risk: `High` when future-heavy; this family turns into obvious speculative query capture very fast

## Current recovery rules

1. Do not advertise entire weak families through the sitemap index.
2. Do not let generated tooling reintroduce stale or far-future inventory.
3. Bias core pages toward linking into other recovery pages, not weaker roots.
4. Treat `Crawled - currently not indexed` as mainly a trust/quality problem, not just a crawl problem.

## Immediate next improvement work

1. Decide birthday-family pruning rules without overreacting and hurting Bing/DDG.
2. Improve the strongest evergreen families next: numerology, synastry, and selected angel numbers.
3. Keep cutting any stale URL emitters that create 404 / redirect / alternate noise.
4. Push one coherent recovery batch and redeploy once, then judge the next GSC recrawl signal.
