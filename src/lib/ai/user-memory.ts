/**
 * Enhanced User Memory System
 *
 * Extracts and stores personal facts from conversations to help the AI
 * remember and learn about the user over time.
 *
 * All personal data is encrypted at rest using AES-256-GCM.
 */

import { sql } from '@vercel/postgres';
import { encrypt, decrypt } from '../encryption';

export type MemoryCategory =
  | 'relationship' // Partner, family, friends
  | 'work' // Job, career, colleagues
  | 'interest' // Hobbies, passions
  | 'concern' // Worries, challenges
  | 'preference' // Likes, dislikes
  | 'life_event' // Major events, changes
  | 'goal'; // Aspirations, plans

export interface UserMemoryFact {
  id?: number;
  category: MemoryCategory;
  fact: string;
  confidence: number;
  mentionedCount: number;
  lastMentionedAt: string;
}

export interface ExtractedFact {
  category: MemoryCategory;
  fact: string;
  confidence: number;
}

/**
 * Extract personal facts from a conversation using pattern matching
 * This is a deterministic approach that doesn't require additional AI calls
 */
export function extractPersonalFacts(userMessages: string[]): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  const combinedText = userMessages.join(' ').toLowerCase();

  // Relationship patterns
  const relationshipPatterns = [
    /my (?:partner|husband|wife|boyfriend|girlfriend|spouse)(?:'s name is |,? )(\w+)/i,
    /(?:i'm|i am) (?:married|engaged|dating|single|divorced)/i,
    /my (?:mom|mum|dad|father|mother|brother|sister|son|daughter)(?:'s name is |,? )(\w+)/i,
    /(?:i have|i've got) (\d+) (?:kids|children|siblings)/i,
  ];

  // Work patterns
  const workPatterns = [
    /(?:i work as|i'm|i am) a[n]? ([\w\s]+?)(?:\.|,|$| and| at)/i,
    /(?:i work|working) (?:at|for|in) ([\w\s]+?)(?:\.|,|$| and)/i,
    /my (?:job|career|profession) is ([\w\s]+)/i,
    /(?:i'm|i am) (?:a )?(freelancer|entrepreneur|self-employed|unemployed|retired|student)/i,
  ];

  // Interest patterns
  const interestPatterns = [
    /(?:i love|i enjoy|i'm into|i'm passionate about|my hobby is) ([\w\s]+?)(?:\.|,|$| and)/i,
    /(?:i've been|i have been) (?:practicing|learning|studying) ([\w\s]+)/i,
  ];

  // Concern patterns
  const concernPatterns = [
    /(?:i'm worried|i'm anxious|i'm stressed|i'm concerned|struggling with) (?:about )?([\w\s]+?)(?:\.|,|$)/i,
    /(?:i've been|i have been) (?:feeling|going through) ([\w\s]+?)(?:\.|,|$)/i,
  ];

  // Life event patterns
  const lifeEventPatterns = [
    /(?:i just|i recently|i'm about to) (?:moved|got|started|finished|lost|found) ([\w\s]+?)(?:\.|,|$)/i,
    /(?:i'm|i am) (?:pregnant|expecting|moving|relocating|graduating)/i,
    /(?:i'm planning|we're planning) (?:to|a) ([\w\s]+?)(?:\.|,|$)/i,
  ];

  // Goal patterns
  const goalPatterns = [
    /(?:i want to|i'd like to|my goal is to|i'm trying to|i hope to) ([\w\s]+?)(?:\.|,|$)/i,
    /(?:i'm working towards|i'm aiming for) ([\w\s]+?)(?:\.|,|$)/i,
  ];

  // Extract facts using patterns
  const patternGroups: [RegExp[], MemoryCategory][] = [
    [relationshipPatterns, 'relationship'],
    [workPatterns, 'work'],
    [interestPatterns, 'interest'],
    [concernPatterns, 'concern'],
    [lifeEventPatterns, 'life_event'],
    [goalPatterns, 'goal'],
  ];

  for (const [patterns, category] of patternGroups) {
    for (const pattern of patterns) {
      const match = combinedText.match(pattern);
      if (match) {
        const factText = match[1] ? match[1].trim() : match[0].trim();
        if (factText.length > 2 && factText.length < 100) {
          facts.push({
            category,
            fact: factText,
            confidence: 0.7,
          });
        }
      }
    }
  }

  // Deduplicate similar facts
  const uniqueFacts = facts.reduce((acc, fact) => {
    const exists = acc.some(
      (f) =>
        f.category === fact.category &&
        (f.fact.includes(fact.fact) || fact.fact.includes(f.fact)),
    );
    if (!exists) {
      acc.push(fact);
    }
    return acc;
  }, [] as ExtractedFact[]);

  return uniqueFacts.slice(0, 5); // Limit to 5 facts per extraction
}

/**
 * Save extracted facts to the database (encrypted)
 */
export async function saveUserMemory(
  userId: string,
  facts: ExtractedFact[],
  sourceMessageId?: string,
): Promise<number> {
  if (facts.length === 0) return 0;

  let savedCount = 0;

  try {
    await ensureUserMemoryTable();
    // Ensure table exists

    for (const fact of facts) {
      // Check if similar fact already exists
      const existing = await sql`
        SELECT id, fact_encrypted, mentioned_count
        FROM user_memory
        WHERE user_id = ${userId}
          AND category = ${fact.category}
        ORDER BY last_mentioned_at DESC
        LIMIT 10
      `;

      // Check for duplicate by decrypting and comparing
      let isDuplicate = false;
      let existingId: number | null = null;
      let existingCount = 1;

      for (const row of existing.rows) {
        try {
          const decryptedFact = decrypt(row.fact_encrypted);
          if (
            decryptedFact.toLowerCase().includes(fact.fact.toLowerCase()) ||
            fact.fact.toLowerCase().includes(decryptedFact.toLowerCase())
          ) {
            isDuplicate = true;
            existingId = row.id;
            existingCount = row.mentioned_count;
            break;
          }
        } catch {
          // Skip if decryption fails
        }
      }

      if (isDuplicate && existingId) {
        // Update existing fact's mention count
        await sql`
          UPDATE user_memory
          SET mentioned_count = ${existingCount + 1},
              last_mentioned_at = NOW(),
              confidence = LEAST(confidence + 0.05, 1.0)
          WHERE id = ${existingId}
        `;
      } else {
        // Insert new encrypted fact
        const encryptedFact = encrypt(fact.fact);
        await sql`
          INSERT INTO user_memory (user_id, category, fact_encrypted, confidence, source_message_id)
          VALUES (${userId}, ${fact.category}, ${encryptedFact}, ${fact.confidence}, ${sourceMessageId || null})
        `;
        savedCount++;
      }
    }

    console.info(`[User Memory] Saved ${savedCount} new facts for user`);
    return savedCount;
  } catch (error) {
    console.error('[User Memory] Failed to save facts:', error);
    return 0;
  }
}

/**
 * Load user memory facts (decrypted)
 */
export async function loadUserMemory(
  userId: string,
  limit: number = 20,
): Promise<UserMemoryFact[]> {
  try {
    await ensureUserMemoryTable();
    const result = await sql`
      SELECT id, category, fact_encrypted, confidence, mentioned_count, last_mentioned_at
      FROM user_memory
      WHERE user_id = ${userId}
      ORDER BY 
        mentioned_count DESC,
        last_mentioned_at DESC
      LIMIT ${limit}
    `;

    return result.rows.map((row) => ({
      id: row.id,
      category: row.category as MemoryCategory,
      fact: decrypt(row.fact_encrypted),
      confidence: row.confidence,
      mentionedCount: row.mentioned_count,
      lastMentionedAt: row.last_mentioned_at,
    }));
  } catch (error) {
    console.error('[User Memory] Failed to load facts:', error);
    return [];
  }
}

/**
 * Format user memory for inclusion in AI context
 */
export function formatUserMemoryForContext(facts: UserMemoryFact[]): string {
  if (facts.length === 0) return '';

  const grouped = facts.reduce(
    (acc, fact) => {
      if (!acc[fact.category]) {
        acc[fact.category] = [];
      }
      acc[fact.category].push(fact.fact);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const parts: string[] = ['USER PROFILE (what you know about them):'];

  const categoryLabels: Record<MemoryCategory, string> = {
    relationship: 'Relationships',
    work: 'Work/Career',
    interest: 'Interests',
    concern: 'Current Concerns',
    preference: 'Preferences',
    life_event: 'Life Events',
    goal: 'Goals',
  };

  for (const [category, factList] of Object.entries(grouped)) {
    const label = categoryLabels[category as MemoryCategory] || category;
    parts.push(`- ${label}: ${factList.join('; ')}`);
  }

  parts.push(
    '\nUse this knowledge to personalize your responses. Reference their situation naturally.',
  );

  return parts.join('\n');
}

/**
 * Delete user memory (for GDPR compliance)
 */
export async function deleteUserMemory(userId: string): Promise<boolean> {
  try {
    await ensureUserMemoryTable();
    await sql`DELETE FROM user_memory WHERE user_id = ${userId}`;
    console.info(`[User Memory] Deleted all memory for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[User Memory] Failed to delete memory:', error);
    return false;
  }
}
export const ensureUserMemoryTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS user_memory (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      fact_encrypted TEXT NOT NULL,
      confidence REAL DEFAULT 0.8,
      source_message_id TEXT,
      mentioned_count INTEGER DEFAULT 1,
      last_mentioned_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_memory_category ON user_memory(category)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_memory_last_mentioned ON user_memory(last_mentioned_at DESC)
  `;
  await sql`
    CREATE OR REPLACE FUNCTION update_user_memory_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `;
  await sql`DROP TRIGGER IF EXISTS update_user_memory_timestamp ON user_memory`;
  await sql`
    CREATE TRIGGER update_user_memory_timestamp
    BEFORE UPDATE ON user_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_user_memory_updated_at()
  `;
};
