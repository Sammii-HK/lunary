# Beyond Your Sun Sign — Quiz System Runbook

Everything you need to work with, extend, or debug the quiz cornerstone. Pick up from here next session.

---

## Table of contents

1. [What the system does](#what-the-system-does)
2. [End-to-end user flow](#end-to-end-user-flow)
3. [Data pipeline](#data-pipeline)
4. [File map](#file-map)
5. [Adding a new quiz](#adding-a-new-quiz)
6. [Adding the email drip for a new quiz](#adding-the-email-drip-for-a-new-quiz)
7. [Adding launch content for a new quiz](#adding-launch-content-for-a-new-quiz)
8. [URLs and endpoints](#urls-and-endpoints)
9. [Testing checklist](#testing-checklist)
10. [Gotchas and rules](#gotchas-and-rules)

---

## What the system does

The Beyond Your Sun Sign quiz series is Lunary's top-of-funnel conversion engine. Each quiz:

- Reads a user's full birth chart via astronomy-engine (MIT, NASA-grade)
- Composes a personalised archetype + reading from the grimoire JSONs (no LLM)
- Teases the reading publicly, unlocks the full version after signup
- Auto-enrols the user in the 7-day Lunary+ trial
- Delivers a quiz-aware Day 2 / Day 5 email drip instead of the generic welcome drip
- Generates per-planet share cards for social distribution

Voice rules: UK English, no em dashes, sentence case, factual-but-fun. See root `CLAUDE.md`.

---

## End-to-end user flow

```
1. User lands on /quiz/beyond-your-sun-sign/<slug>
2. Fills birth data → POST /api/quiz/<slug>
3. Teased result renders client-side with archetype + 3 sections + locked tease + share card
4. User clicks "Unlock my full profile" → cookie `lunary_pending_quiz` stores birth data
5. /auth signup or signin
6. Post-auth: /auth fires POST /api/quiz/claim
   - Validates session, reads cookie, recomputes chart with unlocked=true
   - Records a `quiz_claim` conversion event with archetype + rising + sun sign metadata
   - Returns the full result, clears the cookie
7. /auth stashes result in sessionStorage, redirects to /quiz/beyond-your-sun-sign/<slug>/full
8. /full renders full unlocked reading (self-healing: if sessionStorage is empty but
   cookie is still there, /full will fire /api/quiz/claim itself)
9. User sees full reading, can opt in to email via "Email this to me" button
10. Day 2 and Day 5 cron (welcome-drip) routes to the quiz-specific drip template
    instead of the generic welcome series
```

---

## Data pipeline

Every quiz result is a pure composition from deterministic sources. No LLMs, no hallucinations.

| Source                                                       | What it provides                                                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `astronomy-engine` (MIT) via `utils/astrology/birthChart.ts` | Planets, houses, angles, nodes, Chiron, asteroids                                                                    |
| `src/data/*-placements.json`                                 | Per-planet-in-sign interpretations (coreTraits, lifeThemes, strengths, challenges, careerPaths, famousExamples)      |
| `src/data/rising-signs.json`                                 | Per-rising-sign interpretations (firstImpression, physicalAppearance, lifeApproach, howOthersSeeYou, famousExamples) |
| `src/data/houses.json`                                       | Per-house meanings                                                                                                   |
| `src/data/aspect-interpretations.json`                       | Per-aspect-between-planets interpretations                                                                           |
| `src/lib/quiz/rulers.ts`                                     | Modern + traditional rulership tables                                                                                |
| `src/lib/quiz/dignities.ts`                                  | Domicile/exaltation/detriment/fall by planet + sign                                                                  |
| `src/lib/quiz/chart-analysis.ts`                             | Angular / succedent / cadent house nature                                                                            |
| `src/lib/quiz/aspects.ts`                                    | Aspect detection + bidirectional interpretation lookup                                                               |
| `src/lib/quiz/archetypes.ts`                                 | 19 named archetypes selected from signal combinations                                                                |

The quiz engine composes these sources based on detected signals (rising sign, chart ruler, dignity, house nature, ruler-in-rising, retrograde) and emits a `QuizResult` object.

---

## File map

### Shared quiz infrastructure

```
src/lib/quiz/
├── types.ts                    # QuizResult, QuizInput, QuizSection, QuizArchetype
├── rulers.ts                   # Modern + traditional rulership tables
├── dignities.ts                # Dignity table + describeDignity()
├── chart-analysis.ts           # Angular / succedent / cadent detection
├── aspects.ts                  # Aspect detection + interpretation lookup
├── archetypes.ts               # 19 archetype selector
├── grimoire-lookup.ts          # O(1) lookups across placement/house/rising JSONs
├── email.ts                    # sendQuizResultEmail() helper (opt-in delivery)
├── engines/
│   └── chart-ruler.ts          # First quiz's composition engine
└── drip/
    ├── types.ts                # DripConfig, DripRenderContext, DripEmail
    ├── registry.ts              # Central registry, getDripConfig(slug)
    └── chart-ruler.ts          # Day 2 + Day 5 templates for chart ruler
```

### Routes

```
src/app/
├── quiz/beyond-your-sun-sign/
│   └── [slug]/
│       ├── page.tsx             # Public landing (/quiz/beyond-your-sun-sign/chart-ruler)
│       ├── full/page.tsx        # Authenticated full reading (post-claim)
│       └── preview/page.tsx     # SSR preview (query params only, no auth)
└── api/
    ├── quiz/
    │   ├── chart-ruler/route.ts  # POST: compute + return teased result
    │   ├── claim/route.ts        # POST: auth'd, recompute unlocked, record event
    │   └── email-result/route.ts # POST: opt-in email delivery
    ├── og/quiz/
    │   ├── [slug]/route.tsx     # Result share card (story + Pinterest)
    │   └── ruler/[planet]/route.tsx  # Per-planet launch cards (4 formats)
    └── cron/
        └── welcome-drip/route.ts # Day 2 + Day 5 cron, quiz-aware routing
```

### UI components

```
src/components/quiz/
├── ChartRulerQuizClient.tsx     # Landing form + teased result view + share
└── FullQuizResultView.tsx       # Authenticated full reading
```

### Email templates

```
src/lib/email-components/
└── QuizResultEmail.tsx          # Opt-in result delivery template

src/lib/quiz/drip/
└── chart-ruler.ts               # Day 2 + Day 5 drip templates (HTML + text)
```

### Content assets (not code)

```
content/quiz/
├── QUIZ_SYSTEM.md                 # This file
├── chart-ruler-video-scripts.md   # 10 video scripts (one per planet ruler)
└── chart-ruler-launch-posts.md    # Platform-specific launch copy
```

---

## Adding a new quiz

Pattern learned from Chart Ruler. Budget: roughly 1 day for engine + 1 day for content.

### Step 1: Write the engine

Create `src/lib/quiz/engines/<quiz-slug>.ts`.

Export one function:

```ts
export function compose<Name>Result(
  chart: BirthChartResult,
  options: { unlocked?: boolean } = {},
): QuizResult | null {
  // 1. Read chart → identify the key placements for this quiz
  // 2. Detect signals (dignity, aspects, whatever the quiz cares about)
  // 3. Pick / compute an archetype label
  // 4. Compose sections from grimoire lookups
  // 5. Return a QuizResult with hero, sections, shareCard, tease, meta
}
```

Reuse `src/lib/quiz/grimoire-lookup.ts`, `rulers.ts`, `dignities.ts`, `aspects.ts`, `archetypes.ts` as needed.

The `unlocked` flag should emit a meatier version of the result with the formerly locked sections unlocked.

### Step 2: Add the API route

Create `src/app/api/quiz/<slug>/route.ts`. Copy the pattern from `chart-ruler/route.ts`:

- Zod-validate birthDate / birthTime / birthLocation / birthTimezone
- Call `generateBirthChartWithHouses`
- Call your compose function
- Return the QuizResult JSON

### Step 3: Add the landing page

Create `src/app/quiz/beyond-your-sun-sign/<slug>/page.tsx`. Copy the pattern from `chart-ruler/page.tsx`:

- Server component with metadata (title, description, OG)
- Intro copy
- Mount your quiz's client component

### Step 4: Add the client component

Create `src/components/quiz/<Name>QuizClient.tsx`. The simplest path: extract common logic from `ChartRulerQuizClient.tsx` into a reusable `BaseQuizClient`, or copy-adapt. Key responsibilities:

- Collect birth data
- POST to `/api/quiz/<slug>`
- Set `lunary_pending_quiz` cookie on success
- Render the teased result with archetype + sections + share section + locked tease + signup CTA
- Fire PostHog events (`quiz_started`, `quiz_submitted`, `quiz_result_viewed`, `quiz_share_clicked`, `quiz_signup_clicked`)

### Step 5: Update the claim endpoint

`src/app/api/quiz/claim/route.ts` currently hard-codes `parsed.data.quizSlug !== 'chart-ruler'` as an unsupported-slug check. Add your new slug, and import + dispatch to your compose function when matching.

### Step 6: Update the full result page

`src/app/quiz/beyond-your-sun-sign/[slug]/full/page.tsx` works for all quizzes (slug-parameterised). No changes needed as long as your QuizResult shape matches.

### Step 7: Add the OG share card (optional)

If you want a quiz-specific result share card, add a template to `src/app/api/og/quiz/[slug]/route.tsx` or extend the existing one.

### Step 8: Typecheck + commit

```
npx tsc --noEmit
```

---

## Adding the email drip for a new quiz

Zero changes to the cron. Just three steps:

### Step 1: Write the templates

Create `src/lib/quiz/drip/<slug>.ts`. Export a `DripConfig`:

```ts
import type { DripConfig, DripEmail, DripRenderContext } from './types';

async function renderDay2(ctx: DripRenderContext): Promise<DripEmail> {
  return {
    subject: `...`,
    html: `<html>...</html>`,
    text: `...`,
  };
}

async function renderDay5(ctx: DripRenderContext): Promise<DripEmail> { ... }

export const <slug>DripConfig: DripConfig = {
  quizSlug: '<slug>',
  day2: renderDay2,
  day5: renderDay5,
};
```

Each render function receives a `DripRenderContext` with `userName`, `userEmail`, `userId`, optional `sunSign`, `risingSign`, `archetype`, `archetypeTagline`.

### Step 2: Register it

Edit `src/lib/quiz/drip/registry.ts`:

```ts
import { <slug>DripConfig } from './<slug>';
const configs: DripConfig[] = [chartRulerDripConfig, <slug>DripConfig];
```

### Step 3: Ship

That's it. The `welcome-drip` cron reads the registry and routes each user to their quiz's drip based on their `quiz_claim` conversion event.

The generic welcome drip stays as the fallback for users without a quiz claim.

---

## Adding launch content for a new quiz

Pattern learned from Chart Ruler. See `chart-ruler-video-scripts.md` and `chart-ruler-launch-posts.md` for the shape.

### Video scripts

Create `content/quiz/<slug>-video-scripts.md`:

- Hook pattern: lift the proven one ("Know your rising sign? Is X your chart ruler?") or design a quiz-specific hook
- One script per archetype variant / per core segmentation axis
- ~45 sec each, ~100 words
- CTA: always `Take the Beyond Your Sun Sign quiz on lunary.app to find yours.`

### Platform posts

Create `content/quiz/<slug>-launch-posts.md`:

- Threads: text-only (images don't perform per Sammii's data)
- Bluesky + Mastodon: text + image reference
- Pinterest: pin title + description with hashtags
- Instagram: Bluesky text + hashtags

### Static images

If the quiz has a visual axis (like planet per ruler), add a per-variant OG endpoint. Example: `src/app/api/og/quiz/<axis>/[<variant>]/route.tsx`.

Follow the pattern in `src/app/api/og/quiz/ruler/[planet]/route.tsx`:

- Allow-list the variants (never trust URL input)
- Four format variants: `pinterest` (1000x1500), `instagram-square` (1080x1080), `instagram-portrait` (1080x1350), `story` (1080x1920)
- Use `OG_COLORS` + shared `loadShareFonts`
- Edge runtime

### Schedule everything

Once content is ready, queue in Spellcast:

- Pinterest: use the 1000x1500 image + pin description
- Bluesky / Mastodon: use the 1080x1080 image + Bluesky text
- Threads: text only
- Instagram: 1080x1080 (or carousel) + Instagram caption
- TikTok / Reels: record from the script, use the story format as a cover if needed

---

## URLs and endpoints

Replace `<host>` with `localhost:3003` for dev, `lunary.app` for prod.

### Public user-facing

- **Landing**: `<host>/quiz/beyond-your-sun-sign/chart-ruler`
- **Full (authenticated)**: `<host>/quiz/beyond-your-sun-sign/chart-ruler/full`
- **Preview (no auth, query-param driven)**: `<host>/quiz/beyond-your-sun-sign/chart-ruler/preview?birthDate=1994-01-20&birthTime=01:00&birthLocation=London,%20UK`

### APIs (JSON)

- `POST /api/quiz/chart-ruler` — compute + return teased result
- `POST /api/quiz/claim` — auth'd, recompute unlocked, record event, return result
- `POST /api/quiz/email-result` — auth'd, opt-in email delivery

### Static images

- `/api/og/quiz/chart-ruler?format=story&label=...&subtitle=...&tagline=...`
- `/api/og/quiz/ruler/<planet>?format=pinterest|instagram-square|instagram-portrait|story`

Planet slugs: `sun`, `moon`, `mercury`, `venus`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`.

---

## Testing checklist

Before shipping a new quiz or major change:

1. **Preview URL renders**: hit `/quiz/beyond-your-sun-sign/<slug>/preview?birthDate=...&birthTime=...&birthLocation=...` → should render the full unlocked result
2. **API works**: `curl -X POST /api/quiz/<slug> -d '{"birthDate":"1994-01-20","birthTime":"01:00","birthLocation":"London, UK"}' -H 'Content-Type: application/json'` → returns valid JSON
3. **Cookie flow**: take the quiz in a browser, check DevTools → Application → Cookies → `lunary_pending_quiz` set with birth data
4. **Claim works**: POST `/api/quiz/claim` when signed in with the cookie → returns 200 with `result.archetype.label`, cookie cleared
5. **Full page renders**: `/quiz/beyond-your-sun-sign/<slug>/full` with populated sessionStorage → shows the full result
6. **Full page self-heals**: `/quiz/beyond-your-sun-sign/<slug>/full` with empty sessionStorage but cookie present → re-claims and renders
7. **Share card renders**: hit `/api/og/quiz/<slug>?format=story&...` → returns `image/png`, 200
8. **Drip registered**: `getDripConfig('<slug>')` returns config, cron picks it up

---

## Gotchas and rules

- **Never use LLMs to generate quiz content**. Engine is pure function from grimoire. Deterministic, fast, cheap, on-brand.
- **Never reproduce em dashes**. UK English, sentence case, no em dashes. See `writing-rules.md` in memory.
- **Never soft-paywall**. Per Lunary product rule: capped components + teasers + truncations. No "upgrade to see this", only "unlock your full profile".
- **Never auto-send the full reading email on claim**. Users see the result on-screen. Email is opt-in via the "Email this to me" button.
- **Always record a `quiz_claim` conversion event in the claim route**. Without it, the welcome-drip cron has no way to route to the quiz drip.
- **Celebrity attributions are cultural, not certified**. The reading already qualifies this in the "Others who share this chart ruler" section. Do not remove the qualifier.
- **Generational placements** (Uranus/Neptune/Pluto) need the cohort nuance. Chart ruler is determined by rising sign, not generational planet placement. Do not conflate them.
- **Client-side chart calc is NOT wired**. Current API compute is server-side (uses LocationIQ for geocoding). Moving to client-side was discussed but not implemented.
- **Dev server cache is flaky during heavy edit sessions**. If you see stale chunks, clear `.next` + hard-refresh. Best-case nuclear: DevTools → Application → Storage → Clear site data + reopen tab.
- **The auth page has a dev-mode webpack chunking quirk** that can cause `Cannot read properties of undefined (reading 'call')` on `/auth` and `/app` routes. It's dev-only and does not affect production. If it blocks you during testing, use the `/preview` URL.
