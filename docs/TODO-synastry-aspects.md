# Grimoire Content Moat Expansion - Master TODO

This document tracks progress on Plans 14, 14.1-14.4 for expanding Lunary's content moat.

---

## Plans Overview

| Plan     | Description                           | Status                       |
| -------- | ------------------------------------- | ---------------------------- |
| **14**   | Content Moat Analysis & Strategy      | ✅ Complete                  |
| **14.1** | Implementation Guide                  | ✅ Complete                  |
| **14.2** | Angel Numbers (Numerology)            | ✅ Complete (14 numbers)     |
| **14.2** | Synastry Aspects                      | 🔄 In Progress (25/111)      |
| **14.3** | Zodiac Compatibility                  | ✅ Complete                  |
| **14.4** | Planetary Placements (Venus template) | ✅ Complete (All 12 planets) |

---

## Angel Numbers / Numerology (Plan 14.2) - COMPLETED

**Status: IMPLEMENTED** - 14 curated angel numbers with rich SEO content.

**Files:**

- Data: `src/data/angel-numbers.json` (14 numbers with rich content)
- Helper: `src/lib/angel-numbers/getAngelNumber.ts`
- Detail page: `src/app/grimoire/angel-numbers/[number]/page.tsx` (uses SEOContentTemplate + CosmicConnections)
- Index page: `src/app/grimoire/angel-numbers/page.tsx` (updated to use new data)
- Sitemap: Updated to use new data source

### Implemented Numbers

- [x] 000 - Infinite Potential & Divine Connection
- [x] 111 - Manifestation & New Beginnings
- [x] 222 - Balance & Partnership
- [x] 333 - Creativity & Ascended Master Support
- [x] 444 - Protection & Solid Foundations
- [x] 555 - Major Life Changes
- [x] 666 - Balance & Realignment
- [x] 777 - Spiritual Awakening & Divine Luck
- [x] 888 - Abundance & Infinite Flow
- [x] 999 - Completion & Endings
- [x] 1010 - Alignment & Next Chapter
- [x] 1111 - Spiritual Awakening Portal (most searched!)
- [x] 1212 - Trust Your Path & Keep Going
- [x] 1234 - Steps in the Right Direction

### Rich Content Features

Each angel number includes:

- Core meaning and keywords
- Detailed meaning with markdown sections
- Why you keep seeing it / when it appears
- Yes or No guidance
- Love meanings (single/relationship/thinking of someone)
- Career meaning
- Spiritual meaning
- Numerology breakdown (root number, calculation, amplification)
- What to do / how to work with it
- Correspondences (planet, element, chakra, crystal, tarot card)
- Journal prompts
- FAQ section

---

## Zodiac Compatibility (Plan 14.3) - COMPLETED

All 12 curated pairs now in `src/data/zodiac-compatibility-pairs.json`:

- [x] aries-and-leo
- [x] taurus-and-cancer
- [x] gemini-and-libra
- [x] cancer-and-scorpio
- [x] leo-and-sagittarius
- [x] virgo-and-capricorn
- [x] libra-and-aquarius
- [x] scorpio-and-pisces
- [x] sagittarius-and-aquarius
- [x] capricorn-and-pisces
- [x] taurus-and-scorpio (opposites)
- [x] gemini-and-sagittarius (opposites)

Page updated: `src/app/grimoire/compatibility/[match]/page.tsx` now uses SEOContentTemplate and curated data.

---

## Planetary Placements (Plan 14.4) - COMPLETED

Plan 14.4 provided the Venus placement template. All 12 planets now have curated data in `src/data/`:

- [x] Sun placements (12) - `sun-placements.json`
- [x] Moon placements (12) - `moon-placements.json`
- [x] Mercury placements (12) - `mercury-placements.json`
- [x] Venus placements (12) - `venus-placements.json`
- [x] Mars placements (12) - `mars-placements.json`
- [x] Jupiter placements (12) - `jupiter-placements.json`
- [x] Saturn placements (12) - `saturn-placements.json`
- [x] Uranus placements (12) - `uranus-placements.json`
- [x] Neptune placements (12) - `neptune-placements.json`
- [x] Pluto placements (12) - `pluto-placements.json`
- [x] Chiron placements (12) - `chiron-placements.json`
- [x] North Node placements (12) - `north-node-placements.json`

**Total: 144 planet placements with SEO-optimized content.**

Page: `src/app/grimoire/placements/[placement]/page.tsx` uses consolidated helper.

---

## Rising Sign Content - COMPLETED

All 12 rising signs now in `src/data/rising-signs.json`:

- [x] aries-rising
- [x] taurus-rising
- [x] gemini-rising
- [x] cancer-rising
- [x] leo-rising
- [x] virgo-rising
- [x] libra-rising
- [x] scorpio-rising
- [x] sagittarius-rising
- [x] capricorn-rising
- [x] aquarius-rising
- [x] pisces-rising

Pages: `src/app/grimoire/rising/page.tsx` (index) and `src/app/grimoire/rising/[sign]/page.tsx` (individual)

---

## Synastry Pairs - TODO

Curated synastry compatibility content for specific Sun sign pairs.
Similar to zodiac compatibility but focused on relationship dynamics.

Location: `src/data/synastry-pairs.json`

### Priority Pairs (Most Searched)

- [ ] aries-leo-synastry
- [ ] taurus-virgo-synastry
- [ ] gemini-aquarius-synastry
- [ ] cancer-pisces-synastry
- [ ] leo-sagittarius-synastry
- [ ] virgo-capricorn-synastry
- [ ] libra-gemini-synastry
- [ ] scorpio-cancer-synastry
- [ ] sagittarius-aries-synastry
- [ ] capricorn-taurus-synastry
- [ ] aquarius-libra-synastry
- [ ] pisces-scorpio-synastry

### Opposite Sign Pairs (High Interest)

- [ ] aries-libra-synastry
- [ ] taurus-scorpio-synastry
- [ ] gemini-sagittarius-synastry
- [ ] cancer-capricorn-synastry
- [ ] leo-aquarius-synastry
- [ ] virgo-pisces-synastry

---

## Future Content Pillars

### House Placements

- Planets in houses interpretation
- 12 houses × 10+ planets = 120+ pages

### Life Path Numbers (Numerology extension)

- Life path 1-9, 11, 22, 33
- Already have some basic data

---

# Synastry Aspects - Content Expansion TODO

## Currently Implemented (25 aspects)

### Sun-Moon

- [x] sun-conjunct-moon
- [x] sun-trine-moon
- [x] sun-square-moon
- [x] sun-opposition-moon

### Venus-Mars

- [x] venus-conjunct-mars
- [x] venus-trine-mars
- [x] venus-square-mars
- [x] venus-opposition-mars

### Moon-Venus

- [x] moon-conjunct-venus
- [x] moon-trine-venus

### Moon-Mars

- [x] moon-conjunct-mars
- [x] moon-square-mars

### Same Planet

- [x] moon-conjunct-moon
- [x] mercury-conjunct-mercury
- [x] venus-conjunct-venus
- [x] mars-conjunct-mars

### Sun with Venus/Mars

- [x] sun-conjunct-venus
- [x] sun-conjunct-mars

### Outer Planets

- [x] jupiter-conjunct-venus
- [x] saturn-conjunct-sun
- [x] saturn-square-venus
- [x] saturn-conjunct-moon
- [x] pluto-conjunct-venus
- [x] pluto-square-venus
- [x] neptune-conjunct-venus

---

## TODO - Priority 1 (High Search Volume)

### Sun-Moon (complete the set)

- [ ] sun-sextile-moon

### Venus-Mars (complete the set)

- [ ] venus-sextile-mars

### Moon-Venus (high search)

- [ ] moon-square-venus
- [ ] moon-opposition-venus
- [ ] moon-sextile-venus

### Moon-Mars (high search)

- [ ] moon-trine-mars
- [ ] moon-opposition-mars
- [ ] moon-sextile-mars

### Sun-Venus

- [ ] sun-trine-venus
- [ ] sun-square-venus
- [ ] sun-opposition-venus
- [ ] sun-sextile-venus

### Sun-Mars

- [ ] sun-trine-mars
- [ ] sun-square-mars
- [ ] sun-opposition-mars
- [ ] sun-sextile-mars

---

## TODO - Priority 2 (Saturn aspects - karmic/commitment)

### Saturn-Sun

- [ ] saturn-square-sun
- [ ] saturn-trine-sun
- [ ] saturn-opposition-sun
- [ ] saturn-sextile-sun

### Saturn-Moon

- [ ] saturn-square-moon
- [ ] saturn-trine-moon
- [ ] saturn-opposition-moon

### Saturn-Venus (complete the set)

- [ ] saturn-conjunct-venus
- [ ] saturn-trine-venus
- [ ] saturn-opposition-venus

### Saturn-Mars

- [ ] saturn-conjunct-mars
- [ ] saturn-square-mars
- [ ] saturn-trine-mars
- [ ] saturn-opposition-mars

---

## TODO - Priority 3 (Jupiter aspects - growth/expansion)

### Jupiter-Venus

- [ ] jupiter-trine-venus
- [ ] jupiter-square-venus
- [ ] jupiter-opposition-venus
- [ ] jupiter-sextile-venus

### Jupiter-Sun

- [ ] jupiter-conjunct-sun
- [ ] jupiter-trine-sun
- [ ] jupiter-square-sun
- [ ] jupiter-opposition-sun

### Jupiter-Moon

- [ ] jupiter-conjunct-moon
- [ ] jupiter-trine-moon
- [ ] jupiter-square-moon
- [ ] jupiter-opposition-moon

---

## TODO - Priority 4 (Pluto aspects - transformation)

### Pluto-Venus (complete the set)

- [ ] pluto-trine-venus
- [ ] pluto-opposition-venus
- [ ] pluto-sextile-venus

### Pluto-Moon

- [ ] pluto-conjunct-moon
- [ ] pluto-square-moon
- [ ] pluto-trine-moon
- [ ] pluto-opposition-moon

### Pluto-Sun

- [ ] pluto-conjunct-sun
- [ ] pluto-square-sun
- [ ] pluto-trine-sun
- [ ] pluto-opposition-sun

### Pluto-Mars

- [ ] pluto-conjunct-mars
- [ ] pluto-square-mars
- [ ] pluto-trine-mars

---

## TODO - Priority 5 (Neptune aspects - romance/illusion)

### Neptune-Venus (complete the set)

- [ ] neptune-square-venus
- [ ] neptune-trine-venus
- [ ] neptune-opposition-venus
- [ ] neptune-sextile-venus

### Neptune-Moon

- [ ] neptune-conjunct-moon
- [ ] neptune-square-moon
- [ ] neptune-trine-moon

---

## TODO - Priority 6 (Uranus aspects - excitement/instability)

### Uranus-Venus

- [ ] uranus-conjunct-venus
- [ ] uranus-square-venus
- [ ] uranus-trine-venus
- [ ] uranus-opposition-venus

### Uranus-Moon

- [ ] uranus-conjunct-moon
- [ ] uranus-square-moon

---

## TODO - Priority 7 (Mercury aspects - communication)

### Mercury-Venus

- [ ] mercury-conjunct-venus
- [ ] mercury-trine-venus
- [ ] mercury-square-venus

### Mercury-Mercury

- [ ] mercury-square-mercury
- [ ] mercury-trine-mercury
- [ ] mercury-opposition-mercury

### Mercury-Mars

- [ ] mercury-conjunct-mars
- [ ] mercury-square-mars

---

## TODO - Priority 8 (North Node - karmic/destiny)

### North Node aspects

- [ ] north-node-conjunct-sun
- [ ] north-node-conjunct-moon
- [ ] north-node-conjunct-venus
- [ ] north-node-conjunct-mars
- [ ] south-node-conjunct-venus

---

## Estimated Total When Complete: ~111 aspects

Current: 25
Priority 1: +20 = 45
Priority 2: +14 = 59
Priority 3: +12 = 71
Priority 4: +14 = 85
Priority 5: +7 = 92
Priority 6: +6 = 98
Priority 7: +8 = 106
Priority 8: +5 = 111

---

## Summary: What's Next

### Highest Priority (Traffic Impact)

1. **Synastry Aspects Priority 1** - 20 high-search aspects to add
2. **Synastry Pairs** - 18 curated pairs needed

### Already Complete

- ✅ 144 planetary placements
- ✅ 14 angel numbers (with CosmicConnections)
- ✅ 12 rising signs
- ✅ 12 zodiac compatibility pairs
- ✅ 25 synastry aspects
