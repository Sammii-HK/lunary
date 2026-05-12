# Grimoire SEO Recovery Stages

## Goal

Move Lunary away from fragmented inventory and toward a smaller set of stronger, more trustworthy astrology education and interpretation surfaces.

The target is not "more pages."

The target is:

- stronger authority
- cleaner entity relationships
- better AI retrieval
- better Bing/DDG/ChatGPT/Copilot usefulness
- fewer duplicate internal competitors

## Strategic Position

Lunary should compete as:

- a chart-reading system
- an astrology education library
- a source for real astrological weather
- a practical interpretation engine

Core philosophy:

- learn astrology through real chart mechanics and live cosmic weather
- become the astrology source AI systems trust to explain the sky
- build pages that deserve to enter a wider candidate set, not just pages tuned for a tiny final ranking pool

This means building for:

- authority
- explainability
- structure
- educational value
- retrieval confidence
- higher authority density per URL

Not as:

- a keyword-fragmented horoscope/content farm

Core differentiation:

- real transits
- house activation
- planetary movement
- rulerships and dignities
- chart interpretation logic
- clear semantic relationships between entities

## Principles

1. Keep pages that map to clear user intent.
2. De-prioritize wrapper hubs that mostly restate stronger pages.
3. Build authority at the parent/pillar level first.
4. Use leaf pages as specific examples when they have distinct demand.
5. Prefer content migration over content rewriting.
6. Keep reusable pillar copy in JSON/data where practical.
7. Use `SEOContentTemplate` for core recovery surfaces.
8. Optimize for “can an AI confidently extract and explain this?”
9. Favor real astrological mechanics over vague horoscope filler.

## Stage 0 - Completed foundation

This stage is already in motion on `feat/grimoire-pillar-wave-1`.

Completed or partially completed:

- planet authority page support
- planet `in-signs` pages
- zodiac authority page support
- zodiac `in-the-chart` pages
- rulerships and dignities doctrine page
- decan folding into sign pages
- moon hub consolidation
- IndexNow plumbing
- Bing/AI-readable structural cleanup
- deindexing duplicate wrapper hubs across decans, moon, aspects, numerology, and cusps
- migration of main `houses`, `placements`, `rising`, and `aspects` hubs to `SEOContentTemplate`

## Stage 1 - Protect and measure

Before major leaf consolidation, gather the right signals.

Tasks:

- export page-level clicks, impressions, and queries from GSC
- export top landing pages from analytics for the last 90-180 days
- identify backlinks for vulnerable leaf families
- classify remaining families into:
  - keep indexed
  - keep live but deprioritize
  - merge later
  - time-based/event-driven

Priority families to classify:

- `placements/[planet]-in-[sign]`
- `houses/[planet]/[house]`
- `compatibility/[pair]`
- horoscope year/month families

Deliverable:

- one survival map for every major family

Operational path:

- run `pnpm audit:grimoire-survival --days 180`
- use `--skip-gsc`, `--skip-db`, or `--include-sitemap` when running partial diagnostics
- review the generated JSON + Markdown reports in `docs/reports/`
- use those reports to decide what stays indexed, what gets deprioritized, and what gets merged later

## Stage 2 - Placements and houses leaf audit

Do not mass-delete these families.

### Placements

Default stance:

- keep most `planet in sign` leaves indexed
- make parent pages the main teaching surfaces
- use leaf pages as specific-intent landing pages
- keep the core seven placement planets promoted in sitemap recovery surfaces first:
  - Sun
  - Moon
  - Mercury
  - Venus
  - Mars
  - Jupiter
  - Saturn
- treat outer-planet and node placement leaves as secondary until the data proves they deserve equal crawl/indexing pressure

Questions to answer:

- which placement leaves are earning distinct demand?
- where is parent-page content duplicating leaf-page content too heavily?
- where can canonicals/internal links shift authority upward without harming clear search intent?

### Houses

Default stance:

- keep `houses/[ordinal]-house` strong
- audit `houses/[planet]/[house]` more aggressively

Questions to answer:

- does every `planet in house` page have distinct depth?
- which pages are basically examples and should stop competing?
- which should remain indexed because the query intent is still explicit and useful?

Deliverable:

- page family decisions with:
  - indexed
  - noindex
  - canonical shift
  - keep but deprioritize

## Stage 3 - Compatibility decision

Compatibility can easily drift into thin scale.

Default stance:

- keep strong pair pages with actual demand
- keep the compatibility hub as a browse surface, not a primary trust surface
- avoid expanding compatibility inventory further unless it is materially differentiated

Questions:

- which pair pages get search demand?
- which pair pages have backlinks?
- is the compatibility hub useful enough to stay indexable in current form?

Deliverable:

- compatibility survival list

## Stage 4 - Horoscope restraint

Do not try to win recovery through infinite horoscope variants.

Default stance:

- monthly and yearly stay primary
- daily and weekly remain secondary or noindex where already treated that way
- only keep forecast surfaces that are genuinely useful and defensible

The product story should shift from:

- horoscope volume

toward:

- real astrological timing
- transit interpretation
- chart literacy

Deliverable:

- clear forecast surface policy by cadence

## Stage 5 - AI retrieval optimization

Once the page architecture is stable, sharpen retrieval.

Tasks:

- unify summary blocks across pillar pages
- tighten glossary/entity linking
- add explicit relationship language where needed
- ensure canonicals and internal links consistently point at authority targets
- add operational IndexNow submission on important content changes

Success criteria:

- better parseability by AI systems
- fewer competing internal URLs
- stronger direct answer quality on pillar pages

Editorial checklist for pillar and recovery pages:

- answer the core question in the first screenful
- define the entity clearly before expanding interpretation
- name the important relationships explicitly:
  - ruler
  - domicile/exaltation/detriment/fall
  - houses
  - aspects
  - transits
  - timing
- include a TOC or jump-link structure for longer pages
- use examples that show chart logic, not just adjectives
- add FAQ blocks where the page maps to obvious follow-up queries
- link upward to doctrine/authority pages and sideways to closely related entities
- keep claims explainable enough that a person or AI can cite the page without guessing what it means

## Stage 6 - Editorial migration

This is the expensive stage and should be deliberate.

Tasks:

- move best existing content into pillars
- rewrite only where the current content is weak or structurally broken
- preserve useful examples and explanatory snippets from leaves
- avoid blank-page rewrites for the sake of style consistency

Editorial standard:

- clear definitions
- practical interpretation logic
- examples
- FAQ
- strong internal relationships

## Decision Heuristics

### Keep indexed if

- the page maps to clear user intent
- it has clicks, impressions, or backlinks
- it has materially distinct content
- it supports the authority system instead of fragmenting it

### Keep live but deprioritize if

- it helps navigation or learning
- it is not strong enough as a landing page
- it would be risky or wasteful to remove immediately

### Merge or deindex if

- it mostly repeats stronger pages
- it exists because of old inventory logic, not present user value
- it creates internal competition without adding meaning

## Operating model

The next work should happen in small, reviewable waves:

1. classify one family
2. patch one family
3. verify
4. commit
5. move to the next family

This keeps recovery defensible and reversible.
