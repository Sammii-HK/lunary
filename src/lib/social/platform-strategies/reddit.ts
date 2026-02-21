/**
 * Reddit platform strategy — subreddit-specific tone configs
 */

export interface SubredditTone {
  name: string;
  displayName: string;
  description: string;
  tone: string;
  depth: 'casual' | 'moderate' | 'deep';
  rules: string[];
  commonQuestions: string[];
}

export const SUBREDDIT_TONES: Record<string, SubredditTone> = {
  astrology: {
    name: 'astrology',
    displayName: 'r/astrology',
    description: 'Technical astrology discussion',
    tone: 'Knowledgeable but approachable. Reference chart placements, aspects, and transits with specificity. Avoid generic sun-sign horoscope vibes. Use proper astrology terminology.',
    depth: 'deep',
    rules: [
      'No self-promotion — value-first',
      'Reference specific chart data when relevant',
      'Acknowledge nuance (orbs, house systems, etc.)',
      'Avoid pop astrology generalizations',
    ],
    commonQuestions: [
      'What does Mercury retrograde really affect?',
      'How do I read my natal chart?',
      'What are the most important aspects in synastry?',
      'Saturn return — what should I expect?',
      'Why do I feel more like my rising sign?',
    ],
  },
  tarot: {
    name: 'tarot',
    displayName: 'r/tarot',
    description: 'Tarot practice and interpretation',
    tone: 'Practical and grounded. Focus on spreads, card combinations, and actionable readings. Share specific techniques and interpretations. Welcome both beginners and experienced readers.',
    depth: 'moderate',
    rules: [
      'Share reading techniques, not fortune-telling',
      'Recommend specific spreads for specific questions',
      'Acknowledge multiple valid interpretations',
      'No fearmongering about "scary" cards',
    ],
    commonQuestions: [
      'How do I interpret The Tower in a love reading?',
      'Best spread for career questions?',
      'How do reversed cards work?',
      'Tips for reading for yourself vs others?',
      'How do tarot and astrology connect?',
    ],
  },
  witchcraft: {
    name: 'witchcraft',
    displayName: 'r/witchcraft',
    description: 'Practical witchcraft and spellwork',
    tone: 'Ritual-focused, practical, and grounded. Include specific ingredients, timing (moon phases, planetary hours), and materials. Respect diverse traditions. Emphasize intention and personal practice.',
    depth: 'moderate',
    rules: [
      'Include specific materials and timing',
      'Respect all traditions and paths',
      'No gatekeeping or elitism',
      'Safety notes for herbs, candles, etc.',
    ],
    commonQuestions: [
      'Best protection spell for beginners?',
      'How to cleanse a new living space?',
      'Moon phase timing for different spells?',
      'Working with crystals — where to start?',
      'How to set up a basic altar?',
    ],
  },
  spirituality: {
    name: 'spirituality',
    displayName: 'r/spirituality',
    description: 'Spiritual growth and philosophy',
    tone: 'Philosophical and accessible. Connect cosmic concepts to personal growth without jargon. Be inclusive of different spiritual paths. Share reflective insights, not prescriptive advice.',
    depth: 'casual',
    rules: [
      'Be inclusive of all spiritual paths',
      'Avoid dogmatic statements',
      'Connect to practical life experience',
      'No unsolicited readings or predictions',
    ],
    commonQuestions: [
      'How do you use astrology for personal growth?',
      'What does spiritual awakening actually feel like?',
      'How do you balance logic and intuition?',
      'Finding your spiritual path — where to start?',
      'How to deal with spiritual burnout?',
    ],
  },
};

export type RedditFormat = 'reply' | 'post';

export function buildRedditPrompt(
  subreddit: string,
  format: RedditFormat,
  topic: string,
  question: string | undefined,
  grimoireContext: string,
): string {
  const tone = SUBREDDIT_TONES[subreddit] || SUBREDDIT_TONES.astrology;

  const formatInstruction =
    format === 'reply'
      ? `You are writing a REPLY to someone's question on ${tone.displayName}.
The question is: "${question || topic}"
Write as if you're a knowledgeable community member sharing your perspective.
Start by acknowledging their question, then provide your insight.
Do NOT start with "Great question!" or similar.`
      : `You are writing an ORIGINAL POST for ${tone.displayName}.
Topic: ${topic}
Write as if you're sharing a discovery, insight, or useful information with the community.
Include a compelling title suggestion.
Structure with paragraphs, not wall of text.`;

  return `${formatInstruction}

SUBREDDIT: ${tone.displayName}
TONE: ${tone.tone}
DEPTH: ${tone.depth}

RULES FOR THIS SUBREDDIT:
${tone.rules.map((r) => `- ${r}`).join('\n')}

${grimoireContext ? `REFERENCE DATA (use naturally, don't quote verbatim):\n${grimoireContext}` : ''}

REDDIT-SPECIFIC GUIDELINES:
- Write like a real person, not a brand or AI
- Use paragraphs, not bullet points (unless listing specific items)
- Be conversational but substantive
- Include specific examples or data points
- End with a question or invitation for discussion (Reddit thrives on comments)
- 150-400 words for replies, 300-600 words for posts
- Do NOT include any self-promotion, links, or app mentions
- Do NOT use emojis excessively (1-2 max)

${format === 'post' ? 'Return JSON: {"title": "Post title", "body": "Post body", "flair": "Suggested flair"}' : 'Return JSON: {"body": "Reply text"}'}`;
}
