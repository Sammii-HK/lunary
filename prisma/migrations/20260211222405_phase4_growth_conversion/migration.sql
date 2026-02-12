-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN     "attachment" JSONB,
ADD COLUMN     "best_answer" BOOLEAN DEFAULT false,
ADD COLUMN     "parent_id" INTEGER,
ADD COLUMN     "post_type" VARCHAR(30) DEFAULT 'insight',
ADD COLUMN     "topic_tag" VARCHAR(30),
ADD COLUMN     "vote_count" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "referral_codes" ADD COLUMN     "campaign" VARCHAR(50);

-- AlterTable
ALTER TABLE "user_referrals" ADD COLUMN     "reward_tier" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "user_streaks" ADD COLUMN     "challenge_streak" INTEGER DEFAULT 0,
ADD COLUMN     "last_challenge_week" DATE,
ADD COLUMN     "longest_challenge_streak" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "community_votes" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_rituals" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "ritual_date" DATE NOT NULL,
    "ritual_type" VARCHAR(20) NOT NULL,
    "cosmic_score" INTEGER,
    "card_pulled" JSONB,
    "intention_id" UUID,
    "crystal_color" JSONB,
    "mood" VARCHAR(50),
    "mood_moon_phase" TEXT,
    "gratitude" TEXT,
    "intention_reviewed" BOOLEAN DEFAULT false,
    "intention_outcome" VARCHAR(30),
    "dream_intention" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_challenges" (
    "id" SERIAL NOT NULL,
    "week_start" DATE NOT NULL,
    "transit_key" VARCHAR(100) NOT NULL,
    "challenge_title" VARCHAR(200) NOT NULL,
    "challenge_description" TEXT NOT NULL,
    "daily_prompts" JSONB NOT NULL DEFAULT '[]',
    "xp_per_day" INTEGER NOT NULL DEFAULT 1,
    "xp_bonus_week" INTEGER NOT NULL DEFAULT 5,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_completions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "check_in_date" DATE NOT NULL,
    "completed" BOOLEAN DEFAULT false,
    "reflection" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones_achieved" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "milestone_type" VARCHAR(50) NOT NULL,
    "milestone_key" VARCHAR(100) NOT NULL,
    "milestone_data" JSONB DEFAULT '{}',
    "achieved_at" TIMESTAMPTZ(6),
    "notified_at" TIMESTAMPTZ(6),
    "celebrated" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_achieved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cosmic_gifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "gift_type" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "message" TEXT,
    "opened_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cosmic_gifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_community_votes_post" ON "community_votes"("post_id");

-- CreateIndex
CREATE INDEX "idx_community_votes_user" ON "community_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_votes_post_id_user_id_key" ON "community_votes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_daily_rituals_user" ON "daily_rituals"("user_id");

-- CreateIndex
CREATE INDEX "idx_daily_rituals_date" ON "daily_rituals"("ritual_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_rituals_user_id_ritual_date_ritual_type_key" ON "daily_rituals"("user_id", "ritual_date", "ritual_type");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_challenges_week_start_key" ON "weekly_challenges"("week_start");

-- CreateIndex
CREATE INDEX "idx_weekly_challenges_week" ON "weekly_challenges"("week_start");

-- CreateIndex
CREATE INDEX "idx_challenge_completions_user_challenge" ON "challenge_completions"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_completions_user_id_challenge_id_check_in_date_key" ON "challenge_completions"("user_id", "challenge_id", "check_in_date");

-- CreateIndex
CREATE INDEX "idx_milestones_user" ON "milestones_achieved"("user_id");

-- CreateIndex
CREATE INDEX "idx_milestones_celebrated" ON "milestones_achieved"("celebrated");

-- CreateIndex
CREATE UNIQUE INDEX "milestones_achieved_user_id_milestone_key_key" ON "milestones_achieved"("user_id", "milestone_key");

-- CreateIndex
CREATE INDEX "idx_cosmic_gifts_sender" ON "cosmic_gifts"("sender_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_cosmic_gifts_recipient" ON "cosmic_gifts"("recipient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_community_posts_type" ON "community_posts"("post_type");

-- CreateIndex
CREATE INDEX "idx_community_posts_parent" ON "community_posts"("parent_id");

-- CreateIndex
CREATE INDEX "idx_community_posts_votes" ON "community_posts"("vote_count" DESC);

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_votes" ADD CONSTRAINT "community_votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "challenge_completions" ADD CONSTRAINT "challenge_completions_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "weekly_challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
