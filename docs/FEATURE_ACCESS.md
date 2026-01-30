# Feature Access Guide

This document mirrors the canonical feature entitlements in
`utils/pricing.ts` (`FEATURE_ACCESS`) and plan limits in `PRICING_PLANS`.

## Access Levels

### 1. Unauthenticated (No Account)

- General/universal content only
- No personalized features

### 2. Free Account (Authenticated, No Subscription)

- Access to all features in `FEATURE_ACCESS.free`
- Birth chart viewing is free but requires birthday data

### 3. Paid (Trial or Active)

- Access to all free features plus plan-specific features
- Trialing status is treated the same as trial/active for access

---

## Free Features (`FEATURE_ACCESS.free`)

Available to all authenticated users:

- **Birth Chart** (`birth_chart`)
- **Moon Phases** (`moon_phases`)
  - Includes moon phase display on horoscope page with personalized house placement\*
  - Includes moon phase display on tarot page
  - \*Requires birth chart with birth time for house placement
- **General Horoscope** (`general_horoscope`)
- **General Tarot** (`general_tarot`)
- **General Crystal Recommendations** (`general_crystal_recommendations`)
- **Grimoire** (`grimoire`)
- **Lunar Calendar** (`lunar_calendar`)
- **Weekly AI Ritual** (`weekly_ai_ritual`)
- **Birthday Collection** (`birthday_collection`)
- **Personal Day number** (`personal_day_number`) - number only
- **Personal Year number** (`personal_year_number`) - number only

---

## Paid Features (Trial or Active Subscription)

### Lunary+ (`FEATURE_ACCESS.lunary_plus`)

- **Personalized Horoscope** (`personalized_horoscope`)
- **Personal Tarot** (`personal_tarot`)
- **Personalized Crystal Recommendations** (`personalized_crystal_recommendations`)
- **Personalized Transit Readings** (`personalized_transit_readings`)
- **Transit Calendar** (`transit_calendar`)
- **Tarot Patterns** (`tarot_patterns`)
  - Basic pattern visualizations (progress bars, frequency charts)
  - Cosmic context for card appearances (`pattern_drill_down`):
    - Moon phase + aspects when each card was pulled
    - Personalized transit analysis for frequent cards
- **Solar Return Insights** (`solar_return`)
- **Cosmic Profile** (`cosmic_profile`) - life themes, archetypes, profile insights
- **Moon Circles** (`moon_circles`)
- **Ritual Generator** (`ritual_generator`)
- **Collections** (`collections`)
- **Monthly Insights** (`monthly_insights`)
- **Personal Day meaning** (`personal_day_meaning`)
- **Personal Year meaning** (`personal_year_meaning`)

### Lunary+ Pro (additional)

- **Astral Guide chat access** (`unlimited_ai_chat`)
- **Deeper Readings** (`deeper_readings`)
- **Weekly Reports** (`weekly_reports`)
- **Chat continuity** (`saved_chat_threads`) - single thread, last 50 messages
- **Downloadable Reports** (`downloadable_reports`)
- **AI Ritual Generation** (`ai_ritual_generation`)
- **Advanced Patterns** (`advanced_patterns`)
  - Advanced pattern visualizations (radial charts, sparklines, heatmaps)
  - Cosmic context for card appearances (`pattern_drill_down`):
    - Moon phase + aspects when each card was pulled
    - Personalized transit analysis for frequent cards
    - Frequency timeline visualization
    - Interactive frequent cards expansion

### Lunary+ Pro Annual (additional)

- **Unlimited Tarot Spreads** (`unlimited_tarot_spreads`)
- **Yearly Forecast** (`yearly_forecast`)
- **Data Export** (`data_export`)

---

## Key Gating Rules

- **Personalization requires** authentication, the relevant paid feature key,
  and the required user data (birthday and/or birth chart).
- **Cosmic profile gating**: life themes, archetypes, and profile insights use
  `cosmic_profile`.
- **Numbers vs meanings**:
  - `personal_day_number` and `personal_year_number` are free.
  - `personal_day_meaning` and `personal_year_meaning` require a paid plan.
- **Astral Guide daily limits** (from `PRICING_PLANS`):
  - Free: 3 messages/day
  - Lunary+: 50 messages/day
  - Lunary+ Pro / Annual: 300 messages/day
- **Astral Guide context limits** (from `lib/ai/plans.ts`):
  - Context history entries: Free 0, Lunary+ 4, Lunary+ Pro 8, Annual 8
  - Memory snippets: Free 0, Lunary+ 2, Lunary+ Pro 4, Annual 4
- **Chat history**:
  - One active thread per user
  - History capped at last 50 messages
  - Threads inactive for 90+ days are cleaned up by cron
- **Save chat messages**: requires `collections` (paid) to save messages into
  Collections; no enforced cap for paid plans.
- **Collections**: saving to collections requires a paid plan (`collections`).
  Paid plans have no collection cap enforced.
- **Collection folders**: no enforced folder cap; folders are available with
  Collections (paid).
- **Journaling**: Book of Shadows reflections are available to authenticated
  users via `/api/journal`. Free plans are limited to 3 entries per month.
- **Tarot spreads**:
  - Spread access: free users only see spreads with `minimumPlan: 'free'`;
    monthly/yearly unlock all spreads.
  - Saved spreads per month: free 1, monthly plans 10, annual unlimited.
  - Saved spread history: free keeps the current month; paid keeps 365 days.
- **Trial length**: monthly 7 days, annual 14 days. Use Stripe-backed values
  in copy; avoid hardcoding in UI text.

---

## App Dashboard (`/app`) Components

| Component              | Free                              | Paid                                   |
| ---------------------- | --------------------------------- | -------------------------------------- |
| **Moon Preview**       | `moon_phases`                     | Same                                   |
| **Sky Now**            | Universal (no feature key)        | Same                                   |
| **Daily Insight Card** | `general_horoscope`               | `personalized_horoscope`               |
| **Daily Card Preview** | `general_tarot`                   | `personal_tarot`                       |
| **Transit of the Day** | General transits                  | `personalized_transit_readings`        |
| **Crystal Preview**    | `general_crystal_recommendations` | `personalized_crystal_recommendations` |
| **Wheel of the Year**  | Seasonal (no feature key)         | Same                                   |

---

## Cosmic Context Integration

### Moon Phase Display

Available to all users via `moon_phases` feature:

- **Horoscope page** (`/horoscope`):
  - Current moon phase with branded SVG icon
  - Moon phase keywords (3 per phase)
  - Personalized house placement when birth chart available\*
  - House-specific interpretations (12 unique messages)
  - Full moon phase description

- **Tarot page** (`/tarot`):
  - Current moon phase with branded icon
  - Moon phase keywords
  - Available to all users

\*Requires birth chart with birth time for house placement calculation (Whole Sign House system)

### Tarot Pattern Cosmic Context

Available to Lunary+ and Pro users via `pattern_drill_down` feature:

- **Frequent Cards Drill-Down**:
  - Date when each card was pulled
  - Moon phase at time of reading (with branded icon)
  - Active planetary aspects (top 3 daily transits)
  - Card meaning with keywords (first appearance only)
  - Personalized transit analysis (requires birth chart)\*
  - Frequency timeline visualization
  - Up to 10 appearances shown per card

- **Cosmic Context Format**:
  - First appearance: Full context + card meaning + transit analysis
  - Remaining appearances: Date + moon phase + aspects only
  - All data persisted from reading creation time

\*AI transit insights require birth chart data; gracefully hidden if unavailable

**Note**: The cosmic context integration described above is separate from the `cosmic_patterns` and `advanced_cosmic_patterns` features, which provide automated pattern detection for tarot and journal entries. See `COSMIC_PATTERNS_IMPLEMENTATION.md` for details on that system.

---

## Feature Access Matrix

| Feature key                            | Free | Lunary+ | Lunary+ Pro | Pro Annual |
| -------------------------------------- | ---- | ------- | ----------- | ---------- |
| `moon_phases`                          | ✅   | ✅      | ✅          | ✅         |
| `general_horoscope`                    | ✅   | ✅      | ✅          | ✅         |
| `general_tarot`                        | ✅   | ✅      | ✅          | ✅         |
| `general_crystal_recommendations`      | ✅   | ✅      | ✅          | ✅         |
| `grimoire`                             | ✅   | ✅      | ✅          | ✅         |
| `lunar_calendar`                       | ✅   | ✅      | ✅          | ✅         |
| `weekly_ai_ritual`                     | ✅   | ✅      | ✅          | ✅         |
| `birthday_collection`                  | ✅   | ✅      | ✅          | ✅         |
| `birth_chart`                          | ✅   | ✅      | ✅          | ✅         |
| `personal_day_number`                  | ✅   | ✅      | ✅          | ✅         |
| `personal_year_number`                 | ✅   | ✅      | ✅          | ✅         |
| `personalized_horoscope`               | ❌   | ✅      | ✅          | ✅         |
| `personal_tarot`                       | ❌   | ✅      | ✅          | ✅         |
| `personalized_crystal_recommendations` | ❌   | ✅      | ✅          | ✅         |
| `personalized_transit_readings`        | ❌   | ✅      | ✅          | ✅         |
| `transit_calendar`                     | ❌   | ✅      | ✅          | ✅         |
| `tarot_patterns`                       | ❌   | ✅      | ✅          | ✅         |
| `solar_return`                         | ❌   | ✅      | ✅          | ✅         |
| `cosmic_profile`                       | ❌   | ✅      | ✅          | ✅         |
| `moon_circles`                         | ❌   | ✅      | ✅          | ✅         |
| `ritual_generator`                     | ❌   | ✅      | ✅          | ✅         |
| `collections`                          | ❌   | ✅      | ✅          | ✅         |
| `monthly_insights`                     | ❌   | ✅      | ✅          | ✅         |
| `personal_day_meaning`                 | ❌   | ✅      | ✅          | ✅         |
| `personal_year_meaning`                | ❌   | ✅      | ✅          | ✅         |
| `unlimited_ai_chat`                    | ❌   | ❌      | ✅          | ✅         |
| `deeper_readings`                      | ❌   | ❌      | ✅          | ✅         |
| `weekly_reports`                       | ❌   | ❌      | ✅          | ✅         |
| `saved_chat_threads`                   | ❌   | ❌      | ✅          | ✅         |
| `downloadable_reports`                 | ❌   | ❌      | ✅          | ✅         |
| `ai_ritual_generation`                 | ❌   | ❌      | ✅          | ✅         |
| `advanced_patterns`                    | ❌   | ❌      | ✅          | ✅         |
| `pattern_drill_down`                   | ❌   | ✅      | ✅          | ✅         |
| `unlimited_tarot_spreads`              | ❌   | ❌      | ❌          | ✅         |
| `yearly_forecast`                      | ❌   | ❌      | ❌          | ✅         |
| `data_export`                          | ❌   | ❌      | ❌          | ✅         |
