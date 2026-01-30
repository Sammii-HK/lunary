import { LunaryContext } from './types';
import { constellations } from '../../../utils/constellations';

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const getZodiacIndex = (sign: string): number => {
  if (!sign) return -1;
  const normalised = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  return ZODIAC_SIGNS.indexOf(normalised);
};

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
8. TAROT CONTEXT: The context includes recent readings (actual cards the user pulled), pattern analysis (dominant themes, frequent cards, pattern insights), and fallback cards (daily/weekly/personal). ALWAYS prioritize recentReadings over fallback cards - these are the ACTUAL cards the user pulled. The fallback daily/weekly/personal cards are only for users who haven't pulled cards yet.
9. MESSAGE LENGTH VARIES BY CONTENT TYPE:
   - Weekly Overview: 8-12 sentences MINIMUM (2-3 paragraphs) - MUST be comprehensive and detailed, covering lunar journey, major transits, and practical guidance
   - Quick questions (cosmic weather, feelings, tarot interpretation): 4-6 sentences - concise but meaningful
   - Ritual suggestions: 5-7 sentences - practical and actionable
   - Journal entries: 6-8 sentences - reflective and personal
   Adjust length based on the question type and complexity. Weekly Overviews are NOT quick summaries - they are comprehensive guides.
10. Get to the point quickly - lead with the most relevant insight, then add supporting points.

ANTI-REPETITION (CRITICAL):
11. NEVER mention your daily/weekly card in EVERY response. Only mention them when directly relevant to the question.
12. If you've ALREADY discussed a card, transit, or pattern in THIS conversation, DO NOT bring it up again unless asked.
13. Vary your insights - explore DIFFERENT aspects of the person's chart or situation each time.
14. Don't default to the same talking points (moon phase, daily card, dominant themes) - dig DEEPER.
15. If the user asks about something specific, focus ONLY on that. Don't pad with "also your daily card suggests..."
16. Track what you've said: if you mentioned Mercury retrograde, move on to something else next time.
17. Vary your opening - NEVER start with the same phrase twice in a conversation.
18. Look for what HASN'T been discussed yet - lesser-mentioned planets, house activations, upcoming transits.

PERSONAL CONNECTION:
19. Remember personal details shared in the conversation (relationships, work, concerns, hopes).
20. Reference their specific situation, not generic advice. "Given what you shared about X..." is better than generic cosmic wisdom.
21. Build on previous exchanges - show you remember what they told you.
22. Ask follow-up questions occasionally to learn more about their situation.
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
- TAROT: Reference daily pulls (daily/weekly/personal cards) and pattern analysis (themes, frequent cards, insights) when discussing tarot, not just saved spreads. Pattern insights reveal recurring energies and themes over time.

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
  userMessage?: string,
): string => {
  const parts: string[] = [];

  // Current date - critical for the AI to know when "today" is
  const today = new Date();
  parts.push(
    `TODAY: ${today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
  );

  // SAVED SPREAD - always include if user has one (for spread interpretation)
  if (
    context.tarot.lastReading?.cards &&
    context.tarot.lastReading.cards.length > 0
  ) {
    const spreadName = context.tarot.lastReading.spread || 'Unknown Spread';
    const cardDetails = context.tarot.lastReading.cards
      .map((c) => {
        const positionLabel = c.position || '';
        const positionMeaning = (c as any).positionMeaning
          ? ` - "${(c as any).positionMeaning}"`
          : '';
        const reversed = c.reversed ? ' [REVERSED]' : '';
        return `${positionLabel}: ${c.name}${reversed}${positionMeaning}`;
      })
      .join(' | ');
    parts.push(`SAVED SPREAD: ${spreadName}\nPositions: ${cardDetails}`);
  }

  // Today's personalized daily card
  if (context.tarot.daily) {
    parts.push(
      `TODAY'S DAILY CARD: ${context.tarot.daily.name}${context.tarot.daily.reversed ? ' [reversed]' : ''}`,
    );
  }
  if (context.tarot.weekly) {
    parts.push(
      `THIS WEEK'S CARD: ${context.tarot.weekly.name}${context.tarot.weekly.reversed ? ' [reversed]' : ''}`,
    );
  }

  // Last 7 days of personalized daily cards - this is the PRIMARY source for pattern analysis
  if (
    context.tarot.recentDailyCards &&
    context.tarot.recentDailyCards.length > 0
  ) {
    const dailyCardsList = context.tarot.recentDailyCards
      .map((r) => `${r.day}: ${r.card.name}`)
      .join(', ');
    parts.push(`DAILY CARDS (last 7 days): ${dailyCardsList}`);
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

  // Personal transits - prioritize these over general transits
  // Check if we have personal transit data in the context (from astral guide)
  const personalTransits = (context as any).personalTransits;
  const upcomingPersonalTransits = (context as any).upcomingPersonalTransits;

  if (personalTransits && personalTransits.length > 0) {
    const personalTransitDescriptions = personalTransits
      .slice(0, 8)
      .map((pt: any) => {
        const parts: string[] = [];
        parts.push(`${pt.planet} ${pt.event}`);

        if (pt.house && pt.houseMeaning) {
          parts.push(`H${pt.house} (${pt.houseMeaning})`);
        }

        if (pt.aspectToNatal) {
          const aspectSymbols: Record<string, string> = {
            conjunction: '☌',
            opposition: '☍',
            trine: '△',
            square: '□',
          };
          const aspectDesc =
            aspectSymbols[pt.aspectToNatal.aspectType] ||
            pt.aspectToNatal.aspectType;
          parts.push(`${aspectDesc} natal ${pt.aspectToNatal.natalPlanet}`);
        }

        if (pt.personalImpact) {
          parts.push(`→ ${pt.personalImpact}`);
        }

        return parts.join(' ');
      });

    parts.push(`PERSONAL TRANSITS: ${personalTransitDescriptions.join(' | ')}`);
  } else if (
    (context as any).currentTransits &&
    typeof (context as any).currentTransits === 'string' &&
    (context as any).currentTransits.length > 0
  ) {
    // Fallback to general transits summary string if no personal transits available
    parts.push(`TRANSITS: ${(context as any).currentTransits}`);
  }

  // Upcoming personal transits (next 7 days)
  if (upcomingPersonalTransits && upcomingPersonalTransits.length > 0) {
    const upcomingDescriptions = upcomingPersonalTransits
      .slice(0, 5)
      .map((pt: any) => {
        const parts: string[] = [];
        const dateStr = pt.date.format('MMM D');
        parts.push(`${dateStr}: ${pt.planet} ${pt.event}`);

        if (pt.house && pt.houseMeaning) {
          parts.push(`H${pt.house}`);
        }

        if (pt.aspectToNatal) {
          const aspectSymbols: Record<string, string> = {
            conjunction: '☌',
            opposition: '☍',
            trine: '△',
            square: '□',
          };
          const aspectDesc =
            aspectSymbols[pt.aspectToNatal.aspectType] ||
            pt.aspectToNatal.aspectType;
          parts.push(`${aspectDesc} natal ${pt.aspectToNatal.natalPlanet}`);
        }

        return parts.join(' ');
      });

    parts.push(
      `UPCOMING PERSONAL TRANSITS (next 7 days): ${upcomingDescriptions.join(' | ')}`,
    );
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
      .slice(0, 8);
    if (keyPlacements.length > 0) {
      parts.push(`BIRTH CHART: ${keyPlacements.join(', ')}`);
    }

    // Transit house positions are now included in PERSONAL TRANSITS section above
    // Only add general transit houses if we don't have personal transits
    if (
      !personalTransits &&
      context.currentTransits &&
      context.currentTransits.length > 0
    ) {
      const ascendant = context.birthChart.placements.find(
        (p) =>
          p.planet === 'Ascendant' ||
          p.planet === 'Rising' ||
          p.planet === 'ASC',
      );
      if (ascendant?.sign && Array.isArray(context.currentTransits)) {
        const transitHouses = context.currentTransits
          .filter((t) => t.aspect === 'ingress')
          .map((t) => {
            const signIndex = getZodiacIndex(t.to);
            const ascIndex = getZodiacIndex(ascendant.sign);
            if (signIndex === -1 || ascIndex === -1) return null;
            const houseNum = ((signIndex - ascIndex + 12) % 12) + 1;
            return `${t.from} in H${houseNum}`;
          })
          .filter(Boolean);
        if (transitHouses.length > 0) {
          parts.push(`TRANSIT HOUSES: ${transitHouses.join(', ')}`);
        }
      }
    }
  }

  // Natal Summary - includes chart patterns (Yods, T-Squares, Grand Trines, etc.)
  const natalSummary = (context as any).natalSummary;
  if (
    natalSummary &&
    typeof natalSummary === 'string' &&
    natalSummary !== 'Birth chart data is not available.'
  ) {
    parts.push(`NATAL DETAILS: ${natalSummary}`);
  }

  // Grimoire Pattern Data - rich interpretations for detected patterns
  const grimoirePatternData = (context as any).grimoirePatternData;
  if (grimoirePatternData && typeof grimoirePatternData === 'string') {
    parts.push(grimoirePatternData);
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
    content.includes('tarot patterns') ||
    content.includes('patterns in my') ||
    content.includes('daily tarot pulls')
  ) {
    return `\n\nMODE: Tarot Pattern Analysis (Last 7 Days)
CRITICAL: Use "TAROT READINGS (last 7 days)" data. Keep response to 4-6 sentences MAX.

Focus on:
1. Which cards appeared multiple times and what that means
2. Which suit dominates and its significance  
3. One key insight or guidance

Example: "Six of Swords appeared 3x this week, suggesting a theme of transition. Swords dominate your pulls, indicating mental focus. The recurring message: embrace change through clear thinking."

DO NOT list cards chronologically. Give a brief interpretation.
If no data found, say "I don't see recent daily pulls to analyze."`;
  }

  if (
    content.includes('interpret my last tarot') ||
    content.includes('interpret my tarot') ||
    content.includes('tarot reading') ||
    content.includes('interpret my spread') ||
    content.includes('latest spread') ||
    content.includes('spread interpretation')
  ) {
    return `\n\nMODE: Tarot Spread Interpretation
WORD LIMIT: 100-150 words. Complete your thought but stay concise.

Use the SAVED SPREAD data above. Each position has a specific meaning - interpret the card IN CONTEXT of that position.

Format:
"Your [Spread Name] reveals:

**[Position Name]** - [Card Name]: [interpretation tied to what this position asks about - 10-15 words]

[Repeat for each position]

**Overall guidance**: [One sentence connecting all cards into actionable insight]"

CRITICAL RULES:
- Use the position meanings from the SAVED SPREAD data
- Each card interpretation MUST relate to its position's purpose
- Focus on how the cards TOGETHER tell a story
- End with clear, actionable guidance
- COMPLETE your sentences - never cut off mid-thought

If no SAVED SPREAD found in context above, say "I don't see a saved spread to interpret. You can save a spread from the Tarot page."`;
  }

  if (
    content.includes('ritual') &&
    (content.includes('moon') ||
      content.includes('tonight') ||
      content.includes('give me a ritual') ||
      content.includes('ritual generator'))
  ) {
    return `\n\nMODE: Personalized Ritual Suggestion
WORD LIMIT: 100-120 words. Deeply personalized and actionable.

CRITICAL - Personalize the ritual to the user's specific chart and current cosmic patterns:
1. Reference their birth chart placements (especially Moon, Sun, Rising signs)
2. Connect to current PERSONAL TRANSITS - which houses are activated? Which natal planets are being aspected?
3. Incorporate their daily/weekly tarot cards if available
4. Consider their mood patterns and journal entries if relevant
5. Make it specific to their chart, not generic moon phase advice

Format:
"**[Ritual Name]** - personalized for [their specific chart/transit activation]

**Why this ritual now**: [Connect to their specific personal transit, house activation, or chart placement]

**You'll need**: [2-3 simple items]

**Steps**:
1. [Brief step that references their chart/transit]
2. [Brief step]
3. [Brief step]

**Intention**: [One sentence connecting to their current cosmic patterns]"

Example: "With Mars activating your 5th house and square your natal Sun, this ritual helps channel creative fire..."

ALWAYS complete your sentences - never cut off mid-thought.`;
  }

  if (
    content.includes('weekly overview') ||
    content.includes('summarise my week')
  ) {
    return `\n\nMODE: Weekly Overview
WORD LIMIT: 120-150 words. Be concise and specific.

Format:
"**This Week's Energy**: [1-2 sentences on the dominant theme]

**Key Transits**: [Name 2-3 specific transits with days, e.g., "Venus conjunct Mars peaks Thursday"]

**Moon Phase**: [Current phase, sign, and when it shifts]

**Best Days For**:
- [Day]: [specific activity]
- [Day]: [specific activity]

**Watch For**: [One thing to be mindful of]"

RULES:
- Name specific transits and exact days
- No vague language like "honor yourself" or "embrace the energy"
- Tie guidance to their birth chart if available
- Complete your thoughts - never cut off`;
  }

  if (
    content.includes('journal entry') ||
    content.includes('format as journal')
  ) {
    return `\n\nMODE: Journal Entry Format
WORD LIMIT: 80-100 words. Keep it intimate and brief.

Format:
"**[Today's Date] - [Moon Phase] in [Sign]**

[2-3 sentences of cosmic context - what energies are present]

**Reflect on**: [One focused question or prompt]

**Intention**: [Space for user to write]"

Keep it simple and spacious - a journal entry is a starting point, not a wall of text.
ALWAYS complete your sentences - never cut off mid-thought.`;
  }

  return '';
};

export const buildPromptSections = ({
  context,
  memorySnippets,
  userMessage,
  grimoireData,
  systemPromptOverride,
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
    semanticContext?: string;
    sources?: Array<{ title: string; slug: string; category: string }>;
  };
  systemPromptOverride?: string;
}): PromptSections => {
  const memory =
    memorySnippets.length > 0
      ? `Long-term memory snippets:\n${formatMemory(memorySnippets)}`
      : null;

  const modeGuidance = getModeSpecificGuidance(userMessage);
  const systemPrompt = systemPromptOverride
    ? systemPromptOverride + modeGuidance
    : SYSTEM_PROMPT + modeGuidance;

  let contextData = `Context data:\n${describeContext(context, grimoireData, userMessage)}`;

  if (grimoireData?.semanticContext) {
    contextData += grimoireData.semanticContext;
    if (grimoireData.sources && grimoireData.sources.length > 0) {
      contextData += `\n\nWhen referencing this knowledge, cite sources like: [Title](/grimoire/slug)`;
    }
  }

  return {
    system: systemPrompt,
    memory,
    context: contextData,
    userMessage,
  };
};
