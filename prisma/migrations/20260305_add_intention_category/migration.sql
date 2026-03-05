-- Drop the restrictive category check constraint.
-- Category validation is handled in the API layer (collections/route.ts)
-- which is more flexible and easier to update than a DB constraint.
ALTER TABLE collections
  DROP CONSTRAINT IF EXISTS collections_category_check;
