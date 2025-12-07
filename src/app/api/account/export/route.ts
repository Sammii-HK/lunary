import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Gather all user data
    const [
      profileResult,
      subscriptionResult,
      tarotReadingsResult,
      notesResult,
      aiThreadsResult,
      streaksResult,
      pushSubscriptionsResult,
    ] = await Promise.all([
      sql`SELECT * FROM user_profiles WHERE user_id = ${userId}`,
      sql`SELECT * FROM subscriptions WHERE user_id = ${userId}`,
      sql`SELECT * FROM tarot_readings WHERE user_id = ${userId}`,
      sql`SELECT * FROM user_notes WHERE user_id = ${userId}`,
      sql`SELECT * FROM ai_threads WHERE user_id = ${userId}`,
      sql`SELECT * FROM user_streaks WHERE user_id = ${userId}`,
      sql`SELECT * FROM push_subscriptions WHERE user_id = ${userId}`,
    ]);

    const profile = profileResult.rows[0];

    // Decrypt sensitive fields
    const decryptedProfile = profile
      ? {
          ...profile,
          name: profile.name ? decrypt(profile.name) : null,
          birthday: profile.birthday ? decrypt(profile.birthday) : null,
        }
      : null;

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      email: userEmail,
      profile: decryptedProfile,
      subscription: subscriptionResult.rows[0] || null,
      tarotReadings: tarotReadingsResult.rows,
      notes: notesResult.rows,
      aiConversations: aiThreadsResult.rows.map((thread) => ({
        ...thread,
        messageCount: thread.messages?.length || 0,
      })),
      streaks: streaksResult.rows[0] || null,
      pushSubscriptions: pushSubscriptionsResult.rows.length,
      dataRetentionInfo: {
        description:
          'Your data is retained as long as your account is active. You can request deletion at any time.',
        deletionPolicy:
          'Account deletion is processed within 30 days. Some data may be retained for legal compliance.',
      },
    };

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lunary-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 },
    );
  }
}
