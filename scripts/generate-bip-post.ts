#!/usr/bin/env tsx
/**
 * Build in Public — Post Generator
 *
 * Fetches Lunary metrics, renders a card image, generates a caption via
 * OpenAI GPT-4o-mini, and schedules the post in Spellcast.
 *
 * Usage:
 *   pnpm post:bip                                     # weekly (default)
 *   pnpm post:bip:weekly                              # weekly
 *   pnpm post:bip:milestone                           # milestone check
 *   pnpm post:bip:launch "Synastry v2"                # feature launch
 *   pnpm post:bip:daily                               # daily update (auto day count)
 *   pnpm post:bip:daily "shipped synastry fix"        # daily with notes (used as bullet context)
 *   pnpm post:bip --dry-run                           # print card + caption, no posting
 *   pnpm post:bip --no-schedule                       # create Spellcast draft only
 *   pnpm post:bip --schedule 2026-03-01T10:00:00Z     # custom schedule time
 *   pnpm post:bip:daily --force                       # override already-posted-today guard
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import {
  fetchWeeklySnapshot,
  fetchDailySnapshot,
  checkMilestones,
  markMilestonePosted,
  getDayCount,
  incrementDayCount,
  type MilestoneCheck,
} from '../src/lib/bip-metrics';
import {
  renderMetricsCard,
  renderMilestoneCard,
  renderFeatureLaunchCard,
} from '../src/lib/video/bip-card-renderer';
import {
  uploadCardImage,
  schedulePost,
  createDraftPost,
  scheduleTextPost,
  createTextDraft,
  getSpellcastPostUrl,
} from '../src/lib/bip-spellcast';
import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function getFlagValue(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return undefined;
}

// Mode detection
let mode: 'weekly' | 'milestone' | 'launch' | 'daily' = 'weekly';
if (hasFlag('--mode')) {
  const m = getFlagValue('--mode');
  if (m === 'milestone' || m === 'launch' || m === 'daily') mode = m;
} else if (hasFlag('--milestone') || args.includes('milestone')) {
  mode = 'milestone';
} else if (hasFlag('--launch') || args.includes('launch')) {
  mode = 'launch';
} else if (hasFlag('--daily') || args.includes('daily')) {
  mode = 'daily';
}

// Feature name / notes — first non-flag, non-mode-keyword argument
const MODE_KEYWORDS = new Set(['weekly', 'milestone', 'launch', 'daily']);
const launchFeature =
  args.find((a) => !a.startsWith('--') && !MODE_KEYWORDS.has(a)) ?? '';

const dryRun = hasFlag('--dry-run');
const noSchedule = hasFlag('--no-schedule');
const customSchedule = getFlagValue('--schedule');

// Output dir
const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos', 'bip');

// ---------------------------------------------------------------------------
// Caption generation via OpenAI GPT-4o-mini
// ---------------------------------------------------------------------------

async function generateCaption(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in .env.local');

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You write Build in Public tweets for @sammiihk, indie founder of Lunary (astrology app).

Rules:
- UK English. No em dashes. Sentence case.
- Specific numbers always (never "some" or "a few").
- Lead with the hero stat (biggest change/achievement).
- End with a question, challenge, or reflection that invites replies.
- No hashtags in the tweet body — they go in the first comment.
- Be honest and grounded, not hype.
- Tone: reflective founder sharing real progress, not a marketer.
- Do NOT use sparkle emoji. Do NOT use em dash (—).
- ✅ emoji is allowed and encouraged for daily update bullet points.`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: 120,
    temperature: 0.8,
  });

  return res.choices[0]?.message?.content?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Schedule time helpers
// ---------------------------------------------------------------------------

function scheduledFor(): string {
  if (customSchedule) return customSchedule;
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function dateStamp(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Weekly mode
// ---------------------------------------------------------------------------

async function runWeekly() {
  console.log('\nFetching weekly metrics snapshot...');
  const snapshot = await fetchWeeklySnapshot();

  console.log(`\nWeekly metrics snapshot (${snapshot.weekLabel})`);
  console.log(
    `  MAU: ${snapshot.mau} (${snapshot.mauDelta >= 0 ? '+' : ''}${snapshot.mauDelta}%)`,
  );
  console.log(
    `  MRR: £${snapshot.mrr.toFixed(2)} (${snapshot.mrrDelta >= 0 ? '+' : ''}${snapshot.mrrDelta}%)`,
  );
  console.log(
    `  Impressions/day: ${snapshot.impressionsPerDay} (${snapshot.impressionsDelta >= 0 ? '+' : ''}${snapshot.impressionsDelta}%)`,
  );
  console.log(`  New signups: ${snapshot.newSignups}`);

  // Generate caption
  const captionPrompt = `Write a Build in Public tweet about my week. Here are the metrics:
- ${snapshot.weekLabel}
- MAU: ${snapshot.mau} (${snapshot.mauDelta >= 0 ? '+' : ''}${snapshot.mauDelta}% vs last week)
- MRR: £${snapshot.mrr.toFixed(2)} (${snapshot.mrrDelta >= 0 ? '+' : ''}${snapshot.mrrDelta}% vs last week)
- Impressions/day: ${snapshot.impressionsPerDay} (${snapshot.impressionsDelta >= 0 ? '+' : ''}${snapshot.impressionsDelta}% vs last week)
- New signups this week: ${snapshot.newSignups}

Lead with the biggest change this week. Keep it honest and grounded.`;

  console.log('\nGenerating caption...');
  const caption = await generateCaption(captionPrompt);
  const charCount = caption.length;

  console.log(`\nCaption (${charCount} chars):`);
  console.log(`  "${caption}"`);

  // Render card
  const cardPath = join(OUTPUT_DIR, `weekly-${dateStamp()}.png`);
  console.log('\nRendering card...');
  await renderMetricsCard(
    {
      weekLabel: snapshot.weekLabel,
      mau: snapshot.mau,
      mauDelta: snapshot.mauDelta,
      mrr: snapshot.mrr,
      mrrDelta: snapshot.mrrDelta,
      impressionsPerDay: snapshot.impressionsPerDay,
      impressionsDelta: snapshot.impressionsDelta,
      newSignups: snapshot.newSignups,
    },
    cardPath,
  );
  console.log(`  Card: ${cardPath}`);

  if (dryRun) {
    console.log('\n(dry run — no post created)\n');
    return;
  }

  // Upload and post
  console.log('\nUploading to Spellcast...');
  const mediaId = await uploadCardImage(cardPath);

  let postId: string;
  if (noSchedule) {
    postId = await createDraftPost({ content: caption, mediaId });
    console.log(`  Draft created: ${getSpellcastPostUrl(postId)}`);
  } else {
    const schedTime = scheduledFor();
    postId = await schedulePost({
      content: caption,
      mediaId,
      scheduledFor: schedTime,
    });
    console.log(`  Scheduled for ${schedTime}: ${getSpellcastPostUrl(postId)}`);
  }

  console.log('\nDone.\n');
}

// ---------------------------------------------------------------------------
// Milestone mode
// ---------------------------------------------------------------------------

async function runMilestone() {
  console.log('\nChecking for milestone crossings...');
  const snapshot = await fetchWeeklySnapshot();
  const milestones = await checkMilestones(snapshot);

  const pending = milestones.filter((m) => m.crossed && !m.alreadyPosted);

  if (pending.length === 0) {
    console.log('  No new milestones crossed.\n');
    return;
  }

  console.log(`  ${pending.length} new milestone(s) crossed:`);
  for (const m of pending) {
    console.log(`    ${m.metric} >= ${m.threshold}`);
  }

  // Post the highest-impact pending milestone
  const milestone = pending[pending.length - 1];
  const currentValue = snapshot[milestone.metric];

  // Context lines for the card
  const contextMap: Partial<
    Record<MilestoneCheck['metric'], { context: string; multiplier?: string }>
  > = {
    impressionsPerDay: {
      context: 'started at 100/day in November',
      multiplier: '123x in 3 months',
    },
    mau: {
      context: `${milestone.threshold} active users reached`,
    },
    mrr: {
      context: `£${milestone.threshold} MRR reached`,
    },
  };
  const ctx = contextMap[milestone.metric];

  const cardSlug = `milestone-${milestone.metric}-${milestone.threshold}`;
  const cardPath = join(OUTPUT_DIR, `${cardSlug}.png`);

  console.log('\nGenerating caption...');
  const captionPrompt = `Write a Build in Public tweet celebrating hitting a milestone:
Metric: ${milestone.metric}
Value: ${currentValue}
Threshold crossed: ${milestone.threshold}

Be genuine and specific. Acknowledge the journey to get here.`;
  const caption = await generateCaption(captionPrompt);
  console.log(`\nCaption (${caption.length} chars):`);
  console.log(`  "${caption}"`);

  console.log('\nRendering card...');
  await renderMilestoneCard(
    {
      metric: milestone.metric,
      value: currentValue,
      threshold: milestone.threshold,
      context: ctx?.context,
      multiplier: ctx?.multiplier,
    },
    cardPath,
  );
  console.log(`  Card: ${cardPath}`);

  if (dryRun) {
    console.log('\n(dry run — no post created)\n');
    return;
  }

  console.log('\nUploading to Spellcast...');
  const mediaId = await uploadCardImage(cardPath);

  let postId: string;
  if (noSchedule) {
    postId = await createDraftPost({ content: caption, mediaId });
    console.log(`  Draft created: ${getSpellcastPostUrl(postId)}`);
  } else {
    const schedTime = scheduledFor();
    postId = await schedulePost({
      content: caption,
      mediaId,
      scheduledFor: schedTime,
    });
    console.log(`  Scheduled for ${schedTime}: ${getSpellcastPostUrl(postId)}`);
  }

  // Mark as posted
  await markMilestonePosted(milestone.metric, milestone.threshold);

  console.log('\nDone.\n');
}

// ---------------------------------------------------------------------------
// Launch mode
// ---------------------------------------------------------------------------

async function runLaunch(featureName: string) {
  if (!featureName) {
    console.error('Error: feature name required for launch mode.');
    console.error('Usage: pnpm post:bip:launch "Feature Name"');
    process.exit(1);
  }

  console.log(`\nFeature launch: ${featureName}`);
  console.log('Fetching current metrics for context...');
  const snapshot = await fetchWeeklySnapshot();

  const captionPrompt = `Write a Build in Public tweet announcing a new feature launch:
Feature: ${featureName}
Current MAU: ${snapshot.mau}
Current MRR: £${snapshot.mrr.toFixed(2)}

Announce it concisely. Lead with what it does and who it's for.
Mention the free tier. End with a question or invitation.`;

  console.log('\nGenerating caption...');
  const caption = await generateCaption(captionPrompt);
  console.log(`\nCaption (${caption.length} chars):`);
  console.log(`  "${caption}"`);

  const slug = featureName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const cardPath = join(OUTPUT_DIR, `launch-${slug}.png`);

  console.log('\nRendering card...');
  await renderFeatureLaunchCard(
    {
      featureName,
      mau: snapshot.mau,
      mrr: snapshot.mrr,
    },
    cardPath,
  );
  console.log(`  Card: ${cardPath}`);

  if (dryRun) {
    console.log('\n(dry run — no post created)\n');
    return;
  }

  console.log('\nUploading to Spellcast...');
  const mediaId = await uploadCardImage(cardPath);

  let postId: string;
  if (noSchedule) {
    postId = await createDraftPost({ content: caption, mediaId });
    console.log(`  Draft created: ${getSpellcastPostUrl(postId)}`);
  } else {
    const schedTime = scheduledFor();
    postId = await schedulePost({
      content: caption,
      mediaId,
      scheduledFor: schedTime,
    });
    console.log(`  Scheduled for ${schedTime}: ${getSpellcastPostUrl(postId)}`);
  }

  console.log('\nDone.\n');
}

// ---------------------------------------------------------------------------
// Daily mode
// ---------------------------------------------------------------------------

async function runDaily(notes: string) {
  const { dayCount, alreadyPostedToday } = getDayCount();

  if (alreadyPostedToday && !dryRun) {
    console.log(
      '  Already posted a daily update today. Use --dry-run to preview or --force to override.\n',
    );
    if (!hasFlag('--force')) return;
  }

  const nextDay = dayCount + 1;

  console.log(`\nDay ${nextDay} — fetching snapshot...`);
  const snapshot = await fetchDailySnapshot();

  console.log(`  MAU: ${snapshot.mau}`);
  console.log(`  MRR: £${snapshot.mrr.toFixed(2)}`);
  console.log(`  New signups today: ${snapshot.newSignupsToday}`);
  console.log(`  Impressions/day (7d avg): ${snapshot.impressionsPerDay}`);

  const dataLines = [
    `Current MAU: ${snapshot.mau}`,
    `Current MRR: £${snapshot.mrr.toFixed(2)}`,
    snapshot.newSignupsToday > 0
      ? `New signups today: ${snapshot.newSignupsToday}`
      : null,
    snapshot.impressionsPerDay > 0
      ? `SEO impressions/day (7-day avg): ${snapshot.impressionsPerDay}`
      : null,
  ].filter(Boolean);
  const dataContext = dataLines.join('\n');

  const notesSection = notes
    ? `\nWhat I worked on / happened today:\n${notes}`
    : '';

  const captionPrompt = `Write a Build in Public daily update tweet for day ${nextDay} of building Lunary.

Context: Lunary is a live astrology app with real users and revenue. This is NOT a brand new project.

Metrics:
${dataContext}${notesSection}

Format rules:
- First line: "Day ${nextDay} of building Lunary" + a short honest hook about where things are (e.g. "and the SEO growth is wild", "and MRR just crossed £100")
- Blank line
- 3 bullet points using ✅ emoji, each on its own line
- Bullets must be short and punchy (under 60 chars each), written as natural observations NOT data labels
- Good: "✅ MRR sitting at £115, up from zero six months ago"
- Bad: "✅ Current MRR: £115.72, which feels like a solid foundation"
- Use the metrics as inspiration. Write them as achievements or honest observations.
- Blank line
- Final line: a short question or reflection that invites replies (one sentence)
- No hashtags in the body
- UK English. No em dashes. Sentence case.
- Keep the whole post under 400 characters total.
- Honest and grounded. No corporate language. Tone: real founder, daily journal.`;

  console.log('\nGenerating caption...');
  const caption = await generateCaption(captionPrompt);
  console.log(`\nCaption (${caption.length} chars):`);
  console.log(
    caption
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n'),
  );

  if (dryRun) {
    console.log('\n(dry run — no post created, day count not incremented)\n');
    return;
  }

  const day = incrementDayCount();
  console.log(`\nDay count incremented to ${day}`);

  console.log('\nPosting to Spellcast...');
  const schedTime = scheduledFor();

  let postId: string;
  if (noSchedule) {
    postId = await createTextDraft({ content: caption });
    console.log(`  Draft created: ${getSpellcastPostUrl(postId)}`);
  } else {
    postId = await scheduleTextPost({
      content: caption,
      scheduledFor: schedTime,
    });
    console.log(`  Scheduled for ${schedTime}: ${getSpellcastPostUrl(postId)}`);
  }

  console.log('\nDone.\n');
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    `Build in Public Post Generator — mode: ${mode}${dryRun ? ' (dry run)' : ''}`,
  );

  switch (mode) {
    case 'weekly':
      await runWeekly();
      break;
    case 'milestone':
      await runMilestone();
      break;
    case 'launch':
      await runLaunch(launchFeature);
      break;
    case 'daily':
      await runDaily(launchFeature); // reuse the same "first non-flag arg" for notes
      break;
  }
}

main().catch((err) => {
  console.error(
    '\nFatal error:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
