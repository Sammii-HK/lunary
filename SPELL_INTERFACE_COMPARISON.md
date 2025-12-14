# Spell Interface Comparison

## Field-by-Field Comparison

| Field                      | constants/spells.ts    | constants/grimoire/spells.ts | spells.json           | Notes                         |
| -------------------------- | ---------------------- | ---------------------------- | --------------------- | ----------------------------- |
| **Basic Fields**           |
| `id`                       | ✅                     | ✅                           | ✅                    | All have it                   |
| `title`                    | ✅                     | ✅                           | ✅                    | All have it                   |
| `alternativeNames`         | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `category`                 | ✅ (strict enum)       | ✅ (string)                  | ✅ (string)           | JSON is flexible              |
| `subcategory`              | ❌                     | ✅                           | ✅ (some spells)      | **In JSON & grimoire**        |
| `type`                     | ✅ (7 types)           | ✅ (8 types)                 | ✅ (matches grimoire) | Grimoire adds `sigil_magic`   |
| `difficulty`               | ✅ (3 levels)          | ✅ (4 levels)                | ✅ (3 levels)         | Grimoire adds `master`        |
| `tradition`                | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Content Fields**         |
| `purpose`                  | ✅                     | ✅                           | ✅                    | All have it                   |
| `description`              | ✅                     | ✅                           | ✅                    | All have it                   |
| `fullDescription`          | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `preparationTime`          | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Materials/Ingredients**  |
| `ingredients`              | ✅ (array)             | ❌                           | ✅ (array)            | **JSON & constants use this** |
| `materials`                | ❌                     | ✅ (essential/optional)      | ❌                    | **Only grimoire uses this**   |
| **Timing Fields**          |
| `timing.moonPhase`         | ✅ (MoonPhaseLabels[]) | ✅ (string[])                | ✅ (string[])         | Different types               |
| `timing.sabbat`            | ✅                     | ✅ (sabbats)                 | ❌                    | **Not in JSON**               |
| `timing.planetaryDay`      | ✅                     | ✅ (planetaryDays)           | ✅ (planetaryDay)     | Naming differs                |
| `timing.planetaryHours`    | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `timing.timeOfDay`         | ✅ (enum)              | ✅ (string[])                | ✅ (string)           | Types differ                  |
| `timing.season`            | ✅ (enum)              | ✅ (string[])                | ✅ (string)           | Types differ                  |
| `timing.bestTiming`        | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Ritual Fields**          |
| `tools`                    | ✅                     | ✅                           | ✅                    | All have it                   |
| `preparation`              | ✅                     | ✅                           | ✅                    | All have it                   |
| `steps`                    | ✅                     | ✅                           | ✅                    | All have it                   |
| `visualization`            | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `incantations`             | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Correspondences**        |
| `correspondences.elements` | ✅                     | ✅                           | ✅                    | All have it                   |
| `correspondences.colors`   | ✅                     | ✅                           | ✅                    | All have it                   |
| `correspondences.crystals` | ✅                     | ✅                           | ✅                    | All have it                   |
| `correspondences.herbs`    | ✅                     | ✅                           | ✅                    | All have it                   |
| `correspondences.planets`  | ✅                     | ✅                           | ✅                    | All have it                   |
| `correspondences.zodiac`   | ✅                     | ✅                           | ✅                    | All have it                   |
| `correspondences.numbers`  | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `correspondences.deities`  | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `correspondences.tarot`    | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Variations**             |
| `variations`               | ✅ (string[])          | ✅ (object[])                | ✅ (string[])         | **Different structures!**     |
| **Safety & Ethics**        |
| `safety`                   | ✅                     | ✅                           | ✅                    | All have it                   |
| `ethics`                   | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `aftercare`                | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Metadata**               |
| `history`                  | ✅                     | ✅                           | ✅                    | All have it                   |
| `culturalNotes`            | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `modernAdaptations`        | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| **Advanced Fields**        |
| `energySignature`          | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `successIndicators`        | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |
| `troubleshooting`          | ❌                     | ✅                           | ❌                    | **Only in grimoire**          |

## What Would Be Lost If We Use spells.json Only

### Fields Missing in spells.json:

1. **alternativeNames** - Alternative spell names
2. **fullDescription** - Extended description
3. **preparationTime** - Separate prep time field
4. **timing.planetaryHours** - Planetary hour timing
5. **timing.bestTiming** - Best timing text
6. **visualization** - Visualization steps
7. **incantations** - Structured incantations with timing/repetitions
8. **correspondences.numbers** - Numerological correspondences
9. **correspondences.deities** - Deity correspondences
10. **correspondences.tarot** - Tarot correspondences
11. **ethics** - Ethical considerations
12. **aftercare** - Post-ritual care instructions
13. **culturalNotes** - Cultural context
14. **modernAdaptations** - Modern adaptations
15. **energySignature** - Energy intensity/duration/scope
16. **successIndicators** - How to know if spell worked
17. **troubleshooting** - Common issues and solutions
18. **tradition** - Magical tradition(s)
19. **variations** - Different structure (object vs string)

### Fields Missing in constants/spells.ts:

1. **subcategory** - Spell subcategories
2. **alternativeNames** - Alternative names
3. **fullDescription** - Extended description
4. **preparationTime** - Prep time
5. **timing.planetaryHours** - Planetary hours
6. **timing.bestTiming** - Best timing
7. **visualization** - Visualization steps
8. **incantations** - Structured incantations
9. **correspondences.numbers/deities/tarot** - Extra correspondences
10. **ethics** - Ethical considerations
11. **aftercare** - Post-ritual care
12. **culturalNotes** - Cultural context
13. **modernAdaptations** - Modern adaptations
14. **energySignature** - Energy metadata
15. **successIndicators** - Success indicators
16. **troubleshooting** - Troubleshooting
17. **tradition** - Traditions
18. **variations** - Different structure

## Recommendation

**Option 1: Extend spells.json** (Best long-term)

- Add all missing fields from grimoire interface to spells.json
- Makes JSON the complete source of truth
- Requires updating JSON file (but you have all the data)

**Option 2: Merge Both Sources** (Quick fix)

- Keep spells.json as base
- Add adapter that merges in extra fields from a separate "spell-extensions.json"
- Less invasive, but maintains two sources

**Option 3: Use Most Complete Interface** (Current state)

- Use constants/grimoire/spells.ts interface
- Convert spells.json to match it (ingredients → materials)
- Most complete, but requires JSON migration

## What's Actually Used?

Need to check:

- Does PDF generator use energySignature, successIndicators, troubleshooting?
- Do any pages display ethics, aftercare, culturalNotes?
- Are incantations used anywhere?
- Is visualization used?
