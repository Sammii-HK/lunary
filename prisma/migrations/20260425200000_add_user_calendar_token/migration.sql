-- Add calendar_token to user for .ics subscription auth
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "calendar_token" text;
CREATE UNIQUE INDEX IF NOT EXISTS "user_calendar_token_key" ON "user"("calendar_token");
CREATE INDEX IF NOT EXISTS "idx_user_calendar_token" ON "user"("calendar_token");
