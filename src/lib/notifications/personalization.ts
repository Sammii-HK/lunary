import { sql } from '@vercel/postgres';

export interface UserProfile {
  userId: string;
  name?: string;
  birthday?: string;
  timezone?: string;
  birthChart?: {
    sun?: string;
    moon?: string;
    rising?: string;
  };
  subscription?: {
    status: string;
    planType: string;
    isPaid: boolean;
  };
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const result = await sql`
      SELECT 
        ps.user_id,
        ps.preferences->>'name' as name,
        ps.preferences->>'birthday' as birthday,
        ps.preferences->>'timezone' as timezone,
        COALESCE(s.status, 'free') as subscription_status,
        COALESCE(s.plan_type, 'free') as plan_type
      FROM push_subscriptions ps
      LEFT JOIN subscriptions s ON ps.user_id = s.user_id
      WHERE ps.user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const isPaid =
      row.subscription_status === 'active' ||
      row.subscription_status === 'trial' ||
      row.subscription_status === 'trialing';

    const profile: UserProfile = {
      userId: row.user_id,
      name: row.name || undefined,
      birthday: row.birthday || undefined,
      timezone: row.timezone || undefined,
      subscription: {
        status: row.subscription_status,
        planType: row.plan_type,
        isPaid,
      },
    };

    if (isPaid && row.birthday) {
      const birthChartData = await getBirthChartData(userId);
      if (birthChartData) {
        profile.birthChart = birthChartData;
      }
    }

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getBirthChartData(
  userId: string,
): Promise<{ sun?: string; moon?: string; rising?: string } | null> {
  try {
    const result = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].birth_chart) {
      const pushResult = await sql`
        SELECT preferences->>'birthChart' as birth_chart
        FROM push_subscriptions
        WHERE user_id = ${userId}
        LIMIT 1
      `;

      if (pushResult.rows.length === 0 || !pushResult.rows[0].birth_chart) {
        return null;
      }

      return parseBirthChart(pushResult.rows[0].birth_chart);
    }

    return parseBirthChart(result.rows[0].birth_chart);
  } catch (error) {
    console.error(`Failed to fetch birth chart for user ${userId}:`, error);
    return null;
  }
}

function parseBirthChart(
  birthChart: any,
): { sun?: string; moon?: string; rising?: string } | null {
  if (!birthChart) return null;

  let sun: string | undefined;
  let moon: string | undefined;
  let rising: string | undefined;

  const chartArray = Array.isArray(birthChart) ? birthChart : [];

  for (const placement of chartArray) {
    if (placement.body === 'Sun') sun = placement.sign;
    if (placement.body === 'Moon') moon = placement.sign;
    if (placement.body === 'Ascendant' || placement.body === 'Rising')
      rising = placement.sign;
  }

  return { sun, moon, rising };
}

export async function batchGetUserProfiles(
  userIds: string[],
): Promise<Map<string, UserProfile>> {
  const profileMap = new Map<string, UserProfile>();

  if (userIds.length === 0) {
    return profileMap;
  }

  try {
    // Single query to fetch all profiles + subscription data
    const result = await sql`
      SELECT DISTINCT ON (ps.user_id)
        ps.user_id,
        ps.preferences->>'name' as name,
        ps.preferences->>'birthday' as birthday,
        ps.preferences->>'timezone' as timezone,
        COALESCE(s.status, 'free') as subscription_status,
        COALESCE(s.plan_type, 'free') as plan_type
      FROM push_subscriptions ps
      LEFT JOIN subscriptions s ON ps.user_id = s.user_id
      WHERE ps.user_id = ANY(${userIds as any})
    `;

    // Build initial profiles and collect paid user IDs that need birth charts
    const paidUserIdsWithBirthday: string[] = [];

    for (const row of result.rows) {
      const isPaid =
        row.subscription_status === 'active' ||
        row.subscription_status === 'trial' ||
        row.subscription_status === 'trialing';

      const profile: UserProfile = {
        userId: row.user_id,
        name: row.name || undefined,
        birthday: row.birthday || undefined,
        timezone: row.timezone || undefined,
        subscription: {
          status: row.subscription_status,
          planType: row.plan_type,
          isPaid,
        },
      };

      profileMap.set(row.user_id, profile);

      if (isPaid && row.birthday) {
        paidUserIdsWithBirthday.push(row.user_id);
      }
    }

    // Batch fetch birth charts for paid users with birthdays
    if (paidUserIdsWithBirthday.length > 0) {
      try {
        // First try user_profiles table
        const birthChartResult = await sql`
          SELECT user_id, birth_chart
          FROM user_profiles
          WHERE user_id = ANY(${paidUserIdsWithBirthday as any})
        `;

        const foundUserIds = new Set<string>();
        for (const row of birthChartResult.rows) {
          if (row.birth_chart) {
            const parsed = parseBirthChart(row.birth_chart);
            if (parsed) {
              const profile = profileMap.get(row.user_id);
              if (profile) {
                profile.birthChart = parsed;
              }
              foundUserIds.add(row.user_id);
            }
          }
        }

        // Fallback: fetch from push_subscriptions for users not found in user_profiles
        const missingUserIds = paidUserIdsWithBirthday.filter(
          (id) => !foundUserIds.has(id),
        );
        if (missingUserIds.length > 0) {
          const fallbackResult = await sql`
            SELECT user_id, preferences->>'birthChart' as birth_chart
            FROM push_subscriptions
            WHERE user_id = ANY(${missingUserIds as any})
          `;

          for (const row of fallbackResult.rows) {
            if (row.birth_chart) {
              const parsed = parseBirthChart(row.birth_chart);
              if (parsed) {
                const profile = profileMap.get(row.user_id);
                if (profile) {
                  profile.birthChart = parsed;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn(
          '[Notifications] Failed to batch fetch birth charts:',
          err,
        );
      }
    }
  } catch (error) {
    console.error(
      '[Notifications] Failed to batch fetch user profiles:',
      error,
    );
  }

  return profileMap;
}

export function personalizeNotificationTitle(
  title: string,
  userName?: string,
): string {
  if (!userName) {
    return title;
  }
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

  if (eventType === 'moon' && firstName && userProfile.subscription?.isPaid) {
    return `${firstName}, ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
  }

  if (
    eventType === 'daily_insight' &&
    firstName &&
    userProfile.subscription?.isPaid
  ) {
    return body.replace('Your', `${firstName}, your`);
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

  if (!userProfile.subscription?.isPaid) {
    return false;
  }

  if (!userProfile.birthday) {
    return false;
  }

  return true;
}

export function getPersonalizationLevel(
  userProfile?: UserProfile,
): 'none' | 'basic' | 'full' {
  if (!userProfile) {
    return 'none';
  }

  if (!userProfile.subscription?.isPaid) {
    return 'none';
  }

  if (!userProfile.birthday) {
    return 'basic';
  }

  if (userProfile.birthChart) {
    return 'full';
  }

  return 'basic';
}

export function canReceivePersonalTransits(userProfile?: UserProfile): boolean {
  if (!userProfile) return false;
  if (!userProfile.subscription?.isPaid) return false;
  if (!userProfile.birthChart) return false;
  return true;
}

export function formatPersonalizedGreeting(
  userProfile: UserProfile,
  baseMessage: string,
): string {
  const firstName = userProfile.name?.split(' ')[0];

  if (!firstName) {
    return baseMessage;
  }

  if (!userProfile.subscription?.isPaid) {
    return baseMessage;
  }

  if (baseMessage.toLowerCase().startsWith('your ')) {
    return `${firstName}, ${baseMessage.charAt(0).toLowerCase()}${baseMessage.slice(1)}`;
  }

  return `${firstName}, ${baseMessage.toLowerCase()}`;
}
