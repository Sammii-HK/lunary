import { LunaryContext } from './types';
import { constellations } from '../../../utils/constellations';

const getConstellationInfo = (
  sign: string,
): { name: string; information: string } | null => {
  const normalizedSign = sign.toLowerCase();
  const constellation =
    constellations[normalizedSign as keyof typeof constellations];
  if (!constellation) return null;
  return {
    name: constellation.name,
    information: constellation.information,
  };
};

const toneGuidance = `
You are Lunary — a calm, intuitive astro–tarot companion.
Write in gentle, grounded British English, weaving poetic imagery only when it deepens understanding.
You interpret cosmic patterns; you never predict outcomes or offer medical, legal, or financial advice.

CRITICAL RULES:
1. ONLY reference tarot cards that are explicitly listed in the context data. Do NOT make up cards or card positions.
2. ONLY reference astrological data that is in the context. Do NOT invent birth chart placements or transits.
3. If birth chart data is not provided, do NOT mention specific signs or placements.
4. If tarot cards are provided, reference them by their exact names from the context.
5. Connect ONLY the actual cosmic patterns provided to the user's question.
6. Be direct and specific - avoid generic astrological language.
7. Do NOT include journal prompts in your response - they will be added separately.
8. Keep responses under 10 sentences unless the user explicitly asks for more detail.
9. CRITICAL: Do NOT repeat information from previous messages. Each response should be fresh and new. If you've already mentioned something, don't mention it again unless the user specifically asks about it.
10. Focus on NEW insights based on the current question, not rehashing what was said before.
11. Vary your opening - don't always start with "While I cannot predict..." - be creative and direct.
12. Don't mention the same transits/aspects in every response - focus on what's most relevant to THIS specific question.
13. If you've already explained what a transit means, don't explain it again - just reference it briefly if relevant.
`.trim();

const safetyGuidance = `
If the user requests disallowed guidance (fortune telling, health/finance/legal certainty), respond with boundaries, refocusing on reflective insight.
If the user mentions harm or crisis, encourage seeking professional help and provide grounding cosmic context without minimising their feelings.
`.trim();

const formattingGuidance = `
Use concise paragraphs separated by blank lines.
Surface highlights using natural prose; avoid bullet lists unless the user requests structured steps.
`.trim();

export const SYSTEM_PROMPT = `
${toneGuidance}

${safetyGuidance}

${formattingGuidance}

Context data is provided below. You MUST:
- ONLY reference tarot cards that are explicitly listed (check the TAROT CARDS section)
- ONLY reference astrological data that is explicitly provided
- Do NOT invent or assume birth chart placements if they're not in the context
- Do NOT mention card reversals unless explicitly stated in the tarot data
- Be specific and accurate - if data isn't provided, don't make it up
- Connect the actual cosmic patterns to the user's emotional state and questions
- Vary your language and structure - don't use the same phrases or explanations repeatedly
- Focus on what's MOST relevant to THIS specific question, not everything available

The context will show exactly what tarot cards and astrological patterns are available. Use ONLY what is provided.
`.trim();

type PromptSections = {
  system: string;
  memory: string | null;
  context: string;
  userMessage: string;
};

const formatMemory = (entries: string[]): string =>
  entries.length > 0 ? entries.map((entry) => `- ${entry}`).join('\n') : '';

const describeContext = (context: LunaryContext): string => {
  const parts: string[] = [];

  // Tarot cards - concise format
  const tarotCards: string[] = [];
  if (
    context.tarot.lastReading?.cards &&
    context.tarot.lastReading.cards.length > 0
  ) {
    const cardNames = context.tarot.lastReading.cards
      .map((c) => c.name)
      .join(', ');
    tarotCards.push(
      `Saved: ${cardNames} (${context.tarot.lastReading.spread})`,
    );
  }
  if (context.tarot.daily)
    tarotCards.push(`Daily: ${context.tarot.daily.name}`);
  if (context.tarot.weekly)
    tarotCards.push(`Weekly: ${context.tarot.weekly.name}`);
  if (context.tarot.personal)
    tarotCards.push(`Personal: ${context.tarot.personal.name}`);
  if (tarotCards.length > 0) {
    parts.push(`TAROT: ${tarotCards.join(' | ')}`);
  }

  // Pattern analysis - include insights since they're already computed
  if (context.tarot.patternAnalysis) {
    const analysis = context.tarot.patternAnalysis;
    if (analysis.dominantThemes.length > 0) {
      parts.push(`Themes: ${analysis.dominantThemes.join(', ')}`);
    }
    if (analysis.frequentCards.length > 0) {
      const frequent = analysis.frequentCards
        .slice(0, 3)
        .map((f) => `${f.name} (${f.count}x)`)
        .join(', ');
      parts.push(`Frequent cards: ${frequent}`);
    }
    if (analysis.patternInsights.length > 0) {
      // Include all pattern insights - they're already concise text
      parts.push(`Pattern insights: ${analysis.patternInsights.join(' ')}`);
    }
  }

  // Moon - concise
  if (context.moon) {
    const moonSign = context.moon.sign.toLowerCase();
    const constellationInfo = getConstellationInfo(moonSign);
    let moonInfo = `MOON: ${context.moon.phase} in ${context.moon.sign}`;
    if (constellationInfo) {
      moonInfo += ` | ${constellationInfo.name}: ${constellationInfo.information.substring(0, 100)}`;
    }
    parts.push(moonInfo);
  }

  // Transits - only top 3 most relevant
  if (context.currentTransits && context.currentTransits.length > 0) {
    const topTransits = context.currentTransits
      .slice(0, 3)
      .map((t) => `${t.from} ${t.aspect} ${t.to}`)
      .join(', ');
    parts.push(`TRANSITS: ${topTransits}`);
  }

  // Birth chart - only key placements (not full JSON)
  if (context.birthChart && context.birthChart.placements) {
    const keyPlacements = context.birthChart.placements
      .filter((p) => ['Sun', 'Moon', 'Ascendant'].includes(p.planet))
      .map((p) => `${p.planet}: ${p.sign}`)
      .slice(0, 3);
    if (keyPlacements.length > 0) {
      parts.push(`BIRTH CHART: ${keyPlacements.join(', ')}`);
    }
  }

  // Mood - only recent trend, not full history
  if (context.mood?.last7d && context.mood.last7d.length > 0) {
    const recentMoods = context.mood.last7d
      .slice(-3)
      .map((m) => m.tag)
      .join(', ');
    parts.push(`MOOD: ${recentMoods}`);
  }

  return parts.join('\n');
};

export const buildPromptSections = ({
  context,
  memorySnippets,
  userMessage,
}: {
  context: LunaryContext;
  memorySnippets: string[];
  userMessage: string;
}): PromptSections => {
  const memory =
    memorySnippets.length > 0
      ? `Long-term memory snippets:\n${formatMemory(memorySnippets)}`
      : null;

  return {
    system: SYSTEM_PROMPT,
    memory,
    context: `Context data:\n${describeContext(context)}`,
    userMessage,
  };
};
