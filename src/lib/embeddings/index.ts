import OpenAI from 'openai';
import { sql } from '@vercel/postgres';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

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
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

export async function storeEmbedding(entry: GrimoireEntry): Promise<void> {
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
  await sql`DELETE FROM grimoire_embeddings WHERE slug = ${slug}`;
}

export async function getEmbeddingCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM grimoire_embeddings`;
  return parseInt(result.rows[0].count);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const result = await sql`
    SELECT category, COUNT(*) as count 
    FROM grimoire_embeddings 
    GROUP BY category
  `;
  return Object.fromEntries(
    result.rows.map((row) => [row.category, parseInt(row.count)]),
  );
}
