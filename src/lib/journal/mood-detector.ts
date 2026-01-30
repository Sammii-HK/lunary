/**
 * AI-Powered Mood Detection for Journal Entries
 * Automatically extracts mood tags from journal text
 */

// Standard mood taxonomy (expandable)
export const MOOD_TAXONOMY = {
  positive: [
    'joyful',
    'grateful',
    'hopeful',
    'peaceful',
    'content',
    'excited',
    'inspired',
    'energized',
    'confident',
    'loving',
    'playful',
    'proud',
  ],
  neutral: [
    'reflective',
    'curious',
    'contemplative',
    'focused',
    'calm',
    'accepting',
  ],
  challenging: [
    'anxious',
    'worried',
    'sad',
    'frustrated',
    'overwhelmed',
    'tired',
    'restless',
    'confused',
    'lonely',
    'angry',
  ],
} as const;

export const ALL_MOODS = [
  ...MOOD_TAXONOMY.positive,
  ...MOOD_TAXONOMY.neutral,
  ...MOOD_TAXONOMY.challenging,
];

export interface MoodDetectionResult {
  moods: string[];
  confidence: number;
  method: 'ai' | 'keyword' | 'hybrid';
}

/**
 * Keyword-based mood detection (fast, fallback method)
 */
export function detectMoodsByKeywords(text: string): MoodDetectionResult {
  const lowerText = text.toLowerCase();
  const detectedMoods: string[] = [];

  // Keyword mappings for each mood
  const moodKeywords: Record<string, string[]> = {
    joyful: ['joy', 'joyful', 'happy', 'happiness', 'delight', 'elated'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'gratitude'],
    hopeful: ['hope', 'hopeful', 'optimistic', 'looking forward', 'positive'],
    peaceful: ['peace', 'peaceful', 'serene', 'tranquil', 'calm'],
    content: ['content', 'satisfied', 'fulfilled', 'comfortable'],
    excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped'],
    inspired: [
      'inspired',
      'inspiration',
      'motivated',
      'creative',
      'innovative',
    ],
    energized: ['energized', 'energetic', 'vibrant', 'alive', 'invigorated'],
    confident: ['confident', 'assured', 'certain', 'self-assured'],
    loving: ['love', 'loving', 'affection', 'warmth', 'caring'],
    playful: ['playful', 'fun', 'lighthearted', 'silly', 'amusing'],
    proud: ['proud', 'accomplished', 'achievement', 'success'],

    reflective: [
      'reflect',
      'thinking',
      'pondering',
      'contemplating',
      'considering',
    ],
    curious: ['curious', 'wonder', 'wondering', 'interested', 'intrigued'],
    contemplative: [
      'contemplative',
      'meditative',
      'thoughtful',
      'introspective',
    ],
    focused: ['focused', 'concentrated', 'absorbed', 'engaged'],
    calm: ['calm', 'still', 'quiet', 'steady'],
    accepting: ['accepting', 'acceptance', 'letting go', 'surrender'],

    anxious: ['anxious', 'anxiety', 'nervous', 'worried', 'uneasy'],
    worried: ['worry', 'worried', 'concern', 'concerned', 'stress'],
    sad: ['sad', 'sadness', 'down', 'blue', 'melancholy', 'grief'],
    frustrated: ['frustrated', 'frustration', 'annoyed', 'irritated', 'stuck'],
    overwhelmed: [
      'overwhelmed',
      'swamped',
      'too much',
      'exhausted',
      'overloaded',
    ],
    tired: ['tired', 'exhausted', 'drained', 'weary', 'fatigued'],
    restless: ['restless', 'unsettled', 'agitated', 'fidgety'],
    confused: ['confused', 'uncertain', 'unclear', 'lost', 'puzzled'],
    lonely: ['lonely', 'alone', 'isolated', 'disconnected'],
    angry: ['angry', 'anger', 'mad', 'furious', 'rage'],
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedMoods.push(mood);
        break; // Only add each mood once
      }
    }
  }

  // Confidence based on number of matches
  const confidence = Math.min(detectedMoods.length / 3, 1);

  return {
    moods: detectedMoods.slice(0, 5), // Max 5 moods
    confidence,
    method: 'keyword',
  };
}

/**
 * AI-powered mood detection using Claude
 */
export async function detectMoodsByAI(
  text: string,
  apiKey?: string,
): Promise<MoodDetectionResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-20250514',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `Analyze this journal entry and identify up to 5 primary moods/emotions. Choose ONLY from this list: ${ALL_MOODS.join(', ')}.

Return ONLY a JSON array of mood strings, nothing else. Example: ["hopeful", "reflective", "calm"]

Journal entry:
${text}

Moods (JSON array only):`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI mood detection failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    const moods = JSON.parse(content) as string[];

    // Validate moods against taxonomy
    const validMoods = moods.filter((mood: string) =>
      (ALL_MOODS as readonly string[]).includes(mood),
    );

    return {
      moods: validMoods.slice(0, 5),
      confidence: 0.9,
      method: 'ai',
    };
  } catch (error) {
    console.error('AI mood detection failed:', error);
    // Fallback to keyword detection
    return detectMoodsByKeywords(text);
  }
}

/**
 * Hybrid approach: Try AI first, fallback to keywords
 */
export async function detectMoods(
  text: string,
  preferAI: boolean = true,
): Promise<MoodDetectionResult> {
  // Skip if text is too short
  if (text.length < 20) {
    return { moods: [], confidence: 0, method: 'keyword' };
  }

  if (preferAI) {
    const aiResult = await detectMoodsByAI(text);
    if (aiResult.moods.length > 0) {
      return aiResult;
    }
  }

  // Fallback or default: keyword detection
  return detectMoodsByKeywords(text);
}

/**
 * Batch mood detection for multiple entries
 */
export async function detectMoodsBatch(
  entries: Array<{ id: string; text: string }>,
  preferAI: boolean = true,
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();

  for (const entry of entries) {
    const detection = await detectMoods(entry.text, preferAI);
    results.set(entry.id, detection.moods);
  }

  return results;
}
