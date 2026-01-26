/**
 * TikTok script prompt builders
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { buildScopeGuard } from '../../topic-scope';
import { FACTUAL_GUARDRAIL_INSTRUCTION } from '../../prompt-guards';
import { ContentAspect } from '../../shared/types';
import { getSearchPhraseForTopic } from '../../shared/text/normalize';
import { aspectLabel } from '../constants';

/**
 * Build Grimoire data context for prompt
 */
export function buildGrimoireContext(
  grimoireData: Record<string, any> | null,
): string {
  if (!grimoireData) return '';

  let dataContext = '';
  if (grimoireData.description) {
    dataContext += `Description: ${grimoireData.description}\n`;
  }
  if (grimoireData.element) {
    dataContext += `Element: ${grimoireData.element}\n`;
  }
  if (grimoireData.ruler || grimoireData.rulingPlanet) {
    dataContext += `Ruled by: ${grimoireData.ruler || grimoireData.rulingPlanet}\n`;
  }
  if (grimoireData.modality) {
    dataContext += `Modality: ${grimoireData.modality}\n`;
  }
  if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
    dataContext += `Key themes: ${grimoireData.keywords.join(', ')}\n`;
  }
  if (grimoireData.meaning || grimoireData.mysticalProperties) {
    dataContext += `Meaning: ${grimoireData.meaning || grimoireData.mysticalProperties}\n`;
  }
  if (grimoireData.strengths && Array.isArray(grimoireData.strengths)) {
    dataContext += `Strengths: ${grimoireData.strengths.join(', ')}\n`;
  }
  if (grimoireData.affirmation) {
    dataContext += `Affirmation: ${grimoireData.affirmation}\n`;
  }

  return dataContext;
}

/**
 * Build TikTok script prompt
 */
export function buildTikTokPrompt(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  angle: string,
  aspect: ContentAspect,
): string {
  const searchPhrase = getSearchPhraseForTopic(facet.title, theme.category);
  const dataContext = buildGrimoireContext(grimoireData);
  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;

  return `You are the short-form video script generator for Lunary.

Your job is to generate ONE educational short-form video script per day for:
- Instagram Reels
- TikTok
- YouTube Shorts
- Facebook Reels

This video is independent from written posts.
Do NOT reference Threads, X, blogs, or other content.
Do NOT include hashtags, emojis, links, or CTAs.
Do NOT promote features or the app.

Tone:
- calm
- grounded
- intelligent
- authoritative without being heavy
- never hype-driven

Topic: ${facet.title}
Angle: ${angle}
Aspect focus: ${aspectLabel(aspect)}
Keyword phrase: ${searchPhrase}
Focus: ${facet.focus}
${buildScopeGuard(facet.title)}

Hook requirements (FIRST LINE):
- Write a single-sentence spoken hook that introduces the topic clearly and naturally.
- Must be 8–14 words and grammatically correct.
- Must include the primary keyword exactly once (use "${facet.title}" or "${searchPhrase}").
- Calm and grounded; no hype, no dramatic claims, no clickbait.
- Avoid overused hook templates like "Most people", "This will click", "Here's what matters", "Here's how it helps", "Let me explain", "You need to know".
- Create VARIETY by using different approaches:
  * Direct observation: "${facet.title} shows up differently than most people expect."
  * Pattern recognition: "Watch for ${facet.title} when things shift unexpectedly."
  * Reframe: "${facet.title} isn't about what happens, but how it registers."
  * Gentle invitation: "Here's what ${facet.title} actually tracks."
  * Contrast: "${facet.title} operates quietly, not loudly."
  * Timing: "${facet.title} has a narrow window you can actually use."
- Choose a hook style that matches the ${angle} and ${aspectLabel(aspect)}.
- Make it conversational and engaging for TikTok, not academic or rigid.

Script body requirements (AFTER HOOK):
- 6–10 short lines total.
- Write like one calm human thought unfolding, not a school poster list or formulaic template.
- VARY your sentence structures and rhythms - not every script should follow the same pattern.
- No definition framing.
  - Do not use "is defined as", "refers to", "signifies", "reflects", "represents", or "controls".
  - Avoid the pattern "${facet.title} is the ...".
  - Prefer phrasing like "shows up as", "you might notice", "tends to feel like", "when you're stressed", "when you're choosing".
- Each line must be exactly one complete sentence with a subject and a verb.
- Each sentence must add new meaning.
  - Do not restate the same idea with synonyms across adjacent lines.
  - Build a narrative arc, not a bullet list.
- Include exactly one recognition cue that helps the reader identify this in real life.
  - Can start with "You'll notice it when...", "Watch for...", "It shows up when...", or similar.
  - Must include a real-world cue (a body feeling, behaviour, choice, or thought loop).
- Include exactly one contrast or clarification to correct common misunderstandings.
  - Can use "Not X, but Y", "It's less about X, more about Y", or similar reframing.
- Include exactly one practical application line near the end.
  - Can begin with "Try this:", "So what:", "Test it:", "Notice:", or similar.
  - Must tie a small, emotionally grounded action about ${facet.title} to a clear time window (today, tonight, within 24 hours, over the next 2.5 days, this week).
  - Stay within the topic scope guard.
- The final line should be observational, not inspirational.
  - Ban poster closings like "embrace", "your growth awaits", "journey of self-discovery", "cosmic dance", "step into", "unlock", or "manifest".
  - Avoid abstract-noun stacking (journey, destiny, growth, lessons, self-discovery, awakening, alignment) unless grounded with a concrete cue.
- IMPORTANT: Vary the order and flow of these elements - they don't all need to appear in the same sequence every time.
${guardrailNote}

Hard bans (never include):
- "distinct rhythm worth tracking"
- "here is how X shows up in real life: X"
- "explore in the grimoire"
${dataContext ? `\nGrimoire Data (reference only):\n${dataContext}` : ''}

Return strict JSON only:
{
  "video": {
    "hook": "Spoken hook line",
    "scriptBody": [
      "Line 1",
      "Line 2"
    ]
  }
}`;
}
