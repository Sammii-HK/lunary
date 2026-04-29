-- Add public_handle to user for /me/{handle} cosmic identity profile
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "public_handle" text;
CREATE UNIQUE INDEX IF NOT EXISTS "user_public_handle_key" ON "user"("public_handle");
CREATE INDEX IF NOT EXISTS "idx_user_public_handle" ON "user"("public_handle");
