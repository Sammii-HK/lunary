# Lunary Feature Roadmap

> Comprehensive plan for making Lunary a top-tier astrology app that people use religiously.

**Last updated**: 2026-02-11
**Status**: Phase 1 Complete, Phase 2 Implemented (pending smoke tests + deploy)

---

## Table of Contents

1. [Share Image Improvements](#1-share-image-improvements)
2. [Daily Engagement Loop](#2-daily-engagement-loop)
3. [Community Expansion](#3-community-expansion)
4. [Social & Friend Features](#4-social--friend-features)
5. [Personal Growth & Retention](#5-personal-growth--retention)
6. [Content & Discovery](#6-content--discovery)
7. [Virality & Growth Hooks](#7-virality--growth-hooks)
8. [Yearly Wrapped](#8-yearly-wrapped-december)
9. [Physical Products](#9-physical-products)
10. [Audio Content](#10-audio-content)
11. [Priority Matrix](#11-priority-matrix)

---

## 1. Share Image Improvements

### 1.1 Synastry Share Card Redesign

**Status**: DONE (Phase 1)
**Effort**: Medium (3-5 days)
**Impact**: HIGH - compatibility sharing is the #1 viral astrology content
**Current file**: `src/app/api/og/share/synastry/route.tsx`

#### What Was Implemented

- Story: vertically stacked layout (Person A -> Score circle -> Person B)
- Square/landscape: side-by-side profiles with score circle in center
- Archetype headline from element pair table (`src/utils/astrology/synastry-archetype.ts`)
- Big Three per person with Astronomicon font glyphs
- Top 3 aspects with colored glyphs (harmonious=cometTrail, challenging=galaxyHaze)
- Element balance horizontal bar with gradient accent from dominant element
- Extended `ShareSynastry` props with `BigThree`, `TopAspect`, element balance, archetype
- Extended `/api/share/synastry/route.ts` payload to store richer data in KV

#### Files Changed

- `src/app/api/og/share/synastry/route.tsx` — Complete layout redesign
- `src/app/api/share/synastry/route.ts` — Extended payload types
- `src/components/share/ShareSynastry.tsx` — Extended props
- `src/utils/astrology/synastry-archetype.ts` — New: deterministic archetype lookup
- `src/app/(authenticated)/profile/friends/[id]/page.tsx` — Passes new data to share component

---

### 1.2 Birth Chart Share Card Polish

**Status**: DONE (Phase 1)
**Effort**: Low-Medium (2-3 days)
**Impact**: Medium - better conversion from shares
**Current file**: `src/app/api/og/share/birth-chart/route.tsx`

#### What Was Implemented

- Removed data clutter: element counts grid, modality line, retrograde/house/sign focus stats removed
- Increased chart wheel sizes: landscape 360->420, story 600->700, square 480->560
- Increased name font sizes: landscape 36->40, story 72->80, square 56->62
- Replaced subtitle: "Cosmic preview" -> computed archetype string "A {dominantModality} {dominantElement} Chart"
- Added element-specific decorative gradient overlays (Fire=amber, Earth=green, Air=blue, Water=indigo)
- Added `lunary.app/chart` watermark at bottom-left with 0.3 opacity
- Clean card: name (hero), archetype subtitle, chart wheel (prominent), Big Three + glyphs, element/modality badges, one insight line, watermark

---

### 1.3 New Shareable Card Types

**Effort**: Medium (1-2 days each)
**Impact**: HIGH cumulative - more share surfaces = more viral loops

#### Daily Cosmic Score Card — DONE (Phase 1)

- Score number with color-coded glow circle + 8-segment energy arc
- Headline card with dominant energy badge
- Sun sign glyph via Astronomicon font
- Story/square: centered vertical layout. Landscape: horizontal with info column
- Score color coding: 80+ green, 60+ accent, 40+ primary, <40 rose
- KV-backed share API with 24h TTL (`src/app/api/share/cosmic-score/route.ts`)
- Supports native share, download, clipboard, social URLs (X, Threads)
- **Files**: `src/components/share/ShareCosmicScore.tsx`, `src/app/api/og/share/cosmic-score/route.tsx`, `src/app/api/share/cosmic-score/route.ts`

#### Tarot Pull Card

- Beautiful card art (from existing tarot assets)
- Card name + one-line interpretation
- "Pulled on [date] during [moon phase]"
- Optional: reversed indicator
- **Files**: `src/components/share/ShareTarotPull.tsx`, `src/app/api/og/share/tarot-pull/route.tsx`

#### Streak Milestone Card

- "30 Days of Cosmic Alignment" with flame/star visual
- Total stats: readings done, entries written, rituals completed
- Skill tree level badges earned
- Celebratory design with confetti/sparkle elements
- **Files**: `src/components/share/ShareStreakMilestone.tsx`, `src/app/api/og/share/streak/route.tsx`

#### Compatibility Invite Card

- One-sided birth chart data + "Check our compatibility"
- QR code or short link to enter their birth data
- Works as a growth hack: recipient must sign up to see results
- **Files**: `src/components/share/ShareCompatibilityInvite.tsx`, `src/app/api/og/share/compat-invite/route.tsx`

#### Transit Alert Card

- "Mercury enters your 7th house today"
- Planet glyph + house illustration
- Personal interpretation snippet
- Designed for Stories format
- **Files**: `src/components/share/ShareTransitAlert.tsx`, `src/app/api/og/share/transit/route.tsx`

---

## 2. Daily Engagement Loop

### 2.1 Daily Cosmic Score

**Status**: DONE (Phase 1)
**Effort**: Medium (4-5 days)
**Impact**: CRITICAL - this becomes the reason people open the app every morning
**Tier**: Free (basic), Pro (detailed breakdown)

#### What Was Implemented

- **Scoring algorithm** (`src/utils/cosmic-score.ts`): Deterministic for same date + birth chart. Base score 50, adjusted by transit harmony, moon phase affinity, retrograde penalties, date-seeded variety. Returns `{ overall: 1-100, categories, bestWindowDescription, dominantEnergy, headline }`.
- **API** (`src/app/api/cosmic-score/route.ts`): Authenticated GET. Caches in `daily_horoscopes` JSON column. Free: `{ overall, headline, dominantEnergy }`. Paid (`cosmic_score_detailed`): full categories + bestWindowDescription.
- **Dashboard widget** (`src/components/CosmicScore.tsx`): Animated CSS conic-gradient circular score meter with brand color wheel (blue->green->gold->rose->pink->purple). 1.2s counter animation. Collapsible category bars dropdown. Per-category colored tags. Share button.
- **Entitlement**: `cosmic_score_detailed` added to `lunary_plus`, `lunary_plus_ai`, `lunary_plus_ai_annual` tiers.
- **Unit tests**: 10 tests in `__tests__/unit/utils/cosmic-score.test.ts` — all passing.

#### Free vs Pro (as implemented)

| Feature             | Free             | Pro              |
| ------------------- | ---------------- | ---------------- |
| Overall score       | Yes              | Yes              |
| Energy breakdown    | Top 2 categories | All 5 categories |
| Best windows        | No               | Yes              |
| Dominant energy tag | Yes              | Yes              |
| Shareable card      | Yes              | Yes              |

#### Still TODO

- **Historical Tracking**: "Last time you had this energy..." — not yet implemented
- **Personalized tips**: Transit-specific guidance beyond the headline
- **Push notification**: "Your cosmic score today: 87" — not yet wired into daily cron

---

### 2.2 Morning & Evening Rituals

**Effort**: Medium (3-4 days)
**Impact**: HIGH - creates two daily touchpoints
**Tier**: Free (basic), Pro (full ritual)

#### Morning Ritual (60 seconds)

1. Today's cosmic score with one-line energy summary
2. Single card pull with brief interpretation
3. Set one intention for the day (stored, linked to transits)
4. Optional: crystal/color of the day recommendation

#### Evening Ritual (60 seconds)

1. Mood check-in (tap an emotion, auto-linked to moon phase)
2. One-line gratitude prompt
3. Review morning intention - did it manifest?
4. Dream intention setting (feeds into dream journal)

#### Why This Works

- Both rituals feed data into pattern detection (mood, intentions, dreams)
- The data they input becomes the insights they receive (self-reinforcing loop)
- Creates bookend habits - open the app first thing, close it last thing
- Low friction (60 seconds each, not a chore)

#### Technical Requirements

- Component: `src/components/rituals/MorningRitual.tsx`
- Component: `src/components/rituals/EveningRitual.tsx`
- API: `src/app/api/rituals/daily/route.ts` - store daily ritual data
- DB: New `daily_rituals` table (date, userId, morningIntention, eveningMood, gratitude, dreamIntention)
- Integration: Link ritual data to existing `journal_patterns` detection
- Notifications: Morning push at user's preferred time, evening reminder

---

### 2.3 Retrograde Survival Mode

**Effort**: Medium (3-4 days)
**Impact**: HIGH - seasonal engagement spike, highly shareable
**Tier**: Free (basic), Pro (full toolkit)

#### Concept

When Mercury (or any planet) goes retrograde, the app activates a special visual mode with retrograde-specific content and tools.

#### Features

- **Visual Mode Change**: Subtle UI shift - navigation accent color changes, "Retrograde Active" badge
- **Countdown Timer**: Days remaining in retrograde, with station dates
- **Daily Retrograde Guidance**: Specific dos/don'ts based on which planet + which house it transits in user's chart
- **Retrograde Journal Prompts**: "What from your past is resurfacing?" "Where do you need to slow down?"
- **Practical Reminders**: "Back up your phone", "Re-read emails before sending", "Don't sign contracts"
- **Community Feed**: "Retrograde stories" - anonymous sharing of retrograde chaos
- **Post-Retrograde Reflection**: Summary of what happened during retrograde, linked to journal entries
- **Shareable Badge**: "Surviving Mercury Retrograde" card

#### Technical Requirements

- Utility: `src/utils/retrograde-mode.ts` - detect active retrogrades, calculate days remaining
- Component: `src/components/RetrogradeBanner.tsx` - persistent banner during retrograde periods
- Component: `src/components/RetrogradeToolkit.tsx` - daily guidance + prompts
- API: `src/app/api/retrograde/status/route.ts` - current retrograde data
- Extend existing retrograde tracking data

---

## 3. Community Expansion

### 3.1 Transit Support Groups

**Effort**: Medium (5-7 days)
**Impact**: HIGH - deep retention for key demographics
**Reference**: `docs/REMAINING_TODOS.md` lines 175-180

#### Saturn Return Circles (Priority)

- **Target**: Users aged 27-30 (first Saturn return) and 56-60 (second)
- **Auto-join**: Detect when user's progressed Saturn is within orb of natal Saturn
- **Content**: Weekly themes around Saturn return lessons (responsibility, maturity, structure)
- **Shared experiences**: Anonymous posting about Saturn return challenges
- **Duration**: Active for the ~2.5 year transit window
- **Special content**: Saturn return survival guide, milestone celebrations

#### Pluto Transit Support

- **Target**: Users experiencing Pluto square natal Pluto (~age 36-40) or Pluto opposite natal Pluto (~age 82-88)
- **Content**: Deep transformation themes, shadow work prompts
- **Smaller audience but deeply committed members**

#### Mercury Retrograde Check-in (Seasonal)

- **Auto-activates**: When Mercury stations retrograde (~3 times/year)
- **Duration**: Active for the ~3 week retrograde period + 1 week shadow
- **Content**: Daily check-ins, retrograde stories, practical tips
- **Ties into**: Retrograde Survival Mode (section 2.3)

#### Jupiter Return Circles

- **Target**: Users experiencing Jupiter return (~every 12 years)
- **Content**: Expansion, growth, luck themes
- **Duration**: Active for ~1 year transit window
- **Positive energy**: Celebration-focused rather than survival-focused

#### Technical Requirements

- New DB table: `community_groups`
  ```
  id, type (transit|sign|local|seasonal), name, description,
  transit_type, auto_join_criteria (JSON), active_from, active_until,
  member_count, created_at
  ```
- New DB table: `community_group_members`
  ```
  id, group_id, user_id, joined_at, role (member|moderator)
  ```
- New DB table: `community_posts`
  ```
  id, group_id, user_id, content, anonymous (boolean),
  upvote_count, created_at
  ```
- Auto-assignment logic: Cron job or on-login check comparing user transits to group criteria
- API: `src/app/api/community/groups/route.ts`
- API: `src/app/api/community/posts/route.ts`
- Page: `src/app/(authenticated)/community/page.tsx`
- Components: `src/components/community/`

---

### 3.2 Sign-Based Spaces

**Effort**: Low (2-3 days)
**Impact**: HIGH relative to effort - people love sign-identity content

#### Concept

Permanent community spaces based on rising sign (most personal identity marker).

#### Spaces

- 12 rising sign lounges: "Aries Rising Lounge", "Taurus Rising Lounge", etc.
- Auto-assigned based on user's birth chart data
- Each space has its own feed, shared experiences, tips

#### Content

- Sign-specific survival guides
- "Only [Sign] Risings will understand..." shared experiences
- Seasonal content: "How [current transit] hits [Sign] Risings differently"
- Members can post anonymously or with display name

#### Technical Requirements

- Extend `community_groups` table with `type: 'sign'`
- Pre-seed 12 groups on deployment
- Auto-assign users based on `user_profiles.birth_chart` rising sign
- Simple feed component reusing community post infrastructure

---

### 3.3 Anonymous Q&A / Ask the Circle

**Effort**: Medium (4-5 days)
**Impact**: HIGH - turns passive users into active community members

#### Concept

Post a question to the community, get upvoted answers. AI seeds initial responses to prevent empty-room syndrome.

#### Features

- Post questions anonymously or with display name
- Tag questions by topic: transits, relationships, tarot, career, general
- Community upvotes on answers
- AI-generated seed response for every question (ensures no question goes unanswered)
- "Best Answer" marking by original poster
- Weekly "Top Questions" digest

#### Free vs Pro

| Feature          | Free      | Pro                         |
| ---------------- | --------- | --------------------------- |
| Ask questions    | 2/week    | Unlimited                   |
| Answer questions | Unlimited | Unlimited                   |
| AI seed answers  | Basic     | Detailed with chart context |
| See trending     | Yes       | Yes + personalized feed     |

#### Technical Requirements

- Extend `community_posts` with `type: 'question'|'answer'`
- New DB table: `community_votes` (post_id, user_id, vote)
- API: `src/app/api/community/questions/route.ts`
- AI integration: Generate initial answer using existing AI chat infrastructure
- Moderation: Basic content filtering, report button, admin review queue

---

### 3.4 Collaborative Interpretations

**Effort**: Medium (4-5 days)
**Impact**: Medium-High - bridges solo and social use
**Tier**: Free (view), Pro (share readings for interpretation)

#### Concept

Share a tarot reading or transit configuration and get community interpretations. "What would you make of this spread?"

#### Features

- Share a tarot spread (anonymized, no personal data exposed)
- Community members offer their interpretation
- Original poster can mark helpful interpretations
- Builds tarot literacy across the community
- Could extend to birth chart aspect interpretations

#### Technical Requirements

- Extend `community_posts` with `type: 'interpretation_request'`
- Tarot spread visualization component (reuse existing spread components)
- Privacy: Strip personal data, only share card positions and question theme
- Notifications: "Someone interpreted your spread" push notification

---

### 3.5 Local Circles

**Effort**: Medium (3-4 days)
**Impact**: Medium - needs critical mass per city, but massive long-term potential

#### Concept

City/region-based groups. "London Moon Circle", "NYC Cosmic Coven".

#### Features

- Location-based group discovery
- Real-world meetup coordination (especially around moon events)
- Local astrology event sharing
- City-specific cosmic weather (local moonrise/set times, visible planets)

#### Technical Requirements

- Extend `community_groups` with `type: 'local'`, `location` field
- Location collection during onboarding (optional, city-level only)
- Geo-search: Find groups near user's location
- Minimum member threshold before group becomes active (prevents ghost towns)
- Seed major cities first: London, NYC, LA, Sydney, Toronto

---

### 3.6 Group Circles / Covens (Private Groups)

**Effort**: Medium-High (5-7 days)
**Impact**: HIGH - social glue that makes leaving feel like losing community

#### Concept

Private groups of 3-8 people (friends, study groups, ritual partners). More intimate than public community spaces.

#### Features

- Create a private coven with invite link
- Shared group journal / intention board
- Group synastry overview: "Your coven's combined energy"
- Coordinate moon rituals together (set shared intentions)
- Group streak tracking ("the coven has journaled 14 days straight")
- Group tarot readings (each member pulls a card, combined interpretation)
- Group chat (lightweight, not trying to be Discord)

#### Free vs Pro

| Feature           | Free           | Pro         |
| ----------------- | -------------- | ----------- |
| Create covens     | 1              | Unlimited   |
| Members per coven | 4              | 8           |
| Group synastry    | Basic          | Full report |
| Shared journal    | 3 entries/week | Unlimited   |
| Group rituals     | No             | Yes         |

#### Technical Requirements

- New DB table: `covens` (id, name, created_by, invite_code, max_members, created_at)
- New DB table: `coven_members` (id, coven_id, user_id, role, joined_at)
- New DB table: `coven_posts` (id, coven_id, user_id, type, content, created_at)
- API: `src/app/api/covens/route.ts`
- Page: `src/app/(authenticated)/covens/page.tsx`
- Components: `src/components/covens/`
- Group synastry: Extend existing synastry calculation for N people

---

## 4. Social & Friend Features

### 4.1 Cosmic Gifting

**Effort**: Low-Medium (3-4 days)
**Impact**: HIGH - emotional connection + notification-driven re-engagement

#### Concept

Send friends personalized cosmic gifts: a transit reading for their birthday, a tarot pull "thinking of you", a custom ritual for their current challenge.

#### Gift Types

1. **Birthday Transit Reading**: Auto-generated solar return highlights for their upcoming birthday
2. **Thinking of You Tarot Pull**: Pull a card on behalf of a friend with a personal message
3. **Custom Ritual**: Select a ritual from the grimoire, personalize it, send as a gift
4. **Crystal Recommendation**: "This crystal matches your current energy"
5. **Cosmic Encouragement**: Pre-written affirmations paired with their current transits

#### Technical Requirements

- New DB table: `cosmic_gifts` (id, sender_id, recipient_id, type, content JSON, message, opened_at, created_at)
- API: `src/app/api/gifts/route.ts` (send, receive, open)
- Component: `src/components/gifts/CosmicGift.tsx`
- Notification: Push + email when gift received
- Animation: Gift "unwrapping" experience when opened
- Free: 1 gift/week. Pro: unlimited

---

### 4.2 Friend Activity Feed Improvements

**Effort**: Low (2-3 days)
**Impact**: Medium - makes the Circle tab stickier

#### Current State

Friend activity feed exists in `src/components/friends/FriendActivityFeed.tsx`. Needs enrichment.

#### Proposed Improvements

- Show what friends are going through transit-wise ("Sam is experiencing Venus in their 7th house")
- Celebrate friend milestones more prominently (streak achievements, level-ups)
- "Your friend pulled The Tower today" with option to send encouragement
- Weekly friend digest: "This week in your circle"
- Compatibility tip of the day between you and a random friend

---

### 4.3 Cosmic Compatibility Matching (Discovery)

**Effort**: High (7-10 days)
**Impact**: HIGH but needs scale - a future feature when user base supports it
**Tier**: Pro only

#### Concept

Opt-in discovery feature where users can find people with complementary charts. Not dating - finding your cosmic tribe.

#### Features

- Opt-in toggle in profile settings
- Match by: complementary elements, shared transits, similar moon phases
- "Cosmic Neighbors" - people going through the same transit as you
- "Element Balance" - find people who complement your chart gaps
- Weekly 3 match suggestions
- Anonymous until both accept connection

#### Technical Requirements

- Matching algorithm: `src/utils/cosmic-matching.ts`
- Privacy: Opt-in only, anonymous previews, explicit consent to connect
- API: `src/app/api/discover/route.ts`
- Page: `src/app/(authenticated)/discover/page.tsx`
- Needs sufficient user base to work well - phase 2+ feature

---

## 5. Personal Growth & Retention

### 5.1 Manifestation Tracker

**Effort**: Medium (4-5 days)
**Impact**: CRITICAL for long-term retention - emotional investment in the app
**Tier**: Free (3 active), Pro (unlimited)

#### Concept

Set intentions tied to specific moon phases or transits, track them over time, connect journal entries to outcomes. Creates deep emotional investment.

#### Features

- **Set Intention**: Tied to a moon phase (New Moon = new beginnings) or transit
- **Track Progress**: Journal entries can be linked to active intentions
- **Manifestation Timeline**: Visual timeline from intention → signs → outcome
- **Moon Phase Correlation**: "Intentions set during Aries New Moon have 73% completion rate"
- **Reflection Prompts**: "It's been 2 weeks since your intention. What signs have you noticed?"
- **Celebration**: Mark intention as manifested with a celebratory moment
- **Patterns**: Over time, show which moon phases and transits are most powerful for the user

#### Technical Requirements

- New DB table: `intentions`
  ```
  id, user_id, text, moon_phase, transit_context, status (active|manifested|released),
  set_at, manifested_at, linked_journal_ids (array), tags
  ```
- API: `src/app/api/intentions/route.ts`
- Component: `src/components/manifestation/ManifestationTracker.tsx`
- Component: `src/components/manifestation/IntentionTimeline.tsx`
- Integration: Link from journal entry creation to active intentions
- Push notifications: "Your New Moon intention is 14 days old. How's it going?"

---

### 5.2 Weekly Cosmic Challenges

**Effort**: Low-Medium (3-4 days)
**Impact**: HIGH - recurring content that drives participation
**Tier**: Free

#### Concept

Each week, a themed challenge based on the dominant transit energy. Low-effort for us (auto-generated from transit data), high engagement.

#### Examples

- "Venus in Pisces week: Do one act of radical self-love each day"
- "Mars in Aries: Set one bold boundary this week"
- "Mercury in Gemini: Start 3 conversations with strangers"
- "Full Moon in Scorpio: Write a letter to someone you need to forgive (don't send it)"

#### Features

- Auto-generated based on dominant weekly transit
- Daily check-in: "Did you complete today's challenge?" (yes/no)
- Community participation counter ("4,327 people joined this week's challenge")
- Week-end reflection: How did the challenge align with the cosmic energy?
- Skill tree XP for completion
- Streak tracking for consecutive weekly challenges completed
- Shareable completion card

#### Technical Requirements

- Generation: `src/utils/weekly-challenge.ts` - generate from transit data
- API: `src/app/api/challenges/weekly/route.ts`
- DB: New `weekly_challenges` table + `challenge_completions` table
- Component: `src/components/challenges/WeeklyChallengeCard.tsx`
- Cron: Generate new challenge every Monday based on week's transits

---

### 5.3 Cosmic Milestones & Celebrations

**Effort**: Low (2-3 days)
**Impact**: Medium-High - delightful moments that build loyalty

#### Concept

Go beyond daily streaks. Celebrate astrological milestones and app milestones with special content and shareable moments.

#### Astrological Milestones

- **Solar Return** (birthday): Personalized year-ahead reading + shareable card
- **Lunar Return** (monthly): "Your monthly reset" with brief outlook
- **Saturn Return** (age 28-30): Special multi-month content journey + circle invite
- **Jupiter Return** (every 12 years): Expansion celebration + reflection
- **Progressed Moon sign change** (~every 2.5 years): "Your emotional landscape is shifting"

#### App Milestones

- "1 year on Lunary" with year-in-review mini card
- "100 tarot readings" with most-pulled card
- "50 journal entries" with word cloud
- "First time experiencing [transit type]" with educational context
- "Completed all 4 skill trees" ultimate achievement

#### Technical Requirements

- Milestone detection: `src/utils/milestones.ts`
- Cron: Daily check for approaching milestones per user
- Notification: Push + in-app celebration modal
- Shareable cards for each milestone type
- Extend `user_progress` or new `milestones_achieved` table

---

### 5.4 Predictive Forward-Looking Notifications

**Status**: DONE (Phase 1)
**Effort**: Medium (3-4 days)
**Impact**: HIGH - transforms notifications from reactive to anticipatory

#### What Was Implemented

Integrated into the existing `personal-transit-notification` cron as a second pass after chart activations. For paid users who didn't receive a chart activation notification, generates max 1 predictive notification per user per day.

**Notification flow:**

1. Cron fires `GET /api/cron/personal-transit-notification`
2. Fetches `getGlobalCosmicData(now)` + paid users with birth charts
3. **Pass 1 — Chart Activation**: Sun/Moon/Rising activations -> personalized copy via `getNotificationCopy()`
4. **Pass 2 — Predictive**: For non-notified users, calls `getPredictiveNotifications()` -> max 1 predictive notification
5. Deduplication via `notification_sent_events` using event keys like `predictive-retrograde_start-Mercury-3-2026-02-10`

**Three event types supported:**

- `retrograde_start` — "Mercury retrograde begins in [sign] — time to slow down and review"
- `retrograde_end` — "[Planet] stations direct in [sign] — momentum returns"
- `sign_ingress` — "[Planet] enters your sign — [sign-specific theme]"

**Personalization levels:**

- **High priority (personal)**: Planet entering user's Sun/Moon/Rising sign. Includes user name + "your sign/your chart" language.
- **Medium priority (general)**: Important events (Mercury retrograde always notable) without personal relevance.

**Sign-specific copy**: All 12 zodiac signs have unique `personal` and `general` theme strings in `predictive-copy.ts`.

**Preference mapping**: `predictive_transit` maps to existing `planetaryTransits` toggle — no new user preference needed.

#### Files

- `src/lib/notifications/predictive.ts` — Event detection + priority sorting
- `src/lib/notifications/predictive-copy.ts` — Copy templates for all event types + 12 sign themes
- `src/app/api/cron/personal-transit-notification/route.ts` — Added predictive pass
- `src/lib/notifications/unified-service.ts` — Added `predictive_transit: 'planetaryTransits'` mapping

#### Still TODO

- Configurable lookahead beyond 3/7 days (currently hardcoded)
- "Your luckiest day this month" type notifications (requires deeper transit scoring)
- User-facing preference toggle for predictive vs reactive notifications

---

### 5.5 Dream Dictionary + AI Dream Interpreter

**Effort**: Medium (4-5 days)
**Impact**: Medium-High - enriches existing dream journal significantly
**Tier**: Free (dictionary), Pro (AI interpretation)

#### Current State

Dream journal exists with tags and moon phase tracking. No interpretation layer.

#### Proposed Features

- **Dream Symbol Dictionary**: Searchable database of 500+ dream symbols with meanings
- **AI Dream Interpretation**: Analyze dream journal entries considering current transits, moon phase, and recurring symbols
- **Dream Pattern Detection**: "You dream about water most during Pisces moons"
- **Community Dream Themes**: "12% of users dreamed about flying last night during this Sagittarius moon"
- **Lucid Dreaming Prompts**: Evening ritual integration for dream intention setting

#### Technical Requirements

- Grimoire expansion: Add dream symbols to `grimoire_embeddings`
- AI: Extend AI chat context to include dream history when interpreting
- Analytics: Aggregate anonymized dream themes by moon phase
- Component: `src/components/dreams/DreamInterpreter.tsx`
- API: `src/app/api/dreams/interpret/route.ts`

---

## 6. Content & Discovery

### 6.1 Astro-Learning Paths

**Effort**: Medium-High (5-7 days)
**Impact**: HIGH - transforms grimoire from reference to journey
**Tier**: Free (beginner), Pro (intermediate+advanced)

#### Concept

Structured educational journeys instead of just a grimoire to browse. Gamified learning that feeds into the skill tree system.

#### Learning Paths

1. **"Read Your Birth Chart"** (7 days)
   - Day 1: What is a birth chart?
   - Day 2: Your Sun sign (identity)
   - Day 3: Your Moon sign (emotions)
   - Day 4: Your Rising sign (first impression)
   - Day 5: Your inner planets
   - Day 6: Your outer planets
   - Day 7: Putting it all together
   - Quiz at end, certificate, skill tree XP

2. **"Tarot Fundamentals"** (30 days)
   - Week 1: Major Arcana (7 cards/day study)
   - Week 2: Minor Arcana - Wands & Cups
   - Week 3: Minor Arcana - Swords & Pentacles
   - Week 4: Spreads, reversals, intuition
   - Daily card study with quiz
   - Practice readings with AI feedback

3. **"Understanding Transits"** (14 days)
   - How planets affect your chart
   - Personal vs generational transits
   - Reading your transit chart
   - Planning with planetary timing

4. **"Moon Magic"** (8 days - one per phase)
   - Each lesson aligned to a moon phase
   - Rituals, journaling, intention setting
   - Must complete during the actual phase (monthly cadence)

#### Technical Requirements

- New DB table: `learning_paths` (id, title, description, tier, total_lessons)
- New DB table: `learning_progress` (id, user_id, path_id, current_lesson, completed_at)
- New DB table: `learning_lessons` (id, path_id, order, title, content, quiz JSON)
- API: `src/app/api/learning/route.ts`
- Page: `src/app/(authenticated)/learn/page.tsx`
- Components: `src/components/learning/`
- Integration: Skill tree XP on lesson/path completion

---

### 6.2 "This Day in Cosmic History"

**Effort**: Low (1-2 days)
**Impact**: Medium - daily content variety, connects past to present

#### Concept

Show what was happening astrologically on significant dates, and connect to the user's personal history.

#### Features

- **Historical**: "On this day in 1969 (Moon landing), the Moon was in Aquarius, Mars was in Sagittarius..."
- **Personal**: "One year ago today, you journaled about feeling overwhelmed. Saturn was squaring your Moon."
- **Cultural**: "Today is [holiday/event]. The cosmic energy supports [theme]."
- **Random past reading**: "6 months ago you pulled The Hermit. Does its message still resonate?"

#### Technical Requirements

- Static dataset: Historical events with dates (can curate 365 entries)
- Personal: Query user's journal/tarot entries from same date in prior years
- Component: `src/components/CosmicHistory.tsx`
- Display: Small card in daily dashboard

---

### 6.3 Cosmic Playlists / Mood Boards

**Effort**: Low-Medium (2-3 days)
**Impact**: Medium - delightful, shareable, differentiating

#### Concept

Auto-generate a daily mood/aesthetic based on cosmic weather and user's chart.

#### Features

- **Daily Vibe Card**: Color palette, crystal, activity suggestion, archetype energy
- **Element-Based Aesthetics**: Fire = bold reds & golds, Water = deep blues & silver
- **Transit-Influenced**: "Venus in Taurus vibes: luxury, nature, slow food"
- **Shareable**: Beautiful card format optimized for Instagram Stories
- **Optional**: Spotify playlist link (curated per transit energy, or API integration)

#### Technical Requirements

- Utility: `src/utils/daily-vibe.ts` - generate based on transits + user chart
- Component: `src/components/DailyVibe.tsx`
- OG image: `src/app/api/og/share/daily-vibe/route.tsx`
- Content: Curate vibe associations per planet/sign/transit combination

---

## 7. Virality & Growth Hooks

### 7.1 Cosmic Compatibility Widget

**Effort**: Medium (3-4 days)
**Impact**: MASSIVE viral potential - this is how astrology apps grow organically

#### Concept

Embeddable widget or shareable link: "Check our compatibility!" Two people enter birth data, get a beautiful compatibility card. Massive viral potential.

#### Flow

1. User A generates a compatibility link from their profile
2. User A shares link on social media / sends to friend
3. User B clicks link, enters their birth data (no account needed)
4. Both see compatibility results
5. User B gets CTA to create free account for full report
6. If User B signs up, User A gets credit (referral program tie-in)

#### Technical Requirements

- Page: `src/app/compatibility/[inviteCode]/page.tsx` (public, no auth required)
- API: `src/app/api/compatibility/invite/route.ts` (generate invite)
- API: `src/app/api/compatibility/calculate/route.ts` (calculate without auth)
- Component: `src/components/CompatibilityWidget.tsx`
- OG image: Dynamic preview showing User A's name + "Check our compatibility"
- Integration: Referral program credit when User B signs up

---

### 7.2 Enhanced Social Share Cards

**Effort**: Low (1-2 days)
**Impact**: Medium - incremental improvement to existing shares

#### Improvements to All Existing Share Cards

- Consistent branding: Same footer, same logo placement, same font hierarchy
- "Made with Lunary" watermark that's visible but not intrusive
- Deep link QR code on story-format cards (people can't click stories)
- A/B test different CTA copy on share landing pages
- Track share-to-signup conversion per card type

---

### 7.3 Referral Rewards with Cosmic Flavor

**Effort**: Low (2-3 days)
**Impact**: Medium-High - makes existing referral system more compelling

#### Current State

Referral system exists (`referral_codes`, `user_referrals` tables). Needs thematic wrapper.

#### Proposed Improvements

- **Themed copy**: "Expand your cosmic circle" instead of generic "Refer a friend"
- **Tiered rewards**:
  - 1 referral: Unlock exclusive tarot spread
  - 3 referrals: 1 week of Pro free
  - 5 referrals: Exclusive "Cosmic Connector" badge + permanent cosmetic
  - 10 referrals: 1 month of Pro free
- **Seasonal campaigns**: "Libra season = partnership energy. Invite a friend and both get a synastry report"
- **Friend welcome**: Referred friends get a personalized welcome reading + synastry preview with referrer
- **Shareable referral card**: Beautiful OG image with referral link embedded

---

## 8. Yearly Wrapped (December)

**Status**: Planned for December 2026
**Effort**: 1-2 weeks
**Impact**: MASSIVE viral potential
**Reference**: `docs/REMAINING_TODOS.md` lines 109-163

### Content Slides

#### 1. Your Tarot Year

- Most-pulled cards of the year (top 3 with frequency)
- "The card that defined your year" (most recurring)
- Total readings count
- Suit dominance over time (trend chart)
- "Your tarot personality: The [Archetype]"

#### 2. Your Cosmic Journey

- Major transits you experienced (timeline)
- Your "theme" months (what transit defined each month)
- Moon phases you were most active during
- Retrogrades survived (with count)

#### 3. Your Reflections

- Journal entries count + total words
- Mood trends over the year (graph)
- Top 5 themes that emerged in your writing
- Word cloud of your journal
- "Your emotional season": Which season aligned most with your mood

#### 4. Your Community

- Moon Circles participated in
- Insights shared
- Friends added
- Cosmic gifts sent/received
- "Your cosmic archetype for the year"

#### 5. Year Ahead Preview

- Major 2027 transits for your chart
- Your personal year number (numerology)
- Cards to watch for in 2027
- "Your 2027 theme word"

### Shareable Cards

- "My 2026 in Cards" - top 3 cards visual
- "My Cosmic Year" - summary card with key stats
- "My Year Ahead" - 2027 preview teaser
- Animated story format for Instagram (Remotion)

### Technical Requirements

- Aggregate queries across `tarot_readings`, `collections`, `moon_circles`, `journal entries`, `ai_threads`
- OG image generation for each card type (5-6 unique templates)
- Story-format animations (Remotion)
- Scheduled reveal: Dec 1-15 data collection, Dec 15+ reveal
- Caching: Pre-generate per user, cache results
- **Files**:
  - `src/app/(authenticated)/wrapped/page.tsx`
  - `src/app/api/wrapped/route.ts`
  - `src/components/wrapped/` (slide components)
  - `src/app/api/og/wrapped/` (OG images per slide)

---

## 9. Physical Products

**Status**: Future revenue stream
**Reference**: `docs/REMAINING_TODOS.md` lines 222-286

### Tier 1: Low Effort / High Margin (Print-on-Demand)

1. **Birth Chart Prints** - Generate from existing chart wheel, print via Printful/Gelato
2. **Personalized Planners** - Transit dates pre-filled, moon phases marked
3. **Merch** - Zodiac designs, "Mercury Retrograde Survivor" etc.

### Tier 2: Partnerships

4. **Crystal Kits** - "Your Chart Crystal Set" based on dominant element
5. **Lunary Tarot Deck** - Custom artwork, QR codes linking to grimoire

### Tier 3: Subscription Boxes

6. **Monthly Cosmic Box** - Crystal, transit guide, ritual supplies, exclusive digital content

### Technical Needs

- E-commerce integration (Shopify embed or extend existing `/shop`)
- PDF generation for personalized products
- Print-on-demand API integration (Printful/Gelato)
- Order management / fulfillment tracking

---

## 10. Audio Content

**Status**: Future content stream
**Reference**: `docs/REMAINING_TODOS.md` lines 290-337

### Options (Ranked by Effort)

1. **AI-Generated Weekly Forecasts** (Easiest)
   - Script from existing horoscope/transit data
   - TTS via ElevenLabs (already have `src/lib/tts/elevenlabs.ts`)
   - ~5-10 min per rising sign weekly
   - Fully automatable pipeline

2. **Hybrid: AI Script + Human Voice**
   - AI generates personalized script
   - Human records for authenticity
   - Bi-weekly or monthly cadence

3. **Partner with Podcasters**
   - Sponsor existing astrology podcasts
   - Guest appearances
   - Zero production overhead

### Integration Points

- Audio player on `/horoscope` page
- "Listen to your forecast" button
- Push notification: "Your weekly audio is ready"
- Podcast feed for Apple/Spotify distribution

### Technical Needs

- Audio storage: Cloudflare R2 or S3
- RSS feed generation for podcast apps
- Audio player component: `src/components/AudioPlayer.tsx`
- Script-to-speech pipeline

---

## 11. Priority Matrix

### Phase 1: Daily Habit + Viral Sharing — COMPLETE

These create the daily loop and viral growth simultaneously.

| #   | Feature                           | Effort   | Impact                    | Status |
| --- | --------------------------------- | -------- | ------------------------- | ------ |
| 1   | Synastry share card redesign      | 3-5 days | Viral growth              | DONE   |
| 2   | Daily cosmic score                | 4-5 days | Daily retention           | DONE   |
| 3   | Daily cosmic score shareable card | 1-2 days | Daily viral loop          | DONE   |
| 4   | Birth chart share card polish     | 2-3 days | Better share conversion   | DONE   |
| 5   | Predictive notifications          | 3-4 days | Anticipation-driven opens | DONE   |

### Phase 2: Community Foundation (Weeks 4-6) -- IMPLEMENTED

Build the social infrastructure that makes leaving costly.

| #   | Feature                             | Effort   | Impact              | Status |
| --- | ----------------------------------- | -------- | ------------------- | ------ |
| 6   | Saturn Return circles               | 5-7 days | Deep retention      | Done   |
| 7   | Sign-based spaces (rising/sun/moon) | 2-3 days | Identity attachment | Done   |
| 8   | Mercury retrograde check-in         | 1-2 days | Seasonal engagement | Done   |
| 9   | Retrograde survival mode            | 3-4 days | Seasonal spike      | Done   |
| 10  | Friend activity feed improvements   | 2-3 days | Circle stickiness   | Done   |

#### Smoke Tests (pre-deploy)

- [ ] `/community` — See Rising Sign, Sun Sign, Moon Sign groups with Astronomicon symbols
- [ ] Tap into a space — Header with zodiac symbol, member/post counts, post feed
- [ ] Post in a space — Text validation (10-1000 chars), anonymous toggle, appears in feed
- [ ] Saturn Return — Set test birthday age 27-30, circle appears in hub
- [ ] Dashboard — Retrograde banner visible when any planet is Rx
- [ ] Retrograde survival kit — Expand to see dos/don'ts, journal prompt, practical tip
- [ ] Friend activity — Transit badges and daily compatibility tip render
- [ ] New user (no birth chart) — "Generate your birth chart" prompt on `/community`
- [ ] Free user in a space — Upgrade prompt instead of post form
- [ ] Auto-join — Clear `community_auto_joined` from sessionStorage, reload dashboard, verify memberships created

### Phase 3: Depth & Stickiness (Weeks 7-10)

Features that create emotional investment and long-term habit.

| #   | Feature                   | Effort   | Impact               | Section |
| --- | ------------------------- | -------- | -------------------- | ------- |
| 11  | Manifestation tracker     | 4-5 days | Emotional investment | 5.1     |
| 12  | Morning & evening rituals | 3-4 days | Bookend daily habits | 2.2     |
| 13  | Weekly cosmic challenges  | 3-4 days | Recurring engagement | 5.2     |
| 14  | Cosmic milestones         | 2-3 days | Delight moments      | 5.3     |
| 15  | Cosmic gifting            | 3-4 days | Re-engagement        | 4.1     |

### Phase 4: Growth & Conversion (Weeks 11-14)

Viral loops and upgrade pressure.

| #   | Feature                       | Effort   | Impact                  | Section |
| --- | ----------------------------- | -------- | ----------------------- | ------- |
| 16  | Compatibility widget (public) | 3-4 days | Massive viral potential | 7.1     |
| 17  | Anonymous Q&A                 | 4-5 days | Community activation    | 3.3     |
| 18  | Collaborative interpretations | 4-5 days | Solo → social bridge    | 3.4     |
| 19  | Referral rewards revamp       | 2-3 days | Organic growth          | 7.3     |
| 20  | New shareable card types      | 5-8 days | More share surfaces     | 1.3     |

### Phase 5: Content & Education (Weeks 15-18)

Long-term content moat.

| #   | Feature                           | Effort   | Impact                 | Section |
| --- | --------------------------------- | -------- | ---------------------- | ------- |
| 21  | Astro-learning paths              | 5-7 days | Education retention    | 6.1     |
| 22  | Dream dictionary + AI interpreter | 4-5 days | Enriches dream journal | 5.5     |
| 23  | This day in cosmic history        | 1-2 days | Daily content variety  | 6.2     |
| 24  | Cosmic playlists / mood boards    | 2-3 days | Shareable + delightful | 6.3     |
| 25  | Group circles / covens            | 5-7 days | Private social layer   | 3.6     |

### Phase 6: Seasonal Tentpoles

| #   | Feature                     | Timing                  | Impact                  | Section |
| --- | --------------------------- | ----------------------- | ----------------------- | ------- |
| 26  | Yearly Wrapped              | December 2026           | Massive viral           | 8       |
| 27  | Audio forecasts             | When ready              | Retention channel       | 10      |
| 28  | Physical products           | When scale supports     | Revenue diversification | 9       |
| 29  | Cosmic matching (discovery) | When user base supports | Network effects         | 4.3     |
| 30  | Local circles               | When density supports   | Real-world extension    | 3.5     |

---

## Appendix: Existing Infrastructure to Build On

These existing tables and systems should be extended rather than rebuilt:

| Existing                                            | Extend For                                        |
| --------------------------------------------------- | ------------------------------------------------- |
| `moon_circles` + `moon_circle_insights`             | Transit circles, sign spaces, community groups    |
| `friend_connections` + `synastry_reports`           | Covens, compatibility widget, cosmic gifting      |
| `user_progress` + `user_streaks`                    | Milestones, challenge completions, learning paths |
| `ritual_habits`                                     | Morning/evening rituals, weekly challenges        |
| `daily_horoscopes`                                  | Daily cosmic score caching                        |
| `journal_patterns`                                  | Manifestation tracking, dream patterns            |
| `push_subscriptions` + `notification_sent_events`   | Predictive notifications                          |
| `tarot_readings`                                    | Tarot share cards, wrapped data                   |
| `grimoire_embeddings`                               | Dream dictionary, learning path content           |
| `referral_codes` + `user_referrals`                 | Enhanced referral rewards                         |
| Share infrastructure (`og-utils`, `og-share-utils`) | All new shareable card types                      |

---

## Appendix: Key Metrics to Track

Each feature should move at least one of these:

| Metric                     | Target | Features That Move It                               |
| -------------------------- | ------ | --------------------------------------------------- |
| **DAU/MAU**                | >40%   | Cosmic score, morning ritual, challenges            |
| **D7 retention**           | >50%   | Onboarding, predictive notifications, streaks       |
| **D30 retention**          | >30%   | Manifestation tracker, community, covens            |
| **Shares per user/month**  | >2     | All share card improvements, wrapped                |
| **Viral coefficient**      | >0.5   | Compatibility widget, referrals, share cards        |
| **Free → Paid conversion** | >5%    | Gated community features, deeper AI, learning paths |
| **Session length**         | >4 min | Morning ritual, learning paths, community feed      |
| **Sessions per day**       | >1.5   | Morning + evening ritual, challenge check-ins       |

---

## Appendix: Implemented Notification Types

> As of Phase 1 completion (Feb 2026). Covers all notification types currently in production.

### Delivery Channels

| Channel         | Implementation            | Notes                                        |
| --------------- | ------------------------- | -------------------------------------------- |
| **Web Push**    | VAPID keys via `web-push` | Primary channel. Table: `push_subscriptions` |
| **Native Push** | Firebase Admin SDK        | iOS/Android. Table: `native_push_tokens`     |
| **Email**       | Resend + React Email      | Alongside push for major events              |
| **Discord**     | Webhooks                  | Admin alerts for failures/successes          |

### Cron-Driven Notification Types

| Cron Route                      | Cadence          | What It Sends                                                    | Audience                              |
| ------------------------------- | ---------------- | ---------------------------------------------------------------- | ------------------------------------- |
| `daily-insight-notification`    | Daily            | Tiered insight (generic free / personalized paid)                | All with push                         |
| `daily-cosmic-pulse`            | Daily            | Personalized AI cosmic pulse email + push                        | Paid with birthday                    |
| `weekly-notifications`          | Mon/Fri/Sun      | Mon: week ahead, Fri: tarot, Sun: cosmic reset                   | All with push                         |
| `moon-events`                   | On New/Full Moon | Moon event email                                                 | Users with `moonEvents` pref          |
| `moon-circles`                  | On New/Full Moon | Moon circle open/milestone push + email                          | Users with `moonCircles` pref         |
| `personal-transit-notification` | Daily            | Chart activations + predictive transits (see below)              | Paid with birth chart                 |
| `cosmic-changes-notification`   | Daily            | Cosmic state changes (element shifts, retrogrades)               | Users with `cosmicChanges` pref       |
| `check-notifications-hourly`    | Hourly           | Time-sensitive: moon phases (p10), major aspects (p9+), eclipses | All with push                         |
| `engagement-notifications`      | Daily            | Streak-at-risk + general re-engagement                           | Users with `engagementReminders` pref |
| `trial-reminders`               | Daily            | Trial ending emails (3-day, 1-day)                               | Trial users                           |

### Personal Transit Notification — Two-Pass System

**Pass 1 — Chart Activation** (reactive, same-day):

| Event Type                 | Trigger                                             | Copy Source       |
| -------------------------- | --------------------------------------------------- | ----------------- |
| `sun_activation`           | Transiting Sun in user's Sun sign                   | `copy-library.ts` |
| `rising_activation`        | Transiting Sun in user's Rising sign                | `copy-library.ts` |
| `transit_change` (moon)    | Transiting Moon in user's Moon sign                 | `copy-library.ts` |
| `transit_change` (general) | Priority 9+ transit touching user's Sun/Moon/Rising | `copy-library.ts` |

**Pass 2 — Predictive** (forward-looking, 1-7 days ahead):

| Event Type         | Trigger                      | Lookahead   | Priority                             |
| ------------------ | ---------------------------- | ----------- | ------------------------------------ |
| `retrograde_start` | Planet stationing retrograde | 3 or 7 days | High if personal, Medium if Mercury  |
| `retrograde_end`   | Planet stationing direct     | 3 or 7 days | High if personal, Medium if Mercury  |
| `sign_ingress`     | Planet entering new sign     | Tomorrow    | High if user's sign, skip if general |

**Deduplication**: Both passes use `notification_sent_events` table. Event keys follow pattern `predictive-{type}-{planet}-{daysUntil}-{date}` for predictive, `personal-transit-{date}` for the daily guard.

### Copy Library Event Types (`copy-library.ts`)

All types support free/paid variants with `PersonalizedContext` (name, sunSign, moonSign, risingSign, transit):

| Category | Event Type          | Free Copy Example                    | Paid Copy Example                      |
| -------- | ------------------- | ------------------------------------ | -------------------------------------- |
| Daily    | `insight`           | "Your daily cosmic insight is ready" | "Sam, your cosmic energy today..."     |
| Daily    | `tarot`             | "Today's tarot pattern is emerging"  | "Sam, your personal card today..."     |
| Daily    | `moon_phase`        | "The moon shifts energy today"       | "Sam, tonight's moon in Pisces..."     |
| Daily    | `sky_shift`         | "A major cosmic shift is happening"  | "Sam, today's transit activates..."    |
| Weekly   | `monday_week_ahead` | "Your week ahead is ready"           | "Sam, your personal week ahead..."     |
| Weekly   | `friday_tarot`      | "Weekly tarot pattern emerging"      | "Sam, your weekly personal tarot..."   |
| Weekly   | `sunday_reset`      | "Cosmic reset available"             | "Sam, your personal cosmic reset..."   |
| Monthly  | `new_moon`          | "New Moon energy is here"            | "Sam, this New Moon in your..."        |
| Monthly  | `full_moon`         | "Full Moon energy peaks tonight"     | "Sam, tonight's Full Moon in your..."  |
| Event    | `transit_change`    | "A cosmic shift is unfolding"        | "Sam, [transit] is activating..."      |
| Event    | `sun_activation`    | "Solar energy is heightened"         | "Sam, the Sun illuminates your..."     |
| Event    | `rising_activation` | "Your rising energy is activated"    | "Sam, cosmic energy activates your..." |

### User Preference Keys (`push_subscriptions.preferences`)

| Key                   | Default   | Controls                                          |
| --------------------- | --------- | ------------------------------------------------- |
| `moonPhases`          | true      | Moon phase hourly notifications                   |
| `majorAspects`        | true      | Major aspect hourly notifications                 |
| `planetaryTransits`   | true      | Planet ingress + predictive transit notifications |
| `retrogrades`         | true      | Retrograde start/end notifications                |
| `sabbats`             | true      | Seasonal/sabbat notifications                     |
| `eclipses`            | true      | Eclipse notifications                             |
| `cosmicPulse`         | true      | Daily AI cosmic pulse (requires birthday)         |
| `cosmicPulseTime`     | 'morning' | Morning or evening delivery                       |
| `moonEvents`          | true      | New/Full Moon event emails                        |
| `moonCircles`         | true      | Moon circle push + email                          |
| `cosmicChanges`       | true      | Cosmic state change notifications                 |
| `engagementReminders` | true      | Streak risk + general re-engagement               |

### Quiet Hours

Several cron jobs skip sending during 22:00-08:00 UTC: `daily-cosmic-pulse`, `cosmic-changes-notification`, `moon-circles`.
