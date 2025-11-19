import { sql } from '@vercel/postgres';

export interface UserProfile {
  userId: string;
  name?: string;
  birthday?: string;
  birthChart?: {
    sun?: string;
    moon?: string;
    rising?: string;
  };
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const result = await sql`
      SELECT 
        user_id,
        preferences->>'name' as name,
        preferences->>'birthday' as birthday
      FROM push_subscriptions
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      userId: row.user_id,
      name: row.name || undefined,
      birthday: row.birthday || undefined,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export function personalizeNotificationTitle(
  title: string,
  userName?: string,
): string {
  if (!userName) {
    return title;
  }

  const firstName = userName.split(' ')[0];
  return title;
}

export function personalizeNotificationBody(
  body: string,
  eventType: string,
  userProfile?: UserProfile,
): string {
  if (!userProfile) {
    return body;
  }

  const firstName = userProfile.name?.split(' ')[0];

  if (eventType === 'moon' && firstName) {
    return `${firstName}, ${body.toLowerCase()}`;
  }

  return body;
}

export function shouldPersonalize(
  userProfile?: UserProfile,
  eventType?: string,
): boolean {
  if (!userProfile) {
    return false;
  }

  if (eventType === 'moon' && userProfile.birthday) {
    return true;
  }

  return false;
}
