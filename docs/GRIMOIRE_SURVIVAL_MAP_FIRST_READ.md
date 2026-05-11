# Grimoire Survival Map First Read

This is the first practical read from the stage-1 survival-map export work.

Important constraint:

- the export script exists and works
- Google Search Console auth is currently flaky in the local env
- these notes preserve the useful findings from the successful run before the auth path regressed again

## What clearly stays strong

### Monthly horoscopes

- `426` pages measured
- `6,319` GSC clicks
- `109,890` GSC impressions
- `3,055` organic landing views
- `11` SEO signups

This is still one of the strongest surviving families by a large margin.

Initial stance:

- keep monthly indexed
- keep monthly in sitemap
- improve quality and internal linking
- do not collapse this family away

### Yearly horoscopes

- `61` pages measured
- `756` GSC clicks
- `18,841` GSC impressions
- `1,719` organic landing views
- `3` SEO signups

Initial stance:

- keep yearly indexed
- keep yearly in sitemap
- treat yearly as a durable forecast surface

### Retrograde leaves

- `9` pages measured
- `12` GSC clicks
- `15,680` GSC impressions
- `32` organic landing views

Even when clicks are low, impression demand is real and broad.

Initial stance:

- keep retrograde pages indexed
- treat retrogrades as a strong educational and timing lane

## Mixed families

### Timed moon pages

- `28` pages measured
- `42` GSC clicks
- `3,229` GSC impressions
- `84` organic landing views
- `1` SEO signup

This family is not dead, but it is not uniformly strong either.

Initial stance:

- keep the better-performing timed moon surfaces
- deprioritize weak month/event variants
- do not expand this family aggressively

### Houses leaves

- top-level house leaves: `18` pages, `53` clicks, `965` impressions, `55` landings
- planet-in-house leaves: `30` pages, `28` clicks, `370` impressions, `53` landings

This is usable but not dominant.

Initial stance:

- keep the main house teaching surfaces strong
- audit planet-in-house leaves more aggressively than the house pages themselves

### Placements leaves

- `94` pages measured
- `47` GSC clicks
- `953` GSC impressions
- `155` organic landing views

This is weaker than forecast families, but still shows explicit-intent behavior.

Initial stance:

- do not mass-delete placements
- keep them as specific-intent leaves under stronger parent pillars
- revisit canonical/internal-link authority before any large pruning

## Weakest family

### Compatibility leaves

- `13` pages measured
- `3` GSC clicks
- `28` GSC impressions
- `14` organic landing views

This is the weakest major family in the first read.

Initial stance:

- compatibility is the clearest candidate for tighter pruning or de-prioritization
- do not expand compatibility inventory
- keep only pair pages that prove demand or have external value

## Smaller but real signals

### Planet authority pages

- `10` pages measured
- `2,306` GSC impressions
- `33` organic landing views

These are not yet strong traffic winners, but they fit the long-term authority model.

Initial stance:

- keep building these as trust surfaces
- treat them as structural authority pages rather than expecting short-term volume

### Weekly and daily horoscopes

- weekly: `9` pages, `55` clicks, `1,388` impressions
- daily: `3` pages, `12` clicks, `608` impressions

They are smaller than monthly/yearly and should stay secondary.

Initial stance:

- do not bet recovery on weekly/daily scale
- keep them secondary to monthly/yearly and transit education

## Immediate decisions from the first read

1. Monthly and yearly horoscopes stay.
2. Retrograde leaves stay.
3. Compatibility is the first obvious trim/de-prioritize family.
4. `houses/[slug]/[house]` deserves a harder audit than `placements/[placement]`.
5. Placements should be handled carefully because they still map to explicit search intent.
6. The long-term authority pages are worth keeping even when short-term traffic is modest.

## Operational note

The script for rerunning this work is:

`pnpm audit:grimoire-survival --days 180`

But before this becomes a dependable workflow, the Search Console auth path needs cleaning up:

- `GOOGLE_SERVICE_ACCOUNT_JSON` is malformed in the current env
- fallback OAuth credentials are not consistently available

That should be fixed before relying on repeated automated exports.
