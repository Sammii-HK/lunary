# Lunary Threads Growth Strategy

> Last updated: 2026-02-08
> Goal: Optimise for growth, engagement, follows, and app download funnel

---

## Table of Contents

1. [Platform Context](#1-platform-context)
2. [Algorithm Priorities](#2-algorithm-priorities)
3. [Content Pillars](#3-content-pillars)
4. [Posting Schedule](#4-posting-schedule)
5. [Funnel Strategy](#5-funnel-strategy)
6. [Pipeline Implementation Changes](#6-pipeline-implementation-changes)
7. [Engagement Protocol](#7-engagement-protocol)
8. [Competitive Moat](#8-competitive-moat)
9. [Metrics & KPIs](#9-metrics--kpis)
10. [Astrology Niche Insights](#10-astrology-niche-insights)

---

## 1. Platform Context

### Why Threads Now

- **400M monthly active users** (Aug 2025), surpassed X in daily mobile users (141.5M vs 125M as of Jan 2026)
- **Median engagement rate: 6.25%** vs X at 3.6% (73.6% higher)
- Early growth window for creators - by Q4 2026 this closes as the platform matures
- Deep Meta integration with Instagram (cross-posting to Stories, shared audience)
- Threads Communities launched Oct 2025 (200+ topics) - new discovery surface
- Google now indexes Threads posts - additional SEO surface

### Audience Demographics

- Primary: 18-34 year olds (millennials/Gen Z)
- 51% of Threads users are active on Instagram
- 70% of daily US Threads users are also on Facebook
- Community-oriented, conversation-first culture
- Prefer authentic, casual tone over polished/corporate

---

## 2. Algorithm Priorities

### Ranking Signals (in order of weight)

1. **Replies** - #1 signal. Meaningful replies >>> likes. A post with 10 thoughtful replies outperforms one with 100 likes
2. **Engagement velocity** - 50 likes in 30 minutes beats 100 likes over 24 hours. First 60-90 minutes determine amplification
3. **Reposts & shares** - places content in new feeds beyond follower count
4. **Time spent** - algorithm tracks how long users view content (depth signal)
5. **Profile visits** - higher-effort action, strong signal
6. **Likes** - weakest signal despite being most common

### Format Performance (ranked)

1. **Images** - outperform text by 60%
2. **Video** - up to 5 minutes, strong engagement
3. **Polls** - natural participation driver (up to 4 options)
4. **Text + Image** - better than text alone
5. **Text-only** - lowest performance

### Key Rules

- **One topic tag per post** (not multiple hashtags). Tags are interest markers, not sorting tools
- **200-300 characters optimal** despite 500-char limit
- **First line is everything** - it's the scroll-stopper headline
- Posts with topic tags get significantly more views than those without
- Algorithm shifting from "who you follow" to "what you talk about" model

---

## 3. Content Pillars

### Pillar 1: Conversation Starters (35% of posts) - DISCOVERY

**Purpose:** Drive replies, the algorithm's #1 signal.

**Format:** Open-ended question or hot take as the FIRST line, 2-3 lines of context.

**Current pipeline mapping:** Elevate `question` closerType to opener position. Add `hot_take` intent.

**Examples:**

- "What's the one thing about your moon sign that nobody talks about?"
- "Unpopular opinion: your rising sign matters more than your sun sign for daily life"
- "Mercury retrograde isn't punishing you. It's showing you what you've been avoiding."
- "Which sign handles heartbreak the worst? I have thoughts."
- "Hot take: tarot readers who only read reversals are missing half the story."

**Topic tags:** astrology, tarot, numerology, zodiac signs, spirituality

### Pillar 2: Educational Authority (25% of posts) - CONSIDERATION

**Purpose:** Position Lunary as the reference/library. Build trust and authority.

**Format:** Bold claim or "Did you know" hook + 2-3 lines of insight + optional Grimoire CTA. Always attach a generated OG image.

**Current pipeline mapping:** `educational_authority` archetype + OG image from `/api/og/social-quote`

**Examples:**

- "Your birth chart has 12 houses. Each one governs a different life area. When planets transit through them, they activate those themes specifically for you." + image
- "Amethyst connects to the crown chakra and Pisces energy. It enhances intuition and calms the mind. Many use it for meditation and dream work." + image
- "A trine aspect occurs when planets are 120 degrees apart - natural harmony and flow. But trines can create complacency if not actively developed." + image

**CTA style:** "Explore this in Lunary's Grimoire: lunary.app/grimoire/[slug]" (max 1 in 3 educational posts)

### Pillar 3: Cosmic Timing / Transit Alerts (25% of posts) - URGENCY + RELEVANCE

**Purpose:** Leverage real astronomical data as competitive moat. Timely content gets algorithmic boost.

**Format:** "Right now" content tied to actual astronomical events. Lead with the impact, then the astronomy.

**Current pipeline mapping:** `transit-alert` generator + `getTransitThemeForDate()` + moon phase data

**Sub-types:**

- **Morning cosmic update:** Moon sign, void of course, key aspects
- **Transit alerts:** When planets change signs (from existing pipeline)
- **Moon phase posts:** New/full moon intentions + releases
- **Universal day number:** Daily numerology from existing `universalDay.ts`
- **Week ahead preview:** Sunday cosmic forecast

**Examples:**

- "Venus just entered Scorpio. If your relationships feel more intense this week, that's why."
- "Today's universal day number is 7. Rest > hustle today."
- "Full Moon in Leo tonight. Whatever you've been building since the new moon two weeks ago? It's ready to be seen."
- "Mercury stations direct tomorrow. Projects that stalled in the last 3 weeks start moving again."

### Pillar 4: Identity-Based Engagement (15% of posts) - VIRAL + SHARES

**Purpose:** Drive reposts and shares. Identity content has the highest viral coefficient.

**Format:** Sign-specific callouts, rankings, polls, "tag a friend" style.

**Current pipeline mapping:** Adapt `sign-check` and `ranking` video formats to text. Add `poll` and `identity_callout` intents.

**Sub-types:**

- **Sign callout:** "If you're a [sign], stop scrolling. This week is about to test your patience."
- **Sign ranking:** "Ranking signs by how they handle confrontation: 1. Aries (head-on)..."
- **Polls:** "Which hits harder - Saturn return or Pluto transit?" (Threads native polls)
- **Compatibility:** "Scorpio + Pisces: the most intense water sign pairing. Agree or disagree?"

---

## 4. Posting Schedule

### Design Principles

- **5 posts per day** during growth phase (weekdays)
- **3-4 posts per day** on weekends
- **3-4 hour spacing** between posts (prevents cannibalising own reach)
- **Dual UK/US coverage** across all active hours
- **Reply within 60 minutes** of every post going live

### Audience Windows

| Window                          | UTC Time | Who's Active                           |
| ------------------------------- | -------- | -------------------------------------- |
| UK morning                      | 07:00    | UK waking + scrolling                  |
| UK lunch / US East wake         | 11:00    | UK midday break, US East Coast morning |
| UK evening / US East lunch      | 15:00    | UK wind-down, US East lunch scroll     |
| US East evening / US West lunch | 19:00    | US East evening, US West midday        |
| US West evening                 | 22:00    | US West Coast evening scroll           |

### Weekly Schedule

#### Monday (5 posts - strong start)

| Time (UTC) | Pillar              | Content                            |
| ---------- | ------------------- | ---------------------------------- |
| 07:00      | Cosmic Timing       | Weekly cosmic overview + moon sign |
| 11:00      | Conversation        | Weekly theme question (from facet) |
| 15:00      | Educational + image | Grimoire deep-dive on weekly theme |
| 19:00      | Identity            | Sign-specific weekly callout       |
| 22:00      | Conversation        | Hot take / misconception           |

#### Tuesday (5 posts)

| Time (UTC) | Pillar              | Content                        |
| ---------- | ------------------- | ------------------------------ |
| 07:00      | Cosmic Timing       | Morning transit/moon update    |
| 11:00      | Educational + image | Theme facet educational        |
| 15:00      | Conversation        | Question from facet (elevated) |
| 19:00      | Identity            | Poll (binary choice)           |
| 22:00      | Cosmic Timing       | Evening energy check-in        |

#### Wednesday (5 posts - peak day)

| Time (UTC) | Pillar              | Content                       |
| ---------- | ------------------- | ----------------------------- |
| 07:00      | Cosmic Timing       | Mid-week transit update       |
| 11:00      | Conversation        | Hot take / contrarian opinion |
| 15:00      | Educational + image | Grimoire content + image      |
| 19:00      | Identity            | Sign ranking or compatibility |
| 22:00      | Conversation        | Engagement question           |

#### Thursday (5 posts)

| Time (UTC) | Pillar              | Content                  |
| ---------- | ------------------- | ------------------------ |
| 07:00      | Cosmic Timing       | Morning cosmic update    |
| 11:00      | Educational + image | Deep-dive on theme facet |
| 15:00      | Conversation        | Misconception or reframe |
| 19:00      | Identity            | Sign callout             |
| 22:00      | Conversation        | Question / this-or-that  |

#### Friday (5 posts)

| Time (UTC) | Pillar              | Content                         |
| ---------- | ------------------- | ------------------------------- |
| 07:00      | Cosmic Timing       | Friday energy forecast          |
| 11:00      | Conversation        | Weekend intention question      |
| 15:00      | Educational + image | Crystal/spell/practical content |
| 19:00      | Identity            | Poll (weekend-themed)           |
| 22:00      | Cosmic Timing       | Weekend cosmic preview          |

#### Saturday (3 posts)

| Time (UTC) | Pillar              | Content                        |
| ---------- | ------------------- | ------------------------------ |
| 11:00      | Conversation        | Casual engagement / reflection |
| 15:00      | Educational + image | Grimoire spotlight             |
| 19:00      | Identity            | Sign ranking or fun content    |

#### Sunday (3 posts)

| Time (UTC) | Pillar              | Content                     |
| ---------- | ------------------- | --------------------------- |
| 11:00      | Cosmic Timing       | Week ahead cosmic preview   |
| 15:00      | Conversation        | Intention-setting question  |
| 19:00      | Educational + image | Theme preview for next week |

### Weekly Totals

- **Weekdays:** 5 posts x 5 days = 25 posts
- **Weekends:** 3 posts x 2 days = 6 posts
- **Weekly total: ~31 posts**
- **Monthly total: ~130 posts**

### Pillar Distribution (weekly)

| Pillar                | Posts/Week | %   |
| --------------------- | ---------- | --- |
| Conversation Starters | ~11        | 35% |
| Educational + image   | ~8         | 26% |
| Cosmic Timing         | ~7         | 23% |
| Identity/Engagement   | ~5         | 16% |

---

## 5. Funnel Strategy

### Principle: Value-First, Never Salesy

The Threads algorithm deprioritises promotional content. The funnel must feel like a resource, not a pitch.

### Layer 1: Pure Value (85% of posts)

No CTA, no app mention. Just insight, questions, cosmic timing.
This builds trust, authority, and the reply rate that drives algorithmic reach.

### Layer 2: Soft Authority (15% of posts)

Position Lunary as a reference library:

- "Explore this in Lunary's Grimoire: lunary.app/grimoire/[slug]"
- "Your birth chart explains this - discover yours at lunary.app"
- Only on educational posts, never on conversation starters or identity posts

### Layer 3: Bio Link

- Always point to lunary.app with clear value prop
- Use Threads link tracking (available since May 2025)
- Rotate bio text monthly to test different hooks:
  - "Your cosmic companion. Birth charts, AI guide, 500+ page grimoire."
  - "Real astronomy, not generic horoscopes. Free birth chart at lunary.app"
  - "The astrology app that remembers your chart and grows with you."

### Layer 4: Cross-Platform Bridge

- Cross-post top-performing Threads content to Instagram Stories (new feature)
- Reference Threads discussions in Instagram content: "We talked about this on Threads..."
- Instagram audience already exists - Threads extends the conversation

### Conversion Path

```
Threads post (value)
  -> Reply / engagement (builds familiarity)
    -> Profile visit (sees bio + link)
      -> lunary.app (birth chart as lead magnet)
        -> Free features (explore grimoire, basic chart)
          -> Lunary+ conversion (deeper readings, AI chat)
```

---

## 6. Pipeline Implementation Changes

### 6.1 New Thread Intent Types

Add to `src/lib/social/types.ts`:

```typescript
export type ThreadIntent =
  | 'observation'
  | 'contrast'
  | 'misconception'
  | 'quick_rule'
  | 'signal'
  // New intents for Threads optimisation
  | 'hot_take' // Contrarian opinion that drives debate
  | 'poll' // Binary/multiple choice question
  | 'identity_callout' // Sign-specific "stop scrolling" posts
  | 'cosmic_now' // Real-time transit/moon content
  | 'ranking'; // "Ranking signs by [trait]" list format
```

### 6.2 Restructured Post Format

Current structure: `opener -> payload -> closer`

New structure optimised for Threads algorithm:

```typescript
export interface ThreadsPost {
  // The scroll-stopping first line (question, hot take, or bold claim)
  hook: string; // Max 80 chars - this is what stops the scroll

  // Supporting context (2-3 short lines)
  body: string; // Max 200 chars

  // Conversation prompt (drives replies)
  prompt: string; // Question or "try this" that invites response

  // Metadata
  topicTag: string; // Single Threads topic tag
  hasImage: boolean; // Whether to attach OG image
  imageRoute?: string; // OG image API route if applicable
  pillar: 'conversation' | 'educational' | 'cosmic_timing' | 'identity';
  postSlot: number; // 1-5, maps to posting time
  charCount: number; // Total chars, target 200-300
}
```

### 6.3 Topic Tag Mapping

Add to content generation:

```typescript
export const THREADS_TOPIC_TAGS: Record<ThemeCategory, string> = {
  zodiac: 'astrology',
  tarot: 'tarot',
  lunar: 'moon phases',
  planetary: 'astrology',
  crystals: 'crystals',
  numerology: 'numerology',
  chakras: 'spirituality',
  sabbat: 'spirituality',
  runes: 'spirituality',
  spells: 'witchcraft',
};
```

### 6.4 Image Attachment for Educational Posts

Leverage existing OG routes for Threads posts:

```typescript
export const THREADS_IMAGE_ROUTES: Record<string, string> = {
  educational: '/api/og/social-quote', // Quote/insight posts
  cosmic_timing: '/api/og/share/sky-now', // Transit and cosmic state
  moon_phase: '/api/og/share/cosmic-state', // Moon phase content
  tarot: '/api/og/share/tarot', // Tarot educational
  numerology: '/api/og/share/numerology', // Numerology content
};
```

### 6.5 Character Count Constraints

Add validation to generation:

```typescript
const THREADS_CHAR_LIMITS = {
  hook: { min: 30, max: 80 }, // First line
  body: { min: 50, max: 200 }, // Context
  prompt: { min: 20, max: 60 }, // Conversation driver
  total: { min: 150, max: 300 }, // Full post target
  absolute_max: 500, // Platform limit
};
```

### 6.6 Posting Slot Configuration

```typescript
export const THREADS_POSTING_SLOTS = {
  weekday: [
    { slot: 1, utcHour: 7, audience: 'UK morning', pillar: 'cosmic_timing' },
    {
      slot: 2,
      utcHour: 11,
      audience: 'UK lunch / US East wake',
      pillar: 'varies',
    },
    {
      slot: 3,
      utcHour: 15,
      audience: 'UK evening / US East lunch',
      pillar: 'educational',
    },
    {
      slot: 4,
      utcHour: 19,
      audience: 'US East evening / US West lunch',
      pillar: 'identity',
    },
    {
      slot: 5,
      utcHour: 22,
      audience: 'US West evening',
      pillar: 'conversation',
    },
  ],
  weekend: [
    {
      slot: 1,
      utcHour: 11,
      audience: 'UK lunch / US East wake',
      pillar: 'varies',
    },
    {
      slot: 2,
      utcHour: 15,
      audience: 'UK evening / US East lunch',
      pillar: 'educational',
    },
    {
      slot: 3,
      utcHour: 19,
      audience: 'US East evening / US West lunch',
      pillar: 'identity',
    },
  ],
};
```

### 6.7 Angle Templates for New Intents

Add to `with-threads.ts` for each category:

```typescript
// HOT TAKE - drives debate and replies
{
  intent: 'hot_take',
  hook: 'Unpopular opinion: [contrarian claim about category]',
  body: '[2-3 lines of reasoning]',
  prompt: 'Agree or disagree?',
  topicTag: 'astrology',
  pillar: 'conversation',
}

// POLL - easy participation
{
  intent: 'poll',
  hook: '[Binary choice framed as identity]',
  body: '[Brief context for why this matters]',
  prompt: '[Poll options]', // Threads supports native polls
  topicTag: 'astrology',
  pillar: 'identity',
}

// IDENTITY CALLOUT - high share rate
{
  intent: 'identity_callout',
  hook: 'If you're a [sign], this is your sign to [action]',
  body: '[Why this week/transit is relevant to this sign]',
  prompt: 'Tag a [sign] who needs to hear this.',
  topicTag: 'zodiac signs',
  pillar: 'identity',
}

// COSMIC NOW - timely, algorithmic boost
{
  intent: 'cosmic_now',
  hook: '[Planet] just [action]. Here's what that means for you.',
  body: '[Practical impact in 2-3 lines]',
  prompt: 'How are you feeling this shift?',
  topicTag: 'astrology',
  pillar: 'cosmic_timing',
}

// RANKING - shareable list format
{
  intent: 'ranking',
  hook: 'Ranking signs by [trait]:',
  body: '[Numbered list 1-12 or top 5]',
  prompt: 'Where did your sign land? Fair or unfair?',
  topicTag: 'zodiac signs',
  pillar: 'identity',
}
```

### 6.8 Content Generation Weight Updates

Update archetype weights for Threads-optimised mix:

```typescript
// Threads-specific archetype weights (different from TikTok/Instagram)
export const THREADS_ARCHETYPE_WEIGHTS = {
  conversation_starter: 35, // Questions, hot takes, debates
  educational_authority: 25, // Grimoire deep-dives with images
  cosmic_timing: 25, // Transit alerts, moon updates, universal day
  identity_engagement: 15, // Sign callouts, rankings, polls
};
```

---

## 7. Engagement Protocol

### Critical: Replies Are As Important As Posts

Adam Mosseri explicitly stated: "If you're really trying to grow your presence, you should reply much more than you post."

### Daily Engagement Routine

**Within 60 minutes of each post:**

- Reply to every comment with a thoughtful response (not just "thanks!")
- Ask follow-up questions in replies to drive reply chains
- Like and reply to comments from other creators who engage

**Daily community engagement (15-20 min):**

- Reply to 5-10 posts from other astrology/spirituality creators
- Quote-reply trending astrology content with your educational take
- Engage in Threads Communities (astrology, spirituality, wellness)

**Weekly:**

- Identify top-performing post and create a follow-up expanding on the conversation
- Quote-reply your own best content with "This thread blew up - here's what I'd add..."
- Engage with any competitor/peer content that mentions topics you cover

### Reply Templates (to maintain voice consistency)

Keep authentic and conversational. Never corporate. Match the Lunary voice:

- **Validating:** "This is such a real observation. [Add insight from Grimoire]"
- **Expanding:** "Yes, and the other thing people miss about [topic] is..."
- **Redirecting:** "That's actually connected to [related concept]. The Grimoire goes deep on this."
- **Asking back:** "That's interesting - do you find that [related question]?"

### Community Participation

- Join relevant Threads Communities (launched Oct 2025)
- Target communities: astrology, spirituality, wellness, self-development, witchcraft
- Post community-specific content (can be repurposed from main feed)
- Engage with community moderators and active members

---

## 8. Competitive Moat

### vs. Generic Astrology Accounts

| Advantage             | Lunary                                     | Competitors                  |
| --------------------- | ------------------------------------------ | ---------------------------- |
| Astronomical accuracy | Real calculations from astronomy-engine    | Recycled generic horoscopes  |
| Content depth         | 500+ page Grimoire, 10 categories          | Surface-level sun sign posts |
| Automation            | Full pipeline, 31+ posts/week sustainably  | Manual posting, inconsistent |
| Visual content        | OG image generation at scale               | Text-only or Canva templates |
| Cross-platform        | TikTok + Instagram + Threads in one system | Platform-siloed content      |
| Personalisation       | Birth chart-based insights                 | One-size-fits-all            |

### vs. Major Astrology Apps on Threads

| App       | Threads Strategy                           | Lunary Opportunity                                 |
| --------- | ------------------------------------------ | -------------------------------------------------- |
| Co-Star   | Snarky, black-and-white, AI-generated      | Warmer, grounded, astronomy-backed                 |
| CHANI     | Human-created, feminist, podcast-driven    | More frequent, automated, broader topics           |
| Sanctuary | Brand partnerships, sign-matching products | Educational depth, Grimoire as resource            |
| Pattern   | Relationship/compatibility focused         | Broader scope: crystals, spells, numerology, tarot |

### Key Differentiators to Emphasise

1. **"Real astronomy, not recycled horoscopes"** - your calculations are from actual planetary positions
2. **"The cosmic library"** - Grimoire positioning as a free reference vs. app paywall
3. **"Your chart, not your sign"** - personalisation angle (birth chart > sun sign)
4. **Breadth** - 10 categories (zodiac, tarot, crystals, spells, numerology, etc.) vs. competitors' narrow focus
5. **AI with memory** - "an AI that remembers your chart and your questions"

---

## 9. Metrics & KPIs

### Primary Metrics (Algorithm Health)

| Metric               | Target (Month 1) | Target (Month 3) | Target (Month 6) |
| -------------------- | ---------------- | ---------------- | ---------------- |
| Reply rate per post  | 3-5 replies      | 10-20 replies    | 30+ replies      |
| Avg replies per post | 2+               | 8+               | 20+              |
| Follower growth/week | 50-100           | 200-500          | 500-1000         |
| Total followers      | 500+             | 2,000+           | 8,000+           |

### Secondary Metrics (Funnel Health)

| Metric                            | Target                                |
| --------------------------------- | ------------------------------------- |
| Bio link clicks/week              | 20+ (month 1), 100+ (month 3)         |
| App visits from Threads           | Track via UTM: ?utm_source=threads    |
| Grimoire page visits from Threads | Track via UTM on Grimoire links       |
| Posts with 1000+ views            | 2+/week (month 1), 10+/week (month 3) |

### Content Performance Tracking

| Dimension             | What to Track                            |
| --------------------- | ---------------------------------------- |
| Pillar performance    | Which pillar gets highest reply rate?    |
| Time slot performance | Which UTC slot gets most engagement?     |
| Topic tag performance | Which tags drive most discovery?         |
| Format performance    | Text-only vs text+image reach comparison |
| Intent performance    | Which ThreadIntent drives most replies?  |
| Category performance  | Which ThemeCategory resonates most?      |

### Weekly Review Checklist

- [ ] Top 3 performing posts - what made them work?
- [ ] Worst 3 performing posts - what fell flat?
- [ ] Reply rate trend - improving or declining?
- [ ] Follower growth trend
- [ ] Bio link click trend
- [ ] Adjust pillar weights based on data
- [ ] Adjust posting times based on data
- [ ] Identify new conversation topics from audience replies

---

## 10. Astrology Niche Insights

### Trending Topics to Capitalise On (2026)

1. **Uranus entering Gemini (April 25, 2026)** - 7-year transit. "Major innovation in social media, technology, communication." Create a content series leading up to this.
2. **Neptune in Aries (2025-2039)** - Generational shift. New spiritual identity themes.
3. **Saturn in Pisces (2025-2028)** - Demands accountability and substance. Aligns with Lunary's "grounded spirituality" voice.
4. **Mercury retrograde periods** - Always viral. Have content pre-generated for each retrograde.
5. **Zodiac season transitions** - Monthly viral moments (e.g., "Pisces season starts tomorrow").

### Content That Goes Viral in Astrology Threads

- **Prosperity predictions** - "These signs are destined for [outcome] in 2026"
- **Relatable zodiac memes** - personality trait observations
- **Compatibility debates** - "Scorpio + Pisces: most intense water pairing. Agree?"
- **Saturn Return stories** - transformation narratives
- **Mercury retrograde survival content** - practical, relatable

### Voice That Resonates

From research on successful astrology accounts:

- **Grounded but not academic** - teach without lecturing
- **Authentic and raw** - Threads loves vulnerability
- **Slightly witty/snarky** (Co-Star's success) but warmer than Co-Star
- **Non-judgmental** - astrology as self-understanding, not prediction
- **Accessible** - explain terms simply, avoid jargon
- **Conversational** - write as "I" and "you," not as a brand

This aligns well with Lunary's existing voice guidelines:

- Grounded spirituality
- Emotional truth
- Modern calm
- Vulnerability first, value second
- Authenticity over performance

### Astrology App Market Context

- Market worth **$15B+ in 2025**, app market projected to reach **$5B**
- **59% of users** are millennials and Gen Z
- **37% of app downloads** influenced by social media
- **70% of users engage daily** for horoscope updates
- Co-Star grew from 7.5M to 30M users via social media
- **85% prefer apps with both free and premium content**

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)

1. Add new ThreadIntent types to `src/lib/social/types.ts`
2. Create ThreadsPost interface with new structure (hook/body/prompt)
3. Add topic tag mapping
4. Add character count constraints
5. Update `with-threads.ts` with new angle templates for all categories

### Phase 2: Content Generation (Week 2-3)

6. Build Threads-specific content generator (separate from TikTok/Instagram)
7. Integrate OG image routes for educational posts
8. Add cosmic timing post generator using existing transit/moon data
9. Add identity-based post generators (rankings, callouts, polls)
10. Add posting slot scheduler for 5-slot daily cadence

### Phase 3: Automation (Week 3-4)

11. Add Threads posting to daily cron pipeline
12. Add Threads-specific performance tracking
13. Add weekly analytics summary
14. Cross-post to Instagram Stories integration

### Phase 4: Optimisation (Ongoing)

15. A/B test post formats (text vs text+image)
16. Optimise posting times based on actual engagement data
17. Adjust pillar weights based on reply rates
18. Refine voice and tone based on top-performing posts
19. Build content series for major transits (Uranus in Gemini etc.)
