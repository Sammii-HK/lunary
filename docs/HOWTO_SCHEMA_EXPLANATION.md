# HowTo Schema Explained

## What is HowTo Schema?

**HowTo Schema** is a type of structured data (JSON-LD) that tells search engines your content contains step-by-step instructions for completing a task.

## Why We Added It

We added HowTo schema to the Candle Magic page because it contains ritual instructions (like "Simple Intention Candle Ritual"). This helps Google:

1. **Show Rich Snippets** - Your content can appear with step-by-step instructions directly in search results
2. **Better Understanding** - Google understands your content is instructional
3. **Higher CTR** - Rich snippets get more clicks than regular results
4. **Voice Search** - Google Assistant can read your instructions aloud

## Example from Our Site

**Location:** `src/app/grimoire/components/CandleMagic.tsx`

**What it does:**

- Tells Google: "This page teaches how to perform a candle ritual"
- Lists the steps: Choose color → Carve → Anoint → Light → Burn → Dispose
- Includes tools needed: Candle, lighter, oil
- Estimates time: 15 minutes

**What users see in Google:**
Instead of just a regular search result, they might see:

```
Simple Intention Candle Ritual
⏱️ 15 min
Step 1: Choose a candle color matching your intention...
Step 2: Carve your intention or name into the candle...
[View all steps]
```

## Benefits

- ✅ **Better Search Visibility** - Stands out in search results
- ✅ **Higher Click-Through Rate** - Rich snippets get 2-3x more clicks
- ✅ **Voice Search Optimization** - Works with "Hey Google, how do I..."
- ✅ **Mobile-Friendly** - Shows nicely on mobile search

## Where Else We Could Add It

- Spell instructions in Practices section
- Ritual guides in Grimoire
- Tarot reading guides
- Crystal charging instructions
- Moon ritual guides

## Technical Details

The schema follows Google's HowTo format:

- `@type: "HowTo"` - Identifies it as instructions
- `step[]` - Array of steps with position, name, text
- `tool[]` - List of required tools
- `totalTime` - Estimated duration (ISO 8601 format: PT15M = 15 minutes)

This is a standard SEO best practice for instructional content!
