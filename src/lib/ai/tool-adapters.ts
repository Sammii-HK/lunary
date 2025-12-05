import { sql } from '@vercel/postgres';
import { encrypt, decrypt } from '../encryption';

type SaveConversationSnippetResponse = {
  ok: boolean;
};

/**
 * Save a conversation snippet to the database (encrypted)
 */
export const saveConversationSnippet = async (
  userId: string,
  snippet: string,
): Promise<SaveConversationSnippetResponse> => {
  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_snippets (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        snippet_encrypted TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const encryptedSnippet = encrypt(snippet);

    await sql`
      INSERT INTO conversation_snippets (user_id, snippet_encrypted)
      VALUES (${userId}, ${encryptedSnippet})
    `;

    // Keep only the last 20 snippets per user
    await sql`
      DELETE FROM conversation_snippets
      WHERE user_id = ${userId}
      AND id NOT IN (
        SELECT id FROM conversation_snippets
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 20
      )
    `;

    console.info('[AI Tools] Saved conversation snippet for user');
    return { ok: true };
  } catch (error) {
    console.error('[AI Tools] Failed to save conversation snippet:', error);
    return { ok: false };
  }
};

/**
 * Load conversation snippets for a user (decrypted)
 */
export const loadConversationSnippets = async (
  userId: string,
  limit: number = 10,
): Promise<string[]> => {
  try {
    const result = await sql`
      SELECT snippet_encrypted
      FROM conversation_snippets
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows.map((row) => decrypt(row.snippet_encrypted));
  } catch (error) {
    console.error('[AI Tools] Failed to load conversation snippets:', error);
    return [];
  }
};

export const getDailyHighlight = async (userId: string) => {
  console.info('[AI Tools] getDailyHighlight (stub)', { userId });
  return null;
};

export const searchDocs = async (query: string) => {
  console.info('[AI Tools] searchDocs (stub)', { query });
  return { snippets: [] };
};
