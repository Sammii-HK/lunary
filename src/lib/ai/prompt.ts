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
7. CRITICAL: Do NOT include journal prompts or reflection prompts in your response. Never write phrases like "You could journal on..." or "inviting you to explore..." - these are handled separately by the system and should NEVER appear in your message content. Your response should end naturally without suggesting journaling or reflection activities.
8. MESSAGE LENGTH VARIES BY CONTENT TYPE:
   - Weekly Overview: 8-12 sentences (2-3 paragraphs) - comprehensive but concise
   - Quick questions (cosmic weather, feelings, tarot interpretation): 4-6 sentences - concise but meaningful
   - Ritual suggestions: 5-7 sentences - practical and actionable
   - Journal entries: 6-8 sentences - reflective and personal
   Adjust length based on the question type and complexity.
9. Get to the point quickly - lead with the most relevant insight, then add supporting points.
10. CRITICAL: Do NOT repeat information from previous messages. Each response should be fresh and new. If you've already mentioned something, don't mention it again unless the user specifically asks about it.
11. Focus on NEW insights based on the current question, not rehashing what was said before.
12. Vary your opening - don't always start with "While I cannot predict..." - be creative and direct.
13. Don't mention the same transits/aspects in every response - focus on what's most relevant to THIS specific question.
14. If you've already explained what a transit means, don't explain it again - just reference it briefly if relevant.
15. AVOID REPETITION: Don't repeat the moon phase name twice (e.g., "Waning Crescent in Libra aligns with Waning Crescent energy" is redundant). Just mention it once naturally.
16. Every word counts - remove filler phrases and get straight to the insight.
17. Use conversation history to provide continuity and build on previous exchanges, but don't repeat what was already said.
`.trim();

const safetyGuidance = `
If the user requests disallowed guidance (fortune telling, health/finance/legal certainty), respond with boundaries, refocusing on reflective insight.
If the user mentions harm or crisis, encourage seeking professional help and provide grounding cosmic context without minimising their feelings.
`.trim();

const formattingGuidance = `
Use concise paragraphs separated by blank lines.
Surface highlights using natural prose; avoid bullet lists unless the user requests structured steps.
Prefer 2-3 short paragraphs over longer blocks of text.
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

const describeContext = (
  context: LunaryContext,
  grimoireData?: {
    tarotCards?: Array<{
      name: string;
      keywords: string[];
      information: string;
    }>;
    rituals?: Array<{ title: string; description: string }>;
  },
): string => {
  const parts: string[] = [];

  // Tarot cards - always include daily/weekly/personal cards (they're always generated)
  const tarotCards: string[] = [];

  // Saved reading (if exists)
  if (
    context.tarot.lastReading?.cards &&
    context.tarot.lastReading.cards.length > 0
  ) {
    const cardDetails = context.tarot.lastReading.cards
      .map((c) => {
        const position = c.position ? ` (${c.position})` : '';
        const reversed = c.reversed ? ' [reversed]' : '';
        return `${c.name}${position}${reversed}`;
      })
      .join(', ');
    const spreadName = context.tarot.lastReading.spread || 'Unknown Spread';
    tarotCards.push(`SAVED READING: ${cardDetails} | Spread: ${spreadName}`);
  }

  // Daily, weekly, personal cards - these are always available
  if (context.tarot.daily) {
    tarotCards.push(`Daily: ${context.tarot.daily.name}`);
  }
  if (context.tarot.weekly) {
    tarotCards.push(`Weekly: ${context.tarot.weekly.name}`);
  }
  if (context.tarot.personal) {
    tarotCards.push(`Personal: ${context.tarot.personal.name}`);
  }

  // Always include tarot section - cards are always generated
  if (tarotCards.length > 0) {
    parts.push(`TAROT CARDS: ${tarotCards.join(' | ')}`);
  } else {
    // Fallback if somehow no cards are available
    parts.push(
      `TAROT CARDS: Available (daily/weekly/personal cards generated)`,
    );
  }

  // Recent readings with insights (for AI Plus users)
  if (context.tarot.recentReadings && context.tarot.recentReadings.length > 0) {
    const recentReadingsInfo: string[] = [];
    context.tarot.recentReadings.slice(0, 10).forEach((reading, index) => {
      const cardNames = reading.cards.map((c) => c.name).join(', ');
      let readingInfo = `${index + 1}. ${reading.spread}: ${cardNames}`;
      if (reading.summary) {
        readingInfo += ` | Summary: ${reading.summary.substring(0, 150)}`;
      }
      if (reading.highlights && reading.highlights.length > 0) {
        readingInfo += ` | Highlights: ${reading.highlights.slice(0, 3).join(', ')}`;
      }
      recentReadingsInfo.push(readingInfo);
    });
    if (recentReadingsInfo.length > 0) {
      parts.push(
        `RECENT TAROT READINGS (${recentReadingsInfo.length}): ${recentReadingsInfo.join(' || ')}`,
      );
    }
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

  // Add grimoire data for tarot cards if provided (when user asks about specific cards)
  if (grimoireData?.tarotCards && grimoireData.tarotCards.length > 0) {
    const cardInfo = grimoireData.tarotCards
      .map((card) => {
        const keywords = card.keywords
          ? `Keywords: ${card.keywords.join(', ')}`
          : '';
        const info = card.information ? `Info: ${card.information}` : '';
        return `${card.name} - ${keywords} ${info}`.trim();
      })
      .join(' || ');
    if (cardInfo) {
      parts.push(`GRIMOIRE TAROT DATA: ${cardInfo}`);
    }
  }

  // Moon - concise, avoid repetition
  if (context.moon) {
    const moonSign = context.moon.sign.toLowerCase();
    const constellationInfo = getConstellationInfo(moonSign);
    // Just state the phase and sign, don't repeat the phase
    let moonInfo = `MOON: ${context.moon.phase} in ${context.moon.sign}`;
    if (constellationInfo) {
      moonInfo += ` | ${constellationInfo.name}: ${constellationInfo.information.substring(0, 100)}`;
    }
    parts.push(moonInfo);
  }

  // Transits - include more transits for comprehensive context
  // For weekly overviews, include more transits
  if (context.currentTransits && context.currentTransits.length > 0) {
    const topTransits = context.currentTransits
      .slice(0, 8) // Increased to 8 for weekly overviews
      .map((t) => {
        const applying = t.applying ? ' (applying)' : '';
        const strength = t.strength ? ` strength:${t.strength.toFixed(2)}` : '';
        return `${t.from} ${t.aspect} ${t.to}${applying}${strength}`;
      })
      .join(', ');
    parts.push(`TRANSITS: ${topTransits}`);
  }

  // Birth chart - include more placements for better personalization
  if (context.birthChart && context.birthChart.placements) {
    const keyPlacements = context.birthChart.placements
      .filter((p) =>
        [
          'Sun',
          'Moon',
          'Ascendant',
          'Mercury',
          'Venus',
          'Mars',
          'Jupiter',
          'Saturn',
        ].includes(p.planet),
      )
      .map((p) => {
        const house = p.house ? ` (H${p.house})` : '';
        return `${p.planet}: ${p.sign}${house}`;
      })
      .slice(0, 8); // Increased from 6 to 8
    if (keyPlacements.length > 0) {
      parts.push(`BIRTH CHART: ${keyPlacements.join(', ')}`);
    }
  }

  // Mood - include recent trend
  if (context.mood?.last7d && context.mood.last7d.length > 0) {
    const recentMoods = context.mood.last7d
      .slice(-5) // Increased from 3 to 5 for better context
      .map((m) => m.tag)
      .join(', ');
    parts.push(`MOOD: ${recentMoods}`);
  }

  return parts.join('\n');
};

const getModeSpecificGuidance = (userMessage: string): string => {
  const content = userMessage.toLowerCase();

  if (
    content.includes("tonight's cosmic weather") ||
    content.includes('cosmic weather')
  ) {
    return '\n\nMODE: Cosmic Weather Report\nFocus on describing the current lunar and planetary energies in a clear, accessible way. Help the user understand what cosmic influences are active right now and how they might feel these energies.';
  }

  if (
    content.includes('transit feelings') ||
    content.includes('how might i be feeling')
  ) {
    return '\n\nMODE: Transit Emotional Reflection\nFocus on the emotional and psychological impact of current transits. Help the user understand how planetary movements might be affecting their inner experience, mood, and decision-making.';
  }

  if (
    content.includes('interpret my last tarot') ||
    content.includes('interpret my tarot') ||
    content.includes('tarot reading')
  ) {
    return "\n\nMODE: Tarot Interpretation\nCRITICAL: Check the TAROT section in the context data. The user's saved tarot reading cards are listed there. You MUST reference the specific cards from their reading. If cards are listed in the context, interpret them. If no cards are listed, acknowledge that no reading is saved yet.";
  }

  if (
    content.includes('ritual') &&
    (content.includes('moon') || content.includes('tonight'))
  ) {
    return '\n\nMODE: Ritual Generation\nProvide a specific, actionable ritual suggestion based on the current moon phase and sign. Include steps, timing, and intention. Make it practical and accessible.';
  }

  if (
    content.includes('weekly overview') ||
    content.includes('summarise my week')
  ) {
    return "\n\nMODE: Weekly Overview\nCRITICAL: Write 8-12 sentences (2-3 paragraphs). Do NOT write a single short sentence.\n\nYou MUST include:\n1. Overall lunar journey - describe how moon phases shift throughout the week, what each phase means, and when transitions occur\n2. Major planetary transits - detail the most important transits, what they mean, when they're exact, and how they affect the user personally based on their birth chart\n3. Practical guidance - connect cosmic patterns to actionable insights, highlight specific days that stand out, and provide day-by-day focus areas\n\nBe SPECIFIC and DETAILED. Name specific transits, mention specific days, explain what each transit means. This is NOT a quick summary - it's a comprehensive weekly guide.";
  }

  if (
    content.includes('journal entry') ||
    content.includes('format as journal')
  ) {
    return '\n\nMODE: Journal Entry Format\nFormat your response as a journal entry with date, cosmic context, and reflective prompts. Use first-person perspective and include space for the user to add their own thoughts.';
  }

  return '';
};

export const buildPromptSections = ({
  context,
  memorySnippets,
  userMessage,
  grimoireData,
}: {
  context: LunaryContext;
  memorySnippets: string[];
  userMessage: string;
  grimoireData?: {
    tarotCards?: Array<{
      name: string;
      keywords: string[];
      information: string;
    }>;
    rituals?: Array<{ title: string; description: string }>;
  };
}): PromptSections => {
  const memory =
    memorySnippets.length > 0
      ? `Long-term memory snippets:\n${formatMemory(memorySnippets)}`
      : null;

  const modeGuidance = getModeSpecificGuidance(userMessage);
  const systemPrompt = SYSTEM_PROMPT + modeGuidance;

  return {
    system: systemPrompt,
    memory,
    context: `Context data:\n${describeContext(context, grimoireData)}`,
    userMessage,
  };
};
