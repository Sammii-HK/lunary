# Birthchart upgrade handover, 2026-04-26

Worktree: `/Users/sammii/development/lunary/.claude/worktrees/birthchart-upgrade`

Branch: `birthchart-upgrade`

Status: uncommitted local batch. Nothing has been pushed, merged, deployed, or run against a database.

## Latest wrap-up update, 2026-04-28

This branch has moved beyond the original 2026-04-26 handover. Since then the main work has been dashboard cleanup, chart light/dark unification, tarot page tightening, cached horoscope fixes, and final QA patches from Sammii's live review.

Latest important deltas:

- Dashboard share buttons are unified through `src/components/share/ShareIconButton.tsx`.
- Moon, Sky Now, and daily cosmic share compact buttons now render as the same 28px icon-only control.
- A scoped CSS guard in `src/app/globals.css` prevents compact dashboard share buttons from inheriting the large bordered share-button style.
- Collapsed Sky Now no longer shows Sun/Moon rise-set times.
- Sky Now expanded timing now searches from the start of the user's local day and formats 24-hour times, fixing midnight-ish sunrise values.
- `useLocation` no longer fills real saved coordinates with the New York default timezone/city when timezone is missing. It uses the browser timezone for real coordinates.
- `Today’s Influence` now prefers one tight personal transit with orb/exactness/duration/rarity instead of broad cached copy.
- `/api/horoscope/daily` treats cached "birth chart unavailable" copy as stale once the user has a usable birth chart, even if the old cache was missing `birthChartVersion`.
- Final render guards were expanded so stale "birth chart unavailable" strings cannot leak from cached horoscope data.
- Tarot overview cards now show only the tightest/current transit on the card and keep the full transit list for the detail sheet.
- Tarot removed the top duplicate daily/weekly cards, empty Reading Frequency card, repetitive Pattern note labels, and "Why this card?" filler.
- Tarot detail now uses the native bottom sheet instead of a centred floating modal.
- Tarot pattern counts now rebuild from observed `/api/patterns/user-readings` data when available.
- Chart wheels now use shared chart tokens via `src/components/charts/chartTheme.ts`, including Group Sky, Transit Scrubber, Synastry, and BirthChart.
- Chart gesture handling was hardened with safe pointer capture/release and cancelable-event checks.
- `localhost:3003` was restarted cleanly after a stale Webpack dev chunk caused `Cannot read properties of undefined (reading 'call')` during chart zoom/scroll.

Current local dev server:

- `pnpm exec next dev -p 3003` is running.
- `/app` and `/app/time-machine` return `200` after compilation.
- First page load after restart can take a while while Next compiles route chunks.

## What we were doing

This branch started as a birth chart upgrade, then expanded into an activation and monetisation pass around the same user journey:

- Make the birth chart easier for beginners without removing advanced depth.
- Improve the first-run onboarding moment after signup birthday collection.
- Close obvious premium leaks while keeping Lunary's teaser-first philosophy.
- Remove or pause surfaces that felt noisy or low-quality, especially robotic audio.
- Keep the dashboard close to the version Sammii liked.

## Decisions made

- Keep the birth-time and birth-city modal. Users complained about wrong charts, so collecting accurate data early is still correct.
- Use the signup birthday as a hook: `You're a [Sun sign]. Want to see your Moon and Rising?`
- Show a celebratory chart-calculation loading moment, then show the `Where would you like to go?` picker instead of forcing everyone straight to `/app`.
- Default birth chart house system to Whole Sign and move house-system changes into chart settings.
- Make Beginner/Pro chart mode visible as labelled `Guided`, `Pro`, and `Custom` pills.
- Group Sky free tier is a 1-friend blurred preview, not a 0-friend wall.
- AudioNarrator mounts are paused across the app while Sammii decides whether voice quality is worth TTS cost.
- Web push prompt stays as a contextual dashboard banner after engagement, not during signup.
- Push dismissals escalate: 7 days, then 30 days, then never.
- CosmicScore and ShareZodiacSeason are back near the top of the dashboard.
- Paid horoscope compact card stays linked; no headline-only change.

## What changed

### Birth chart

- Added chart density modes on `/app/birth-chart`: `guided`, `pro`, and `custom`.
- Guided mode defaults to a cleaner wheel with aspects, asteroids, and sensitive points hidden.
- Pro mode enables aspects, asteroids, and points, and sets the aspect filter to all.
- Manual toggle drift marks the chart as Custom.
- `ChartControls` now has a clear Reading mode section with icon, label, three pills, subtitle, and a 7-day `NEW` badge.
- The wheel legend hides asteroid legend entries when asteroids are off.
- The wheel keeps selected hidden objects renderable.
- Planet taps open the grounded sheet.
- Hit targets are larger.
- Pinch/pan behaviour was preserved from the earlier chart pass.
- Added `src/components/birth-chart-sections/SectionGuide.tsx` and reading-path cards across chart interpretation sections.

### Onboarding

- Welcome step now uses a Big 3 hook when birthday is already known.
- Extracted shared Sun sign helper: `src/utils/astrology/sun-sign-from-date.ts`.
- Birthday step still pre-fills birthday from signup.
- Birthday submit now shows a 3s minimum `Calculating your chart...` moment with Full Moon icon, Sun/Big 3 copy, and a best-effort daily horoscope tease.
- After loading, user sees the route picker.
- Picker now actually navigates to the selected destination. This was fixed after the swarm: the earlier implementation used `Link href` but `handleComplete()` always pushed `/app`.
- Picker now highlights `Birth chart` first with a `Just made` badge, but still lets users choose Daily overview, Tarot, Horoscope, Profile, or Grimoire.
- The old complete-step picker is kept as part of the flow, not deleted.

### Dashboard

- Dashboard clutter from an earlier pass remains removed:
  - No six-word horoscope dashboard card.
  - No Astral Guide dashboard promo.
  - No daily audio recap dashboard launcher.
- CosmicScore and ShareZodiacSeason are restored above the moon/sky grid.
- Evening Ritual and compact horoscope remain lower on the dashboard.
- `WebPushContextualPrompt` is mounted near the top of the dashboard for authenticated users, but it only renders after engagement conditions are met.

### Web push

- Added `src/components/WebPushContextualPrompt.tsx`.
- Prompt only appears when:
  - Browser supports Notification, service workers, and PushManager.
  - Notification permission is still `default`.
  - User is not in native Capacitor.
  - `dashboard-engaged` exists in localStorage.
  - Dismiss suppression window has expired.
- `dashboard-engaged` is set after horoscope view or 5s on the birth chart page.
- Dismissal uses `web-push-prompt-dismiss-count` plus `web-push-prompt-dismissed-until`.
- Suppression ladder: first dismiss = 7 days, second = 30 days, third+ = `never`.

### Premium leaks and teaser gates

- Group Sky now uses entitlement key `group_sky`.
- Free Group Sky users can select one friend, then see the wheel blurred with lock overlay and `SmartTrialButton`.
- Free Group Sky users do not see timing or insight panels.
- Paid Group Sky users can use up to 6 friends.
- Year in Stars now has server-side yearly access checks on both routes.
- Locked Year in Stars reel limits to the first slide, pauses auto-advance, hides share CTA, and overlays an upgrade prompt.
- Friend synastry API strips rich chart/aspect data for free users.
- Friend synastry UI gates SynastryChart, CompatibilityBreakdown, element balance, modality balance, and aspects behind `friend_connections`.
- Free friend synastry keeps compatibility percentage, summary, and upgrade teaser.
- `ChartCinematic.tsx` is deleted and has no remaining references.
- Added entitlement keys `group_sky` and `voice_narration` to paid tiers.

### AudioNarrator

- AudioNarrator component, hook, route, and `voice_narration` entitlement remain in place.
- AudioNarrator mounts are commented out/paused across the app with marker:
  `AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.`
- This is intentional even though commented blocks are not ideal, because Sammii wanted to pause the UI without reconstructing all mount points later.
- `NextHitCard` was corrected so it no longer promises voice while audio is paused. Free users see `Deeper read on Plus`; paid users see no empty lock CTA.
- Browser/system voice scoring improvements remain in `src/lib/audio/tts-cache.ts`, but they are not the final answer for high-quality narration.

### Tarot and journal loop

- Tarot page analytics waits for auth/subscription state.
- Paid personalised tarot tracks personalised view events; free/generic tracks generic tarot view.
- Tarot draw analytics records spread slug, spread name, card count, and plan type after saving.
- Tarot save-to-journal sends `sourceMessageId`.
- Journal route parses the request before free-tier limit checks.
- Repeated tarot saves return the existing journal entry with `deduped: true`.
- Saved spreads have richer selected state and summary snippets.
- Tarot Time Machine links save successful linked events locally.
- Added unit test: `__tests__/unit/api/journal-tarot-source.test.ts`.

### Sky Now

- Dashboard Sky Now widget no longer uses the map pin icon.
- Compact card shows Sun and Moon rise/set times when local timing exists.
- Expanded Sky Now still shows local timing detail.
- Missing local timing shows a quiet `Use location` prompt.

### Astral Guide

- Guide mic input is restored.
- Interim transcript display is restored.
- Persona picker is restored on mobile and desktop.
- Persona prompt wiring is restored.
- Do not remove these again. The problem was playback voice quality, not the mic or persona UI.

### Lunary MCP

- MCP startup logging is quiet by default.
- `LUNARY_MCP_DEBUG=1` enables verbose logging.
- Missing API key logs once.
- HTTP errors are categorised and no longer dump raw response bodies.
- Tool errors return structured `isError: true` payloads.
- Social tool HTTP failures are quieter and more structured.
- Docs mention the debug flag and quiet default.

## Current dirty scope

Current snapshot is around 85 modified tracked files, 1 tracked deletion, and 7 untracked files.

Notable untracked files:

- `__tests__/unit/api/journal-tarot-source.test.ts`
- `docs/HANDOVER_BIRTHCHART_UPGRADE_2026-04-26.md`
- `src/components/WebPushContextualPrompt.tsx`
- `src/components/birth-chart-sections/SectionGuide.tsx`
- `src/components/charts/chartTheme.ts`
- `src/components/share/ShareIconButton.tsx`
- `src/utils/astrology/sun-sign-from-date.ts`

Do not delete untracked files without Sammii explicitly approving it.

## Verification run

Passed on 2026-04-28 wrap-up:

- Focused ESLint over all changed TS/TSX files:
  `git diff --name-only --diff-filter=ACMRT | rg '\.(ts|tsx)$' | tr '\n' '\0' | xargs -0 pnpm exec eslint`
- Result: 0 errors, 2 warnings.
- Remaining warnings are existing `@next/next/no-img-element` warnings in:
  - `src/app/(authenticated)/profile/friends/[id]/page.tsx`
  - `src/components/horoscope/HoroscopeSeasonReading.tsx`
- `pnpm jest __tests__/unit/api/journal-tarot-source.test.ts --runInBand`
- Result: 2 tests passed.
- `git diff --check`
- Result: passed.
- Filtered `tsc --noEmit` checks showed no diagnostics for the touched chart/gesture/dashboard files, but the full repo still has many pre-existing type errors.

Earlier passed:

- Focused ESLint over 57 changed TS/TSX files:
  `git diff --name-only --diff-filter=ACMRT | rg '\.(ts|tsx)$' | tr '\n' '\0' | xargs -0 pnpm exec eslint`
- Result: 0 errors, 2 warnings.
- Remaining warnings are existing `@next/next/no-img-element` warnings in:
  - `src/app/(authenticated)/profile/friends/[id]/page.tsx`
  - `src/components/horoscope/HoroscopeSeasonReading.tsx`
- `pnpm jest __tests__/unit/api/journal-tarot-source.test.ts --runInBand`
- Result: 2 tests passed.
- `git diff --check`
- Result: passed.
- Earlier in the branch: focused ESLint passed for Guide, dashboard/Sky Now, chart, tarot, MCP, and birth-chart-section files.
- Earlier in the branch: `pnpm build` passed inside `lunary-mcp`.

Not completed / still not green:

- Full app typecheck. `pnpm exec tsc --noEmit --pretty false` now completes, but the repo still has many pre-existing type errors across tests, admin/API routes, persona routes, OG routes, progress, and entitlement plan typing. The 2026-04-28 filtered check did not show errors in the files touched by the latest dashboard/chart fixes.
- Full app build. Not run after the full swarm batch.
- Browser QA is partial. The in-app Browser Node REPL tool was unavailable and exposed Chrome connectors were not attached, so verification used server checks, live dev logs, focused lint, focused runtime route checks, and user-observed QA.

## Manual QA needed

### Onboarding

- New user with birthday from signup should see the Sun sign Big 3 hook.
- Birthday field should be prefilled, not blank.
- Birth time and city entry should still work.
- Location suggestions should still work.
- Submitting birthday/details should show the 3s chart-loading moment.
- Loading moment should not trap the user if chart generation fails.
- After loading, picker should appear.
- Picker should route correctly to each destination:
  - Birth chart
  - Daily overview
  - Tarot
  - Horoscope
  - Profile
  - Grimoire
- Skip flow should still work from welcome, birthday, and complete states.
- Preview mode should still work if used by admin/testing surfaces.

### Dashboard

- Dashboard should feel close to the pre-clutter version.
- CosmicScore and ShareZodiacSeason should be back near the top.
- No six-word horoscope card.
- No Astral Guide promo card.
- No daily audio recap launcher.
- Evening Ritual should still appear in evening conditions.
- Compact horoscope card should still link correctly.
- Referral CTA and year-in-stars seasonal card should still render in the right places.
- Moon and Sky Now compact share buttons should be identical small icon buttons.
- Sky Now collapsed card should not show rise/set times.
- Sky Now expanded card should show plausible local rise/set times in 24-hour format.
- Today’s Influence should show one exact/tight personal transit with orb and duration context, and should not mention missing birth-chart data for users who have charts.

### Web push

- Banner should not show during signup.
- Banner should not show without `dashboard-engaged`.
- Banner should show on dashboard when permission is `default`, engagement marker exists, and browser supports web push.
- Accept should trigger the native browser notification prompt once.
- Successful accept should create a web push subscription via `/api/notifications/subscribe`.
- Dismiss should suppress for 7 days.
- Second dismiss should suppress for 30 days.
- Third dismiss should set `never`.
- Native Capacitor app should not show the web banner.

### Birth chart

- Guided, Pro, and Custom pills should be visible and legible.
- `NEW` badge should appear only within the 7-day localStorage window.
- Guided mode should hide advanced clutter.
- Pro mode should show advanced layers.
- Manual toggle drift should mark Custom.
- Mode should persist across refresh.
- Whole Sign should be the default.
- House-system changes should be available through chart settings, not first-run jargon.
- Planet taps should open the grounded sheet.
- Pinch/pan should not crash or hide selected glyphs.
- Selected hidden asteroids/points should remain visible while selected.
- Light mode chart colours should be softer and readable across BirthChart, Transit Scrubber, Synastry, and Group Sky.
- If chart zoom throws `Cannot read properties of undefined (reading 'call')`, hard-refresh first because stale Webpack dev chunks caused that in local QA after repeated hot reloads.

### Tarot

- Tarot page should not show duplicate daily/weekly cards at the top.
- Overview cards should show only the closest/tightest/most important transit.
- Detail sheet should show the full transit list in a native bottom sheet.
- Daily/weekly cards should not show "Why this card?" filler.
- Pattern surfaces should not repeat `Pattern note` labels.
- Pattern counts should match real observed readings for the selected range.
- Reading Frequency should not render as an empty/useless card.

### Premium gates

- Group Sky free user with 0 selected friends should see the "Pick a friend to preview Group Sky" pitch.
- Group Sky free user after selecting 1 friend should see blurred wheel + lock overlay + trial CTA.
- Group Sky free user should not see timing or insight panels.
- Group Sky paid user should be able to select up to 6 friends and see insights.
- Year in Stars free user should see first slide plus upgrade overlay, no auto-advance, no share CTA.
- Year in Stars paid user should see full reel and share CTA.
- Friend synastry free user should see compatibility percentage and summary, but not rich chart/aspect breakdown.
- Friend synastry paid user should see full SynastryChart, CompatibilityBreakdown, element/modality blocks, and aspects.
- Check there are no remaining references to `ChartCinematic`.

### AudioNarrator pause

- No AudioNarrator controls should render on the paused surfaces.
- Paid users should not see empty holes where narrator controls were.
- Free users should not see voice-specific upsell copy while the feature is paused.
- Search for the pause marker before restoring anything:
  `rg "AudioNarrator paused" src`

### Tarot and journal

- Tarot draw should still complete.
- Tarot analytics should not block reading creation.
- Save-to-journal should work.
- Saving the same tarot reading twice should return/detect the existing journal entry.
- Journal entries should include tarot metadata.
- Tarot Time Machine links should save successful linked events locally.

### Sky Now

- Dashboard card should show compact Sun/Moon rise/set times when local timing exists.
- Expanded card should show local timing detail.
- Missing location should show the quiet `Use location` prompt.
- Map pin should not be back.

### Guide

- Mic button should be visible.
- Interim transcript should display while speaking.
- Final transcript should append into the composer.
- Persona picker should be visible on mobile and desktop.
- Selected persona should affect user-facing Guide system prompt.

## Suggested commit split

If committing, split into logical local commits before any push:

1. Birth chart density, section guides, Sky Now, tarot/journal loop, MCP quiet mode.
2. Premium gate fixes: Group Sky, Year in Stars, friend synastry, entitlements, ChartCinematic removal.
3. Onboarding activation: Big 3 hook, loading moment, picker routing, Whole Sign default.
4. Dashboard/web push: dashboard ordering, contextual push banner, engagement markers, suppression ladder.
5. Audio pause: AudioNarrator mount comments and `NextHitCard` copy correction.

Do not push without Sammii explicitly approving it. Lunary PRs should be batched to avoid extra Vercel builds.

## Important cautions

- Do not run DB commands without confirming the target. Lunary `.env.local` can point at production.
- Do not delete generated or untracked files without explicit permission.
- Do not bypass pre-commit hooks with `--no-verify`.
- Do not merge, push, or deploy without approval.
- Do not re-remove Guide mic or persona picker.
- Do not bring back dashboard clutter unless Sammii explicitly asks.
- Treat browser/system voice selection as best-effort only. The current product decision is that AudioNarrator UI is paused.
