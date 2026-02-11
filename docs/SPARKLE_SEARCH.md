# Sparkle Search: Personalized Grimoire Search

## Overview

Sparkle Search adds a personalization layer to the Grimoire search. When a user toggles the sparkle button in the search bar, results are boosted and badged based on their birth chart, the current moon sign, and active retrogrades. Everything runs client-side using data already available in context providers — zero API calls.

## How It Works

### Toggle

A `Sparkles` icon button sits inside the search input (right side). Tapping it toggles `isPersonalized` state on/off. When active the icon turns `lunary-accent`; when inactive it's `zinc-500`.

### Data Sources

All data is read from existing React context providers that already wrap the grimoire pages:

| Data                   | Provider                   | Hook                  | What We Extract                                              |
| ---------------------- | -------------------------- | --------------------- | ------------------------------------------------------------ |
| Birth chart placements | `UserProvider`             | `useUser()`           | Sun sign, Moon sign, Ascendant sign                          |
| Current moon sign      | `AstronomyContextProvider` | `useMoonData()`       | `currentMoonConstellationPosition`                           |
| Planetary positions    | `AstronomyContextProvider` | `usePlanetaryChart()` | `currentAstrologicalChart` filtered to `retrograde === true` |

Sign extraction:

```ts
const sun = birthChart.find((p) => p.body === 'Sun')?.sign; // e.g. "Aries"
const moon = birthChart.find((p) => p.body === 'Moon')?.sign; // e.g. "Scorpio"
const rising = birthChart.find((p) => p.body === 'Ascendant')?.sign; // e.g. "Leo"
```

### Score Boosting

When personalized mode is ON, the existing `searchResults` scoring pipeline applies bonus points to results whose titles match the user's placements:

| Match                                       | Boost | Badge            |
| ------------------------------------------- | ----- | ---------------- |
| User's Sun sign in title                    | +3    | "Your Sun Sign"  |
| User's Moon sign in title                   | +2    | "Your Moon Sign" |
| User's Rising sign in title                 | +3    | "Your Rising"    |
| Current transiting Moon sign in title       | +2    | "Current Moon"   |
| Retrograde planet name + retrograde context | +2    | "Active Now"     |

Rules:

- Matching is case-insensitive (`"ARIES"` matches `sun: "Aries"`)
- A single result can receive multiple badges (e.g. Sun and Moon both in Aries = both badges, +6)
- The "Current Moon" badge is skipped if the result already has a "Your..." badge for the same sign (avoids double-badging when the transiting moon is in the user's Sun sign)
- Only one "Active Now" badge per result even if multiple retrograde planets appear in the title
- Boosting happens before deduplication, so boosted results rise to the top of the final sorted list

### Badges

Badges render as small pill-shaped spans next to the result title:

```
┌──────────────────────────────────────────────┐
│ Zodiac Sign - Aries  [Your Sun Sign]         │
│ zodiac                                       │
├──────────────────────────────────────────────┤
│ Mercury Retrograde  [Active Now]             │
│ astrology                                    │
└──────────────────────────────────────────────┘
```

Styled with `bg-lunary-accent/20 text-lunary-accent` rounded-full pills.

### Personalized Suggestions (Empty Search)

When sparkle is ON and the search input is empty + focused, a suggestions dropdown appears instead of nothing:

**"Based on your chart" section:**

- Sun in {sign} — links to `/grimoire/zodiac/{sign}`
- Moon in {sign} — links to `/grimoire/zodiac/{sign}`
- Rising in {sign} — links to `/grimoire/zodiac/{sign}`

**"Current sky" section** (only if data available):

- Moon in {sign} — explore {sign} magic
- {Planet} is retrograde — survival guide (one per retrograde planet)

**Footer:**

- Link to the Astral Guide (`/guide`)

### Fallback States

| State                              | Behavior                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Not authenticated (`user` is null) | Sparkle button works; toggling shows "Sign in to personalize your Grimoire search" |
| Authenticated but no birth chart   | Shows "Add your birth details in settings to personalize your Grimoire search"     |
| Authenticated with birth chart     | Full personalization (boosts, badges, suggestions)                                 |
| Sparkle OFF                        | Standard keyword search, identical to previous behavior                            |

### Astral Guide CTAs

Three places now guide users toward the Astral Guide:

1. **Results footer** — Every search result dropdown has a subtle footer: "For personalized guidance, ask the Astral Guide" linking to `/guide`
2. **No-results state** — Enhanced message explaining the Astral Guide knows the entire Grimoire + has their chart context. Links to `/guide?prompt={query}` so the query carries over
3. **Personalized suggestions footer** — "For full chart guidance, ask the Astral Guide" linking to `/guide`

## Astral Guide Quick Action

A new "Grimoire Lookup" quick action was added to `CopilotQuickActions.tsx`:

```
Label: "Grimoire Lookup"
Prompt: "Look up something in the Grimoire based on my current transits"
Icon: BookOpen
```

This surfaces the grimoire connection directly in the Astral Guide chat interface.

## Files Changed

| File                                                                | Changes                                                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/grimoire/GrimoireSearch.tsx`                               | Sparkle toggle, personalization hooks, score boosting, badges, suggestions dropdown, guide CTAs |
| `src/components/CopilotQuickActions.tsx`                            | Added "Grimoire Lookup" quick action                                                            |
| `__tests__/unit/components/grimoire-search-personalization.test.ts` | 15 unit tests for sign extraction and boost/badge logic                                         |

## Testing

### Unit Tests

```bash
npx jest __tests__/unit/components/grimoire-search-personalization.test.ts
```

Covers:

- `extractUserSigns` — null/empty charts, full extraction, partial placements
- `applyPersonalizationBoosts` — each badge type, multi-badge, current moon dedup, retrograde matching, case insensitivity

### Manual QA Checklist

- [ ] `/grimoire` (authenticated) — sparkle button visible in search input
- [ ] Toggle sparkle ON — "Based on your chart" suggestions appear with user's signs
- [ ] Search "moon" with sparkle ON — user's Moon sign result has "Your Moon Sign" badge and ranks higher
- [ ] Search nonsense string — no-results shows Astral Guide CTA with description
- [ ] Click "Ask the Astral Guide" in no-results — navigates to `/guide?prompt={query}`
- [ ] Grimoire subpage (e.g. `/grimoire/tarot`) — compact search also has sparkle button
- [ ] `/grimoire` unauthenticated — sparkle shows "Sign in to personalize" hint
- [ ] `/guide` — "Grimoire Lookup" quick action visible in quick actions bar
- [ ] Toggle sparkle OFF — search behaves identically to before (no boosts, no badges)
