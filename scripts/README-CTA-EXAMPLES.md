# CTA Examples System

## Overview

This system generates accurate, real transit examples for display in CTA (Call-To-Action) nudges across Lunary's Grimoire content hubs. Examples are calculated using Lunary's actual astrology APIs against a reference birth chart, ensuring they demonstrate real personalization capabilities.

## How It Works

1. **Reference Chart**: Uses a fixed birth chart (Jan 15, 1990, 12:00 PM, London) as the baseline
2. **Real Transits**: Calculates TODAY's actual planetary positions
3. **Accurate Aspects**: Finds real aspects between transits and natal planets
4. **House Activations**: Determines which natal houses are being activated
5. **Personal Day**: Calculates the numerological Personal Day number
6. **Moon Phase**: Identifies the current lunar phase

## Files

### Generation Scripts

- `scripts/lib/reference-chart.ts` - Reference birth chart utilities
- `scripts/generate-cta-examples.ts` - Main generation script
- `scripts/test-cta-examples.ts` - Test script to verify examples
- `src/app/api/cron/generate-cta-examples/route.ts` - Automated cron endpoint

### Output

- `src/lib/cta-examples.json` - Generated examples (do not edit manually)

### Integration

- `src/lib/grimoire/getContextualNudge.ts` - Loads examples and injects them into CTAs
- `src/constants/contextual-nudges.json` - CTA configuration with `{EXAMPLE}` placeholders

## Usage

### Automated Monthly Update (Recommended)

A Vercel cron job automatically regenerates examples on the 20th of each month at 6:00 AM UTC:

- **Endpoint**: `/api/cron/generate-cta-examples`
- **Schedule**: `0 6 20 * *` (6 AM UTC on the 20th)
- **Notifications**: Sends Discord alerts on success/failure
- **Monitoring**: Check Vercel dashboard → Cron Jobs

No manual intervention required! The system updates itself monthly.

### Manual Update (When Needed)

You can manually regenerate examples anytime:

```bash
# Via script (local)
pnpm run generate-cta-examples

# Via API endpoint (requires CRON_SECRET)
pnpm run cron:cta-examples
```

Useful for:

- Testing changes to generation logic
- Forcing an update outside the monthly schedule
- Recovering from a failed automated run

### Testing

To test that examples are being injected correctly:

```bash
pnpm tsx scripts/test-cta-examples.ts
```

## CTA Configuration

CTAs can include example placeholders in their `headline` or `subline` text:

### Available Placeholders

- `{EXAMPLE}` - Full example with interpretation (e.g., "Moon △ Mercury — emotional comfort")
- `{EXAMPLE_TEXT}` - Just the example text (e.g., "Moon △ Mercury")
- `{EXAMPLE_INTERPRETATION}` - Just the interpretation (e.g., "emotional comfort")

### Example CTA

```json
{
  "headline": "This is your sun sign forecast",
  "subline": "With your birth chart, you'd see:\n\nExample: {EXAMPLE}\n\nTakes 2 minutes.",
  "buttonLabel": "Create my free birth chart",
  "href": "/auth?signup=true",
  "action": "authOrLink"
}
```

## Hubs with Examples

Currently generating examples for:

- **horoscopes** - Transit aspects, house activations, Personal Day
- **planets** - Natal positions, current transits to natal planets
- **houses** - House activations, planets transiting through
- **transits** - Major aspects with timing, house activations
- **moon** - Moon phase, position, aspects to natal chart
- **aspects** - Aspect types with orbs

## Technical Details

### Deterministic Selection

Examples are selected deterministically based on the page path using a hash function. This ensures:

- Same page always shows same example
- Users see consistent examples when returning to a page
- Different pages within a hub show different examples

### Example Format

Each example has three fields:

```json
{
  "type": "transit_to_natal",
  "text": "Jupiter 17°58' Cancer ⚹ your natal Moon 17°30' Virgo",
  "interpretation": "opportunity for connection"
}
```

### Aspect Symbols

- ☌ Conjunction (0°)
- ☍ Opposition (180°)
- △ Trine (120°)
- □ Square (90°)
- ⚹ Sextile (60°)

## Maintenance

### When to Regenerate

1. **Automatic** - Vercel cron runs monthly on the 20th (no action needed)
2. **Manual** - After API changes or hub updates
3. **Recovery** - If automated run fails (check Discord/Vercel logs)

### Troubleshooting

**Examples not showing?**

- Check that the hub name in `contextual-nudges.json` matches the key in `cta-examples.json`
- Verify placeholder syntax is correct: `{EXAMPLE}`, `{EXAMPLE_TEXT}`, or `{EXAMPLE_INTERPRETATION}`
- Run `pnpm tsx scripts/test-cta-examples.ts` to debug

**Stale examples?**

- Run `pnpm run generate-cta-examples` to refresh with current transits

**Missing examples for a hub?**

- Edit `scripts/generate-cta-examples.ts` to add generation logic for that hub
- Regenerate the examples file

## Future Enhancements

Potential improvements:

- Automated monthly regeneration via cron job
- Multiple reference charts for diverse examples
- Season-aware example selection
- Region-specific timing examples
- Integration with user's actual chart (for authenticated preview)

## Architecture

```
User visits /grimoire/horoscopes/daily/aries
         ↓
SEOContentTemplate calls getContextualNudge(pathname)
         ↓
getContextualNudge() determines hub = "horoscopes"
         ↓
Selects CTA from contextual-nudges.json["horoscopes"]
         ↓
Finds matching example from cta-examples.json["horoscopes"]
         ↓
Injects example into {EXAMPLE} placeholder
         ↓
Returns complete CTA with real transit example
         ↓
ContextualNudgeSection renders CTA to user
```

## Reference Chart Details

**Profile:**

- Birth Date: January 15, 1990
- Birth Time: 12:00 PM (noon)
- Birth Location: London, UK
- Timezone: Europe/London

This profile was chosen for:

- Northern hemisphere perspective
- Reasonable mix of planetary positions
- Standard timezone for easy calculations
- No unusual chart features that might confuse examples

---

**Last Updated:** 2026-01-26
**Version:** 1.0
