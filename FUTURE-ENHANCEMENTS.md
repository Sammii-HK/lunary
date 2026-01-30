# Future Enhancements

## Moon Features

### Libration Effects (For Future Addition)

**What**: Moon's "wobble" that lets us see ~59% of surface over time
**Use cases**:

- Showing moon surface features/maria for specific locations
- Observatory apps showing moon topography
- Precise visibility calculations for lunar features

**Implementation notes**:

- astronomy-engine provides `Libration()` function
- Returns: `elon`, `elat`, `distance`, `diameter`
- Observer-specific (requires lat/lon)
- Currently NOT needed for global moon phase/illumination ✅

**When to add**:

- If adding moon surface feature visualization
- If adding observer-specific rise/set times
- If showing "what craters/seas are visible tonight"

---

## Storage & Optimization

### ✅ COMPLETED: Consolidated Moon Calculations

- ✅ Merged smart cache logic into `astronomical-data.ts`
- ✅ Enhanced `getAccurateMoonPhase()` with:
  - Percentage-based cache expiration (no arbitrary hour boundaries)
  - Supermoon/micromoon detection
  - Change rate calculation
  - Per-minute cache keys
  - Smart TTL (expires when illumination reaches next integer %)
- ✅ Removed redundant files (kept DRY principle)
- ✅ One source of truth: `astronomical-data.ts`
