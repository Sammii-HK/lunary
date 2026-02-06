# Component Data-TestID Mapping

Reference guide for adding data-testid attributes to Lunary components based on actual app screenshots.

## 🎯 Purpose

This document maps every interactive element shown in the app screenshots to the specific components that need data-testid attributes for Playwright automation.

---

## 📱 Dashboard Page (`/app`)

**Status**: ✅ WORKING - data-testid attributes added to all components

### Moon Phase Card

**Component**: `src/components/compact/MoonPreview.tsx`

```tsx
// Main moon phase card (expandable)
<ExpandableCard
  data-testid='moon-phase-card'
  preview={preview}
  expanded={expanded}
>
  {/* Shows current moon phase, sign, illumination */}
  {/* Expands to show zodiac info, guidance, and recommended spells */}
</ExpandableCard>
```

### Sky Now Widget

**Component**: `src/components/compact/SkyNowCard.tsx`

```tsx
// Main collapsible Sky Now widget
<ExpandableCard
  data-testid='sky-now-widget'
  preview={preview}
  expanded={expanded}
>
  {/* Preview: grid of planet symbols */}
  <div className='grid grid-cols-10'>
    {planets.map((planet) => (
      <div data-testid='planet-item' data-planet={planet.body}>
        {/* Planet symbol and zodiac sign */}
      </div>
    ))}
  </div>

  {/* Expanded view: detailed planet list */}
  <div data-testid='sky-now-expand'>
    {planets.map((planet) => (
      <div data-testid='planet-item' data-planet={planet.body}>
        {/* Planet name, sign, degree, house, retrograde status */}
      </div>
    ))}
  </div>
</ExpandableCard>
```

### Transit of the Day

**Component**: `src/components/TransitOfTheDay.tsx`

```tsx
// Shows next significant transit
<Link href='/horoscope' data-testid='transit-card'>
  {/* Transit planet, event, timing, personalized guidance */}
</Link>
```

### Daily Tarot Card

**Component**: `src/components/compact/DailyCardPreview.tsx`

```tsx
// Daily tarot card with personalized reading
<Link href='/tarot' data-testid='tarot-daily-card'>
  {/* Card name, keywords, personalized connection to chart */}
</Link>
```

### Crystal Recommendation

**Component**: `src/components/compact/CrystalModal.tsx`

```tsx
// Crystal card that opens modal
<div
  data-testid="crystal-card"
  onClick={() => setIsModalOpen(true)}
>
  {/* Crystal name and reason for recommendation */}
</div>

// Crystal detail modal
<div data-testid="crystal-modal">
  {/* Modal content: crystal name, intention, properties, chakra */}
</div>
```

### Today's Influence (Daily Insight)

**Component**: `src/components/compact/DailyInsightCard.tsx`

```tsx
// Daily personalized insight based on transits
<Link href='/horoscope' data-testid='journal-prompt'>
  {/* Today's influence text with transit timings */}
  {/* Transit aspect short bios */}
  {/* Life theme connection (if available) */}
</Link>
```

---

## 🔮 Horoscope Page (`/horoscope`)

### Numerology Cards

```tsx
// Component: NumerologyCards
<div data-testid="numerology-section">
  <div data-testid="personal-numerology">
    <h3>Personal Numbers</h3>
    <div
      data-testid="numerology-day"
      onClick={() => openNumerologyModal('day')}
    >
      Day: {personalDay}
    </div>
    <div
      data-testid="numerology-month"
      onClick={() => openNumerologyModal('month')}
    >
      Month: {personalMonth}
    </div>
    <div
      data-testid="numerology-year"
      onClick={() => openNumerologyModal('year')}
    >
      Year: {personalYear}
    </div>
  </div>

  <div data-testid="universal-numerology">
    <h3>Universal Numbers</h3>
    {/* Same structure as personal */}
  </div>
</div>

// Numerology Modal
<Dialog open={isOpen}>
  <DialogContent data-testid="numerology-modal">
    <DialogClose data-testid="numerology-close" />
    <h2 data-testid="numerology-modal-title">{type} Number</h2>
    <div data-testid="numerology-modal-content">
      {/* Detailed numerology explanation */}
    </div>
  </DialogContent>
</Dialog>
```

### Horoscope Patterns

```tsx
// Component: HoroscopePatterns
<div data-testid='horoscope-patterns-section'>
  <h3>Patterns in Your Horoscope</h3>
  <div data-testid='pattern-list'>
    {patterns.map((pattern) => (
      <div
        key={pattern.id}
        data-testid='pattern-card'
        data-pattern-id={pattern.id}
      >
        {pattern.title}
      </div>
    ))}
  </div>
</div>
```

### Transit Wisdom

```tsx
// Component: TransitWisdom
<div data-testid='transit-wisdom-section'>
  <h3>Transit Wisdom</h3>
  <div data-testid='transit-wisdom-content'>
    <p data-testid='transit-wisdom-text'>{wisdom.text}</p>
  </div>
</div>
```

### Today's Aspects

```tsx
// Component: TodaysAspects
<div data-testid='todays-aspects-section'>
  <h3>Today's Aspects</h3>
  {aspects.map((aspect) => (
    <div key={aspect.id} data-testid='aspect-card' data-aspect-id={aspect.id}>
      {aspect.planet1} {aspect.type} {aspect.planet2}
    </div>
  ))}
</div>
```

### Upcoming Transits

```tsx
// Component: UpcomingTransits
<div data-testid='upcoming-transits-section'>
  <h3>Upcoming Transits (Next 30 Days)</h3>
  <div data-testid='upcoming-transits-list'>
    {transits.map((transit) => (
      <div
        key={transit.id}
        data-testid='transit-item'
        data-transit-date={transit.date}
      >
        <span data-testid='transit-date'>{transit.date}</span>
        <span data-testid='transit-description'>{transit.description}</span>
      </div>
    ))}
  </div>
</div>
```

### Rituals Section

```tsx
// Component: RitualSuggestions
<div data-testid='ritual-section'>
  <h3>Rituals for Today</h3>
  {rituals.map((ritual) => (
    <div key={ritual.id} data-testid='ritual-card' data-ritual-id={ritual.id}>
      <h4 data-testid='ritual-title'>{ritual.title}</h4>
      <p data-testid='ritual-description'>{ritual.description}</p>
    </div>
  ))}
</div>
```

---

## 🃏 Tarot Page (`/tarot`)

### Daily/Weekly Cards

```tsx
// Component: TarotCards
<div data-testid='tarot-cards-main'>
  <div data-testid='daily-card-full'>
    <img data-testid='daily-card-image' src={daily.image} />
    <h3 data-testid='daily-card-name'>{daily.name}</h3>
    <p data-testid='daily-card-meaning'>{daily.meaning}</p>
    <p data-testid='daily-card-transit'>{daily.transitMapping}</p>
  </div>

  <div data-testid='weekly-card-full'>{/* Same structure */}</div>
</div>
```

### Pattern Analysis

```tsx
// Component: PatternAnalysis
<div data-testid='pattern-analysis-section'>
  <h3>Pattern Analysis</h3>

  {/* Timeframe Selector */}
  <div data-testid='pattern-timeframe-selector'>
    <button data-testid='pattern-7days' onClick={() => setTimeframe('7days')}>
      7 Days
    </button>
    <button data-testid='pattern-14days' onClick={() => setTimeframe('14days')}>
      14 Days
    </button>
    <button data-testid='pattern-30days' onClick={() => setTimeframe('30days')}>
      30 Days
    </button>
    <button data-testid='pattern-90days' onClick={() => setTimeframe('90days')}>
      90 Days
    </button>
    <button
      data-testid='pattern-6months'
      onClick={() => setTimeframe('6months')}
    >
      6 Months
    </button>
    <button
      data-testid='pattern-12months'
      onClick={() => setTimeframe('12months')}
    >
      12 Months
    </button>
    <button data-testid='pattern-yoy' onClick={() => setTimeframe('yoy')}>
      Year Over Year
    </button>
  </div>

  {/* Pattern Results */}
  <div data-testid='pattern-insights'>
    <h4 data-testid='dominant-themes-title'>Dominant Themes</h4>
    <div data-testid='dominant-themes'>
      {themes.map((theme) => (
        <span key={theme} data-testid='theme-tag'>
          {theme}
        </span>
      ))}
    </div>

    <div data-testid='pattern-interpretation'>{interpretation}</div>
  </div>
</div>
```

### Rituals & Journal Prompts

```tsx
// Component: TarotRitualsAndPrompts
<div data-testid='rituals-prompts-section'>
  <div data-testid='ritual-section-tarot'>
    <h3>Rituals</h3>
    {rituals.map((ritual) => (
      <div key={ritual.id} data-testid='ritual-card-tarot'>
        {ritual.title}
      </div>
    ))}
  </div>

  <div data-testid='journal-prompts-section'>
    <h3>Journal Prompts</h3>
    {prompts.map((prompt) => (
      <div key={prompt.id} data-testid='journal-prompt-card'>
        {prompt.text}
      </div>
    ))}
  </div>
</div>
```

### Saved Spreads

```tsx
// Component: SavedSpreads
<div data-testid='saved-spreads-section'>
  <h3>Saved Spreads</h3>
  <div data-testid='saved-spreads-list'>
    {spreads.map((spread) => (
      <div
        key={spread.id}
        data-testid='saved-spread-card'
        data-spread-id={spread.id}
      >
        <h4 data-testid='spread-title'>{spread.title}</h4>
        <p data-testid='spread-date'>{spread.date}</p>
      </div>
    ))}
  </div>
</div>
```

---

## 🤖 Guide Page (`/guide`)

### Guide Options

```tsx
// Component: AstralGuide
<div data-testid='astral-guide'>
  <h2>Astral Guide</h2>

  {/* Option Buttons */}
  <div data-testid='guide-options'>
    <button data-testid='guide-option-tarot' onClick={() => setMode('tarot')}>
      Tarot Patterns
    </button>
    <button data-testid='guide-option-chart' onClick={() => setMode('chart')}>
      Chart Patterns
    </button>
    <button
      data-testid='guide-option-grimoire'
      onClick={() => setMode('grimoire')}
    >
      Grimoire Search
    </button>
    <button
      data-testid='guide-option-journal'
      onClick={() => setMode('journal')}
    >
      Journaling
    </button>
  </div>

  {/* Chat Interface */}
  <div data-testid='guide-chat'>
    <div data-testid='guide-messages'>
      {messages.map((msg) => (
        <div
          key={msg.id}
          data-testid='guide-message'
          data-message-type={msg.type}
        >
          {msg.content}
        </div>
      ))}
    </div>

    <div data-testid='guide-response' />

    <form onSubmit={handleSubmit} data-testid='guide-form'>
      <textarea data-testid='guide-input' placeholder='Ask your question...' />
      <button type='submit' data-testid='guide-submit'>
        Send
      </button>
    </form>
  </div>
</div>
```

---

## 🌟 Birth Chart Page (`/chart`)

### Chart Visualization

```tsx
// Component: BirthChart
<div data-testid='birth-chart-page'>
  <div data-testid='chart-visualization'>
    <svg data-testid='chart-svg'>{/* SVG chart content */}</svg>
  </div>

  {/* Tabs */}
  <div data-testid='chart-tabs'>
    <button data-testid='tab-planets' onClick={() => setTab('planets')}>
      Planets
    </button>
    <button data-testid='tab-aspects' onClick={() => setTab('aspects')}>
      Aspects
    </button>
    <button data-testid='tab-houses' onClick={() => setTab('houses')}>
      Houses
    </button>
    <button data-testid='tab-patterns' onClick={() => setTab('patterns')}>
      Patterns
    </button>
  </div>

  {/* Content based on active tab */}
  {tab === 'planets' && (
    <div data-testid='planets-list'>
      {planets.map((planet) => (
        <div
          key={planet.name}
          data-testid='planet-item'
          data-planet={planet.name.toLowerCase()}
        >
          <span data-testid='planet-name'>{planet.name}</span>
          <span data-testid='planet-sign'>{planet.sign}</span>
          <span data-testid='planet-degree'>{planet.degree}°</span>
          <span data-testid='planet-house'>House {planet.house}</span>
        </div>
      ))}
    </div>
  )}

  {tab === 'aspects' && (
    <div data-testid='aspects-list'>
      {aspects.map((aspect) => (
        <div
          key={aspect.id}
          data-testid='aspect-item'
          data-aspect-type={aspect.type}
        >
          <span data-testid='aspect-planets'>
            {aspect.planet1} {aspect.symbol} {aspect.planet2}
          </span>
          <span data-testid='aspect-orb'>{aspect.orb}°</span>
        </div>
      ))}
    </div>
  )}

  {tab === 'houses' && (
    <div data-testid='houses-list'>
      {houses.map((house, idx) => (
        <div key={idx} data-testid='house-item' data-house-number={idx + 1}>
          <span data-testid='house-number'>House {idx + 1}</span>
          <span data-testid='house-sign'>{house.sign}</span>
          <span data-testid='house-ruler'>{house.ruler}</span>
        </div>
      ))}
    </div>
  )}

  {tab === 'patterns' && (
    <div data-testid='patterns-list'>
      {patterns.map((pattern) => (
        <div
          key={pattern.id}
          data-testid='pattern-item'
          data-pattern-type={pattern.type}
        >
          <h4 data-testid='pattern-type'>{pattern.type}</h4>
          <p data-testid='pattern-description'>{pattern.description}</p>
        </div>
      ))}
    </div>
  )}
</div>
```

---

## 👤 Profile & Circle Page (`/profile`)

### Profile Stats

````tsx
// Component: ProfilePage
<div data-testid="profile-page">
  <div data-testid="profile-stats">
    <h2 data-testid="profile-name">{user.name}</h2>
    <div data-testid="profile-chart-info">
      <span data-testid="sun-sign">{user.sunSign}</span>
      <span data-testid="moon-sign">{user.moonSign}</span>
      <span data-testid="rising-sign">{user.risingSign}</span>
    </div>
  </div>

  {/* Tabs */}
  <div data-testid="profile-tabs">
    <button
      data-testid="tab-profile"
      onClick={() => setTab('profile')}
    >
      Profile
    </button>
    <button
      data-testid="tab-circle"
      onClick={() => setTab('circle')}
    >
      Circle
    </button>
  </div>

  {/* Circle Tab */}
  {tab === 'circle' && (
    <div data-testid="circle-section">
      <h3>Your Circle</h3>

      <div data-testid="circle-leaderboard">
        {/* Leaderboard content */}
      </div>

      <div data-testid="circle-list">
        {friends.map(friend => (
          <div
            key={friend.id}
            data-testid="friend-card"
            data-friend-id={friend.id}
            onClick={() => viewFriend(friend.id)}
          >
            <h4 data-testid="friend-name">{friend.name}</h4>
            <p data-testid="friend-signs">
              {friend.sunSign} ☉ {friend.moonSign} ☽ {friend.risingSign} ↑
            </p>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

---

## 👥 Friend Profile Page (`/profile/friends/[id]`) ✅ WORKING

**Main Container:**
```tsx
<div data-testid="friend-profile-page">
  {/* Header */}
  <button data-testid="back-to-circle">Back to Circle</button>

  <div data-testid="friend-profile-header">
    <div data-testid="friend-avatar">{/* Avatar */}</div>
    <h1>{friend.name}</h1>

    {/* Compatibility score in header */}
    <div data-testid="compatibility-score-header">
      <div data-testid="compatibility-score">{score}%</div>
    </div>
  </div>

  {/* Tab Navigation */}
  <div data-testid="friend-profile-tabs">
    <button data-testid="tab-overview">Overview</button>
    <button data-testid="tab-synastry">Synastry</button>
    <button data-testid="tab-chart">Their Chart</button>
    <button data-testid="tab-timing">Timing</button>
  </div>

  {/* Overview Tab */}
  <div data-testid="overview-tab-content">
    <div data-testid="overview-compatibility">
      <h3>Compatibility Overview</h3>
      <div>{score}% Match</div>
      <p>{summary}</p>
      <button data-testid="view-full-synastry">View Full Synastry</button>
    </div>

    <div data-testid="key-placements">
      <h3>{friend.name}'s Key Placements</h3>
      <div data-testid="key-placements-grid">
        {/* Shows: Sun, Moon, Ascendant, Venus, Mars */}
        {keyPlacements.map(placement => (
          <div key={placement.body}>
            {placement.body} in {placement.sign}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Synastry Tab */}
  <div data-testid="synastry-tab-content">
    <div data-testid="synastry-score-section">
      <div data-testid="synastry-compatibility-score">{score}%</div>
      <p>{summary}</p>
    </div>

    <div data-testid="synastry-element-balance">
      <h3>Element Balance</h3>
      <div data-testid="element-balance-grid">
        {/* Shows: Fire, Earth, Air, Water with counts */}
      </div>
    </div>

    <div data-testid="synastry-modality-balance">
      <h3>Modality Balance</h3>
      <div data-testid="modality-balance-grid">
        {/* Shows: Cardinal, Fixed, Mutable with counts */}
      </div>
    </div>

    <div data-testid="synastry-aspects-section">
      <h3>Aspects</h3>
      <div data-testid="harmonious-aspects">
        <h4>Harmonious (19)</h4>
        {/* Trines, sextiles, beneficial conjunctions */}
      </div>
      <div data-testid="challenging-aspects">
        <h4>Challenging (12)</h4>
        {/* Squares, oppositions, difficult aspects */}
      </div>
      <button data-testid="toggle-all-aspects">Show All Aspects</button>
    </div>
  </div>

  {/* Their Chart Tab */}
  <div data-testid="chart-tab-content">
    <div data-testid="chart-view-toggle">
      <button data-testid="chart-wheel-button">Chart Wheel</button>
      <button data-testid="placements-list-button">Placements List</button>
    </div>

    {/* Chart wheel shows full natal chart visualization */}
    {/* Placements list shows categorized planets */}
  </div>

  {/* Timing Tab */}
  <div data-testid="timing-tab-content">
    <div data-testid="timing-windows">
      <h3>Best Times to Connect</h3>
      {/* Shows optimal timing windows or "No optimal timing windows found" */}
    </div>

    <div data-testid="shared-cosmic-events">
      <h3>Shared Cosmic Events</h3>
      {/* Shows: New Moons, Full Moons, significant transits */}
    </div>
  </div>
</div>
````

**Notes:**

- All 4 tabs fully implemented and working
- Overview: Shows compatibility score and key placements
- Synastry: Full compatibility analysis with elements, modalities, and aspects
- Their Chart: Complete birth chart with wheel and list views
- Timing: Optimal connection times and shared lunar events

---

## 📚 Grimoire - Crystals (`/grimoire/crystals`)

### Crystal List

```tsx
// Component: CrystalsPage
<div data-testid='crystals-page'>
  <h2>Crystals</h2>
  <p data-testid='crystals-subtitle'>healing and magic</p>

  {/* Daily Selection */}
  <div data-testid='daily-selection'>
    <h3>Daily Selection</h3>
    <p data-testid='daily-selection-text'>
      Select crystals based on your daily intentions and needs...
    </p>
  </div>

  {/* Search */}
  <input
    data-testid='crystal-search'
    placeholder='Search crystals by name, properties...'
  />

  {/* Categories */}
  <div data-testid='crystal-categories'>
    <h3>Crystal Categories</h3>
    <button data-testid='category-protection'>Protection & Grounding</button>
    <button data-testid='category-love'>Love & Heart Healing</button>
    <button data-testid='category-spiritual'>Spiritual & Intuitive</button>
    <button data-testid='category-manifestation'>
      Manifestation & Abundance
    </button>
    <button data-testid='category-healing'>Healing & Wellness</button>
    <button data-testid='category-communication'>
      Communication & Clarity
    </button>
    <button data-testid='category-creativity'>Creativity & Inspiration</button>
    <button data-testid='category-balance'>Balance & Harmony</button>
  </div>

  {/* Crystal List */}
  <div data-testid='crystal-list'>
    {crystals.map((crystal) => (
      <div
        key={crystal.slug}
        data-testid='crystal-card'
        data-crystal-slug={crystal.slug}
        onClick={() => navigate(`/grimoire/crystals/${crystal.slug}`)}
      >
        <h4 data-testid='crystal-name'>{crystal.name}</h4>
        <p data-testid='crystal-quick-description'>
          {crystal.quickDescription}
        </p>
      </div>
    ))}
  </div>
</div>
```

### Crystal Detail Page

```tsx
// Component: CrystalDetailPage
<div data-testid='crystal-detail-page'>
  <h1 data-testid='crystal-detail-title'>
    {crystal.name} Crystal: Complete Guide
  </h1>

  <div data-testid='crystal-context-note'>
    In Lunary, crystal correspondences are contextual rather than prescriptive.
  </div>

  <div data-testid='crystal-quick-meaning'>
    <h3>Quick Meaning</h3>
    <p data-testid='crystal-meaning-text'>{crystal.quickMeaning}</p>
  </div>

  <div data-testid='crystal-timing-note'>
    <p>Crystals work better with timing.</p>
  </div>

  <div data-testid='crystal-what-is'>
    <h3>What is {crystal.name}?</h3>
    <div data-testid='crystal-description'>{crystal.description}</div>
  </div>

  <div data-testid='crystal-meaning-section'>
    <h3>Meaning</h3>
    <div data-testid='crystal-detailed-meaning'>{crystal.detailedMeaning}</div>
  </div>
</div>
```

---

## 📚 Grimoire - Spells (`/grimoire/spells`)

### Spell List

```tsx
// Component: SpellsPage
<div data-testid='spells-page'>
  <h2>Spells</h2>

  {/* Context Message */}
  <div data-testid='spells-context'>
    <p>
      and create sacred space. Remember that magic works best when aligned with
      ethical principles and genuine need.
    </p>
  </div>

  {/* Moon Phase Indicator */}
  <div data-testid='current-moon-phase'>
    <span>🌙 Current Moon Phase: </span>
    <span data-testid='moon-phase-name'>Waning Crescent</span>
    <p data-testid='moon-phase-note'>
      Certain spells work best during specific moon phases...
    </p>
  </div>

  {/* Search */}
  <input
    data-testid='spell-search'
    placeholder='Search spells by name, purpose, or category...'
  />

  {/* Filters */}
  <div data-testid='spell-filters'>
    <button data-testid='filter-all'>All Spells</button>
    <button data-testid='filter-moon-phase'>Current Moon Phase</button>
    <button data-testid='filter-protection'>Protection</button>
    <button data-testid='filter-love'>Love & Relationships</button>
    <button data-testid='filter-prosperity'>Prosperity & Abundance</button>
    <button data-testid='filter-healing'>Healing & Wellness</button>
    <button data-testid='filter-cleansing'>Cleansing & Purification</button>
  </div>

  {/* Spell List */}
  <div data-testid='spell-list'>
    {spells.map((spell) => (
      <div
        key={spell.slug}
        data-testid='spell-card'
        data-spell-slug={spell.slug}
        onClick={() => navigate(`/grimoire/spells/${spell.slug}`)}
      >
        <div data-testid='spell-icon'>{spell.icon}</div>
        <h4 data-testid='spell-name'>{spell.name}</h4>
        <span data-testid='spell-difficulty'>{spell.difficulty}</span>
        <p data-testid='spell-quick-description'>{spell.description}</p>
        <div data-testid='spell-timing'>
          <span data-testid='spell-duration'>{spell.duration}</span>
          <span data-testid='spell-category'>{spell.category}</span>
        </div>
        <div data-testid='spell-moon-phases'>
          {spell.moonPhases.map((phase) => (
            <span key={phase} data-testid='spell-moon-phase'>
              {phase}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>
```

### Spell Detail Page

```tsx
// Component: SpellDetailPage
<div data-testid='spell-detail-page'>
  <h1 data-testid='spell-detail-title'>{spell.name}</h1>

  <p data-testid='spell-detail-description'>{spell.fullDescription}</p>

  <div data-testid='spell-timing-note'>
    Rituals are most effective when aligned with timing and personal cycles.
  </div>

  <div data-testid='spell-purpose'>
    <h3>⭐ Purpose</h3>
    <p data-testid='spell-purpose-text'>{spell.purpose}</p>
  </div>

  <div data-testid='spell-timing'>
    <h3>🌙 Optimal Timing</h3>
    <div data-testid='spell-moon-phase-timing'>
      <span>Moon Phase: </span>
      {spell.optimalMoonPhases.map((phase) => (
        <span key={phase} data-testid='optimal-moon-phase'>
          {phase}
        </span>
      ))}
    </div>
    <div data-testid='spell-time-of-day'>
      Time of Day: <span>{spell.timeOfDay}</span>
    </div>
  </div>

  <div data-testid='spell-ingredients'>
    <h3>🔮 Ingredients</h3>
    <ul data-testid='ingredients-list'>
      {spell.ingredients.map((ingredient, idx) => (
        <li key={idx} data-testid='ingredient-item'>
          <span data-testid='ingredient-name'>{ingredient.name}</span>
          <span data-testid='ingredient-amount'>{ingredient.amount}</span>
          <span data-testid='ingredient-purpose'>{ingredient.purpose}</span>
          {ingredient.substitutes && (
            <span data-testid='ingredient-substitutes'>
              Substitutes: {ingredient.substitutes}
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>

  <div data-testid='spell-tools'>
    <h3>Tools Needed</h3>
    <ul data-testid='tools-list'>
      {spell.tools.map((tool, idx) => (
        <li key={idx} data-testid='tool-item'>
          {tool}
        </li>
      ))}
    </ul>
  </div>

  <div data-testid='spell-preparation'>
    <h3>Preparation Steps</h3>
    <ol data-testid='preparation-steps'>
      {spell.steps.map((step, idx) => (
        <li key={idx} data-testid='preparation-step'>
          <span data-testid='step-number'>{idx + 1}</span>
          <span data-testid='step-text'>{step}</span>
        </li>
      ))}
    </ol>
  </div>
</div>
```

---

## 🎯 Implementation Checklist

### Step 1: Identify Component Files

For each page, find the actual component files in your codebase:

```bash
# Dashboard components
src/app/app/page.tsx
src/components/dashboard/MoonPhaseWidget.tsx
src/components/dashboard/SkyNowWidget.tsx
src/components/dashboard/DailyTransits.tsx
# ... etc

# Horoscope components
src/app/horoscope/page.tsx
src/components/horoscope/NumerologyCards.tsx
# ... etc
```

### Step 2: Add data-testid Systematically

Work through one page at a time:

1. **Dashboard** → Add all testids from Dashboard section
2. **Horoscope** → Add all testids from Horoscope section
3. **Tarot** → Add all testids from Tarot section
4. **Guide** → Add all testids from Guide section
5. **Birth Chart** → Add all testids from Birth Chart section
6. **Profile** → Add all testids from Profile section (fix friend view first!)
7. **Grimoire Crystals** → Add all testids from Crystals section
8. **Grimoire Spells** → Add all testids from Spells section

### Step 3: Test Selectors

After adding testids to a page:

```bash
# Start dev server
pnpm dev

# In browser DevTools console, test selectors:
document.querySelector('[data-testid="moon-phase-section"]')
document.querySelector('[data-testid="sky-now-expand"]')
document.querySelector('[data-testid="transit-card"]')
# ... etc
```

### Step 4: Update Recording Configs

Once selectors are verified, update `src/lib/video/app-feature-recordings.ts` with the correct data-testid selectors.

---

## 💡 Tips

1. **Use semantic names**: `data-testid="crystal-card"` not `data-testid="card1"`
2. **Add data attributes for variants**: `data-crystal-slug="garnet"` or `data-planet="sun"`
3. **Keep consistent naming**: If you use `card` for one component, use it for similar components
4. **Test immediately**: Don't wait to add all testids before testing - test as you go
5. **Document as you go**: If you find a component that doesn't match this doc, update the doc

---

## 🚀 Next: Recording Configuration

After all data-testid attributes are added, update the recording configurations to use these selectors:

```typescript
// Example: Dashboard recording with real selectors
{
  id: 'dashboard-overview',
  steps: [
    { type: 'click', selector: '[data-testid="sky-now-expand"]' },
    { type: 'click', selector: '[data-testid="crystal-card"]' },
    // ... etc
  ]
}
```
