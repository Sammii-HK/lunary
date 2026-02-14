/**
 * Content rotation logic for video scripts
 */

import { pickRandom } from '../shared/text/normalize';
import { VIDEO_ANGLE_OPTIONS } from './constants';

/**
 * Get angle for topic based on recent usage
 */
export async function getAngleForTopic(
  topic: string,
  scheduledDate: Date,
): Promise<string> {
  const { sql } = await import('@vercel/postgres');
  const result = await sql`
    SELECT angle
    FROM video_scripts
    WHERE topic = ${topic}
      AND angle IS NOT NULL
      AND scheduled_date <= ${scheduledDate.toISOString()}
    ORDER BY scheduled_date DESC NULLS LAST
    LIMIT 10
  `;
  const recentAngles = result.rows
    .map((row) => String(row.angle))
    .filter(Boolean);
  for (const option of VIDEO_ANGLE_OPTIONS) {
    if (!recentAngles.includes(option)) {
      return option;
    }
  }
  if (recentAngles.length === 0) {
    return pickRandom(VIDEO_ANGLE_OPTIONS);
  }
  const lastIndex = new Map<string, number>();
  recentAngles.forEach((angle, index) => {
    if (!lastIndex.has(angle)) lastIndex.set(angle, index);
  });
  const sorted = VIDEO_ANGLE_OPTIONS.slice().sort((a, b) => {
    const aIndex = lastIndex.get(a) ?? 999;
    const bIndex = lastIndex.get(b) ?? 999;
    return bIndex - aIndex;
  });
  return sorted[0] || VIDEO_ANGLE_OPTIONS[0];
}
