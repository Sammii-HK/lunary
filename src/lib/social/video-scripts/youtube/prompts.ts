/**
 * YouTube script prompt builders
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { buildScopeGuard } from '../../topic-scope';
import { FACTUAL_GUARDRAIL_INSTRUCTION } from '../../prompt-guards';

/**
 * Build facet context for YouTube prompt
 */
export function buildFacetContext(
  facet: DailyFacet,
  data: Record<string, any> | null,
  index: number,
): string {
  let context = `Day ${index + 1}: ${facet.title}\nFocus: ${facet.focus}\n`;
  if (data) {
    if (data.description) context += `Description: ${data.description}\n`;
    if (data.element) context += `Element: ${data.element}\n`;
    if (data.ruler || data.rulingPlanet) {
      context += `Ruled by: ${data.ruler || data.rulingPlanet}\n`;
    }
    if (data.modality) context += `Modality: ${data.modality}\n`;
    if (data.keywords && Array.isArray(data.keywords)) {
      context += `Key themes: ${data.keywords.join(', ')}\n`;
    }
    if (data.meaning || data.mysticalProperties) {
      context += `Meaning: ${data.meaning || data.mysticalProperties}\n`;
    }
    if (data.mysticalProperties) {
      context += `Mystical properties: ${data.mysticalProperties}\n`;
    }
    if (data.healingPractices && Array.isArray(data.healingPractices)) {
      context += `Healing practices: ${data.healingPractices.join(', ')}\n`;
    }
  }
  return context;
}

/**
 * Build YouTube script prompt
 */
export function buildYouTubePrompt(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const facetContexts = allData.map(({ facet, data }, index) =>
    buildFacetContext(facet, data, index),
  );

  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;

  return `Create a complete, flowing YouTube video script (3–4 minutes, 450–650 words) for a weekly educational deep dive on ${theme.name}.

The script should be:
- Written as a composed, authoritative narrative that can be read aloud smoothly from start to finish
- Educational and interpretive, not conversational or casual
- Designed for viewers seeking depth, clarity, and understanding
- Structured to flow naturally through: opening context, topic overview, foundational concepts, deeper meaning, practical interpretation, synthesis, and closing reflection
- Smoothly connected throughout, with no abrupt shifts or segmented feeling
- Clear, grounded, and premium in tone

Opening guidance:
- Begin by establishing why this topic matters and what it helps the viewer understand or reframe
- Avoid generic greetings or channel-style introductions
- Do not reference "this video" or the act of watching

Content guidance:
- Build understanding progressively from foundations to deeper insight
- Use explanation and interpretation, not storytelling or anecdotes
- Cover all facets listed below, integrating them naturally rather than treating them as separate sections
- Maintain clarity and pace while staying concise

Closing guidance:
- End with a reflective synthesis that reinforces meaning and understanding
- Do not include CTAs, prompts to like/subscribe, or platform references
- Leave the viewer with a sense of conceptual completion
- Add one short final sentence that begins with "try this:" and connects a concrete action about ${theme.name} to a clear time window (today, tonight, within 24 hours, over the next 2.5 days, this week) so viewers know how to apply the week/day focus.

Theme: ${theme.name}
Category: ${theme.category}
Description: ${theme.description}

Facets to cover:
${facetContexts.join('\n---\n')}

Return ONLY the complete script text. No section headers, no labels, no markdown, no formatting. The output should read as a single, cohesive spoken narrative with a calm, confident delivery.
Avoid deterministic claims; use soft language like "can", "tends to", "may", "often", "influences", "highlights".
${buildScopeGuard(theme.name)}
${guardrailNote}`;
}
