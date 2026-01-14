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
- **Solar Return Insights** (`solar_return`)
- **Cosmic Profile** (`cosmic_profile`) - life themes, archetypes, profile insights
- **Moon Circles** (`moon_circles`)
- **Ritual Generator** (`ritual_generator`)
- **Collections** (`collections`)
- **Monthly Insights** (`monthly_insights`)
- **Personal Day meaning** (`personal_day_meaning`)
- **Personal Year meaning** (`personal_year_meaning`)

### Lunary+ AI (additional)

- **Astral Guide chat access** (`unlimited_ai_chat`)
- **Deeper Readings** (`deeper_readings`)
- **Weekly Reports** (`weekly_reports`)
- **Saved Chat Threads** (`saved_chat_threads`)
- **Downloadable Reports** (`downloadable_reports`)
- **AI Ritual Generation** (`ai_ritual_generation`)
- **Advanced Patterns** (`advanced_patterns`)

### Lunary+ AI Annual (additional)

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
  - Lunary+ AI / Annual: 300 messages/day
- **Astral Guide context limits** (from `lib/ai/plans.ts`):
  - Context history entries: Free 0, Lunary+ 4, Lunary+ AI 8, Annual 8
  - Memory snippets: Free 0, Lunary+ 2, Lunary+ AI 4, Annual 4
- **Saved chat threads**:
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

## Feature Access Matrix

| Feature key                            | Free | Lunary+ | Lunary+ AI | AI Annual |
| -------------------------------------- | ---- | ------- | ---------- | --------- |
| `moon_phases`                          | ✅   | ✅      | ✅         | ✅        |
| `general_horoscope`                    | ✅   | ✅      | ✅         | ✅        |
| `general_tarot`                        | ✅   | ✅      | ✅         | ✅        |
| `general_crystal_recommendations`      | ✅   | ✅      | ✅         | ✅        |
| `grimoire`                             | ✅   | ✅      | ✅         | ✅        |
| `lunar_calendar`                       | ✅   | ✅      | ✅         | ✅        |
| `weekly_ai_ritual`                     | ✅   | ✅      | ✅         | ✅        |
| `birthday_collection`                  | ✅   | ✅      | ✅         | ✅        |
| `birth_chart`                          | ✅   | ✅      | ✅         | ✅        |
| `personal_day_number`                  | ✅   | ✅      | ✅         | ✅        |
| `personal_year_number`                 | ✅   | ✅      | ✅         | ✅        |
| `personalized_horoscope`               | ❌   | ✅      | ✅         | ✅        |
| `personal_tarot`                       | ❌   | ✅      | ✅         | ✅        |
| `personalized_crystal_recommendations` | ❌   | ✅      | ✅         | ✅        |
| `personalized_transit_readings`        | ❌   | ✅      | ✅         | ✅        |
| `transit_calendar`                     | ❌   | ✅      | ✅         | ✅        |
| `tarot_patterns`                       | ❌   | ✅      | ✅         | ✅        |
| `solar_return`                         | ❌   | ✅      | ✅         | ✅        |
| `cosmic_profile`                       | ❌   | ✅      | ✅         | ✅        |
| `moon_circles`                         | ❌   | ✅      | ✅         | ✅        |
| `ritual_generator`                     | ❌   | ✅      | ✅         | ✅        |
| `collections`                          | ❌   | ✅      | ✅         | ✅        |
| `monthly_insights`                     | ❌   | ✅      | ✅         | ✅        |
| `personal_day_meaning`                 | ❌   | ✅      | ✅         | ✅        |
| `personal_year_meaning`                | ❌   | ✅      | ✅         | ✅        |
| `unlimited_ai_chat`                    | ❌   | ❌      | ✅         | ✅        |
| `deeper_readings`                      | ❌   | ❌      | ✅         | ✅        |
| `weekly_reports`                       | ❌   | ❌      | ✅         | ✅        |
| `saved_chat_threads`                   | ❌   | ❌      | ✅         | ✅        |
| `downloadable_reports`                 | ❌   | ❌      | ✅         | ✅        |
| `ai_ritual_generation`                 | ❌   | ❌      | ✅         | ✅        |
| `advanced_patterns`                    | ❌   | ❌      | ✅         | ✅        |
| `unlimited_tarot_spreads`              | ❌   | ❌      | ❌         | ✅        |
| `yearly_forecast`                      | ❌   | ❌      | ❌         | ✅        |
| `data_export`                          | ❌   | ❌      | ❌         | ✅        |
