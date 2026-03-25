-- Switch embedding dimensions from 1536 (OpenAI) to 1024 (DeepInfra bge-large-en-v1.5)
-- This drops existing embeddings since dimension mismatch would cause query errors.
-- Re-embed via admin panel or cron after deploy.

ALTER TABLE grimoire_embeddings DROP COLUMN IF EXISTS embedding;
ALTER TABLE grimoire_embeddings ADD COLUMN embedding vector(1024);

-- Recreate the index for cosine similarity search
DROP INDEX IF EXISTS grimoire_embeddings_embedding_idx;
CREATE INDEX grimoire_embeddings_embedding_idx ON grimoire_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
