-- DropTable
DROP TABLE IF EXISTS "content_rotation_secondary";

-- AlterTable
ALTER TABLE "video_scripts" DROP COLUMN IF EXISTS "secondary_theme_id",
DROP COLUMN IF EXISTS "secondary_facet_slug",
DROP COLUMN IF EXISTS "secondary_angle_key",
DROP COLUMN IF EXISTS "secondary_aspect_key";
