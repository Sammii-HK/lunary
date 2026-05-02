-- Couples Mode v1 — pair two users via a 6-digit pairing code so they share
-- a daily compatibility forecast and 14-day cosmic calendar.
CREATE TABLE IF NOT EXISTS "couple_pairings" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "pairingCode" TEXT,
    "pairedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "couple_pairings_pkey" PRIMARY KEY ("id")
);

-- Unique active pairing code (only one open invite per code at a time).
CREATE UNIQUE INDEX IF NOT EXISTS "couple_pairings_pairingCode_key"
    ON "couple_pairings"("pairingCode");

-- Prevent duplicate pairings between the same ordered pair of users.
CREATE UNIQUE INDEX IF NOT EXISTS "couple_pairings_userAId_userBId_key"
    ON "couple_pairings"("userAId", "userBId");

CREATE INDEX IF NOT EXISTS "couple_pairings_userAId_idx"
    ON "couple_pairings"("userAId");

CREATE INDEX IF NOT EXISTS "couple_pairings_userBId_idx"
    ON "couple_pairings"("userBId");
