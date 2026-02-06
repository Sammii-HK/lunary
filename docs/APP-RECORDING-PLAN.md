# App Recording Plan

Comprehensive plan for recording all Lunary app features with Playwright.

## 🎯 Recording Strategy

**Goal**: Create a library of demo videos showcasing every aspect of Lunary, from overview to deep dives.

**Approach**:

- **Tier 1**: Core 6 features (overview demos, 15-22s each)
- **Tier 2**: Deep dives (focused feature explorations, 20-30s each)
- **Tier 3**: Grimoire content (crystals, spells, detailed guides, 15-25s each)

---

## 📊 Tier 1: Core Features (Priority: HIGH)

These give users a comprehensive overview of Lunary's main capabilities.

### ✅ Configured Features

1. **Dashboard Overview** (`dashboard-overview`)
   - Path: `/app`
   - Duration: 18s
   - Highlights: Moon phases, Sky Now widget, daily transits, tarot cards, crystal modal
   - Status: Config complete, needs selector testing

2. **Horoscope Deep Dive** (`horoscope-deepdive`)
   - Path: `/horoscope`
   - Duration: 20s
   - Highlights: Personal numerology, universal numerology modal, transit wisdom, upcoming transits
   - Status: Config complete, needs selector testing

3. **Tarot Pattern Analysis** (`tarot-patterns`)
   - Path: `/tarot`
   - Duration: 20s
   - Highlights: Daily/weekly cards, pattern timeframes, rituals, journal prompts
   - Status: Config complete, needs selector testing

4. **Astral Guide AI** (`astral-guide`)
   - Path: `/guide`
   - Duration: 18s
   - Highlights: AI assistant, pattern analysis, chart questions
   - Status: Config complete, needs selector testing

5. **Birth Chart Walkthrough** (`birth-chart`)
   - Path: `/chart`
   - Duration: 22s
   - Highlights: Chart visualization, planetary positions, aspects, houses
   - Status: Config complete, needs selector testing

6. **Profile & Circle** (`profile-circle`)
   - Path: `/profile` → `/profile/friends/[id]`
   - Duration: 25s
   - Highlights: Circle/friends list, friend profile with all 4 tabs
     - Overview: Compatibility score, key placements
     - Synastry: Element/modality balance, aspects
     - Their Chart: Birth chart wheel and placements
     - Timing: Best connection times, shared cosmic events
   - Status: ✅ FULLY WORKING, data-testid attributes added

---

## 🔍 Tier 2: Deep Dives (Priority: MEDIUM)

Focused explorations of specific widgets and features that deserve their own spotlight.

### Widget Deep Dives

7. **Sky Now Widget Deep Dive** (`sky-now-deepdive`)
   - Path: `/app`
   - Duration: 20s
   - Focus: Expand Sky Now, show all planetary positions, current aspects, house placements
   - Why: Shows real-time cosmic weather in detail

8. **Transit Wisdom Deep Dive** (`transit-wisdom-deepdive`)
   - Path: `/horoscope`
   - Duration: 25s
   - Focus: Personalized transit interpretations based on user's chart
   - Why: Demonstrates AI-powered personalization

9. **Numerology System** (`numerology-deepdive`)
   - Path: `/horoscope`
   - Duration: 20s
   - Focus: Personal day/month/year numbers, universal numbers, meanings
   - Why: Shows unique numerology integration

10. **Tarot Transit Mapping** (`tarot-transit-mapping`)
    - Path: `/tarot`
    - Duration: 22s
    - Focus: How daily/weekly cards map to current transits
    - Why: Shows correlation between tarot and astrology

11. **Pattern Timeline Analysis** (`pattern-timeline`)
    - Path: `/tarot`
    - Duration: 25s
    - Focus: 7/14/30/90 day patterns, 6/12 month, year-over-year
    - Why: Demonstrates long-term pattern recognition

12. **Ritual System** (`ritual-system`)
    - Path: `/tarot` or `/horoscope`
    - Duration: 20s
    - Focus: Moon-phase aligned rituals, personalized suggestions
    - Why: Shows practical spiritual guidance

13. **Journal Prompts** (`journal-prompts`)
    - Path: `/tarot` or `/horoscope`
    - Duration: 18s
    - Focus: Personalized journal prompts based on current energy
    - Why: Demonstrates reflection tools

### Chart Deep Dives

14. **Aspect Grid Deep Dive** (`aspect-grid-deepdive`)
    - Path: `/chart` (aspects tab)
    - Duration: 25s
    - Focus: All aspects in chart, orbs, interpretations
    - Why: Shows comprehensive aspect analysis

15. **House System Deep Dive** (`house-system-deepdive`)
    - Path: `/chart` (houses tab)
    - Duration: 22s
    - Focus: All house placements, rulers, interpretations
    - Why: Demonstrates house system expertise

16. **Planetary Patterns** (`planetary-patterns`)
    - Path: `/chart` (patterns tab if exists)
    - Duration: 20s
    - Focus: Stelliums, grand trines, T-squares, other configurations
    - Why: Shows advanced chart pattern recognition

---

## 📚 Tier 3: Grimoire Content (Priority: MEDIUM-LOW)

Educational content showcasing the depth of Lunary's knowledge base.

### Crystal Database

17. **Crystal Categories Overview** (`crystals-overview`)
    - Path: `/grimoire/crystals`
    - Duration: 18s
    - Focus: Browse categories, show variety of crystals
    - Why: Demonstrates comprehensive crystal database

18. **Individual Crystal Deep Dive** (`crystal-detail-garnet`)
    - Path: `/grimoire/crystals/garnet` (example)
    - Duration: 20s
    - Focus: Full crystal guide - meaning, properties, chakras, uses
    - Why: Shows depth of crystal information
    - Note: Can create multiple versions for different crystals

19. **Crystal Timing & Context** (`crystal-timing`)
    - Path: `/grimoire/crystals`
    - Duration: 18s
    - Focus: "Crystals work better with timing" - contextual recommendations
    - Why: Shows intelligent crystal suggestions

### Spell Database

20. **Spell Categories Overview** (`spells-overview`)
    - Path: `/grimoire/spells`
    - Duration: 18s
    - Focus: Browse spells, filter by moon phase, show variety
    - Why: Demonstrates spell library organization

21. **Individual Spell Deep Dive** (`spell-detail-salt-circle`)
    - Path: `/grimoire/spells/salt-circle-protection` (example)
    - Duration: 25s
    - Focus: Full spell guide - purpose, timing, ingredients, steps
    - Why: Shows comprehensive spell instructions
    - Note: Can create multiple versions for different spells

22. **Moon Phase Spell Filtering** (`spell-moon-filtering`)
    - Path: `/grimoire/spells`
    - Duration: 20s
    - Focus: Filter spells by current moon phase, show optimal timing
    - Why: Demonstrates timing-based recommendations

### Additional Grimoire

23. **Grimoire Search** (`grimoire-search`)
    - Path: `/grimoire`
    - Duration: 18s
    - Focus: Search functionality across crystals, spells, guides
    - Why: Shows comprehensive search capabilities

---

## 🔐 Environment Setup

**Before recording, set up your test persona credentials:**

1. Add to `.env.local`:

```bash
PERSONA_EMAIL=your-test-account@example.com
PERSONA_PASSWORD=your-test-password
```

2. Make sure your test account:
   - Has a complete profile (name, birthday, location)
   - Has a birth chart calculated
   - Has at least 1-2 friends in their Circle
   - Has Lunary+ subscription (for recording all personalized features)

3. The Playwright recorder will automatically:
   - Authenticate using these credentials
   - Navigate to the feature page
   - Execute the recording steps
   - Save the video to `/public/app-demos/`

**Note**: These credentials are only used locally and never committed to git (`.env.local` is in `.gitignore`).

---

## 🎬 Recording Workflow

### For Each Feature:

1. **Add data-testid attributes** to key elements (see Component Checklist below)
2. **Test selectors** in browser DevTools
3. **Update recording config** in `app-feature-recordings.ts`
4. **Record with Playwright**: `pnpm record:app-features:one [feature-id]`
5. **Review video** - check timing, transitions, content visibility
6. **Adjust config** if needed - timing, selectors, scroll distances
7. **Convert to MP4**: `pnpm convert:app-demos`
8. **Archive** - move to appropriate folder (`/app-demos/tier-1/`, etc.)

### Batch Recording:

```bash
# Record all Tier 1 features
pnpm record:app-features:batch dashboard-overview horoscope-deepdive tarot-patterns astral-guide birth-chart profile-circle

# Record all Tier 2 features
pnpm record:app-features:batch sky-now-deepdive transit-wisdom-deepdive numerology-deepdive tarot-transit-mapping pattern-timeline ritual-system journal-prompts aspect-grid-deepdive house-system-deepdive planetary-patterns

# Record all Tier 3 features
pnpm record:app-features:batch crystals-overview crystal-detail-garnet crystal-timing spells-overview spell-detail-salt-circle spell-moon-filtering grimoire-search
```

---

## 📋 Component Data-TestID Checklist

Based on screenshots, these components need data-testid attributes for reliable Playwright selectors:

### Dashboard (`/app`)

- [ ] `[data-testid="moon-phase-card"]` - Moon phase widget
- [ ] `[data-testid="sky-now-widget"]` - Sky Now collapsible widget
- [ ] `[data-testid="sky-now-expand"]` - Button to expand Sky Now
- [ ] `[data-testid="planet-item"]` - Individual planet in Sky Now (add data-planet attribute too)
- [ ] `[data-testid="transit-card"]` - Daily transit cards
- [ ] `[data-testid="tarot-daily-card"]` - Daily tarot card
- [ ] `[data-testid="tarot-weekly-card"]` - Weekly tarot card
- [ ] `[data-testid="crystal-card"]` - Crystal recommendation
- [ ] `[data-testid="crystal-modal"]` - Crystal detail modal
- [ ] `[data-testid="journal-prompt"]` - Journal prompt section

### Horoscope (`/horoscope`)

- [ ] `[data-testid="personal-numerology"]` - Personal numerology section
- [ ] `[data-testid="universal-numerology"]` - Universal numerology section
- [ ] `[data-testid="numerology-modal"]` - Numerology detail modal
- [ ] `[data-testid="numerology-close"]` - Close button for modal
- [ ] `[data-testid="horoscope-patterns"]` - Pattern section
- [ ] `[data-testid="transit-wisdom"]` - Transit wisdom section
- [ ] `[data-testid="todays-aspects"]` - Today's aspects section
- [ ] `[data-testid="upcoming-transits"]` - Upcoming transits list
- [ ] `[data-testid="transit-item"]` - Individual transit in list
- [ ] `[data-testid="ritual-card"]` - Ritual suggestion

### Tarot (`/tarot`)

- [ ] `[data-testid="daily-card"]` - Daily tarot card
- [ ] `[data-testid="weekly-card"]` - Weekly tarot card
- [ ] `[data-testid="pattern-timeframe"]` - Pattern timeframe selector
- [ ] `[data-testid="pattern-7days"]` - 7 day pattern button
- [ ] `[data-testid="pattern-14days"]` - 14 day pattern button
- [ ] `[data-testid="pattern-30days"]` - 30 day pattern button
- [ ] `[data-testid="pattern-insights"]` - Pattern insights section
- [ ] `[data-testid="dominant-themes"]` - Dominant themes display
- [ ] `[data-testid="ritual-section"]` - Ritual section
- [ ] `[data-testid="journal-prompts"]` - Journal prompts section
- [ ] `[data-testid="saved-spreads"]` - Saved spreads library

### Guide (`/guide`)

- [ ] `[data-testid="guide-option-tarot"]` - Tarot patterns option
- [ ] `[data-testid="guide-option-chart"]` - Chart patterns option
- [ ] `[data-testid="guide-option-grimoire"]` - Grimoire search option
- [ ] `[data-testid="guide-input"]` - AI input field
- [ ] `[data-testid="guide-submit"]` - Submit button
- [ ] `[data-testid="guide-response"]` - AI response container
- [ ] `[data-testid="guide-message"]` - Individual message

### Birth Chart (`/chart`)

- [ ] `[data-testid="chart-visualization"]` - Main chart SVG/canvas
- [ ] `[data-testid="planet-list"]` - List of planetary positions
- [ ] `[data-testid="planet-item"]` - Individual planet (add data-planet attribute)
- [ ] `[data-testid="tab-planets"]` - Planets tab
- [ ] `[data-testid="tab-aspects"]` - Aspects tab
- [ ] `[data-testid="tab-houses"]` - Houses tab
- [ ] `[data-testid="aspect-item"]` - Individual aspect
- [ ] `[data-testid="house-item"]` - Individual house
- [ ] `[data-testid="pattern-stellium"]` - Stellium pattern
- [ ] `[data-testid="pattern-grand-trine"]` - Grand trine pattern

### Profile & Circle (`/profile`)

- [ ] `[data-testid="profile-stats"]` - User stats section
- [ ] `[data-testid="profile-info"]` - Profile information
- [ ] `[data-testid="tab-circle"]` - Circle/friends tab
- [ ] `[data-testid="circle-list"]` - Friends list
- [ ] `[data-testid="friend-card"]` - Individual friend card
- [ ] `[data-testid="circle-leaderboard"]` - Leaderboard section
- [ ] `[data-testid="synastry-comparison"]` - Synastry comparison view

### Grimoire - Crystals (`/grimoire/crystals`)

- [ ] `[data-testid="crystal-search"]` - Search input
- [ ] `[data-testid="crystal-category"]` - Category filter
- [ ] `[data-testid="crystal-list"]` - Crystal grid/list
- [ ] `[data-testid="crystal-card"]` - Individual crystal card
- [ ] `[data-testid="crystal-detail"]` - Crystal detail page
- [ ] `[data-testid="crystal-meaning"]` - Quick meaning section
- [ ] `[data-testid="crystal-properties"]` - Full properties section

### Grimoire - Spells (`/grimoire/spells`)

- [ ] `[data-testid="spell-search"]` - Search input
- [ ] `[data-testid="spell-filter"]` - Filter controls
- [ ] `[data-testid="moon-phase-indicator"]` - Current moon phase
- [ ] `[data-testid="spell-list"]` - Spell grid/list
- [ ] `[data-testid="spell-card"]` - Individual spell card
- [ ] `[data-testid="spell-detail"]` - Spell detail page
- [ ] `[data-testid="spell-purpose"]` - Purpose section
- [ ] `[data-testid="spell-timing"]` - Optimal timing section
- [ ] `[data-testid="spell-ingredients"]` - Ingredients list
- [ ] `[data-testid="spell-steps"]` - Preparation steps

---

## 🐛 Fixes Needed Before Recording

These issues need to be resolved to ensure high-quality recordings:

### Profile & Circle Features

- [ ] **Fix friend profile view** - Friend profile pages need fixes for synastry display
  - Issue: Friend synastry comparison not working properly
  - Impact: Affects `profile-circle` recording (Tier 1)
  - Priority: HIGH (blocking Tier 1 recording)

### Other Potential Issues

- [ ] **Test all URLs** - Verify all recording startUrl paths work correctly
- [ ] **Check mobile viewport** - Ensure 1080x1920 viewport displays properly
- [ ] **Verify modals** - Test that all modals open/close reliably
- [ ] **Check loading states** - Ensure data loads fast enough for recordings

---

## 🚀 Next Steps

### Pre-Recording (This Week):

1. **Fix friend profile view** for synastry (CRITICAL)
2. **Add data-testid attributes** to Tier 1 components
3. **Test all recording URLs** manually
4. **Verify selectors** in browser DevTools

### Immediate (This Week):

1. **Test Tier 1 recordings** with real app
2. **Adjust selectors** in configs based on testing
3. **Record all Tier 1 features** (6 videos)
4. **Convert to MP4** and verify quality

### Short Term (Next 2 Weeks):

1. **Add data-testid attributes** to Tier 2 components
2. **Create configs** for Tier 2 deep dives
3. **Record Tier 2 features** (10 videos)
4. **Create comparison video** system for before/after demos

### Medium Term (Next Month):

1. **Add data-testid attributes** to Grimoire components
2. **Create configs** for Tier 3 Grimoire content
3. **Record Tier 3 features** (7 videos)
4. **Create template** for easily adding new recordings

---

## 💡 Usage Ideas

Once you have this library of recordings:

1. **Social Media**: Use individual videos as standalone posts on TikTok, Instagram Reels, YouTube Shorts
2. **Comparison Videos**: Combine "before Lunary" vs "after Lunary" scenarios
3. **Feature Highlights**: Create monthly "feature spotlight" series
4. **Testimonial Overlays**: Add user testimonials over app demos
5. **Tutorial Series**: Combine multiple videos into "How to use X" tutorials
6. **Landing Page**: Embed key videos on marketing site
7. **Email Campaigns**: Include video links in onboarding/engagement emails
8. **App Store**: Use for App Store preview videos

---

## 📊 Estimated Output

- **Total Videos**: 23+ recordings
- **Total Duration**: ~7-8 minutes of unique app footage
- **Storage**: ~200-300MB total (MP4 format)
- **Recording Time**: ~4-6 hours total (including testing/adjustments)
- **Update Frequency**: Re-record after major UI changes (quarterly?)

---

## 🎯 Success Metrics

Track these to measure recording system effectiveness:

- **Recording Success Rate**: % of features that record without errors
- **Selector Stability**: How often selectors break after app updates
- **Video Engagement**: View rates, completion rates on social media
- **Conversion Impact**: Users who sign up after watching demos
- **Time Saved**: Compare to manual screen recording time
