import { sql } from '@vercel/postgres';

export interface ExtractedMoment {
  content: string;
  moodTags: string[];
  cardReferences: string[];
  timestamp: string;
  messageId: string;
}

const EMOTION_PATTERNS = [
  /\b(feel(?:ing)?|felt)\s+(\w+)/gi,
  /\bi(?:'m| am)\s+(happy|sad|anxious|excited|worried|hopeful|restless|calm|peaceful|overwhelmed|grateful|confused|inspired)/gi,
  /\b(joy|sorrow|anxiety|excitement|worry|hope|peace|gratitude|confusion|inspiration)\b/gi,
];

const INSIGHT_PATTERNS = [
  /\bi\s+(?:realize|realized|understand|understood|learned|noticed)\b/gi,
  /\b(?:insight|revelation|epiphany|realization)\b/gi,
  /\bthis\s+(?:means|suggests|indicates|shows)\b/gi,
];

const INTENTION_PATTERNS = [
  /\b(?:intention|goal|want to|going to|will|plan to)\b/gi,
  /\bnew\s+moon\b/gi,
  /\bfull\s+moon\b/gi,
  /\bmanifest(?:ing)?\b/gi,
];

const TAROT_CARD_NAMES = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
  'Ace of Wands',
  'Two of Wands',
  'Three of Wands',
  'Four of Wands',
  'Five of Wands',
  'Six of Wands',
  'Seven of Wands',
  'Eight of Wands',
  'Nine of Wands',
  'Ten of Wands',
  'Page of Wands',
  'Knight of Wands',
  'Queen of Wands',
  'King of Wands',
  'Ace of Cups',
  'Two of Cups',
  'Three of Cups',
  'Four of Cups',
  'Five of Cups',
  'Six of Cups',
  'Seven of Cups',
  'Eight of Cups',
  'Nine of Cups',
  'Ten of Cups',
  'Page of Cups',
  'Knight of Cups',
  'Queen of Cups',
  'King of Cups',
  'Ace of Swords',
  'Two of Swords',
  'Three of Swords',
  'Four of Swords',
  'Five of Swords',
  'Six of Swords',
  'Seven of Swords',
  'Eight of Swords',
  'Nine of Swords',
  'Ten of Swords',
  'Page of Swords',
  'Knight of Swords',
  'Queen of Swords',
  'King of Swords',
  'Ace of Pentacles',
  'Two of Pentacles',
  'Three of Pentacles',
  'Four of Pentacles',
  'Five of Pentacles',
  'Six of Pentacles',
  'Seven of Pentacles',
  'Eight of Pentacles',
  'Nine of Pentacles',
  'Ten of Pentacles',
  'Page of Pentacles',
  'Knight of Pentacles',
  'Queen of Pentacles',
  'King of Pentacles',
];

const MOOD_KEYWORDS: Record<string, string> = {
  happy: 'joyful',
  sad: 'melancholic',
  anxious: 'anxious',
  excited: 'energised',
  worried: 'concerned',
  hopeful: 'hopeful',
  restless: 'restless',
  calm: 'peaceful',
  peaceful: 'peaceful',
  overwhelmed: 'overwhelmed',
  grateful: 'grateful',
  confused: 'uncertain',
  inspired: 'inspired',
  reflective: 'reflective',
  introspective: 'reflective',
};

export function extractMoodTags(text: string): string[] {
  const moods = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const [keyword, tag] of Object.entries(MOOD_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      moods.add(tag);
    }
  }

  return Array.from(moods);
}

export function extractCardReferences(text: string): string[] {
  const cards = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const card of TAROT_CARD_NAMES) {
    if (lowerText.includes(card.toLowerCase())) {
      cards.add(card);
    }
  }

  return Array.from(cards);
}

function isJournalWorthy(text: string): boolean {
  if (text.length < 20) return false;

  for (const pattern of EMOTION_PATTERNS) {
    if (pattern.test(text)) return true;
    pattern.lastIndex = 0;
  }

  for (const pattern of INSIGHT_PATTERNS) {
    if (pattern.test(text)) return true;
    pattern.lastIndex = 0;
  }

  for (const pattern of INTENTION_PATTERNS) {
    if (pattern.test(text)) return true;
    pattern.lastIndex = 0;
  }

  if (extractCardReferences(text).length > 0) return true;

  return false;
}

export function extractMomentsFromMessages(
  messages: Array<{ role: string; content: string; ts?: string; id?: string }>,
): ExtractedMoment[] {
  const moments: ExtractedMoment[] = [];

  for (const msg of messages) {
    if (msg.role !== 'user') continue;

    if (isJournalWorthy(msg.content)) {
      moments.push({
        content: msg.content,
        moodTags: extractMoodTags(msg.content),
        cardReferences: extractCardReferences(msg.content),
        timestamp: msg.ts || new Date().toISOString(),
        messageId: msg.id || `msg-${Date.now()}`,
      });
    }
  }

  return moments;
}

export async function saveExtractedMoments(
  userId: string,
  moments: ExtractedMoment[],
  cosmicContext?: { moonPhase?: string; transitHighlight?: string },
): Promise<number> {
  let savedCount = 0;

  for (const moment of moments) {
    const existingResult = await sql`
      SELECT id FROM collections 
      WHERE user_id = ${userId} 
      AND category = 'journal'
      AND content->>'sourceMessageId' = ${moment.messageId}
      LIMIT 1
    `;

    if (existingResult.rows.length > 0) continue;

    const title =
      moment.content.length > 50
        ? moment.content.substring(0, 50) + '...'
        : moment.content;

    const contentData = {
      text: moment.content,
      moodTags: moment.moodTags,
      cardReferences: moment.cardReferences,
      moonPhase: cosmicContext?.moonPhase || null,
      transitHighlight: cosmicContext?.transitHighlight || null,
      source: 'chat',
      sourceMessageId: moment.messageId,
    };

    const tagsArray = `{${(moment.moodTags || []).map((t) => `"${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
    await sql`
      INSERT INTO collections (user_id, title, category, content, tags, created_at)
      VALUES (
        ${userId},
        ${title},
        'journal',
        ${JSON.stringify(contentData)}::jsonb,
        ${tagsArray}::text[],
        ${moment.timestamp}::timestamptz
      )
    `;

    savedCount++;
  }

  return savedCount;
}
