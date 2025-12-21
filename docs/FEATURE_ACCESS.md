# Feature Access Guide

This document outlines what features are available to users based on their authentication and subscription status.

## Access Levels

### 1. **Unauthenticated Users** (No Account)

- Can view general/universal content only
- No personalized features
- All content is based on universal cosmic energies

### 2. **Free Account** (Authenticated, No Subscription)

- Requires: Account signup only
- Access to: All free features listed below
- **Note**: Birth chart is FREE but requires account + birthday data

### 3. **Lunary+ Subscription** (Paid)

- Requires: Active subscription or trial
- Access to: All free features + Lunary+ features

### 4. **Lunary+ AI Subscription** (Paid)

- Requires: Active subscription or trial
- Access to: All Lunary+ features + AI features

### 5. **Lunary+ AI Annual Subscription** (Paid)

- Requires: Active annual subscription or trial
- Access to: All Lunary+ AI features + Advanced features

---

## FREE Features (Just Need Account Signup)

These features are available to **all authenticated users** (free accounts):

### Core Features

- ✅ **Birth Chart** - View your personal birth chart (requires birthday)
- ✅ **Moon Phases** - Daily moon phase information and guidance
- ✅ **General Horoscope** - Universal horoscope based on sun signs
- ✅ **General Tarot** - Daily and weekly tarot cards (not personalized)
- ✅ **General Crystal Recommendations** - Universal crystal guidance
- ✅ **Grimoire** - Access to the complete grimoire knowledge base
- ✅ **Lunar Calendar** - Moon phase calendar
- ✅ **Weekly AI Ritual** - 1 free AI ritual/reading per week
- ✅ **Birthday Collection** - Birthday-related features

### App Dashboard Components (Free)

- ✅ **Moon Preview** - Current moon phase, illumination, next phase countdown
- ✅ **Sky Now** - Current planetary positions (universal)
- ✅ **Daily Insight Card** - General daily horoscope (universal)
- ✅ **Daily Card Preview** - General tarot card (universal)
- ✅ **Transit of the Day** - General upcoming transits (universal)
- ✅ **Crystal Preview** - General crystal recommendation (universal)
- ✅ **Wheel of the Year** - Seasonal sabbats (when within 7 days)

### Tarot Page (Free)

- ✅ **General Tarot Reading** - Daily and weekly cards (universal)
- ✅ **General Guidance** - Daily message, weekly energy, key guidance
- ✅ **Cosmic Calendar** - Upcoming transits affecting everyone
- ✅ **Today's Transits** - Planetary events happening today (universal)

---

## PAID Features (Require Subscription)

These features require an **active subscription** (Lunary+, Lunary+ AI, or Lunary+ AI Annual):

### Lunary+ Features

- 🔒 **Personalized Horoscope** - Based on your exact birth chart
- 🔒 **Personal Tarot** - Cards chosen specifically for you
- 🔒 **Personalized Crystal Recommendations** - Based on your birth chart and current transits
- 🔒 **Transit Calendar** - Personal transit impacts on your chart
- 🔒 **Tarot Patterns** - Personal tarot pattern analysis (7-90 days)
- 🔒 **Solar Return Insights** - Birthday and personal year analysis
- 🔒 **Cosmic Profile** - Complete cosmic profile features
- 🔒 **Moon Circles** - New & Full Moon rituals
- 🔒 **Ritual Generator** - Personalized ritual generation
- 🔒 **Collections** - Save and organize insights
- 🔒 **Monthly Insights** - Monthly cosmic insights

### Lunary+ AI Features (Additional)

- 🔒 **Unlimited AI Chat** - Lunary Copilot with unlimited messages
- 🔒 **Deeper Readings** - Enhanced tarot interpretations
- 🔒 **Weekly Reports** - Personalized weekly cosmic reports
- 🔒 **Saved Chat Threads** - Save and revisit AI conversations
- 🔒 **Downloadable PDF Reports** - Export insights as PDFs
- 🔒 **AI Ritual Generation** - AI-powered ritual creation
- 🔒 **Unlimited Collections** - No limits on saved collections

### Lunary+ AI Annual Features (Additional)

- 🔒 **Advanced Patterns** - Year-over-year comparisons, multi-dimensional analysis
- 🔒 **Extended Timeline Insights** - 6-month and 12-month pattern analysis
- 🔒 **Yearly Forecast** - Annual cosmic forecast
- 🔒 **Data Export** - Export your data
- 🔒 **Unlimited Tarot Spreads** - No limits on tarot spread readings

---

## Component Access Logic

### App Dashboard (`/app`)

| Component              | Free Account                     | Paid Subscription                          |
| ---------------------- | -------------------------------- | ------------------------------------------ |
| **Moon Preview**       | ✅ Universal moon phases         | ✅ Universal moon phases                   |
| **Sky Now**            | ✅ Universal planetary positions | ✅ Universal planetary positions           |
| **Daily Insight Card** | ✅ General horoscope             | ✅ Personalized horoscope (if has chart)   |
| **Daily Card Preview** | ✅ General tarot card            | ✅ Personalized tarot card (if has chart)  |
| **Transit of the Day** | ✅ General upcoming transits     | ✅ Personal transit impacts (if has chart) |
| **Crystal Preview**    | ✅ General crystal               | ✅ Personalized crystal (if has chart)     |
| **Wheel of the Year**  | ✅ Shows during sabbats          | ✅ Shows during sabbats                    |

### Tarot Page (`/tarot`)

| Feature                  | Free Account        | Paid Subscription                       |
| ------------------------ | ------------------- | --------------------------------------- |
| **Daily/Weekly Cards**   | ✅ General cards    | ✅ Personalized cards (if has chart)    |
| **Guidance Messages**    | ✅ General guidance | ✅ Personalized guidance (if has chart) |
| **Tarot Patterns**       | ❌ Paywall          | ✅ 7-90 day patterns                    |
| **Advanced Patterns**    | ❌ Paywall          | ✅ 180-365 days (Annual only)           |
| **Guided Tarot Spreads** | ❌ Paywall          | ✅ All spreads                          |
| **Card History**         | ❌ Paywall          | ✅ 7+ days history                      |
| **Seasonal Readings**    | ❌ Paywall          | ✅ Available                            |
| **Ritual for Patterns**  | ❌ Paywall          | ✅ Available                            |
| **Reflection Prompts**   | ❌ Paywall          | ✅ Available                            |

### Horoscope Page (`/horoscope`)

| Feature                     | Free Account                   | Paid Subscription                          |
| --------------------------- | ------------------------------ | ------------------------------------------ |
| **Daily Horoscope**         | ✅ General horoscope           | ✅ Personalized horoscope (if has chart)   |
| **Today's Transits**        | ✅ Universal transits          | ✅ Personal transit impacts (if has chart) |
| **Cosmic Calendar**         | ✅ Universal upcoming transits | ✅ Universal upcoming transits             |
| **Personal Insight**        | ❌ Paywall                     | ✅ Available (if has chart)                |
| **Solar Return Insights**   | ❌ Paywall                     | ✅ Available (if has chart)                |
| **Transit Wisdom**          | ❌ Paywall                     | ✅ Available (if has chart)                |
| **Today's Aspects**         | ❌ Paywall                     | ✅ Available (if has chart)                |
| **Personal Transit Impact** | ❌ Paywall                     | ✅ Available (if has chart)                |

---

## Key Access Patterns

### Birth Chart Access

- **Free**: Birth chart viewing is FREE but requires:
  - ✅ Account signup
  - ✅ Birthday data
- **Paid**: Birth chart is included in all paid plans

### Personalization Requirements

For personalized features to work, users need:

1. ✅ Account (authentication)
2. ✅ Subscription (paid plan)
3. ✅ Birthday data
4. ✅ Birth chart calculated

### Messaging Strategy

#### For Free Features (Just Need Account)

- **Unauthenticated**: "Sign up for free" → `/auth?signup=true`
- **Authenticated**: Feature available (may need to add birthday)

#### For Paid Features (Need Subscription)

- **Unauthenticated**: "Sign up for free" → `/auth?signup=true` (leads to trial)
- **Authenticated, No Subscription**: "Start Free Trial" or "Upgrade to unlock" → `/pricing`
- **Authenticated, Has Subscription**: Feature available

---

## Component-Specific Access Checks

### `DailyCardPreview`

- **Free**: Shows general tarot card
- **Paid**: Shows personalized card if `canAccessPersonalized` (auth + chart access + name + birthday)
- **Badge**: Shows "Personal" badge when personalized
- **Unlock Link**: Shows when not personalized

### `DailyInsightCard`

- **Free**: Shows general horoscope
- **Paid**: Shows personalized horoscope if `canAccessPersonalized` (auth + chart access + birthday + chart)
- **Unlock Link**: Shows when not personalized

### `CrystalPreview`

- **Free**: Shows general crystal recommendation
- **Paid**: Shows personalized crystal if `canAccessPersonalized` (auth + chart access + chart + birthday)
- **Badge**: Shows "For you" badge when personalized
- **Unlock Link**: Shows when not personalized

### `TransitOfTheDay`

- **Free**: Shows general upcoming transit
- **Paid**: Shows personal transit impact if authenticated + has chart access + has chart
- **Unlock Link**: Shows when not personalized

### `MoonPreview`

- **Free**: Always available (universal)
- **Paid**: Same (universal)

### `SkyNowCard`

- **Free**: Always available (universal)
- **Paid**: Same (universal)

---

## Important Notes

1. **Birth Chart is FREE** - Users can view their birth chart with just an account, but they need to add their birthday first.

2. **Personalization Requires Subscription** - While birth chart viewing is free, personalized readings (horoscope, tarot, crystals) require a paid subscription.

3. **Data Requirements** - Personalized features need:
   - Account authentication
   - Birthday (for birth chart calculation)
   - Active subscription (for personalized content)

4. **Trial Access** - Users on a free trial have access to all paid features during the trial period.

5. **Messaging Consistency** - All "unlock" messaging should:
   - Link to signup if not authenticated
   - Link to pricing if authenticated but not subscribed
   - Show appropriate feature badges when personalized

---

## Feature Access Matrix

| Feature                       | Unauthenticated | Free Account | Lunary+ | Lunary+ AI | Lunary+ AI Annual |
| ----------------------------- | --------------- | ------------ | ------- | ---------- | ----------------- |
| Moon Phases                   | ✅              | ✅           | ✅      | ✅         | ✅                |
| General Horoscope             | ✅              | ✅           | ✅      | ✅         | ✅                |
| General Tarot                 | ✅              | ✅           | ✅      | ✅         | ✅                |
| General Crystals              | ✅              | ✅           | ✅      | ✅         | ✅                |
| Grimoire                      | ✅              | ✅           | ✅      | ✅         | ✅                |
| Birth Chart View              | ❌              | ✅           | ✅      | ✅         | ✅                |
| Personalized Horoscope        | ❌              | ❌           | ✅      | ✅         | ✅                |
| Personal Tarot                | ❌              | ❌           | ✅      | ✅         | ✅                |
| Personalized Crystals         | ❌              | ❌           | ✅      | ✅         | ✅                |
| Tarot Patterns (7-90 days)    | ❌              | ❌           | ✅      | ✅         | ✅                |
| Tarot Patterns (180-365 days) | ❌              | ❌           | ❌      | ❌         | ✅                |
| Advanced Patterns             | ❌              | ❌           | ❌      | ❌         | ✅                |
| Moon Circles                  | ❌              | ❌           | ✅      | ✅         | ✅                |
| Ritual Generator              | ❌              | ❌           | ✅      | ✅         | ✅                |
| Unlimited AI Chat             | ❌              | ❌           | ❌      | ✅         | ✅                |
| Weekly Reports                | ❌              | ❌           | ❌      | ✅         | ✅                |
| Downloadable PDFs             | ❌              | ❌           | ❌      | ✅         | ✅                |

---

## Current Implementation Status

### ✅ Correctly Implemented

- Birth chart access logic (free but requires account)
- Personalized vs general content switching
- Proper authentication barriers
- Messaging for unlock links

### ⚠️ Areas to Review

- Ensure all components use consistent access checks
- Verify "For you" / "Personal" badges only show when truly personalized
- Confirm unlock messaging routes correctly (signup vs pricing)
