# Unused Grimoire Data Sources

## Currently Integrated in Phase 4 ✅

- ✅ Crystals (200+) - `/src/data/crystals.json`
- ✅ Spells (hundreds) - `/src/data/spells.json`
- ✅ Numerology (basic life path, personal year) - `/src/data/numerology.json`
- ✅ Planetary bodies (all planets) - `/src/data/planetary-bodies.json`
- ✅ Zodiac signs (12 signs) - `/src/data/zodiac-signs.json`
- ✅ Houses (12 houses) - `/src/data/houses.json`
- ✅ Chakras (7 chakras) - `/src/data/chakras.json`
- ✅ Basic correspondences - `/src/data/correspondences.json`

## NOT YET INTEGRATED (Massive Opportunities!) ⭐

### 1. Tarot System 🃏

**Location**: `/src/data/tarot-cards.json` (1400 lines!), `/src/constants/tarot.ts`
**Content**:

- **78 Tarot Cards** (22 Major Arcana + 56 Minor Arcana)
  - Each card has: element, planet, zodiac sign, keywords, upright/reversed meanings, symbolism, love/career meanings, affirmation
- **4 Tarot Suits** with element correspondences
  - Wands (Fire), Cups (Water), Swords (Air), Pentacles (Earth)
- **Tarot Spreads** (Three Card, Five Card, Celtic Cross, etc.)
- **Card Combinations** guide
- **Reversed Cards** guide

**Potential Integration**:

- Recommend specific tarot cards based on current transits/moon phase
- Connect tarot suits to user's chart elements
- Suggest tarot spreads for current cosmic energies
- Link tarot archetypes to natal planets (e.g., "Your Uranus in Aquarius resonates with The Fool")

---

### 2. Runes (Elder Futhark) ᚠᚢᚦᚨᚱᚲ

**Location**: `/src/data/runes.json` (770 lines), `/src/constants/runes.ts`
**Content**:

- **24+ Runes** with complete data
- Each rune has: element, deity, aett (Freya/Heimdall/Tyr), keywords, magical properties, upright/reversed meanings, divination meanings, magical uses, history, affirmation

**Potential Integration**:

- Recommend runes based on planetary transits (e.g., Fehu for Jupiter transits = wealth)
- Connect rune elements to user's chart
- Suggest runes for ritual work based on current energies
- Daily/weekly rune draw integrated with astrological context

---

### 3. Sabbats / Wheel of the Year 🌙☀️

**Location**: `/src/data/sabbats.json`, `/src/constants/sabbats.ts`
**Content**:

- **8 Sabbats**: Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lughnasadh, Mabon
- Each sabbat has: date, season, element, description, keywords, colors, crystals, herbs, foods, traditions, rituals, deities, symbols, history, spiritual meaning, affirmation

**Potential Integration**:

- Recommend sabbat rituals based on time of year + user's chart
- Connect sabbat energies to user's natal planets
- Suggest sabbat-specific crystals/herbs based on personal transits
- Seasonal guidance aligned with user's birth chart

---

### 4. Moon System 🌕🌑

**Location**: `/src/constants/moon/annualFullMoons.ts`, moon phases data
**Content**:

- **Monthly Moon Phases** with meanings
- **Annual Full Moons** by month (Wolf Moon, Snow Moon, etc.)
- **Moon in Signs** (12 sign interpretations)

**Potential Integration**:

- Already have moon phase, but not utilizing full moon names
- Connect full moon energies to user's natal moon
- Recommend rituals for full moons in specific signs

---

### 5. Aspects (Astrological) ⚹

**Location**: `/src/constants/grimoire/seo-data.ts` → `astrologicalAspects`
**Content**:

- Conjunction, Opposition, Trine, Square, Sextile, Quincunx, Semi-sextile, etc.
- Detailed meanings and interpretations

**Potential Integration**:

- **Already detecting aspects in natal chart, but NOT using grimoire meanings!**
- Enhance aspect interpretation with grimoire data
- Recommend crystals/herbs specific to challenging aspects

---

### 6. Retrogrades 🔄

**Location**: `/src/constants/grimoire/seo-data.ts` → `retrogradeInfo`
**Content**:

- Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto retrogrades
- Complete guidance for each retrograde

**Potential Integration**:

- Detect if user is experiencing retrograde transit
- Recommend retrograde-specific practices from grimoire
- Connect retrograde energies to natal placements

---

### 7. Eclipses 🌑🌞

**Location**: `/src/constants/grimoire/seo-data.ts` → `eclipseInfo`
**Content**:

- Solar and lunar eclipse meanings
- Eclipse guidance and practices

**Potential Integration**:

- **Already detecting relevant eclipses, but not using grimoire meanings!**
- Enhance eclipse interpretations with grimoire wisdom

---

### 8. Numerology Extended 🔢

**Location**: `/src/constants/grimoire/numerology-extended-data.ts`, `/src/constants/grimoire/clock-numbers-data.ts`
**Content**:

- **Angel Numbers**: 111, 222, 333, 444, 555, 666, 777, 888, 999, etc.
- **Mirror Hours**: 01:01, 02:02, 03:03, etc. with meanings
- **Double Hours**: 00:00, 01:01, etc. with meanings
- **Karmic Debt Numbers**: 13, 14, 16, 19 with lessons and healing
- **Expression/Destiny Numbers**: Full name numerology
- **Soul Urge Numbers**: Heart's desire from vowels

**Potential Integration**:

- Calculate ALL numerology numbers (not just life path)
- Detect angel numbers in user's life
- Karmic debt analysis
- Mirror/double hour synchronicity guidance

---

### 9. Comprehensive Correspondences 📚

**Location**: `/src/constants/grimoire/correspondences.ts` (89KB!)
**Content**:

#### **Elements** (Fire, Water, Air, Earth, Spirit)

- Colors, crystals, herbs, planets, days, zodiac signs, numbers, animals, directions, seasons, time of day, qualities, magical uses, rituals, affirmations

#### **Colors** (Red, Pink, Orange, Yellow, Green, Blue, Purple, White, Black, Brown, Silver, Gold)

- Correspondences, uses, planets, descriptions, magical properties, emotional effects, candle uses, affirmations

#### **Days** (Sunday-Saturday)

- Planetary ruler, element, correspondences, uses, best spells, spells to avoid, ritual suggestions, affirmations

#### **Deities** (Multiple Pantheons)

- Greek, Roman, Egyptian, Norse, Celtic, Hindu deities with correspondences

#### **Flowers** (Rose, Lavender, Jasmine, etc.)

- Correspondences, colors, planets, uses, magical properties, mythology, harvest time, spell uses, affirmations

#### **Herbs** (Comprehensive list)

- Correspondences, uses, planets, magical properties, history, preparation, safety, spell uses, affirmations

#### **Animals** (Spirit animals, familiars)

- Correspondences, symbolism, mythology, spirit animal meanings, dream meanings, magical uses, affirmations

#### **Wood Types** (Oak, Willow, Ash, etc.)

- Correspondences, uses, planets, magical properties, mythology, wand properties, ritual uses, affirmations

#### **Numbers** (1-9)

- Correspondences, planets, uses, numerology meanings, magical properties, best days, spell uses, affirmations

**Potential Integration**:

- **Use for ritual creation**: "For this Mars transit, use red candles (Mars correspondence), carnelian (Mars stone), basil (Mars herb), perform on Tuesday (Mars day)"
- **Elemental balance**: Recommend practices based on user's elemental balance
- **Deity work**: Suggest deities aligned with user's chart
- **Color magic**: Candle color recommendations for specific intentions

---

### 10. Witch Types 🔮

**Location**: `/src/constants/witch-types.json`
**Content**:

- Different paths of witchcraft (Green Witch, Kitchen Witch, Cosmic Witch, Hedge Witch, etc.)
- Each type has practices, focus areas, tools

**Potential Integration**:

- Recommend witch path based on user's birth chart
- "With your Taurus Sun and Virgo Moon, you're naturally drawn to Green Witch practices"

---

### 11. Meditation & Mindfulness 🧘

**Location**: Meditation pages/constants
**Content**:

- **Techniques**: Guided, mindfulness, visualization, walking, mantra
- **Breathwork**: Deep belly breathing, box breathing, pranayama
- **Grounding**: Tree root visualization, physical grounding, crystal grounding

**Potential Integration**:

- Recommend meditation techniques based on chart (e.g., water signs = visualization, air signs = breathwork)
- Grounding practices for earth/fire imbalances

---

### 12. Divination Methods 🔮

**Location**: Divination pages
**Content**:

- **Scrying**: Crystal ball, black mirror, water, fire
- **Pendulum**: Pendulum divination guide
- **Dream Interpretation**: Dream symbolism
- **Omen Reading**: Signs and synchronicities

**Potential Integration**:

- Recommend divination methods based on intuitive placements (Moon, Neptune, Pisces)
- "With Neptune in Pisces, water scrying enhances your natural psychic abilities"

---

### 13. Decans & Cusps 🌟

**Location**: Grimoire pages
**Content**:

- Zodiac decans (10-degree subdivisions)
- Cusp placements (between signs)

**Potential Integration**:

- Detailed interpretations for planets in specific decans
- Cusp guidance

---

### 14. Chinese Zodiac 🐉

**Location**: Grimoire page
**Content**:

- 12 Chinese zodiac animals
- Year, month, day, hour animals

**Potential Integration**:

- Calculate Chinese zodiac from birth date
- Combine Western + Chinese astrology insights

---

### 15. Lunar Nodes ☊☋

**Location**: `/src/constants/grimoire/seo-data.ts`
**Content**:

- North Node (destiny, future growth)
- South Node (past life, comfort zone)

**Potential Integration**:

- **Critical for karmic astrology!**
- North Node guidance for life path
- South Node for releasing patterns

---

### 16. Synastry/Compatibility 💑

**Location**: `/src/data/zodiac-compatibility.json` (1926 lines!)
**Content**:

- Every zodiac sign pair compatibility
- Relationship dynamics, challenges, strengths

**Potential Integration**:

- Relationship compatibility analysis
- Suggest relationship crystals/rituals based on synastry

---

### 17. Modern Witchcraft Tools 🔪🕯️

**Location**: Grimoire pages
**Content**:

- Athame, wand, cauldron, chalice, pentacle
- Tool correspondences and uses

**Potential Integration**:

- Recommend tools based on user's chart
- Tool consecration timing

---

### 18. Candle Magic 🕯️

**Location**: Grimoire candle-magic pages
**Content**:

- 12+ candle colors with meanings
- Anointing practices
- Incantations
- Altar lighting

**Potential Integration**:

- **Already have color correspondences, but not candle-specific guidance!**
- Candle color + herb + intention rituals

---

## Integration Priority Ranking

### 🔥 **HIGHEST PRIORITY** (Immediate Value)

1. **Tarot Cards** - 78 cards with planetary/zodiac correspondences → can recommend cards for transits
2. **Sabbats** - Seasonal rituals with full correspondences → time-sensitive recommendations
3. **Numerology Extended** - Angel numbers, karmic debt, expression, soul urge → deeper personal insights
4. **Comprehensive Correspondences** - Elements, colors, days, deities, herbs, flowers, animals, wood → rich ritual creation
5. **Aspects & Retrogrades** (grimoire meanings) - Already detecting, just need to use grimoire interpretations

### 🌟 **HIGH PRIORITY** (Great Enhancement)

6. **Runes** - Divination system with elemental correspondences
7. **Lunar Nodes** - Karmic astrology (critical!)
8. **Synastry/Compatibility** - Relationship guidance
9. **Moon Extended** - Full moon names and meanings
10. **Candle Magic** - Specific candle ritual guidance

### 💫 **MEDIUM PRIORITY** (Nice to Have)

11. **Witch Types** - Path recommendations based on chart
12. **Meditation** - Technique recommendations
13. **Divination Methods** - Method recommendations based on psychic placements
14. **Modern Witchcraft Tools** - Tool recommendations
15. **Decans & Cusps** - Detailed zodiac subdivisions

### ⭐ **LOWER PRIORITY** (Specialized)

16. **Chinese Zodiac** - Additional system integration
17. **Dream Interpretation** - Specific use case
18. **Omen Reading** - Synchronicity guidance

---

## Estimated Integration Effort

**Quick Wins** (1-2 days each):

- Aspect meanings (use existing detections, add grimoire interpretations)
- Retrograde meanings (same as aspects)
- Eclipse meanings (same as aspects)
- Sabbat recommendations (date-based lookup)

**Medium Effort** (3-5 days each):

- Tarot card recommendations (78 cards, need recommendation logic)
- Numerology extended (calculate all numbers, retrieve meanings)
- Comprehensive correspondences integration (massive data, need smart querying)

**Larger Projects** (1-2 weeks each):

- Runes system (complete divination system)
- Synastry/compatibility (relationship analysis engine)
- Lunar nodes (karmic astrology system)

---

## Bottom Line

**You have approximately 10x more grimoire data than Phase 4 currently uses!**

Current integration: ~8 data sources
Available data sources: ~80+ categories

The cosmic companion could be **dramatically** more comprehensive by integrating:

- Tarot (78 cards)
- Runes (24 runes)
- Sabbats (8 sabbats with full ritual data)
- Extended numerology (angel numbers, karmic debt, all core numbers)
- Comprehensive correspondences (elements, colors, days, deities, herbs, flowers, animals, woods, numbers)
- Lunar nodes (karmic destiny)
- Synastry (relationship compatibility)
- And much more!
