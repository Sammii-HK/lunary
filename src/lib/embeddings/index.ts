import OpenAI from 'openai';
import { sql } from '@vercel/postgres';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

// LRU cache for query embeddings to avoid duplicate OpenAI API calls.
// Embeddings are deterministic for the same input, so safe to cache.
const EMBEDDING_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const EMBEDDING_CACHE_MAX_SIZE = 200;
const embeddingCache = new Map<
  string,
  { embedding: number[]; timestamp: number }
>();

function getCachedEmbedding(text: string): number[] | null {
  const cached = embeddingCache.get(text);
  if (cached && Date.now() - cached.timestamp < EMBEDDING_CACHE_TTL) {
    return cached.embedding;
  }
  if (cached) {
    embeddingCache.delete(text);
  }
  return null;
}

function setCachedEmbedding(text: string, embedding: number[]): void {
  // Evict oldest entries if at capacity
  if (embeddingCache.size >= EMBEDDING_CACHE_MAX_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(text, { embedding, timestamp: Date.now() });
}

// Check if we're in test/CI mode without database access
function isTestMode(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.SKIP_AUTH === 'true' ||
    process.env.BYPASS_AUTH === 'true' ||
    !process.env.POSTGRES_URL
  );
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface GrimoireEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface EmbeddingResult {
  id: string;
  slug: string;
  title: string;
  category: string;
  similarity: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Return empty embedding in test mode
  if (isTestMode() && !process.env.OPENAI_API_KEY) {
    console.warn(
      '⚠️ generateEmbedding: Running in test mode without OpenAI API key',
    );
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  // Check cache first to avoid duplicate OpenAI API calls
  const cached = getCachedEmbedding(text);
  if (cached) return cached;

  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const embedding = response.data[0].embedding;
  setCachedEmbedding(text, embedding);
  return embedding;
}

export async function storeEmbedding(entry: GrimoireEntry): Promise<void> {
  if (isTestMode()) {
    console.warn('⚠️ storeEmbedding: Skipped in test mode');
    return;
  }

  const embedding = await generateEmbedding(
    `${entry.title}\n\n${entry.content}`,
  );
  const embeddingString = `[${embedding.join(',')}]`;

  await sql`
    INSERT INTO grimoire_embeddings (id, slug, title, category, content, embedding, metadata)
    VALUES (
      ${entry.id},
      ${entry.slug},
      ${entry.title},
      ${entry.category},
      ${entry.content},
      ${embeddingString}::vector,
      ${JSON.stringify(entry.metadata || {})}::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      category = EXCLUDED.category,
      content = EXCLUDED.content,
      embedding = EXCLUDED.embedding,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
  `;
}

export async function searchSimilar(
  query: string,
  limit: number = 5,
  category?: string,
): Promise<EmbeddingResult[]> {
  // Return empty results in test mode without database
  if (isTestMode()) {
    console.warn('⚠️ searchSimilar: Running in test mode without database');
    return [];
  }

  const queryEmbedding = await generateEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  let results;

  if (category) {
    results = await sql`
      SELECT 
        id,
        slug,
        title,
        category,
        content,
        metadata,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM grimoire_embeddings
      WHERE category = ${category}
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `;
  } else {
    results = await sql`
      SELECT 
        id,
        slug,
        title,
        category,
        content,
        metadata,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM grimoire_embeddings
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `;
  }

  return results.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    content: row.content,
    similarity: parseFloat(row.similarity),
    metadata: row.metadata,
  }));
}

export async function deleteEmbedding(slug: string): Promise<void> {
  if (isTestMode()) {
    console.warn('⚠️ deleteEmbedding: Skipped in test mode');
    return;
  }
  await sql`DELETE FROM grimoire_embeddings WHERE slug = ${slug}`;
}

export async function getEmbeddingCount(): Promise<number> {
  if (isTestMode()) {
    return 0;
  }
  const result = await sql`SELECT COUNT(*) as count FROM grimoire_embeddings`;
  return parseInt(result.rows[0].count);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  if (isTestMode()) {
    return {};
  }
  const result = await sql`
    SELECT category, COUNT(*) as count 
    FROM grimoire_embeddings 
    GROUP BY category
  `;
  return Object.fromEntries(
    result.rows.map((row) => [row.category, parseInt(row.count)]),
  );
}
