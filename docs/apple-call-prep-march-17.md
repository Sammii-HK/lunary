# Apple App Store Review Call -- Talking Points

**Date:** Tuesday 17 March 2026, 10:00 PM
**App:** Lunary: Personal Ephemeris (ID: 6759622745)
**Build:** 1.0 (20)
**Submission:** 2c33f46e-437b-42b4-874f-04271d1b1cfd
**Status:** Rejected 3 times (28 Feb, 3 Mar, 10 Mar)

---

## Opening (30 seconds)

- "Thank you for taking the time. I appreciate the opportunity to discuss this directly."
- "I have two issues to cover: the 4.3(b) categorisation and the 2.1(b) IAP error. I would like to start with 4.3(b) as it is the primary concern."
- Have the app open and ready to demo on your phone

---

## Issue 1: Guideline 4.3(b) -- "Saturated Category"

### The core reframe

Lunary is a **personal ephemeris** -- a computational astronomy tool that teaches users to read their own birth chart. It is not a horoscope app.

### Key differentiators (pick 4-5 to hit, do not try to say all of them)

- **Real astronomical engine.** astronomy-engine (MIT, VSOP87) computes actual planetary positions to +/-1 arcminute accuracy. Same planetary theory used by NASA JPL. This is not pre-written horoscope text.
- **Full natal chart computation.** Requires date, time, and location of birth. Every piece of content maps to the user's actual chart houses and planetary placements. Generic horoscope apps only ask for sun sign.
- **Real-time transit tracking with severity tagging.** Shows which planets are moving through which houses in your natal chart right now, with timing and intensity scoring. No competitor does this.
- **Synastry engine.** Full relationship chart comparison with 36 planetary aspects -- not a compatibility quiz.
- **Cosmic Score system.** 12 pattern types analysed against live sky data. Unique to Lunary.
- **2,000+ article educational grimoire.** Covering astrology, tarot, crystals, spells, divination. Original hand-authored content, not AI generated. This alone would qualify as a standalone educational app.
- **Tarot integrated with birth chart data.** Readings contextualised to your natal chart. No app on the store does this.
- **3 native iOS widget types.** Cosmic Dashboard, Moon Tracker, Daily Card.
- **Structured learning paths.** The goal is chart literacy, not fortune telling.
- **Placidus house system.** Professional-grade chart calculation, not simplified sun sign content.

### The question they cannot answer

> "Which specific app on the App Store duplicates this functionality? I have asked twice in writing and received no answer."

Force them to name a competitor. They cannot, because none exists.

### Supporting evidence

- **Google Play:** Live and approved with zero issues. 10+ organic downloads already.
- **User traction:** 519 accounts, 228 MAU, 191 signups in the last 30 days -- all organic.
- **SEO proof of demand:** 23,000 impressions/day, 230x growth in 3 months, average position 8.9. Users are actively searching for what Lunary offers.
- **Category is NOT saturated.** Only around 10 astrology apps in the App Store. None of them do real astronomical calculations tied to educational content at this scale.
- **The name itself:** "Lunary: Personal Ephemeris". An ephemeris is a reference tool. Rejecting this is like rejecting a calculator app because there are "too many maths apps."

### If they push back on 4.3(b)

- "I submitted a detailed technical brief on 28 February. The second and third rejections used the exact same template text without engaging with a single point from that document. I would appreciate the opportunity to discuss the specific technical differences today."
- "Lunary belongs to a category that does not exist yet on the App Store. It is the only app combining computed ephemeris data, full natal chart analysis, and a 2,000+ article educational library."
- If they still will not budge: "I would like to formally appeal this decision to the App Review Board. Can you confirm the process for that?"

---

## Issue 2: Guideline 2.1(b) -- IAP Error

### The facts

- Review device: iPad Air 11-inch (M3), iPadOS 26.3
- **iPadOS 26.3 is not available to developers.** Xcode only offers 26.2 simulator runtimes as of today.
- Tested successfully on **6 devices:**
  - 4 simulators on iPadOS/iOS 26.2 (iPad Pro M3, iPad Air M5, iPhone 17, iPhone 14 Plus)
  - iPhone Pro physical device on iOS 26.3.1 beta
  - iPad Pro 12.9-inch 6th gen on iOS 17.7.1
- All sandbox purchases complete successfully. Screenshots available.
- Paid Apps Agreement is active. RevenueCat is properly configured.
- This appears to be a StoreKit regression specific to iPadOS 26.3.

### What to ask them

- "Could you share the specific error message you encountered?"
- "Would you be willing to retry on 26.3.1 or 26.2? I believe this is an OS-level issue rather than an app issue."
- "I am happy to investigate further if you can provide the error details."

---

## Three template rejections -- address this directly

- "I want to flag that all three rejections used identical template language. The detailed technical brief I submitted on 28 February was not acknowledged or addressed in the subsequent rejections. This call is exactly what I was hoping for -- a proper technical discussion about what Lunary actually does."

---

## Words to use

- Personal ephemeris
- Educational astronomy tool
- Computational engine
- Planetary positions / natal chart analysis
- VSOP87 planetary theory
- Original educational content
- Structured learning paths
- Digital reference tool

## Words to avoid

- Astrology app
- Horoscope
- Fortune telling / prediction
- Zodiac / star sign
- Spiritual / mystic
- "Reading" (say "analysis" instead)

---

## Things NOT to say

- Do not mention the WebView/Capacitor architecture unless directly asked
- Do not mention revenue or what Apple is "missing out on"
- Do not name-drop competitors negatively -- position Lunary as a different category
- Do not get emotional. Let the evidence do the work.
- Do not mention Monkey Taps by name (use the precedent data for your own confidence only)

---

## Closing

- "To confirm next steps: [repeat whatever they say]."
- "I will resubmit with [any changes discussed]. Is there anything else you would recommend before I do?"
- "Thank you for your time. I really appreciate the chance to discuss this properly."

---

## If the call fails -- escalation path

1. Submit formal appeal to the App Review Board: developer.apple.com/contact/app-store/?topic=appeal
2. If the Board also rejects, contact Apple Developer Relations directly
3. Last resort: public write-up (3 identical template rejections, no engagement with technical brief, Google Play approved instantly)

---

## Quick reference -- have visible during the call

| Fact                  | Value                          |
| --------------------- | ------------------------------ |
| Engine                | astronomy-engine (MIT, VSOP87) |
| Precision             | +/-1 arcminute                 |
| House system          | Placidus                       |
| Grimoire articles     | 2,000+                         |
| Synastry aspects      | 36                             |
| Cosmic Score patterns | 12                             |
| Widget types          | 3                              |
| Total accounts        | 519                            |
| MAU                   | 228                            |
| SEO impressions/day   | 23,000                         |
| Google Play           | Live, approved, no issues      |
| Entity                | Delaware C-Corp (Stripe Atlas) |
