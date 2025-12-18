# Grimoire Content Audit

This document catalogs all Grimoire content locations for future JSON consolidation.

## JSON Data Files (`src/data/`)

| File                         | Count | Key Fields                                         | Status   |
| ---------------------------- | ----- | -------------------------------------------------- | -------- |
| `crystals.json`              | 104   | `id`, `name`, `ogColor`, `chakras`, `elements`     | Complete |
| `numerology.json`            | 40+   | Angel Numbers (12), Life Path (12), Master Numbers | Complete |
| `numerology-extended.json`   | 20+   | Karmic Debt (4), Expression Numbers (9+)           | Complete |
| `tarot-cards.json`           | 78    | Major (22) + Minor Arcana (56 - all 4 suits)       | Complete |
| `runes.json`                 | 24    | Elder Futhark with `symbol` (Unicode), `element`   | Complete |
| `chakras.json`               | 7     | `name`, `color`, `element`, `sanskritName`         | Complete |
| `planetary-bodies.json`      | 11+   | `name`, `symbol`, `rules`, `keywords`              | Complete |
| `sabbats.json`               | 8     | Wheel of the Year with dates, correspondences      | Complete |
| `zodiac-signs.json`          | 12    | Full sign data with elements, modalities           | Complete |
| `zodiac-compatibility.json`  | 144   | All sign pair combinations                         | Complete |
| `correspondences.json`       | -     | Cross-references between entities                  | Complete |
| `spells.json`                | -     | Spell content and instructions                     | Complete |
| `spell-meta.json`            | -     | Spell metadata                                     | Complete |
| `crystal-index.json`         | -     | Crystal quick lookup                               | Complete |
| `crystal-personalized.json`  | -     | Personalized crystal recommendations               | Complete |
| `grimoire-search-index.json` | 2600+ | Search index entries                               | Complete |
| `symbols.json`               | -     | Symbol definitions                                 | Complete |

## TypeScript Constants (NOT in JSON - candidates for conversion)

### Astrology Core

| File                                   | Content                              | Count | Priority    |
| -------------------------------------- | ------------------------------------ | ----- | ----------- |
| `src/constants/seo/houses.ts`          | Astrological Houses                  | 12    | High        |
| `src/constants/seo/aspects.ts`         | Aspect definitions with symbols      | 7     | High        |
| `src/constants/seo/decans.ts`          | Zodiac Decans with tarot cards       | 36    | High        |
| `src/constants/seo/cusps.ts`           | Zodiac Cusps ("Cusp of Power", etc.) | 12    | High        |
| `src/constants/grimoire/seo-data.ts`   | Houses + Aspects (duplicate)         | -     | Consolidate |
| `src/constants/seo/cosmic-ontology.ts` | Aspects, Houses, Phases (duplicate)  | -     | Consolidate |

### Chinese Zodiac

| File                                  | Content                  | Count | Priority |
| ------------------------------------- | ------------------------ | ----- | -------- |
| `src/constants/seo/chinese-zodiac.ts` | Full Chinese Zodiac data | 12    | High     |

### Moon & Lunar

| File                                    | Content                        | Count | Priority    |
| --------------------------------------- | ------------------------------ | ----- | ----------- |
| `utils/moon/monthlyPhases.ts`           | Moon phase meanings            | 8     | High        |
| `src/constants/seo/cosmic-ontology.ts`  | Lunar phases with rituals      | 8     | Consolidate |
| `src/constants/moon/annualFullMoons.ts` | Named moons (Wolf, Snow, etc.) | 12    | Medium      |

### Numerology Extended

| File                                                 | Content               | Count | Priority    |
| ---------------------------------------------------- | --------------------- | ----- | ----------- |
| `src/constants/grimoire/clock-numbers-data.ts`       | Mirror Hours          | 12    | High        |
| `src/constants/grimoire/clock-numbers-data.ts`       | Double Hours          | 12    | High        |
| `src/constants/grimoire/numerology-data.ts`          | Additional numerology | -     | Check       |
| `src/constants/grimoire/numerology-extended-data.ts` | More numerology       | -     | Check       |
| `src/constants/seo/numerology.ts`                    | SEO numerology data   | -     | Consolidate |

### Reference & Glossary

| File                                        | Content                  | Count | Priority |
| ------------------------------------------- | ------------------------ | ----- | -------- |
| `src/constants/grimoire/glossary.ts`        | Astrology glossary terms | 100+  | Medium   |
| `src/constants/grimoire/correspondences.ts` | Cross-references         | -     | Medium   |

### Other Content

| File                                         | Content                     | Count | Priority    |
| -------------------------------------------- | --------------------------- | ----- | ----------- |
| `src/constants/seo/zodiac-seasons.ts`        | Zodiac season content       | 12    | Medium      |
| `src/constants/seo/birthday-zodiac.ts`       | Day-by-day zodiac           | 365   | Low         |
| `src/constants/seo/yearly-transits.ts`       | Annual transit data         | -     | Low         |
| `src/constants/seo/monthly-horoscope.ts`     | Monthly horoscope templates | -     | Low         |
| `src/constants/seo/compatibility-content.ts` | Sign compatibility          | -     | Low         |
| `src/constants/seo/planet-sign-content.ts`   | Planet in sign combinations | 120+  | Medium      |
| `src/constants/tarotSpreads.ts`              | Tarot spread layouts        | -     | Medium      |
| `src/constants/tarot.ts`                     | Tarot constants             | -     | Consolidate |
| `src/constants/spells.ts`                    | Spell constants             | -     | Consolidate |
| `src/constants/sabbats.ts`                   | Sabbat constants            | -     | Consolidate |
| `src/constants/runes.ts`                     | Rune constants              | -     | Consolidate |
| `src/constants/chakras.ts`                   | Chakra constants            | -     | Consolidate |
| `src/constants/symbols.ts`                   | Symbol constants            | -     | Consolidate |
| `src/constants/weekDays.ts`                  | Day correspondences         | 7     | Low         |

### Utility Files with Data

| File                                    | Content                        | Priority    |
| --------------------------------------- | ------------------------------ | ----------- |
| `utils/zodiac/zodiac.ts`                | Zodiac signs, planetary bodies | High        |
| `utils/tarot/tarot-cards.ts`            | Tarot card utilities           | Consolidate |
| `src/constants/entity-relationships.ts` | Entity cross-references        | Medium      |

## Duplication Analysis

Several content types exist in multiple locations:

1. **Houses**: `seo-data.ts`, `houses.ts`, `cosmic-ontology.ts`
2. **Aspects**: `aspects.ts`, `seo-data.ts`, `cosmic-ontology.ts`
3. **Moon Phases**: `monthlyPhases.ts`, `cosmic-ontology.ts`
4. **Sabbats**: `sabbats.json`, `sabbats.ts`
5. **Chakras**: `chakras.json`, `chakras.ts`
6. **Runes**: `runes.json`, `runes.ts`

## Recommended JSON Consolidation (Future)

### Phase 1: High Priority

- [ ] `houses.json` - Consolidate from 3 TS sources
- [ ] `aspects.json` - Consolidate from 3 TS sources
- [ ] `chinese-zodiac.json` - Convert from TS
- [ ] `decans.json` - Convert from TS
- [ ] `cusps.json` - Convert from TS
- [ ] `moon-phases.json` - Consolidate from 2 TS sources
- [ ] `clock-numbers.json` - Mirror + Double hours

### Phase 2: Medium Priority

- [ ] `glossary.json` - Convert from TS
- [ ] `planet-sign.json` - All planet-in-sign combinations
- [ ] `annual-moons.json` - Named full moons
- [ ] `tarot-spreads.json` - Spread layouts

### Phase 3: Low Priority

- [ ] `birthday-zodiac.json` - 365 days of zodiac
- [ ] `yearly-transits.json` - Transit data
- [ ] `monthly-horoscope.json` - Templates

## OG Image Category Coverage

For the thematic OG image system, we need data for:

| Category       | Source                     | Ready? |
| -------------- | -------------------------- | ------ |
| Zodiac         | zodiac-signs.json          | Yes    |
| Crystals       | crystals.json (104)        | Yes    |
| Numerology     | numerology.json + extended | Yes    |
| Tarot Major    | tarot-cards.json           | Yes    |
| Tarot Minor    | tarot-cards.json (4 suits) | Yes    |
| Runes          | runes.json                 | Yes    |
| Chakras        | chakras.json               | Yes    |
| Planets        | planetary-bodies.json      | Yes    |
| Sabbats        | sabbats.json               | Yes    |
| Houses         | houses.ts                  | Use TS |
| Aspects        | aspects.ts                 | Use TS |
| Chinese Zodiac | chinese-zodiac.ts          | Use TS |
| Decans         | decans.ts                  | Use TS |
| Cusps          | cusps.ts                   | Use TS |
| Moon Phases    | monthlyPhases.ts           | Use TS |
| Mirror Hours   | clock-numbers-data.ts      | Use TS |
| Double Hours   | clock-numbers-data.ts      | Use TS |
