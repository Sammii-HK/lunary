-- Migration: Add 'dream' category to collections table
-- This allows Book of Shadows entries to be explicitly categorized as dreams

-- Drop the existing constraint
ALTER TABLE collections 
  DROP CONSTRAINT IF EXISTS collections_category_check;

-- Add the updated constraint with 'dream' category
ALTER TABLE collections 
  ADD CONSTRAINT collections_category_check 
  CHECK (category IN ('chat', 'ritual', 'insight', 'moon_circle', 'tarot', 'journal', 'dream'));

-- Add index for dream category queries
CREATE INDEX IF NOT EXISTS idx_collections_dream_category 
  ON collections(user_id, created_at DESC) 
  WHERE category = 'dream';

