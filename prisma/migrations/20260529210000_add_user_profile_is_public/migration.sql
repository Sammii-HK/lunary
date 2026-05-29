-- Add profile_is_public visibility flag to user for the /me/{handle} public
-- cosmic-identity page. Explicit-consent gate: the public page (and its OG
-- card) only render when this is true. Defaults to false so existing claimed
-- handles and all new claims stay PRIVATE until the owner opts in.
--
-- Backfill note: existing rows take the DEFAULT (false), i.e. previously
-- claimed handles become private. This is the intended privacy-safe default
-- (see PR body). To preserve the prior auto-public behaviour for the current
-- handful of claimed handles instead, run the optional backfill below.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "profile_is_public" BOOLEAN NOT NULL DEFAULT false;

-- OPTIONAL backfill (DO NOT run unless you deliberately want every already
-- claimed handle to stay publicly visible without a fresh opt-in):
-- UPDATE "user" SET "profile_is_public" = true WHERE "public_handle" IS NOT NULL;
