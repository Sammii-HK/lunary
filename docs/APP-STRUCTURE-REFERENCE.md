# Lunary App Structure Reference

Complete reference guide for Lunary's app structure, pages, and features.

## 📱 App Overview

Lunary is a comprehensive astrology and spiritual guidance app that combines:

- Real-time astrological data (transits, moon phases, aspects)
- Personalized chart analysis
- Tarot pattern recognition
- AI-powered guidance
- Crystal and spell grimoire
- Social features (circle/friends with synastry)

---

## 🗺️ Page Structure

### `/app` - Dashboard

**Purpose**: Daily digest of cosmic guidance

**Key Sections**:

1. **Moon Phase Widget**
   - Current moon phase visualization
   - Moon phase calendar
   - Daily lunar guidance

2. **Sky Now Widget** (Expandable)
   - Collapsed: Quick cosmic weather overview
   - Expanded: All planetary positions with signs and houses
   - Real-time data updates

3. **Daily Transits**
   - Current transits affecting the user
   - Personalized transit interpretations
   - Click-through to detailed transit wisdom

4. **Tarot Cards**
   - Daily card with transit mapping
   - Weekly card with themes
   - Pattern insights

5. **Crystal Recommendations**
   - Daily crystal suggestion
   - Click opens detailed modal with full crystal guide
   - Contextual based on current transits

6. **Journal Prompts**
   - Personalized daily prompts
   - Based on current cosmic energy

**User Flow**:

1. User lands on dashboard → sees daily overview
2. Expands Sky Now → views all planetary positions
3. Scrolls to transits → reads personalized interpretations
4. Views tarot cards → understands daily/weekly themes
5. Clicks crystal → opens modal with full guide

---

### `/horoscope` - Horoscope & Numerology

**Purpose**: Deep personalized horoscope analysis combining numerology and astrology

**Key Sections**:

1. **Personal Numerology**
   - Personal Day Number (with modal)
   - Personal Month Number (with modal)
   - Personal Year Number (with modal)
   - Click any number → opens detailed modal with meaning and guidance

2. **Universal Numerology**
   - Universal Day Number
   - Universal Month Number
   - Universal Year Number
   - Shows collective energy themes

3. **Horoscope Patterns**
   - Identified patterns in user's current horoscope
   - Pattern-based rituals and guidance
   - AI-generated insights

4. **Transit Wisdom**
   - Personalized interpretations of current transits
   - Based on user's birth chart
   - Shows how transits affect personal placements

5. **Today's Aspects**
   - All aspects occurring today
   - Significance and timing
   - How they affect the user

6. **Upcoming Transits** (30-day view)
   - Scrollable list of upcoming transits
   - Date, transit description, significance
   - Helps with planning and preparation

7. **Solar Return Insights** (if near birthday)
   - Year-ahead predictions
   - Key themes for upcoming year

8. **Rituals Section**
   - Moon-phase aligned rituals
   - Based on current energy and patterns

**User Flow**:

1. User navigates to horoscope → sees numerology overview
2. Clicks personal day number → reads detailed meaning in modal
3. Scrolls to transit wisdom → reads personalized interpretations
4. Scrolls to upcoming transits → plans for month ahead
5. Views rituals → gets practical guidance

**Unique Features**:

- Combines numerology with astrology (unique to Lunary)
- Personalized transit interpretations (not generic horoscopes)
- 30-day forward-looking transit view

---

### `/tarot` - Tarot Patterns & Analysis

**Purpose**: Deep tarot pattern recognition and spiritual guidance

**Key Sections**:

1. **Daily & Weekly Cards**
   - Daily card with full interpretation
   - Weekly card with themes
   - Transit mapping (how cards relate to current astrology)
   - Unique feature: Cards are mapped to transits!

2. **Pattern Analysis** (Multiple Timeframes)
   - **7 days**: Short-term patterns
   - **14 days**: Two-week trends
   - **30 days**: Monthly themes
   - **90 days**: Quarterly patterns
   - **6 months**: Half-year analysis
   - **12 months**: Full year patterns
   - **Year-over-Year**: Compare to same period last year

   For each timeframe:
   - Dominant themes identified
   - Pattern interpretation
   - Recurring card analysis
   - Spiritual guidance

3. **Rituals**
   - Ritual suggestions based on current patterns
   - Moon-phase aligned
   - Actionable spiritual practices

4. **Journal Prompts**
   - Reflection prompts based on tarot patterns
   - Encourages deeper introspection
   - Connected to current energy

5. **Saved Spreads Library**
   - Historical tarot spreads
   - Can review past readings
   - Track spiritual journey over time

**User Flow**:

1. User sees daily/weekly cards → understands current energy
2. Selects pattern timeframe → views pattern analysis
3. Reads dominant themes → gains insights
4. Views rituals → gets practical actions
5. Completes journal prompts → reflects deeply

**Unique Features**:

- Pattern recognition across multiple timeframes (7 days to year-over-year)
- Transit mapping for tarot (connects astrology and tarot)
- Saved spreads library for historical tracking

---

### `/guide` - Astral Guide (AI Assistant)

**Purpose**: AI-powered spiritual and astrological guidance

**Capabilities**:

1. **Tarot Pattern Analysis**
   - Ask questions about tarot patterns
   - "What patterns do you see in my recent cards?"
   - "What does this recurring theme mean?"

2. **Chart Pattern Analysis**
   - Ask about birth chart patterns
   - "Explain my Sun-Moon aspect"
   - "What does my stellium mean?"

3. **Grimoire Search**
   - Search crystals and spells database
   - "What crystal is good for protection?"
   - "Show me spells for the full moon"

4. **Journaling Assistance**
   - Guided reflection
   - Prompt generation
   - Insight interpretation

**User Flow**:

1. User selects mode (tarot/chart/grimoire/journal)
2. Types question in chat interface
3. AI responds with personalized guidance
4. User can ask follow-up questions

**Unique Features**:

- Context-aware (knows user's chart, recent cards, etc.)
- Multi-modal (can help with different types of spiritual work)
- Conversational and iterative

---

### `/chart` - Birth Chart Analysis

**Purpose**: Comprehensive natal chart analysis

**Key Sections**:

1. **Chart Visualization**
   - Full birth chart wheel
   - Interactive elements
   - Planetary positions visible

2. **Planets Tab**
   - All planetary placements
   - Sign, degree, house for each planet
   - Interpretations available

3. **Aspects Tab**
   - All aspects in birth chart
   - Aspect types (conjunction, sextile, square, trine, opposition)
   - Orbs displayed
   - Interpretations for each aspect

4. **Houses Tab**
   - All 12 houses
   - House cusps and signs
   - House rulers
   - Planets in each house

5. **Patterns Tab** (if exists)
   - Chart patterns identified:
     - Stelliums (3+ planets in same sign/house)
     - Grand Trines
     - T-Squares
     - Yods
     - Grand Crosses
   - Pattern interpretations
   - Significance in life

**User Flow**:

1. User views chart visualization → understands overall chart structure
2. Switches to Planets tab → reviews all placements
3. Switches to Aspects tab → understands planetary relationships
4. Switches to Houses tab → sees life area themes
5. Switches to Patterns tab → identifies major chart configurations

**Unique Features**:

- Comprehensive aspect analysis with orbs
- Pattern recognition (stelliums, grand trines, etc.)
- Interactive chart with tooltips/modals

---

### `/profile` - Profile & Circle

**Purpose**: User profile and social features with synastry

**Key Sections**:

1. **Profile Stats**
   - User name
   - Sun, Moon, Rising signs
   - Birth details
   - Account stats

2. **Circle Tab** (Friends/Social)
   - Friends list
   - Circle leaderboard (gamification)
   - Add friends functionality
   - View friend profiles

3. **Friend Profile View** (⚠️ NEEDS FIX)
   - Friend's chart overview
   - **Synastry Comparison**:
     - Dual chart visualization
     - Synastry aspects between charts
     - Compatibility insights
     - Relationship dynamics
   - **Issue**: Synastry comparison not working properly
   - **Priority**: HIGH (blocking recording)

**User Flow**:

1. User views their profile → sees chart summary
2. Switches to Circle tab → views friends list
3. Clicks on friend → views friend's profile
4. Views synastry → understands relationship compatibility (when fixed)

**Unique Features**:

- Social astrology (rare in astrology apps)
- Synastry comparison for relationships
- Circle leaderboard for engagement

**Known Issues**:

- [ ] Friend profile synastry view needs fixes
- [ ] Ensure dual chart displays correctly
- [ ] Fix synastry aspect calculations if broken

---

### `/grimoire/crystals` - Crystal Database

**Purpose**: Comprehensive crystal reference and guidance

**Key Sections**:

1. **Daily Selection**
   - Contextual recommendation system
   - "Select crystals based on your daily intentions and needs"

2. **Search**
   - Search by name
   - Search by properties
   - Search by intention

3. **Categories**
   - Protection & Grounding
   - Love & Heart Healing
   - Spiritual & Intuitive
   - Manifestation & Abundance
   - Healing & Wellness
   - Communication & Clarity
   - Creativity & Inspiration
   - Balance & Harmony

4. **Crystal List**
   - All crystals in database
   - Preview cards with quick descriptions
   - Click through to full crystal guide

5. **Crystal Detail Pages** (e.g., `/grimoire/crystals/garnet`)
   - Full crystal name and description
   - **Quick Meaning**: One-sentence summary
   - **"Crystals work better with timing"**: Contextual note
   - **What is [Crystal]?**: Detailed background
   - **Meaning**: Full spiritual and energetic properties
   - Associations (chakras, elements, planets, zodiac)
   - How to use
   - When to use (timing guidance)

**Content Characteristics**:

- "In Lunary, crystal correspondences are contextual rather than prescriptive"
- Emphasis on timing and context (unique approach)
- Comprehensive but not overwhelming

**User Flow**:

1. User browses categories → finds crystal by intention
2. Clicks crystal card → reads full guide
3. Understands properties, timing, usage
4. Integrates crystal into practice

---

### `/grimoire/spells` - Spell Database

**Purpose**: Ritual and spell guidance with timing

**Key Sections**:

1. **Context Message**
   - "...and create sacred space. Remember that magic works best when aligned with ethical principles and genuine need."
   - Sets ethical tone

2. **Current Moon Phase Indicator**
   - Shows current moon phase
   - "Certain spells work best during specific moon phases..."
   - Helps users choose appropriate spells

3. **Search**
   - Search by name
   - Search by purpose
   - Search by category

4. **Filters**
   - All Spells
   - Current Moon Phase (smart filter)
   - Protection
   - Love & Relationships
   - Prosperity & Abundance
   - Healing & Wellness
   - Cleansing & Purification

5. **Spell Cards**
   - Spell name with icon
   - Difficulty level (beginner/intermediate/advanced)
   - Duration (e.g., "15-20 minutes")
   - Category
   - Quick description
   - Optimal moon phases (badges)

6. **Spell Detail Pages** (e.g., `/grimoire/spells/salt-circle-protection`)
   - Full spell name and description
   - **"Rituals are most effective when aligned with timing and personal cycles"**
   - **⭐ Purpose**: What the spell does
   - **🌙 Optimal Timing**:
     - Moon phases (e.g., "New Moon, Waxing Crescent, Full Moon")
     - Time of day (e.g., "any", "evening", "dawn")
   - **🔮 Ingredients**:
     - Full ingredient list
     - Amounts
     - Purpose of each ingredient
     - Substitutes available
   - **Tools Needed**: Required tools
   - **Preparation Steps**: Numbered step-by-step instructions

**Content Characteristics**:

- Detailed instructions (not vague)
- Timing guidance (moon phases, time of day)
- Ingredient substitutions (practical)
- Ethical framing

**User Flow**:

1. User checks current moon phase → sees appropriate spells
2. Filters by intention → finds relevant spell
3. Clicks spell → reads full guide
4. Gathers ingredients → follows steps
5. Performs ritual with proper timing

**Unique Features**:

- Moon phase filtering and recommendations
- Detailed ingredient lists with substitutes
- Ethical and contextual approach
- "Timing is half the spell" philosophy

---

## 🎯 Key App Philosophies

### 1. Contextual vs. Prescriptive

"In Lunary, crystal correspondences are contextual rather than prescriptive."

- Guidance adapts to user's unique situation
- Not one-size-fits-all advice

### 2. Timing is Essential

"Crystals/rituals/magic works best when aligned with timing and personal cycles."

- Moon phases matter
- Personal cycles matter
- Astrological timing integrated throughout

### 3. Integration of Modalities

- Astrology + Tarot (transit mapping)
- Astrology + Numerology (horoscope page)
- Crystals + Astrology (contextual recommendations)
- Spells + Moon phases (timing)

### 4. Personalization

- Uses user's birth chart for all interpretations
- Transit wisdom based on personal placements
- Horoscope combines universal and personal
- AI guide knows user's context

### 5. Pattern Recognition

- Tarot patterns across multiple timeframes
- Chart pattern identification (stelliums, etc.)
- Recurring themes highlighted
- Historical tracking (saved spreads)

---

## 📊 Data Flow

### User Birth Data → Chart Calculation

1. User enters birth date, time, location
2. System calculates natal chart
3. Stores planetary positions, houses, aspects

### Current Time → Real-Time Transits

1. System fetches current planetary positions
2. Calculates transits to user's natal chart
3. Generates personalized transit interpretations

### Tarot Draws → Pattern Analysis

1. User draws daily/weekly cards
2. System stores card history
3. Analyzes patterns across timeframes
4. Maps cards to current transits

### AI Guide → Contextual Responses

1. User asks question
2. System provides user context (chart, recent cards, etc.)
3. AI generates personalized response
4. Can query grimoire database

---

## 🎨 UI/UX Patterns

### Dark Theme

- Primary background: Dark black/navy
- Text: Light gray/white
- Accents: Purple/pink gradients
- Mystical, spiritual aesthetic

### Interactive Elements

- Cards are clickable → expand to details
- Modals for detailed info (numerology, crystals)
- Expandable widgets (Sky Now)
- Tabs for different views (chart tabs, profile tabs)

### Information Hierarchy

1. **Overview** (dashboard) → Quick daily digest
2. **Deep Dives** (horoscope, tarot, chart) → Detailed analysis
3. **Reference** (grimoire) → Educational content
4. **Tools** (guide, journal) → Interactive utilities
5. **Social** (profile/circle) → Community features

### Navigation

- Bottom nav (mobile): Home, Tarot, Horoscope, Guide, More
- Top nav (desktop): Main sections accessible
- Breadcrumbs in grimoire: Home > Grimoire > Crystals > Garnet

---

## 🚀 Unique Selling Points

### What Makes Lunary Different:

1. **Transit Mapping for Tarot**: Maps tarot cards to current astrological transits (unique!)
2. **Numerology + Astrology**: Integrated horoscope combining both systems
3. **Multi-Timeframe Pattern Analysis**: Tarot patterns from 7 days to year-over-year
4. **Contextual Grimoire**: Crystals and spells recommended based on current transits
5. **AI-Powered Guidance**: Astral Guide with full context of user's data
6. **Social Astrology**: Synastry comparisons with friends
7. **Timing-Focused**: Everything emphasizes optimal timing
8. **Personalized Everything**: All interpretations based on user's unique chart

---

## 📝 Content Types

### Generated Content:

- Daily transit interpretations (AI)
- Tarot pattern analyses (AI)
- Horoscope patterns and rituals (AI)
- Journal prompts (AI)
- Crystal recommendations (algorithm + AI)

### Static Content:

- Birth chart calculations (astronomical)
- Grimoire database (crystals, spells)
- Core astrological data (sign meanings, etc.)

### User-Generated Content:

- Saved tarot spreads
- Journal entries
- Birth chart data
- Circle connections

---

## 🔮 Future Expansion Ideas

Based on current structure, potential additions:

1. **Progressive Aspects** tracking (beyond transits)
2. **Solar/Lunar Returns** detailed analysis
3. **Relocation Charts** for travelers
4. **Composite Charts** for relationships (beyond synastry)
5. **Electional Astrology** for timing decisions
6. **Asteroid Analysis** (Chiron, Lilith, etc.)
7. **More Grimoire Content**: Herbs, Essential Oils, Moon Rituals
8. **Guided Meditations** aligned with transits
9. **Community Features**: Share spreads, discuss patterns
10. **Integration with Wearables**: Track moods vs. transits

---

## 🎬 Recording Priority Features

### Must-Have (Tier 1):

1. Dashboard overview - Shows the daily digest flow
2. Horoscope with numerology - Shows unique integration
3. Tarot patterns - Shows pattern recognition power
4. Astral Guide - Shows AI capability
5. Birth Chart - Shows comprehensive analysis
6. Profile/Circle - Shows social features (after fix)

### Should-Have (Tier 2):

7. Sky Now expansion - Shows real-time data
8. Transit wisdom - Shows personalization
9. Numerology modals - Shows depth
10. Tarot timeframes - Shows pattern analysis
11. Chart patterns - Shows advanced features

### Nice-to-Have (Tier 3):

12. Grimoire overview - Shows content breadth
13. Crystal deep dives - Shows knowledge depth
14. Spell deep dives - Shows ritual guidance
15. Timing features - Shows strategic advantage

---

## 💾 Technical Notes

### Pages (Next.js App Router):

- `/app/app/page.tsx` - Dashboard
- `/app/horoscope/page.tsx` - Horoscope
- `/app/tarot/page.tsx` - Tarot
- `/app/guide/page.tsx` - Astral Guide
- `/app/chart/page.tsx` - Birth Chart
- `/app/profile/page.tsx` - Profile/Circle
- `/app/grimoire/crystals/page.tsx` - Crystals
- `/app/grimoire/spells/page.tsx` - Spells

### Key Components:

- `MoonPhaseWidget` - Dashboard moon display
- `SkyNowWidget` - Expandable planet positions
- `TransitCard` - Transit display component
- `TarotCard` - Card display component
- `NumerologyCard` - Numerology display with modal
- `PatternAnalysis` - Tarot pattern timeframe selector
- `AstralGuide` - AI chat interface
- `BirthChart` - Chart SVG visualization
- `SynastryComparison` - Dual chart comparison (needs fix)

### Data Sources:

- Swiss Ephemeris (planetary positions)
- Custom tarot deck data
- Grimoire content database (crystals, spells)
- User birth data (from profile)
- OpenAI (AI-generated interpretations)

---

This document serves as the single source of truth for Lunary's app structure. Use it when:

- Planning new features
- Creating demo videos
- Onboarding new team members
- Writing documentation
- Designing marketing materials
